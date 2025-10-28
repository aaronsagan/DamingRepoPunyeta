// src/components/ReceiptUploader.tsx
import React, { useEffect, useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

type OCRResult = {
  text: string;
  refNumber?: string;
  amount?: string;
  date?: string;
  confidence?: number; // 0-100
};

type Props = {
  onFileChange?: (file: File | null) => void;
  onOCRExtract?: (result: OCRResult) => void; // send parsed values back to parent
  initialFile?: File | null;
};

export default function ReceiptUploader({ onFileChange, onOCRExtract, initialFile = null }: Props) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [ocrText, setOcrText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [parsing, setParsing] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [parsedRef, setParsedRef] = useState<string>('');
  const [parsedAmount, setParsedAmount] = useState<string>('');
  const [parsedDate, setParsedDate] = useState<string>('');
  const workerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize worker asynchronously
    let mounted = true;
    
    (async () => {
      try {
        const worker = await Tesseract.createWorker({
          logger: () => {} // Empty logger to avoid DataCloneError
        });
        if (mounted) {
          workerRef.current = worker;
        }
      } catch (err) {
        console.error('Failed to initialize Tesseract worker:', err);
      }
    })();

    return () => {
      mounted = false;
      (async () => {
        if (workerRef.current) {
          try {
            await workerRef.current.terminate();
          } catch (err) {
            console.error('Error terminating worker:', err);
          }
        }
      })();
    };
  }, []);

  async function runOCR(imageFile: File) {
    setParsing(true);
    setProgress(0);
    setOcrText('');
    setConfidence(null);
    setParsedRef('');
    setParsedAmount('');
    setParsedDate('');

    try {
      const worker = workerRef.current;
      
      // Check if worker is ready
      if (!worker) {
        console.error('OCR worker not initialized yet. Please wait a moment and try again.');
        setParsing(false);
        return;
      }

      // Manual progress tracking
      setProgress(10);
      await worker.load();
      
      setProgress(30);
      await worker.loadLanguage('eng');
      
      setProgress(50);
      await worker.initialize('eng');

      // convert file to blob/url
      setProgress(60);
      const imgURL = URL.createObjectURL(imageFile);
      
      setProgress(70);
      const { data } = await worker.recognize(imgURL, { 
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK 
      });
      
      setProgress(90);
      // full detected text
      const text = data?.text || '';
      setOcrText(text);

      // compute average confidence (safe fallback)
      const confidences = data?.words?.map((w: any) => w.confidence).filter(Boolean) || [];
      const avgConf = confidences.length ? Math.round((confidences.reduce((a: number,b:number)=>a+b,0)/confidences.length)) : Math.round((data?.confidence || 0));
      setConfidence(avgConf);

      // parse common fields
      const parsed = parseReceiptText(text);
      setParsedRef(parsed.refNumber || '');
      setParsedAmount(parsed.amount || '');
      setParsedDate(parsed.date || '');

      // callback to parent
      onOCRExtract?.({
        text,
        refNumber: parsed.refNumber,
        amount: parsed.amount,
        date: parsed.date,
        confidence: avgConf
      });

      // revoke object URL
      URL.revokeObjectURL(imgURL);
    } catch (err) {
      console.error('OCR error', err);
    } finally {
      setParsing(false);
      setProgress(100);
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    onFileChange?.(f);
    if (f) runOCR(f);
  }

  // Simple parsing heuristics — tweak according to your receipts
  function parseReceiptText(text: string) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const joined = lines.join(' | ');

    // Reference number regexes (GCash, bank ref patterns)
    const refRegexes = [
      /ref(?:erence)?[:\s]*([A-Za-z0-9\-]+)/i,
      /transaction id[:\s]*([A-Za-z0-9\-]+)/i,
      /txn(?:\s|#)[:\s]*([A-Za-z0-9\-]+)/i,
      /\b([A-Z0-9]{6,})\b/ // fallback generic uppercase/alphanumeric
    ];

    let refNumber: string | undefined;
    for (const r of refRegexes) {
      const m = joined.match(r);
      if (m && m[1]) {
        refNumber = m[1];
        break;
      }
    }

    // Amount regex (peso symbol optional)
    const amountRegex = /(?:₱|\bPHP\b|PHP\s|Peso\s|P\s)?\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i;
    let amount: string | undefined;
    const amountMatch = joined.match(amountRegex);
    if (amountMatch && amountMatch[1]) {
      amount = amountMatch[1].replace(/,/g, '');
    }

    // Date regex (common formats)
    const dateRegexes = [
      /(\d{4}-\d{2}-\d{2})/, // 2024-01-31
      /(\d{2}\/\d{2}\/\d{4})/, // 31/01/2024
      /(\d{2}\.\d{2}\.\d{4})/,
      /([A-Za-z]{3,9}\s\d{1,2},\s?\d{4})/ // January 2, 2024
    ];
    let date: string | undefined;
    for (const r of dateRegexes) {
      const m = joined.match(r);
      if (m && m[1]) {
        date = m[1];
        break;
      }
    }

    return { refNumber, amount, date };
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Upload Receipt</label>
      <input type="file" accept="image/*,application/pdf" onChange={onFileSelected} />
      {file && (
        <div className="mt-2">
          <p className="text-sm">Selected: {file.name}</p>
        </div>
      )}

      <div>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">OCR Progress: {progress}%</p>
          {parsing && <progress value={progress} max={100} />}
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Reference Number (editable)</label>
            <input value={parsedRef} onChange={(e)=>setParsedRef(e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-xs font-medium">Amount (editable)</label>
            <input value={parsedAmount} onChange={(e)=>setParsedAmount(e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-xs font-medium">Date (editable)</label>
            <input value={parsedDate} onChange={(e)=>setParsedDate(e.target.value)} className="input" />
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          <p>OCR Confidence: {confidence ?? 'N/A'}%</p>
          <p className="mt-2">Raw OCR text (debug):</p>
          <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{ocrText || 'No OCR text yet'}</pre>
        </div>

        {/* Optional: on a real form you would send the file + parsed values to backend when user submits form */}
      </div>
    </div>
  );
}
