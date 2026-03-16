import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Mail, BookOpen, GraduationCap, Calendar, HelpCircle } from 'lucide-react';
import type { View } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  setView: (view: View) => void;
}

export function Footer({ setView }: FooterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const links = [
    { label: 'Library', view: 'library' as View, icon: BookOpen },
    { label: 'Subjects', view: 'subjects' as View, icon: GraduationCap },
    { label: 'Events', view: 'events' as View, icon: Calendar },
    { label: 'Help', view: 'dashboard' as View, icon: HelpCircle },
  ];

  return (
    <section ref={sectionRef} className="section-flowing bg-[var(--bg-primary)] pb-8">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Card */}
        <div
          ref={cardRef}
          className="card p-8 sm:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Contact */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                  <span className="text-xl font-black">S</span>
                </div>
                <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  School Portal
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)]">
                    123 Maple Street, Springfield
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-[var(--text-secondary)]" />
                  <a 
                    href="mailto:help@schoolportal.edu"
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    help@schoolportal.edu
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Links */}
            <div>
              <h4 className="font-bold mb-4 micro-label text-[var(--text-secondary)]">
                QUICK LINKS
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {links.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => setView(link.view)}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-2"
                  >
                    <link.icon size={18} />
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t-2 border-[rgba(26,26,26,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-secondary)]">
              © 2026 School Portal. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <button 
                onClick={() => setView('privacy')}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setView('terms')}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
