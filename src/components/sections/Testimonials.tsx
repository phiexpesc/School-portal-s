import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { x: '-6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards animation
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards,
          { y: '10vh', scale: 0.96, opacity: 0, rotate: 1 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-flowing bg-[var(--bg-primary)]">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div ref={headerRef} className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
            What students say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="testimonial-card hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-4">
                <Quote size={18} />
              </div>
              <p className="text-lg font-bold mb-6 leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center font-bold text-sm">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{testimonial.grade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
