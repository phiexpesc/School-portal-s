import { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import type { Book, BorrowedBook } from '@/types';

interface MyBooksProps {
  borrowedBooks: (BorrowedBook & { book: Book })[];
  onReturn: (bookId: string) => Promise<void>;
  onBack?: () => void;
}

export function MyBooks({ borrowedBooks: initialBorrowedBooks, onReturn, onBack }: MyBooksProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [returnedId, setReturnedId] = useState<string | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState(initialBorrowedBooks);

  // Update when props change
  useEffect(() => {
    setBorrowedBooks(initialBorrowedBooks);
  }, [initialBorrowedBooks]);

  const handleReturn = async (bookId: string) => {
    setReturningId(bookId);
    await new Promise(resolve => setTimeout(resolve, 800));
    await onReturn(bookId);
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

  if (selectedBook) {
    const isBorrowed = borrowedBooks.some(bb => bb.bookId === selectedBook.id);

    return (
      <div className="min-h-screen bg-[#f8f7f4] p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => setSelectedBook(null)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to My Books
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border-2 border-[rgba(26,26,26,0.1)]">
            <div className="aspect-[2/1] relative">
              <img
                src={selectedBook.coverUrl}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-3">
                  {selectedBook.genre}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{selectedBook.title}</h1>
                <p className="text-lg opacity-90">{selectedBook.author}</p>
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {selectedBook.description}
              </p>
              
              {isBorrowed ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-100 text-green-700">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">You have borrowed this book</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 text-gray-600">
                  <BookOpen className="w-6 h-6" />
                  <span>You haven't borrowed this book yet.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-2">My Books</h2>
          <p className="text-gray-600">
            You have {borrowedBooks.length} book{borrowedBooks.length !== 1 ? 's' : ''} on loan
          </p>
        </div>

        {/* Books List */}
        {borrowedBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {borrowedBooks.map((item) => {
              const daysRemaining = getDaysRemaining(item.dueDate);
              const statusClass = getStatusColor(daysRemaining);

              return (
                <div
                  key={item.bookId}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-[rgba(26,26,26,0.1)] hover:shadow-md transition-shadow"
                >
                  <div 
                    onClick={() => setSelectedBook(item.book)}
                    className="aspect-[3/4] relative cursor-pointer"
                  >
                    <img
                      src={item.book.coverUrl}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>
                      {daysRemaining < 0 ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      ) : daysRemaining <= 3 ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due soon
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          On track
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mb-3 ${statusClass}`}>
                      {daysRemaining < 0 ? (
                        <>Overdue by {Math.abs(daysRemaining)} days</>
                      ) : daysRemaining <= 3 ? (
                        <>Due in {daysRemaining} days</>
                      ) : (
                        <>Due in {daysRemaining} days</>
                      )}
                    </div>
                    
                    <h3 
                      onClick={() => setSelectedBook(item.book)}
                      className="font-bold text-[#1a1a1a] text-lg mb-1 cursor-pointer hover:underline"
                    >
                      {item.book.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{item.book.author}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Borrowed: {new Date(item.borrowedDate).toLocaleDateString()}</span>
                      <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                    </div>
                    
                    <button
                      onClick={() => handleReturn(item.bookId)}
                      disabled={returningId === item.bookId}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        returnedId === item.bookId
                          ? 'bg-green-500 text-white'
                          : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      {returningId === item.bookId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Returning...
                        </>
                      ) : returnedId === item.bookId ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Returned!
                        </>
                      ) : (
                        'Return Book'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">No books borrowed</h3>
            <p className="text-gray-500">You haven't borrowed any books yet. Visit the library to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
