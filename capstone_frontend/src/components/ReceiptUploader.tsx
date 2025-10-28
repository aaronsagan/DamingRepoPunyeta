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
  const [workerReady, setWorkerReady] = useState<boolean>(false);
  const workerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize worker asynchronously
    let mounted = true;
    
    (async () => {
      try {
        // Create worker WITHOUT logger to avoid DataCloneError
        const worker = await Tesseract.createWorker();
        if (mounted) {
          workerRef.current = worker;
          setWorkerReady(true);
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
    <div className="space-y-4">
      {/* Worker Status */}
      {!workerReady && (
        <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
          <div className="animate-spin h-3 w-3 border-2 border-yellow-500 border-t-transparent rounded-full" />
          Initializing OCR engine...
        </div>
      )}

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Upload Receipt</label>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          onChange={onFileSelected}
          disabled={!workerReady}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {!workerReady && (
          <p className="text-xs text-muted-foreground">Please wait for OCR engine to initialize...</p>
        )}
      </div>

      {/* File Info */}
      {file && (
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">Selected:</p>
          <p className="text-sm font-medium truncate">{file.name}</p>
        </div>
      )}

      {/* Progress Bar */}
      {parsing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Processing OCR...</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Editable Extracted Fields */}
      {(parsedRef || parsedAmount || parsedDate) && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-primary">📝 Extracted Values (Editable)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Reference Number</label>
              <input 
                value={parsedRef} 
                onChange={(e)=>setParsedRef(e.target.value)} 
                placeholder="Not detected"
                className="w-full h-9 px-3 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <input 
                value={parsedAmount} 
                onChange={(e)=>setParsedAmount(e.target.value)} 
                placeholder="Not detected"
                className="w-full h-9 px-3 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <input 
                value={parsedDate} 
                onChange={(e)=>setParsedDate(e.target.value)} 
                placeholder="Not detected"
                className="w-full h-9 px-3 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confidence & Raw Text */}
      {confidence !== null && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">OCR Confidence:</p>
            <p className={`text-xs font-bold ${
              confidence >= 85 ? 'text-green-600 dark:text-green-400' :
              confidence >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {confidence}%
            </p>
          </div>
          
          {/* Collapsible Raw Text */}
          <details className="group">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1">
              <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Show Raw OCR Text
            </summary>
            <pre className="mt-2 text-xs bg-muted/50 border border-border rounded-md p-3 max-h-32 overflow-auto font-mono whitespace-pre-wrap">
              {ocrText || 'No text extracted'}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
