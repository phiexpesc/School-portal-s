import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, BookOpen, Star, FileText, Users, ArrowLeft } from 'lucide-react';
import type { Book, View } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface BookDetailProps {
  book: Book | null;
  setView: (view: View) => void;
  onRent: (bookId: string) => void;
  hasBorrowed: (bookId: string) => boolean;
}

export function BookDetail({ book, setView, onRent, hasBorrowed }: BookDetailProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isRenting, setIsRenting] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      mm.add('(min-width: 1024px)', () => {
        const children = content.querySelectorAll('.desktop-only > div, .desktop-only > button');
        
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
          { x: '-70vw', opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, ease: 'none' },
          0
        );
        scrollTl.fromTo(children[1],
          { x: '70vw', opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, ease: 'none' },
          0.06
        );
        scrollTl.fromTo(children[2],
          { y: '30vh', scale: 0.85, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.6)' },
          0.16
        );
        scrollTl.fromTo(children[3],
          { x: '50vw', y: '-30vh', opacity: 0 },
          { x: 0, y: 0, opacity: 1, ease: 'none' },
          0.10
        );
        scrollTl.fromTo(children[4],
          { x: '50vw', y: '30vh', opacity: 0 },
          { x: 0, y: 0, opacity: 1, ease: 'none' },
          0.14
        );

        // EXIT (70% - 100%)
        scrollTl.to([children[1], children[2]],
          { y: '-50vh', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.7
        );
        scrollTl.to(children[0],
          { y: '50vh', opacity: 0, ease: 'power2.in' },
          0.72
        );
        scrollTl.to([children[3], children[4]],
          { x: '40vw', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.74
        );
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  const handleRent = async () => {
    if (!book || hasBorrowed(book.id) || book.available <= 0) return;
    
    setIsRenting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onRent(book.id);
    setIsRenting(false);
    setRentSuccess(true);
    
    setTimeout(() => setRentSuccess(false), 2000);
  };

  if (!book) {
    return (
      <section ref={sectionRef} className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-xl text-[var(--text-secondary)]">No book selected</p>
          <button onClick={() => setView('library')} className="btn-primary mt-4">
            Go to Library
          </button>
        </div>
      </section>
    );
  }

  const alreadyBorrowed = hasBorrowed(book.id);
  const canRent = book.available > 0 && !alreadyBorrowed;

  return (
    <section ref={sectionRef} className="min-h-screen lg:h-screen bg-[var(--bg-primary)] flex items-center justify-center py-20 lg:py-0">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div ref={contentRef} className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => setView('library')}
          className="absolute -top-12 left-4 lg:top-4 lg:left-0 z-10 btn-secondary flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-4 pt-8">
          {/* Book Cover */}
          <div className="card p-0 overflow-hidden">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>

          {/* Info Card */}
          <div className="card p-5 sm:p-6">
            <span className="micro-label text-[var(--text-secondary)] mb-2 block">
              {book.genre}
            </span>
            <h2 className="text-xl sm:text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {book.title}
            </h2>
            <p className="text-base text-[var(--text-secondary)] mb-4">
              {book.author}
            </p>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">
              {book.description}
            </p>
            
            <div className="flex gap-4 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <Star size={16} className="text-[var(--accent)]" />
                <span>Grade {book.grade}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-[var(--accent)]" />
                <span>{book.pages} pages</span>
              </div>
            </div>

            {/* Rent Button */}
            <button
              onClick={handleRent}
              disabled={!canRent || isRenting || rentSuccess}
              className={`w-full btn-primary flex items-center justify-center gap-2 ${
                alreadyBorrowed ? 'bg-gray-300 cursor-not-allowed' : ''
              } ${rentSuccess ? 'bg-green-500' : ''}`}
            >
              {isRenting ? (
                <div className="w-5 h-5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
              ) : rentSuccess ? (
                <>
                  <Check size={20} />
                  Rented!
                </>
              ) : alreadyBorrowed ? (
                <>
                  <Check size={20} />
                  Already Borrowed
                </>
              ) : (
                <>
                  <BookOpen size={20} />
                  {book.available > 0 ? 'Rent this book' : 'Out of stock'}
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Available Card */}
            <div className="card p-4 bg-[var(--card-mint)] flex flex-col justify-center">
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <Check size={14} />
              </div>
              <span className="micro-label text-[var(--text-secondary)] text-xs">Available</span>
              <p className="font-bold text-xl mt-1">{book.available}</p>
              <p className="text-xs text-[var(--text-secondary)]">of {book.total} copies</p>
            </div>

            {/* Details Card */}
            <div className="card p-4 bg-[var(--card-lavender)]">
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <Users size={14} />
              </div>
              <h4 className="font-bold text-sm mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Details
              </h4>
              <div className="space-y-1 text-xs">
                <div><span className="text-[var(--text-secondary)]">Grade:</span> <strong>{book.grade}</strong></div>
                <div><span className="text-[var(--text-secondary)]">Pages:</span> <strong>{book.pages}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Absolute Positioned */}
        <div className="hidden lg:block desktop-only relative h-[80vh]">
          {/* Left Photo Card */}
          <div className="absolute left-0 top-[8%] w-[30%] h-[80%] rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Center Info Card */}
          <div className="absolute left-[34%] top-[10%] w-[42%] h-[55%] rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-8 flex flex-col justify-center">
            <span className="micro-label text-[var(--text-secondary)] mb-3">
              {book.genre}
            </span>
            <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {book.title}
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-4">
              {book.author}
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              {book.description}
            </p>
            
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Star size={16} className="text-[var(--accent)]" />
                <span>Grade {book.grade}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} className="text-[var(--accent)]" />
                <span>{book.pages} pages</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleRent}
            disabled={!canRent || isRenting || rentSuccess}
            className={`absolute left-[38%] top-[68%] btn-primary flex items-center gap-2 ${
              alreadyBorrowed ? 'bg-gray-300 cursor-not-allowed' : ''
            } ${rentSuccess ? 'bg-green-500' : ''}`}
          >
            {isRenting ? (
              <div className="w-5 h-5 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
            ) : rentSuccess ? (
              <>
                <Check size={20} />
                Rented!
              </>
            ) : alreadyBorrowed ? (
              <>
                <Check size={20} />
                Already Borrowed
              </>
            ) : (
              <>
                <BookOpen size={20} />
                {book.available > 0 ? 'Rent this book' : 'Out of stock'}
              </>
            )}
          </button>

          {/* Right Mint Card */}
          <div className="absolute right-0 top-[8%] w-[20%] h-[25%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-mint)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
              <Check size={18} />
            </div>
            <span className="micro-label text-[var(--text-secondary)]">Available</span>
            <p className="font-bold text-2xl mt-1">{book.available}</p>
            <p className="text-xs text-[var(--text-secondary)]">of {book.total} copies</p>
          </div>

          {/* Right Lavender Card */}
          <div className="absolute right-0 top-[36%] w-[20%] h-[52%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-lavender)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5">
            <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-4">
              <Users size={18} />
            </div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Book Details
            </h4>
            <div className="space-y-4">
              <div>
                <span className="micro-label text-[var(--text-secondary)] block mb-1">Grade</span>
                <p className="font-bold">{book.grade}</p>
              </div>
              <div>
                <span className="micro-label text-[var(--text-secondary)] block mb-1">Pages</span>
                <p className="font-bold">{book.pages}</p>
              </div>
              <div>
                <span className="micro-label text-[var(--text-secondary)] block mb-1">Genre</span>
                <p className="font-bold">{book.genre}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
