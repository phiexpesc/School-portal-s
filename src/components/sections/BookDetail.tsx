import { useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, User, CheckCircle, Loader2 } from 'lucide-react';
import type { Book } from '@/types';

interface BookDetailProps {
  book: Book;
  isBorrowed: boolean;
  onRent: () => Promise<{ success: boolean; message?: string }>;
  onBack: () => void;
  user: any;
}

export function BookDetail({ book, isBorrowed: initialIsBorrowed, onRent, onBack, user }: BookDetailProps) {
  const [isRenting, setIsRenting] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRent = async () => {
    if (!user) return;
    
    setIsRenting(true);
    setError('');
    
    try {
      const result = await onRent();
      
      if (result.success) {
        setRentSuccess(true);
        setTimeout(() => setRentSuccess(false), 3000);
      } else {
        setError(result.message || 'Failed to rent book');
      }
    } catch (err) {
      setError('An error occurred while renting the book');
    } finally {
      setIsRenting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] p-4 sm:p-6 lg:p-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#1a1a1a] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Library
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-xl">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#c4f692] text-[#1a1a1a] text-sm font-medium mb-4">
                {book.genre}
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-3">{book.title}</h1>
              <p className="text-xl text-gray-600 flex items-center gap-2">
                <User className="w-5 h-5" />
                {book.author}
              </p>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">
              {book.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-[rgba(26,26,26,0.1)]">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Grade {book.grade}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-[rgba(26,26,26,0.1)]">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{book.pages} pages</span>
              </div>
            </div>

            {/* Rent Button */}
            <div className="pt-4">
              {initialIsBorrowed ? (
                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-100 text-green-700">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium text-lg">You have borrowed this book</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleRent}
                    disabled={isRenting || book.available === 0}
                    className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-lg transition-all ${
                      rentSuccess
                        ? 'bg-green-500 text-white'
                        : book.available > 0
                        ? 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isRenting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Renting...
                      </>
                    ) : rentSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Rented Successfully!
                      </>
                    ) : book.available > 0 ? (
                      <>Rent This Book</>
                    ) : (
                      <>Not Available</>
                    )}
                  </button>
                  
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                  
                  {book.available > 0 && (
                    <p className="text-gray-500 text-sm">
                      {book.available} of {book.total} copies available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
