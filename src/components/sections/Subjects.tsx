import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FlaskConical, BookOpen, Languages, Calculator, Palette, Code, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const subjects = [
  { id: '1', name: 'Science', icon: FlaskConical, color: 'var(--card-mint)', count: 12 },
  { id: '2', name: 'History', icon: BookOpen, color: 'var(--card-peach)', count: 8 },
  { id: '3', name: 'Languages', icon: Languages, color: 'var(--card-lavender)', count: 15 },
];

const chips = [
  { name: 'Math', icon: Calculator },
  { name: 'Art', icon: Palette },
  { name: 'Coding', icon: Code },
];

export function Subjects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      
      mm.add('(min-width: 1024px)', () => {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.6,
          }
        });

        const children = content.children;
        
        // ENTRANCE (0% - 30%)
        scrollTl.fromTo(children[0],
          { x: '-50vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        );
        
        for (let i = 1; i <= 3; i++) {
          scrollTl.fromTo(children[i],
            { x: '60vw', opacity: 0, rotate: i % 2 === 0 ? -2 : 2 },
            { x: 0, opacity: 1, rotate: 0, ease: 'none' },
            0.05 * i
          );
        }

        scrollTl.fromTo(children[4]?.children || [],
          { y: '30vh', opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0.08
        );

        scrollTl.fromTo(children[5],
          { y: '40vh', scale: 0.9, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, ease: 'none' },
          0.16
        );

        // EXIT (70% - 100%)
        scrollTl.to([children[1], children[2], children[3]],
          { x: '55vw', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.7
        );
        scrollTl.to([children[0], children[4], children[5]],
          { x: '-40vw', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.72
        );
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen lg:h-screen bg-[var(--bg-primary)] flex items-center justify-center py-16 lg:py-0">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div ref={contentRef} className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              What will you explore today?
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Pick a subject to see assignments, resources, and recommended reads.
            </p>
          </div>

          {/* Subject Cards */}
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="card p-4 sm:p-5 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ background: subject.color }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center flex-shrink-0">
                  <subject.icon size={24} className="sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                    {subject.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {subject.count} books available
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Chips */}
          <div className="flex gap-2 flex-wrap justify-center py-2">
            {chips.map((chip) => (
              <button
                key={chip.name}
                className="chip flex items-center gap-2 text-sm py-2 px-4"
              >
                <chip.icon size={14} />
                {chip.name}
              </button>
            ))}
          </div>

          {/* Info Card */}
          <div className="card p-4 sm:p-5 bg-[var(--card-yellow)] flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="font-bold text-base sm:text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                Library open until 6 PM today
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Come visit us!
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Absolute Positioned */}
        <div className="hidden lg:block relative h-[80vh]">
          {/* Header Block (Left Top) */}
          <div className="absolute left-0 top-[5%] w-[45%]">
            <h2 className="text-4xl xl:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              What will you explore today?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Pick a subject to see assignments, resources, and recommended reads.
            </p>
          </div>

          {/* Subject Cards (Right Side) */}
          {subjects.map((subject, index) => (
            <div
              key={subject.id}
              className="absolute right-0 w-[48%] h-[22%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-6 flex items-center gap-6 cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ 
                background: subject.color,
                top: `${8 + index * 30}%`
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center flex-shrink-0">
                <subject.icon size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  {subject.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {subject.count} books available
                </p>
              </div>
            </div>
          ))}

          {/* Chips Row (Left Mid) */}
          <div className="absolute left-0 top-[40%] flex gap-3 flex-wrap">
            {chips.map((chip) => (
              <button
                key={chip.name}
                className="chip flex items-center gap-2"
              >
                <chip.icon size={16} />
                {chip.name}
              </button>
            ))}
          </div>

          {/* Info Card (Pale Yellow) */}
          <div className="absolute left-0 bottom-[5%] w-[30%] h-[28%] rounded-[28px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-yellow)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-6 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-4">
              <Clock size={22} />
            </div>
            <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
              Library open until 6 PM today
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Come visit us!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
