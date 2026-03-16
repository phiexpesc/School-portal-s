import { useState } from 'react';
import { BookOpen, Calendar, Check, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import type { View, BorrowedBook, Book } from '@/types';

interface MyBooksProps {
  setView: (view: View) => void;
  borrowedBooks: (BorrowedBook & { book: Book })[];
  onReturn: (bookId: string) => void;
  selectedBook: Book | null;
}

export function MyBooks({ setView, borrowedBooks, onReturn, selectedBook }: MyBooksProps) {
  const [returningId, setReturningId] = useState<string | null>(null);
  const [returnedId, setReturnedId] = useState<string | null>(null);

  const handleReturn = async (bookId: string) => {
    setReturningId(bookId);
    await new Promise(resolve => setTimeout(resolve, 800));
    onReturn(bookId);
    setReturningId(null);
    setReturnedId(bookId);
    setTimeout(() => setReturnedId(null), 2000);
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return 'text-red-600 bg-red-100';
    if (daysRemaining <= 3) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  // If a specific book is selected, show its details
  if (selectedBook) {
    const isBorrowed = borrowedBooks.some(bb => bb.bookId === selectedBook.id);
    
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto">
          <button
            onClick={() => setView('library')}
            className="btn-secondary flex items-center gap-2 mb-6"
          >
            <ArrowLeft size={18} />
            Back to Library
          </button>

          <div className="card p-8 flex flex-col md:flex-row gap-8">
            <img
              src={selectedBook.coverUrl}
              alt={selectedBook.title}
              className="w-full md:w-64 h-80 object-cover rounded-2xl border-[3px] border-[rgba(26,26,26,0.85)]"
            />
            <div className="flex-1">
              <span className="micro-label text-[var(--text-secondary)]">{selectedBook.genre}</span>
              <h2 className="text-3xl font-black mt-2 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {selectedBook.title}
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-4">{selectedBook.author}</p>
              <p className="text-[var(--text-secondary)] mb-6">{selectedBook.description}</p>
              
              {isBorrowed ? (
                <div className="p-4 rounded-2xl bg-[var(--card-mint)] border-[2px] border-[rgba(26,26,26,0.85)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={20} className="text-green-600" />
                    <span className="font-bold">You have borrowed this book</span>
                  </div>
                  <button
                    onClick={() => handleReturn(selectedBook.id)}
                    disabled={returningId === selectedBook.id}
                    className="btn-primary mt-4"
                  >
                    {returningId === selectedBook.id ? (
                      <div className="w-5 h-5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Return this book'
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[var(--card-peach)] border-[2px] border-[rgba(26,26,26,0.85)]">
                  <p className="text-sm">You haven't borrowed this book yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
              My Books
            </h2>
            <p className="text-[var(--text-secondary)] mt-2">
              You have {borrowedBooks.length} book{borrowedBooks.length !== 1 ? 's' : ''} on loan
            </p>
          </div>
          <button
            onClick={() => setView('library')}
            className="btn-secondary flex items-center gap-2 self-start"
          >
            <BookOpen size={18} />
            Browse Library
          </button>
        </div>

        {/* Books List */}
        {borrowedBooks.length > 0 ? (
          <div className="space-y-4">
            {borrowedBooks.map((item) => {
              const daysRemaining = getDaysRemaining(item.dueDate);
              const statusClass = getStatusColor(daysRemaining);
              
              return (
                <div
                  key={item.bookId}
                  className="card p-6 flex flex-col sm:flex-row gap-6"
                >
                  <img
                    src={item.book.coverUrl}
                    alt={item.book.title}
                    className="w-full sm:w-32 h-48 sm:h-44 object-cover rounded-xl border-[2px] border-[rgba(26,26,26,0.85)] flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>
                          {daysRemaining < 0 ? (
                            <span className="flex items-center gap-1">
                              <AlertCircle size={12} />
                              Overdue by {Math.abs(daysRemaining)} days
                            </span>
                          ) : daysRemaining <= 3 ? (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              Due in {daysRemaining} days
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Check size={12} />
                              Due in {daysRemaining} days
                            </span>
                          )}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {item.book.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-sm mb-4">
                        {item.book.author}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Borrowed: {new Date(item.borrowedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleReturn(item.bookId)}
                        disabled={returningId === item.bookId || returnedId === item.bookId}
                        className={`btn-primary flex items-center gap-2 ${
                          returnedId === item.bookId ? 'bg-green-500' : ''
                        }`}
                      >
                        {returningId === item.bookId ? (
                          <div className="w-5 h-5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
                        ) : returnedId === item.bookId ? (
                          <>
                            <Check size={18} />
                            Returned!
                          </>
                        ) : (
                          'Return Book'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--card-lavender)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <BookOpen size={36} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              No books borrowed
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              You haven't borrowed any books yet. Visit the library to get started!
            </p>
            <button
              onClick={() => setView('library')}
              className="btn-primary"
            >
              Browse Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
