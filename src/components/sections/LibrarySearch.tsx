import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Sparkles, TrendingUp, BookOpen, ChevronRight } from 'lucide-react';
import type { Book, View } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface LibrarySearchProps {
  books: Book[];
  filteredBooks: Book[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  genres: string[];
  setView: (view: View) => void;
  setSelectedBook: (book: Book) => void;
}

export function LibrarySearch({
  books,
  filteredBooks,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  genres,
  setView,
  setSelectedBook
}: LibrarySearchProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      mm.add('(min-width: 1024px)', () => {
        const children = content.querySelectorAll('.desktop-only > div');
        
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.6,
          }
        });

        // ENTRANCE (0% - 30%)
        scrollTl.fromTo(children[0],
          { y: '80vh', scale: 0.92, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0
        );
        scrollTl.fromTo(children[1],
          { x: '-60vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.06
        );
        scrollTl.fromTo(children[2],
          { x: '60vw', y: '-20vh', opacity: 0 },
          { x: 0, y: 0, opacity: 1, ease: 'none' },
          0.10
        );
        scrollTl.fromTo(children[3],
          { x: '60vw', y: '20vh', opacity: 0 },
          { x: 0, y: 0, opacity: 1, ease: 'none' },
          0.14
        );

        // EXIT (70% - 100%)
        scrollTl.to(children[0],
          { y: '-60vh', opacity: 0, ease: 'power2.in' },
          0.7
        );
        scrollTl.to(children[1],
          { x: '-40vw', opacity: 0, ease: 'power2.in' },
          0.72
        );
        scrollTl.to([children[2], children[3]],
          { x: '40vw', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.74
        );
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setView('mybooks');
  };

  const newArrivals = books.slice(0, 3);
  const popularBooks = books.slice(3, 6);

  return (
    <section ref={sectionRef} className="min-h-screen lg:h-screen bg-[var(--bg-primary)] flex items-center justify-center py-16 lg:py-0">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div ref={contentRef} className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-4">
          {/* Header */}
          <h2 className="text-2xl sm:text-3xl font-black text-center" style={{ fontFamily: 'var(--font-heading)' }}>
            Find your next read
          </h2>

          {/* Search Card */}
          <div className="card p-4 sm:p-6">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-11 text-sm"
                placeholder="Search title, author, or topic..."
              />
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 flex-wrap mb-4">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`chip text-xs py-2 px-3 ${selectedGenre === genre ? 'bg-[var(--accent)]' : ''}`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {filteredBooks.slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="flex items-center gap-3 p-3 rounded-xl border-[2px] border-[rgba(26,26,26,0.85)] bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded-lg border border-[rgba(26,26,26,0.3)]"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                      {book.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {book.author}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-secondary)] flex-shrink-0" />
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <p className="text-center text-[var(--text-secondary)] py-6">
                  No books found. Try a different search.
                </p>
              )}
            </div>
          </div>

          {/* Side Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* New Arrivals */}
            <div className="card p-4 bg-[var(--card-mint)]">
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <Sparkles size={14} />
              </div>
              <h4 className="font-bold text-sm mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                New Arrivals
              </h4>
              <div className="space-y-1">
                {newArrivals.slice(0, 2).map((book) => (
                  <div key={book.id} className="flex items-center gap-1 text-xs">
                    <BookOpen size={12} />
                    <span className="truncate">{book.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Popular */}
            <div className="card p-4 bg-[var(--card-peach)]">
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <TrendingUp size={14} />
              </div>
              <h4 className="font-bold text-sm mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Most Popular
              </h4>
              <div className="space-y-1">
                {popularBooks.slice(0, 2).map((book, index) => (
                  <div key={book.id} className="flex items-center gap-1 text-xs">
                    <span className="w-4 h-4 rounded-full bg-white border border-[rgba(26,26,26,0.5)] flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span className="truncate">{book.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="card p-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop"
              alt="Library bookshelf"
              className="w-full h-40 object-cover"
            />
          </div>
        </div>

        {/* Desktop Layout - Absolute Positioned */}
        <div className="hidden lg:block desktop-only relative h-[80vh]">
          {/* Search Card (Center) */}
          <div className="absolute left-[25%] top-[10%] w-[50%] h-[75%] rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-8">
            <h2 className="text-3xl font-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              Find your next read
            </h2>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 text-sm"
                placeholder="Search title, author, or topic..."
              />
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 flex-wrap mb-6">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`chip text-xs py-2 px-4 ${selectedGenre === genre ? 'bg-[var(--accent)]' : ''}`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-3 overflow-y-auto max-h-[45%]">
              {filteredBooks.slice(0, 4).map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="book-card p-3 hover:bg-gray-50"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="book-cover w-12 h-16"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                      {book.title}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] truncate">
                      {book.author}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-[var(--bg-primary)]">
                      {book.genre}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-[var(--text-secondary)] flex-shrink-0" />
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <p className="text-center text-[var(--text-secondary)] py-8">
                  No books found. Try a different search.
                </p>
              )}
            </div>
          </div>

          {/* Left Photo Card */}
          <div className="absolute left-0 top-[10%] w-[22%] h-[75%] rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
            <img
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=900&fit=crop"
              alt="Library bookshelf"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Mint Card */}
          <div className="absolute right-0 top-[10%] w-[22%] h-[35%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-mint)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5">
            <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
              <Sparkles size={18} />
            </div>
            <h4 className="font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              New Arrivals
            </h4>
            <div className="space-y-2">
              {newArrivals.map((book) => (
                <div key={book.id} className="flex items-center gap-2 text-sm">
                  <BookOpen size={14} />
                  <span className="truncate">{book.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Peach Card */}
          <div className="absolute right-0 bottom-[10%] w-[22%] h-[38%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-peach)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5">
            <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
              <TrendingUp size={18} />
            </div>
            <h4 className="font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Most Popular
            </h4>
            <div className="space-y-2">
              {popularBooks.map((book, index) => (
                <div key={book.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-white border border-[rgba(26,26,26,0.5)] flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate">{book.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
