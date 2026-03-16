import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Coins, BookOpen, ArrowRight, Megaphone, X, ChevronRight } from 'lucide-react';
import type { View, User, Announcement } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  setView: (view: View) => void;
  user: User | null;
  dueSoonCount: number;
  announcements: Announcement[];
}

export function Hero({ setView, user, dueSoonCount, announcements }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      // Auto-play entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(content.children,
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1 }
      );

      // Scroll-driven animation (desktop only)
      const mm = gsap.matchMedia();
      
      mm.add('(min-width: 1024px)', () => {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 0.6,
            onLeaveBack: () => {
              gsap.set(content.children, { opacity: 1, x: 0, y: 0, scale: 1 });
            }
          }
        });

        // EXIT phase (70% - 100%)
        scrollTl.fromTo(content.children,
          { y: 0, opacity: 1 },
          { y: '-15vh', opacity: 0, ease: 'power2.in', stagger: 0.02 },
          0.7
        );
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  const borrowedCount = user?.borrowedBooks.filter(bb => !bb.returned).length || 0;
  const activeAnnouncements = announcements.filter(a => a.active);
  const latestAnnouncement = activeAnnouncements.length > 0 ? activeAnnouncements[activeAnnouncements.length - 1] : null;

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  return (
    <section ref={sectionRef} className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center py-20 lg:py-16">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div ref={contentRef} className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-4">
          {/* Welcome Card */}
          <div className="card p-6">
            <span className="micro-label text-[var(--text-secondary)] mb-3 block">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-[var(--text-secondary)] mb-4">
              You have <span className="font-bold text-[var(--text-primary)]">{borrowedCount} books</span> on loan
              {dueSoonCount > 0 && (
                <>, and <span className="font-bold text-red-600">{dueSoonCount} due soon</span></>
              )}.
            </p>
            <button
              onClick={() => setView('library')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <BookOpen size={18} />
              Go to Library
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Photo Card */}
          <div className="card p-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
              alt="Student reading"
              className="w-full h-48 sm:h-64 object-cover"
            />
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Announcement Card - Clickable */}
            <button 
              onClick={() => latestAnnouncement && handleAnnouncementClick(latestAnnouncement)}
              className={`card p-4 bg-[var(--card-mint)] text-left transition-transform hover:scale-[1.02] ${!latestAnnouncement ? 'opacity-70' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <Megaphone size={14} />
              </div>
              <span className="micro-label text-[var(--text-secondary)] block text-xs">Announcement</span>
              <p className="font-bold text-sm mt-1 line-clamp-2">
                {latestAnnouncement ? latestAnnouncement.title : 'No announcements yet'}
              </p>
              {latestAnnouncement && (
                <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                  Click to read <ChevronRight size={12} />
                </p>
              )}
            </button>

            {/* Credits Card */}
            <div className="card p-4 bg-[var(--card-lavender)]">
              <div className="w-8 h-8 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-2">
                <Coins size={14} />
              </div>
              <span className="micro-label text-[var(--text-secondary)] block text-xs">Credits</span>
              <p className="font-bold text-xl mt-1">{borrowedCount}/5</p>
            </div>
          </div>

          {/* All Announcements Preview */}
          {activeAnnouncements.length > 0 && (
            <div className="card p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  All Announcements ({activeAnnouncements.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeAnnouncements.slice().reverse().map((ann) => (
                  <button
                    key={ann.id}
                    onClick={() => handleAnnouncementClick(ann)}
                    className="w-full text-left p-3 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--accent)] transition-colors border-[2px] border-transparent hover:border-[rgba(26,26,26,0.85)]"
                  >
                    <p className="font-bold text-sm line-clamp-1">{ann.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-1">{ann.message}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout - Grid Based */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left Column - Photo */}
            <div className="col-span-5">
              <div className="rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.10)] aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=1000&fit=crop"
                  alt="Student reading"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="col-span-7 space-y-5">
              {/* Welcome Card */}
              <div className="rounded-[34px] border-[3px] border-[rgba(26,26,26,0.85)] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-8 xl:p-10">
                <span className="micro-label text-[var(--text-secondary)] mb-4 block">
                  Student Dashboard
                </span>
                <h1 className="text-3xl xl:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  Welcome back, {user?.name || 'Student'}!
                </h1>
                <p className="text-[var(--text-secondary)] text-base xl:text-lg mb-6 leading-relaxed">
                  You have <span className="font-bold text-[var(--text-primary)]">{borrowedCount} books</span> on loan
                  {dueSoonCount > 0 && (
                    <>, and <span className="font-bold text-red-600">{dueSoonCount} due soon</span></>
                  )}.
                  Check your library tab to avoid late fees.
                </p>
                <button
                  onClick={() => setView('library')}
                  className="btn-primary flex items-center gap-2"
                >
                  <BookOpen size={20} />
                  Go to Library
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Cards Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Announcement Card */}
                <button 
                  onClick={() => latestAnnouncement && handleAnnouncementClick(latestAnnouncement)}
                  className={`rounded-[24px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-mint)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5 flex flex-col justify-center text-left transition-transform hover:scale-[1.02] aspect-square ${!latestAnnouncement ? 'opacity-70' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
                    <Megaphone size={18} />
                  </div>
                  <span className="micro-label text-[var(--text-secondary)]">Announcement</span>
                  <p className="font-bold text-sm mt-1 line-clamp-2">
                    {latestAnnouncement ? latestAnnouncement.title : 'No announcements yet'}
                  </p>
                </button>

                {/* Credits Card */}
                <div className="rounded-[24px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-lavender)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5 flex flex-col justify-center aspect-square">
                  <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
                    <Coins size={18} />
                  </div>
                  <span className="micro-label text-[var(--text-secondary)]">Credits</span>
                  <p className="font-bold text-2xl mt-1">{borrowedCount}/5</p>
                  <p className="text-xs text-[var(--text-secondary)]">Books borrowed</p>
                </div>

                {/* More Announcements Card */}
                {activeAnnouncements.length > 1 ? (
                  <div className="rounded-[24px] border-[3px] border-[rgba(26,26,26,0.85)] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-4 overflow-hidden aspect-square">
                    <h4 className="font-bold text-xs mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      More
                    </h4>
                    <div className="space-y-2 overflow-y-auto max-h-[calc(100%-1.5rem)]">
                      {activeAnnouncements.slice(0, -1).reverse().slice(0, 3).map((ann) => (
                        <button
                          key={ann.id}
                          onClick={() => handleAnnouncementClick(ann)}
                          className="w-full text-left p-2 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--accent)] transition-colors text-xs"
                        >
                          <p className="font-bold line-clamp-1">{ann.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border-[3px] border-[rgba(26,26,26,0.85)] bg-[var(--card-peach)] shadow-[0_18px_40px_rgba(0,0,0,0.10)] p-5 flex flex-col justify-center aspect-square">
                    <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center mb-3">
                      <BookOpen size={18} />
                    </div>
                    <span className="micro-label text-[var(--text-secondary)]">Library</span>
                    <p className="font-bold text-sm mt-1">Browse Books</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-5 sm:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center flex-shrink-0">
                  <Megaphone size={18} />
                </div>
                <div>
                  <span className="micro-label text-[var(--text-secondary)] block">Announcement</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {selectedAnnouncement.title}
            </h3>
            
            <div className="bg-[var(--bg-primary)] rounded-2xl p-4 sm:p-5">
              <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.message}
              </p>
            </div>
            
            <button
              onClick={() => setShowAnnouncementModal(false)}
              className="w-full btn-primary mt-5"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
