import { useState, useEffect, useRef } from 'react';
import { QrCode, X, Camera, Keyboard, Check, AlertCircle, BookOpen } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { Book } from '@/types';

interface QRScannerProps {
  books: Book[];
  onRent: (bookId: string) => void;
  onReturn: (bookId: string) => void;
  hasBorrowed: (bookId: string) => boolean;
  onClose: () => void;
}

interface ScannedResult {
  code: string;
  bookId: string;
  action: 'rent' | 'return';
}

const CODES_STORAGE_KEY = 'schoolPortalQRCodes';

export function QRScanner({ books, onRent, onReturn, hasBorrowed, onClose }: QRScannerProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    book?: Book;
    action?: 'rent' | 'return';
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Request camera permission
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  };

  // Initialize scanner
  useEffect(() => {
    const initScanner = async () => {
      if (scanMode === 'camera' && scannerContainerRef.current) {
        // First check/request permission
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          setScanResult({
            success: false,
            message: 'Camera access denied. Please allow camera access in your browser settings and try again, or use manual code entry.'
          });
          setIsScanning(false);
          return;
        }
        
        scannerRef.current = new Html5Qrcode('qr-reader');
        startScanning();
      }
    };

    initScanner();

    return () => {
      stopScanning();
    };
  }, [scanMode]);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      setIsScanning(true);
      
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Prefer back camera, fallback to first available
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
        const cameraId = backCamera ? backCamera.id : devices[0].id;
        
        await scannerRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            handleScannedCode(decodedText);
          },
          () => {
            // Error callback - ignore scan errors (no QR found in frame)
          }
        );
      } else {
        throw new Error('No cameras found');
      }
    } catch (error) {
      console.error('Failed to start scanner:', error);
      setScanResult({
        success: false,
        message: 'Unable to access camera. Please ensure camera permissions are granted and try again, or use manual code entry.'
      });
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
    setIsScanning(false);
  };

  // Extract QR data from URL or JSON
  const extractQRData = (text: string): ScannedResult | null => {
    // Try to parse as URL first
    try {
      const url = new URL(text);
      const qr = url.searchParams.get('qr');
      const bookId = url.searchParams.get('book');
      const action = url.searchParams.get('action') as 'rent' | 'return';
      
      if (qr && bookId && action) {
        return { code: qr, bookId, action };
      }
    } catch {
      // Not a URL, try JSON
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      if (data.code && data.bookId && data.action) {
        return { code: data.code, bookId: data.bookId, action: data.action };
      }
    } catch {
      // Not JSON either
    }

    // Try to find code in localStorage
    const savedCodes = localStorage.getItem(CODES_STORAGE_KEY);
    if (savedCodes) {
      const codes = JSON.parse(savedCodes);
      const foundCode = codes.find((c: any) => c.code === text.toUpperCase());
      if (foundCode) {
        return { 
          code: foundCode.code, 
          bookId: foundCode.bookId, 
          action: foundCode.action 
        };
      }
    }

    return null;
  };

  const handleScannedCode = (decodedText: string) => {
    const result = extractQRData(decodedText);

    if (!result) {
      setScanResult({
        success: false,
        message: 'Invalid QR code. Please try again.'
      });
      return;
    }

    handleCodeValidation(result);
  };

  const handleCodeValidation = (result: ScannedResult) => {
    const book = books.find(b => b.id === result.bookId);
    if (!book) {
      setScanResult({
        success: false,
        message: 'Book not found in library.'
      });
      return;
    }

    // Check if action is valid
    if (result.action === 'rent') {
      if (hasBorrowed(book.id)) {
        setScanResult({
          success: false,
          message: 'You have already borrowed this book.',
          book,
          action: result.action
        });
        return;
      }
      if (book.available <= 0) {
        setScanResult({
          success: false,
          message: 'This book is currently out of stock.',
          book,
          action: result.action
        });
        return;
      }
      // Process rent
      onRent(book.id);
      setScanResult({
        success: true,
        message: `Successfully rented "${book.title}"!`,
        book,
        action: result.action
      });
    } else if (result.action === 'return') {
      if (!hasBorrowed(book.id)) {
        setScanResult({
          success: false,
          message: 'You have not borrowed this book.',
          book,
          action: result.action
        });
        return;
      }
      // Process return
      onReturn(book.id);
      setScanResult({
        success: true,
        message: `Successfully returned "${book.title}"!`,
        book,
        action: result.action
      });
    }

    // Stop scanning after successful scan
    stopScanning();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      const result = extractQRData(manualCode.trim());
      if (result) {
        handleCodeValidation(result);
      } else {
        setScanResult({
          success: false,
          message: 'Invalid code. Please check and try again.'
        });
      }
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setManualCode('');
    if (scanMode === 'camera') {
      startScanning();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Scan QR Code
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Quick rent or return books
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switch */}
        {!scanResult && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setScanMode('camera'); stopScanning(); }}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
                scanMode === 'camera'
                  ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                  : 'bg-white border-[rgba(26,26,26,0.2)]'
              }`}
            >
              <Camera size={16} />
              <span className="text-sm font-bold">Camera</span>
            </button>
            <button
              onClick={() => { setScanMode('manual'); stopScanning(); }}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
                scanMode === 'manual'
                  ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                  : 'bg-white border-[rgba(26,26,26,0.2)]'
              }`}
            >
              <Keyboard size={16} />
              <span className="text-sm font-bold">Enter Code</span>
            </button>
          </div>
        )}

        {/* Scan Result */}
        {scanResult ? (
          <div className={`p-6 rounded-xl border-[3px] text-center ${
            scanResult.success 
              ? 'bg-[var(--card-mint)] border-[rgba(26,26,26,0.85)]' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              scanResult.success ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {scanResult.success ? (
                <Check size={32} className="text-white" />
              ) : (
                <AlertCircle size={32} className="text-white" />
              )}
            </div>
            
            <h4 className={`text-lg font-bold mb-2 ${scanResult.success ? '' : 'text-red-700'}`}>
              {scanResult.success ? 'Success!' : 'Error'}
            </h4>
            
            <p className={`text-sm mb-4 ${scanResult.success ? 'text-[var(--text-secondary)]' : 'text-red-600'}`}>
              {scanResult.message}
            </p>

            {scanResult.book && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-[2px] border-[rgba(26,26,26,0.1)] mb-4">
                <BookOpen size={20} className="text-[var(--text-secondary)]" />
                <div className="text-left">
                  <p className="font-bold text-sm truncate">{scanResult.book.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{scanResult.book.author}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetScan}
                className="flex-1 btn-secondary text-sm"
              >
                Scan Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-primary text-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Camera Scanner */}
            {scanMode === 'camera' && (
              <div className="space-y-4">
                <div 
                  id="qr-reader" 
                  ref={scannerContainerRef}
                  className="w-full aspect-square rounded-xl overflow-hidden border-[3px] border-[rgba(26,26,26,0.85)]"
                />
                
                {!isScanning && (
                  <div className="text-center py-8">
                    <AlertCircle size={32} className="mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-[var(--text-secondary)]">
                      Camera not available. Please use manual code entry.
                    </p>
                  </div>
                )}

                <p className="text-xs text-center text-[var(--text-secondary)]">
                  Point your camera at a QR code to scan
                </p>
              </div>
            )}

            {/* Manual Code Entry */}
            {scanMode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="micro-label block mb-2 text-xs">
                    Enter 8-Character Code
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="e.g., AB12CD34"
                    maxLength={8}
                    className="input-field text-center text-lg font-mono tracking-widest uppercase"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={manualCode.length !== 8}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={16} />
                  Process Code
                </button>

                <div className="p-4 bg-[var(--card-yellow)] rounded-xl">
                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>Tip:</strong> Ask your librarian for a rent/return code. 
                    Codes are 8 characters long and work with any QR scanner app!
                  </p>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
