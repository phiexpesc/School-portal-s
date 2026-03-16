import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, DollarSign, AlertCircle } from 'lucide-react';
import type { BorrowedBook } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface ReturnReminderProps {
  borrowedBooks: BorrowedBook[];
  getDueSoonBooks: () => Promise<BorrowedBook[]>;
}

export function ReturnReminder({ borrowedBooks: initialBorrowedBooks, getDueSoonBooks }: ReturnReminderProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dueSoonCount, setDueSoonCount] = useState(0);

  // Load due soon count from Firebase
  useEffect(() => {
    const loadDueSoon = async () => {
      try {
        const books = await getDueSoonBooks();
        setDueSoonCount(books.length);
      } catch (error) {
        console.error('Error loading due soon books:', error);
      }
    };
    loadDueSoon();
  }, [getDueSoonBooks, initialBorrowedBooks]);

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

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-[#f8f7f4] overflow-hidden">
      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-6">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop"
              alt="Library"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="bg-white rounded-3xl p-8 border-2 border-[rgba(26,26,26,0.1)]">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Don't forget to return!</h2>
            <p className="text-gray-600 mb-4">
              Keep your library record clear—return books by their due date to avoid late fees.
            </p>
            {dueSoonCount > 0 && (
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <AlertCircle className="w-5 h-5" />
                You have {dueSoonCount} book{dueSoonCount > 1 ? 's' : ''} due soon!
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#c4f692] rounded-2xl p-6">
              <Clock className="w-8 h-8 text-[#1a1a1a] mb-3" />
              <div className="text-3xl font-bold text-[#1a1a1a]">{dueSoonCount}</div>
              <div className="text-sm text-[#1a1a1a]/70">books due soon</div>
            </div>
            
            <div className="bg-[#d4c5f9] rounded-2xl p-6">
              <DollarSign className="w-8 h-8 text-[#1a1a1a] mb-3" />
              <div className="text-3xl font-bold text-[#1a1a1a]">$0.50</div>
              <div className="text-sm text-[#1a1a1a]/70">per day late fee</div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block desktop-only relative h-[80vh]">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=800&fit=crop"
              alt="Library"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] bg-white rounded-3xl p-10 shadow-xl border-2 border-[rgba(26,26,26,0.1)]">
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">Don't forget to return!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Keep your library record clear—return books by their due date to avoid late fees.
            </p>
            {dueSoonCount > 0 && (
              <div className="flex items-center gap-2 text-amber-600 font-medium mb-6">
                <AlertCircle className="w-5 h-5" />
                You have {dueSoonCount} book{dueSoonCount > 1 ? 's' : ''} due soon!
              </div>
            )}
          </div>

          <div className="absolute right-[100px] top-[10%] w-[200px] bg-[#c4f692] rounded-2xl p-6 shadow-lg">
            <Clock className="w-8 h-8 text-[#1a1a1a] mb-3" />
            <div className="text-4xl font-bold text-[#1a1a1a]">{dueSoonCount}</div>
            <div className="text-sm text-[#1a1a1a]/70">books due soon</div>
          </div>

          <div className="absolute right-[50px] bottom-[10%] w-[200px] bg-[#d4c5f9] rounded-2xl p-6 shadow-lg">
            <DollarSign className="w-8 h-8 text-[#1a1a1a] mb-3" />
            <div className="text-4xl font-bold text-[#1a1a1a]">$0.50</div>
            <div className="text-sm text-[#1a1a1a]/70">per day late fee</div>
          </div>
        </div>
      </div>
    </section>
  );
}
