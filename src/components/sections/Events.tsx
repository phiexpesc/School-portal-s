import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface EventsProps {
  events: Event[];
}

export function Events({ events }: EventsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
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
          { x: '-12vw', opacity: 0, rotate: -1 },
          {
            x: 0,
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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Events this month
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Workshops, reading clubs, and guest speakers.
          </p>
        </div>

        {/* Events List */}
        <div ref={cardsRef} className="space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-card cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="event-image"
              />
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-xl font-black mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {event.title}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {event.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[var(--accent)]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[var(--accent)]" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[var(--accent)]" />
                    <span>Library Hall</span>
                  </div>
                </div>
              </div>
              <button className="self-center btn-secondary flex items-center gap-2 hidden sm:flex">
                Join
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
