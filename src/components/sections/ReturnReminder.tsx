import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import type { View, BorrowedBook, Book } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface ReturnReminderProps {
  setView: (view: View) => void;
  borrowedBooks: (BorrowedBook & { book: Book })[];
}

export function ReturnReminder({ setView, borrowedBooks }: ReturnReminderProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
          { x: '-60vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        );
        scrollTl.fromTo(children[1],
          { x: '60vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.06
        );
        scrollTl.fromTo(children[2],
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'back.out(1.6)' },
          0.18
        );
        scrollTl.fromTo(children[3],
          { y: '-30vh', rotate: -6, opacity: 0 },
          { y: 0, rotate: 0, opacity: 1, ease: 'none' },
          0.12
        );
        scrollTl.fromTo(children[4],
          { y: '30vh', rotate: 6, opacity: 0 },
          { y: 0, rotate: 0, opacity: 1, ease: 'none' },
          0.16
        );

        // EXIT (70% - 100%)
        scrollTl.to(children[1],
          { x: '55vw', opacity: 0, ease: 'power2.in' },
          0.7
        );
        scrollTl.to(children[0],
          { x: '-55vw', opacity: 0, ease: 'power2.in' },
          0.72
        );
        scrollTl.to([children[3], children[4]],
          { opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.74
        );
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  const dueSoonCount = borrowedBooks.filter(bb => {
    const dueDate = new Date(bb.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }).length;

  return (
    <section ref={sectionRef} className="min-h-screen lg:h-screen bg-[var(--bg-secondary)] flex items-center justify-center py-16 lg:py-0">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none mix-blend-overlay" />

      <div ref={contentRef} className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-4">
          {/* Photo Card */}
          <div className="card p-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"
              alt="Book stack"
              className="w-full h-48 sm:h-64 object-cover"
            />
          </div>

          {/* Text Card */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Don't forget to return!
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-5 leading-relaxed">
              Keep your library record clear—return books by their due date to avoid late fees.
              {dueSoonCount > 0 && (
                <span className="block mt-2 font-bold text-red-600">
                  You have {dueSoonCount} book{dueSoonCount > 1 ? 's' : ''} due soon!
                </span>
              )}
            </p>
            <button
              onClick={() => setView('mybooks')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Calendar size={18} />
              View due dates
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Due Soon Card */}
            <div className="card p-4 bg-[var(--card-mint)] flex flex-col justify-center">
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <Calendar size={14} />
              </div>
              <span className="micro-label text-[var(--text-secondary)] text-xs">Due Soon</span>
              <p className="font-bold text-xl mt-1">{dueSoonCount}</p>
              <p className="text-xs text-[var(--text-secondary)]">books</p>
            </div>

            {/* Late Fee Card */}
            <div className="card p-4 bg-[var(--card-lavender)] flex flex-col justify-center">
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <AlertCircle size={14} />
              </div>
              <span className="micro-label text-[var(--text-secondary)] text-xs">Late fee</span>
              <p className="font-bold text-lg mt-1">$0.50/day</p>
              <p className="text-xs text-[var(--text-secondary)]">per book</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Absolute Positioned */}
        <div className="hidden lg:block desktop-only relative h-[80vh]">
          {/* Photo Card (Left) */}
          <div className="absolute left-0 top-[10%] w-[45%] h-[75%] rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1000&fit=crop"
              alt="Book stack"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Card (Right) */}
          <div className="absolute right-0 top-[15%] w-[50%] h-[60%] rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-10 flex flex-col justify-center">
            <h2 className="text-4xl xl:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Don't forget to return!
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8 leading-relaxed">
              Keep your library record clear—return books by their due date to avoid late fees.
              {dueSoonCount > 0 && (
                <span className="block mt-2 font-bold text-red-600">
                  You have {dueSoonCount} book{dueSoonCount > 1 ? 's' : ''} due soon!
                </span>
              )}
            </p>
            <button
              onClick={() => setView('mybooks')}
              className="btn-primary self-start flex items-center gap-2"
            >
              <Calendar size={20} />
              View due dates
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Mint Card */}
          <div className="absolute left-[38%] top-[5%] w-[18%] h-[20%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-mint)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
              <Calendar size={18} />
            </div>
            <span className="micro-label text-[var(--text-secondary)]">Due Soon</span>
            <p className="font-bold text-2xl mt-1">{dueSoonCount}</p>
            <p className="text-xs text-[var(--text-secondary)]">books</p>
          </div>

          {/* Lavender Card */}
          <div className="absolute right-[5%] bottom-[5%] w-[16%] h-[20%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-lavender)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5 flex flex-col justify-center">
            <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
              <AlertCircle size={18} />
            </div>
            <span className="micro-label text-[var(--text-secondary)]">Late fee</span>
            <p className="font-bold text-xl mt-1">$0.50/day</p>
            <p className="text-xs text-[var(--text-secondary)]">per book</p>
          </div>
        </div>
      </div>
    </section>
  );
}
