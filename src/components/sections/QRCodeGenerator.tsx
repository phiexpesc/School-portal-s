import { useState, useEffect } from 'react';
import { QrCode, X, Copy, Check, RefreshCw, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';
import type { Book } from '@/types';

interface QRCodeGeneratorProps {
  books: Book[];
  onClose: () => void;
}

interface GeneratedCode {
  id: string;
  bookId: string;
  bookTitle: string;
  action: 'rent' | 'return';
  code: string;
  qrDataUrl: string;
  createdAt: number;
  url: string;
}

const CODES_STORAGE_KEY = 'schoolPortalQRCodes';

export function QRCodeGenerator({ books, onClose }: QRCodeGeneratorProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [action, setAction] = useState<'rent' | 'return'>('rent');
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load saved codes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CODES_STORAGE_KEY);
    if (saved) {
      setGeneratedCodes(JSON.parse(saved));
    }
  }, []);

  // Save codes to localStorage
  useEffect(() => {
    localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(generatedCodes));
  }, [generatedCodes]);

  // Generate a random 8-character alphanumeric code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Generate QR code
  const generateQRCode = async () => {
    if (!selectedBook) return;

    const code = generateRandomCode();
    // Create a standalone URL that works when scanned outside the website
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/?qr=${code}&book=${selectedBook.id}&action=${action}`;

    try {
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      });

      const newCode: GeneratedCode = {
        id: Date.now().toString(),
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        action,
        code,
        qrDataUrl,
        createdAt: Date.now(),
        url
      };

      setGeneratedCodes(prev => [newCode, ...prev]);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Copy URL to clipboard
  const copyURL = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCode(url);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Delete a code
  const deleteCode = (id: string) => {
    setGeneratedCodes(prev => prev.filter(c => c.id !== id));
  };

  // Download QR code image
  const downloadQR = (code: GeneratedCode) => {
    const link = document.createElement('a');
    link.href = code.qrDataUrl;
    link.download = `qr-${code.action}-${code.bookTitle.slice(0, 20)}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                QR Code Generator
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Generate codes for quick rent/return
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

        {/* Generator Section */}
        <div className="space-y-4 mb-6">
          {/* Book Selection */}
          <div>
            <label className="micro-label block mb-2 text-xs">Select Book</label>
            <select
              value={selectedBook?.id || ''}
              onChange={(e) => {
                const book = books.find(b => b.id === e.target.value);
                setSelectedBook(book || null);
              }}
              className="input-field text-sm"
            >
              <option value="">Choose a book...</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.available}/{book.total} available)
                </option>
              ))}
            </select>
          </div>

          {/* Action Selection */}
          <div>
            <label className="micro-label block mb-2 text-xs">Action</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('rent')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
                  action === 'rent'
                    ? 'bg-[var(--card-mint)] border-[rgba(26,26,26,0.85)]'
                    : 'bg-white border-[rgba(26,26,26,0.2)] hover:border-[rgba(26,26,26,0.4)]'
                }`}
              >
                <span className="text-sm font-bold">Rent Book</span>
              </button>
              <button
                type="button"
                onClick={() => setAction('return')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
                  action === 'return'
                    ? 'bg-[var(--card-lavender)] border-[rgba(26,26,26,0.85)]'
                    : 'bg-white border-[rgba(26,26,26,0.2)] hover:border-[rgba(26,26,26,0.4)]'
                }`}
              >
                <span className="text-sm font-bold">Return Book</span>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateQRCode}
            disabled={!selectedBook}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} />
            Generate QR Code & Code
          </button>
        </div>

        {/* Generated Codes List */}
        <div>
          <h4 className="font-bold mb-3 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
            Generated Codes ({generatedCodes.length})
          </h4>
          
          {generatedCodes.length === 0 ? (
            <div className="text-center py-8 bg-[var(--bg-primary)] rounded-xl border-[2px] border-dashed border-[rgba(26,26,26,0.2)]">
              <QrCode size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                No codes generated yet. Generate one above.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {generatedCodes.map((code) => (
                <div
                  key={code.id}
                  className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-4"
                >
                  {/* QR Image */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={code.qrDataUrl}
                      alt="QR Code"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-[2px] border-[rgba(26,26,26,0.85)]"
                    />
                  </div>

                  {/* Code Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        code.action === 'rent' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {code.action === 'rent' ? 'RENT' : 'RETURN'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="font-bold text-sm truncate mb-1">
                      {code.bookTitle}
                    </p>
                    
                    {/* Code Display */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <code className="bg-[var(--bg-primary)] px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">
                        {code.code}
                      </code>
                      <button
                        onClick={() => copyCode(code.code)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === code.code ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    {/* URL Display */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                      <span className="text-xs text-[var(--text-secondary)] truncate max-w-[150px]">
                        {code.url}
                      </span>
                      <button
                        onClick={() => copyURL(code.url)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                      >
                        {copiedCode === code.url ? (
                          <Check size={12} className="text-green-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <button
                        onClick={() => downloadQR(code)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)] text-xs font-bold hover:translate-y-[-1px] transition-transform"
                      >
                        <Download size={12} />
                        Download
                      </button>
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="px-3 py-1.5 rounded-full border-[2px] border-red-600 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-[var(--card-yellow)] rounded-xl border-[2px] border-[rgba(26,26,26,0.85)]">
          <p className="text-xs text-[var(--text-secondary)]">
            <strong>How to use:</strong> Students can scan the QR code with any camera app - it will 
            open the website and automatically process the rent/return. No expiration - codes work forever!
          </p>
        </div>
      </div>
    </div>
  );
}
