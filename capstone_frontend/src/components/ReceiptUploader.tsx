// src/components/ReceiptUploader.tsx
import React, { useEffect, useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

type OCRResult = {
  text: string;
  refNumber?: string;
  amount?: string;
  date?: string;
  confidence?: number; // 0-100
  template?: string; // receipt type (gcash, bpi, etc)
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
  const [receiptType, setReceiptType] = useState<string>('unknown');
  const [fieldsLocked, setFieldsLocked] = useState<boolean>(false);
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

  // Image preprocessing for better OCR accuracy
  async function preprocessImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(URL.createObjectURL(file));
          return;
        }
        
        // Scale up image for better OCR (2x size)
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Step 1: Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        
        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128;       // Red
          data[i + 1] = factor * (data[i + 1] - 128) + 128; // Green
          data[i + 2] = factor * (data[i + 2] - 128) + 128; // Blue
        }
        
        // Step 2: Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = gray;
        }
        
        // Step 3: Apply adaptive threshold (Otsu-like)
        // Calculate histogram
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < data.length; i += 4) {
          histogram[Math.floor(data[i])]++;
        }
        
        // Find optimal threshold
        let sum = 0;
        for (let i = 0; i < 256; i++) sum += i * histogram[i];
        
        let sumB = 0;
        let wB = 0;
        let wF = 0;
        let mB, mF, max = 0;
        let threshold = 0;
        const total = canvas.width * canvas.height;
        
        for (let i = 0; i < 256; i++) {
          wB += histogram[i];
          if (wB === 0) continue;
          wF = total - wB;
          if (wF === 0) break;
          
          sumB += i * histogram[i];
          mB = sumB / wB;
          mF = (sum - sumB) / wF;
          
          const between = wB * wF * (mB - mF) * (mB - mF);
          if (between > max) {
            max = between;
            threshold = i;
          }
        }
        
        // Apply threshold
        for (let i = 0; i < data.length; i += 4) {
          const value = data[i] > threshold ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = value;
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
    });
  }

  async function runOCR(imageFile: File) {
    setParsing(true);
    setProgress(0);
    setOcrText('');
    setConfidence(null);
    setParsedRef('');
    setParsedAmount('');
    setParsedDate('');
    setReceiptType('unknown');
    setFieldsLocked(false);

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
      
      // Preprocess image for better accuracy
      const imgURL = await preprocessImage(imageFile);
      
      setProgress(30);
      
      // Worker is pre-loaded in newer Tesseract.js, just recognize directly
      const { data } = await worker.recognize(imgURL, 'eng', { 
        tessedit_pageseg_mode: Tesseract.PSM.AUTO 
      });
      
      setProgress(80);
      // full detected text
      const text = data?.text || '';
      setOcrText(text);

      // compute average confidence (safe fallback)
      const confidences = data?.words?.map((w: any) => w.confidence).filter(Boolean) || [];
      const avgConf = confidences.length ? Math.round((confidences.reduce((a: number,b:number)=>a+b,0)/confidences.length)) : Math.round((data?.confidence || 0));
      setConfidence(avgConf);

      // parse common fields with template detection
      const parsed = parseReceiptText(text);
      
      // Lock fields if confidence is high (anti-fake protection)
      const shouldLock = avgConf >= 70 && (parsed.refNumber || parsed.amount);
      
      if (shouldLock) {
        setFieldsLocked(true);
      }
      
      setParsedRef(parsed.refNumber || '');
      setParsedAmount(parsed.amount || '');
      setParsedDate(parsed.date || '');

      // callback to parent
      onOCRExtract?.({
        text,
        refNumber: parsed.refNumber,
        amount: parsed.amount,
        date: parsed.date,
        confidence: avgConf,
        template: parsed.template
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

  // 🧠 UNIFIED SMART PARSER with Anti-Fake Detection
  function parseReceiptText(rawText: string) {
    console.log('🔍 RAW OCR TEXT (before normalization):', rawText);
    
    // 1️⃣ Normalize text - remove extra spaces and OCR artifacts
    // Keep £ because OCR often reads ₱ as £
    let text = rawText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E₱£]/g, '') // remove invisible OCR artifacts but keep £
      .trim();

    console.log('🔍 NORMALIZED TEXT (after cleanup):', text);
    console.log('🔍 Text contains "Amount"?', text.includes('Amount'));
    console.log('🔍 Text contains "Ref"?', text.includes('Ref'));
    console.log('🔍 Text contains "150"?', text.includes('150'));
    console.log('🔍 Text contains "0033"?', text.includes('0033'));

    const lower = text.toLowerCase();

    // --- TEMPLATE DETECTION ---
    let template = 'generic';
    
    // More flexible GCash detection - check for multiple indicators
    if (lower.includes('gcash') || lower.includes('sent via gcash') || 
        (lower.includes('ref no') && lower.includes('total amount sent'))) {
      template = 'gcash';
      setReceiptType('gcash');
      console.log('✅ Detected as GCash receipt');
    } else if (lower.includes('bpi')) {
      template = 'bpi';
      setReceiptType('bpi');
      console.log('✅ Detected as BPI receipt');
    } else if (lower.includes('maya') || lower.includes('paymaya')) {
      template = 'maya';
      setReceiptType('maya');
      console.log('✅ Detected as Maya receipt');
    } else if (lower.includes('bdo')) {
      template = 'bdo';
      setReceiptType('bdo');
      console.log('✅ Detected as BDO receipt');
    } else if (lower.includes('paypal')) {
      template = 'paypal';
      setReceiptType('paypal');
      console.log('✅ Detected as PayPal receipt');
    } else {
      setReceiptType('unknown');
      console.log('⚠️ No specific template detected, using generic parser');
    }
    
    console.log('🏷️ Template selected:', template);

    let refNumber = '';
    let amount = '';
    let date = '';

    // --- TEMPLATE-SPECIFIC LOGIC ---
    if (template === 'gcash') {
      console.log('🔍 GCash Parser - Input text:', text);
      console.log('🔍 Raw text length:', text.length);
      
      // REFERENCE NUMBER - Tested against: "Ref No. 0033 076 950354"
      // Try multiple patterns in order of specificity
      const refTests = [
        { pattern: /Ref\s+No\.\s+([0-9 ]{10,})/i, name: 'Ref No.' },
        { pattern: /Ref\.\s+No\.\s+([0-9 ]{10,})/i, name: 'Ref. No.' },
        { pattern: /Ref No\s+([0-9 ]{10,})/i, name: 'Ref No (no dots)' },
        { pattern: /Reference\s+([0-9 ]{10,})/i, name: 'Reference' },
        { pattern: /\b([0-9]{4}\s+[0-9]{3}\s+[0-9]{6,})\b/, name: 'Spaced pattern' },
        { pattern: /\b([0-9]{13,15})\b/, name: 'Long number' },
      ];
      
      for (const test of refTests) {
        const match = text.match(test.pattern);
        if (match && match[1]) {
          const cleaned = match[1].replace(/\s+/g, '');
          if (cleaned.length >= 10 && cleaned.length <= 20) {
            refNumber = cleaned;
            console.log('✅ Ref matched:', test.name, '→', refNumber);
            break;
          }
        } else {
          console.log('❌ Ref pattern failed:', test.name);
        }
      }

      // AMOUNT - Tested against: "Amount 150.00" and "Total Amount Sent £150.00"
      const amountTests = [
        { pattern: /Amount\s+(\d{1,6}\.?\d{0,2})\b/i, name: 'Amount [number]' },
        { pattern: /Total\s+Amount\s+Sent\s+[£₱PF]?(\d{1,6}\.?\d{0,2})/i, name: 'Total Amount Sent' },
        { pattern: /Amount\s+[£₱PF]?(\d{1,6}\.?\d{0,2})/i, name: 'Amount [symbol][number]' },
        { pattern: /[£₱]\s*(\d{1,6}\.\d{2})/i, name: 'Symbol only' },
        { pattern: /\b(\d{1,6}\.\d{2})\b/, name: 'Decimal number' },
      ];
      
      for (const test of amountTests) {
        const match = text.match(test.pattern);
        if (match && match[1]) {
          const testAmount = match[1];
          const numValue = parseFloat(testAmount);
          
          // Validation: must be real money amount
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 999999) {
            // Exclude phone number fragments
            if (testAmount !== '63' && testAmount !== '912' && testAmount !== '067' && testAmount !== '8350') {
              amount = testAmount;
              console.log('✅ Amount matched:', test.name, '→', amount);
              break;
            }
          }
        } else {
          console.log('❌ Amount pattern failed:', test.name);
        }
      }

      const dateMatch = text.match(/([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)?)|(\d{2}\/\d{2}\/\d{4})/i);
      if (dateMatch) date = dateMatch[0];
      
      console.log('📊 Final Results:', { refNumber, amount, date });
      console.log('📊 Values found:', { hasRef: !!refNumber, hasAmount: !!amount, hasDate: !!date });
    }
    else if (template === 'bpi') {
      const refMatch = text.match(/Transaction\s*(?:ID|Code|No\.)[:\s]*([0-9A-Za-z\-]+)/i);
      if (refMatch) refNumber = refMatch[1].trim();

      const amountMatch = text.match(/Amount[:\s]*(?:₱|PHP)?\s*([0-9.,]+)/i);
      if (amountMatch) amount = amountMatch[1].replace(/,/g, '').trim();

      const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|([A-Za-z]{3,9}\s\d{1,2},\s?\d{4})|(\d{2}\/\d{2}\/\d{4})/i);
      if (dateMatch) date = dateMatch[0];
    }
    else if (template === 'maya') {
      const refMatch = text.match(/Reference\s*(?:No\.|Number)?[:\s]*([0-9A-Za-z\-]+)/i);
      if (refMatch) refNumber = refMatch[1].trim();

      const amountMatch = text.match(/Amount\s*(?:Paid|Sent)?[:\s]*(?:₱|PHP)?\s*([0-9.,]+)/i);
      if (amountMatch) amount = amountMatch[1].replace(/,/g, '').trim();

      const dateMatch = text.match(/([A-Za-z]{3,9}\s\d{1,2},\s?\d{4})|(\d{2}\/\d{2}\/\d{4})/i);
      if (dateMatch) date = dateMatch[0];
    }
    else if (template === 'bdo') {
      const refMatch = text.match(/Transaction\s*(?:Ref|No\.|Number)[:\s]*([0-9A-Za-z\-]+)/i);
      if (refMatch) refNumber = refMatch[1].trim();

      const amountMatch = text.match(/Amount[:\s]*(?:₱|PHP)?\s*([0-9.,]+)/i);
      if (amountMatch) amount = amountMatch[1].replace(/,/g, '').trim();

      const dateMatch = text.match(/([A-Za-z]{3,9}\s\d{1,2},\s?\d{4})|(\d{2}\/\d{2}\/\d{4})|(\d{4}-\d{2}-\d{2})/i);
      if (dateMatch) date = dateMatch[0];
    }

    // --- FALLBACK PATTERNS (if template didn't match) ---
    console.log('🔄 Checking fallback patterns...', { hasRef: !!refNumber, hasAmount: !!amount, hasDate: !!date });
    
    if (!refNumber) {
      console.log('🔍 Trying fallback ref patterns...');
      const refFallbackPatterns = [
        /Ref\s+No\.\s+([0-9 ]{10,})/i,
        /Reference\s+([0-9 ]{10,})/i,
        /\b([0-9]{4}\s+[0-9]{3}\s+[0-9]{6,})\b/,
        /\b([0-9]{13,15})\b/,
      ];
      
      for (const pattern of refFallbackPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const cleaned = match[1].replace(/\s+/g, '');
          if (cleaned.length >= 10) {
            refNumber = cleaned;
            console.log('✅ Fallback ref found:', refNumber);
            break;
          }
        }
      }
    }

    if (!amount) {
      console.log('🔍 Trying fallback amount patterns...');
      const amtFallbackPatterns = [
        /Amount\s+(\d{1,6}\.?\d{0,2})\b/i,
        /Total\s+Amount\s+Sent\s+[£₱PF]?(\d{1,6}\.?\d{0,2})/i,
        /[£₱]\s*(\d{1,6}\.\d{2})/i,
        /\b(\d{1,6}\.\d{2})\b/,
      ];
      
      for (const pattern of amtFallbackPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const testAmt = match[1];
          const numValue = parseFloat(testAmt);
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 999999 &&
              testAmt !== '63' && testAmt !== '912' && testAmt !== '067') {
            amount = testAmt;
            console.log('✅ Fallback amount found:', amount);
            break;
          }
        }
      }
    }

    if (!date) {
      const dateFallback = text.match(/([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)?)|(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})/i);
      if (dateFallback) {
        date = dateFallback[0];
        console.log('✅ Fallback date found:', date);
      }
    }

    // --- 🛡️ ANTI-FAKE VALIDATION ---
    // Check if amount matches phone number pattern (+63xxx)
    const phonePattern = /\+?63\d{10}/;
    const isAmountFromPhone = phonePattern.test(amount);
    if (isAmountFromPhone) {
      amount = ''; // Clear fake amount
    }

    // Additional check: if amount is just "63" or "912" (common phone fragments)
    if (amount === '63' || amount === '912' || amount === '067') {
      amount = ''; // Clear suspicious amounts
    }

    // Validate amount is reasonable (1 to 999999)
    if (amount) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 1 || numAmount > 999999) {
        amount = ''; // Clear invalid amounts
      }
    }

    // Clean leading zeros (avoid ₱063)
    if (amount) {
      amount = amount.replace(/^0+(?=[1-9])/, '');
    }

    // Validate reference number length (should be reasonable)
    if (refNumber && refNumber.length < 6) {
      refNumber = ''; // Too short to be a real ref number
    }

    return { refNumber, amount, date, template };
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
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-file-upload-button]:mr-4 [&::file-selector-button]:mr-4"
          style={{ color: 'transparent' }}
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

      {/* OCR Status - Compact Display */}
      {confidence !== null && (
        <div className="space-y-2">
          {/* Warnings for missing values */}
          {(!parsedAmount || parsedAmount === '') && confidence !== null && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-orange-500/10 border border-orange-500/20">
              <span className="text-orange-600 dark:text-orange-400 text-xs">⚠️</span>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                <strong>Amount not detected.</strong> Please enter it manually.
              </p>
            </div>
          )}

          {(!parsedRef || parsedRef === '') && confidence !== null && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-orange-500/10 border border-orange-500/20">
              <span className="text-orange-600 dark:text-orange-400 text-xs">⚠️</span>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                <strong>Reference number not detected.</strong> Please enter it manually.
              </p>
            </div>
          )}
          
          {/* Low confidence warning */}
          {confidence < 60 && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
              <span className="text-red-600 dark:text-red-400 text-xs">⚠️</span>
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Low confidence ({confidence}%):</strong> Please verify or manually enter the values.
              </p>
            </div>
          )}
          
          {/* Collapsible Debug Section */}
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
