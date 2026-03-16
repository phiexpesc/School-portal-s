import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Send, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function Newsletter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { y: 60, scale: 0.98, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section ref={sectionRef} className="section-flowing bg-[var(--bg-secondary)]">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none mix-blend-overlay" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* CTA Card */}
        <div
          ref={cardRef}
          className="card p-8 sm:p-12 min-h-[44vh] flex flex-col justify-center"
        >
          <div className="text-center max-w-xl mx-auto">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <Mail size={28} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Get the weekly bulletin
            </h2>
            <p className="text-[var(--text-secondary)] mb-8">
              New books, events, and deadlines—delivered every Monday.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="input-field pl-11 text-sm w-full"
                  disabled={isSubscribed}
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribed}
                className={`btn-primary flex items-center justify-center gap-2 whitespace-nowrap ${
                  isSubscribed ? 'bg-green-500' : ''
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Check size={18} />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Subscribe
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-[var(--text-secondary)] mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
