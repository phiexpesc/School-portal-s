import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Bell, Calendar, ChevronRight, X } from 'lucide-react';
import type { User, Announcement } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  user: User | null;
  onViewChange: (view: string) => void;
  getActiveAnnouncements: () => Promise<Announcement[]>;
  getDueSoonBooks: () => Promise<any[]>;
}

export function Hero({ user, onViewChange, getActiveAnnouncements, getDueSoonBooks }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dueSoonCount, setDueSoonCount] = useState(0);

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [anns, dueSoon] = await Promise.all([
          getActiveAnnouncements(),
          getDueSoonBooks()
        ]);
        setAnnouncements(anns);
        setDueSoonCount(dueSoon.length);
      } catch (error) {
        console.error('Error loading hero data:', error);
      }
    };

    loadData();
  }, [getActiveAnnouncements, getDueSoonBooks]);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(content.children,
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1 }
      );

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
    <section ref={sectionRef} className="relative min-h-screen bg-[#f8f7f4] overflow-hidden">
      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-[rgba(26,26,26,0.1)] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Student Dashboard</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-3">
            Welcome back, {user?.name || 'Student'}!
          </h2>
          
          <p className="text-gray-600 text-lg">
            You have {borrowedCount} book{borrowedCount !== 1 ? 's' : ''} on loan
            {dueSoonCount > 0 && (
              <>, and <span className="text-amber-600 font-medium">{dueSoonCount} due soon</span></>
            )}.
            Check your library tab to avoid late fees.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Announcement Card */}
          {latestAnnouncement && (
            <div 
              onClick={() => handleAnnouncementClick(latestAnnouncement)}
              className="bg-[#c4f692] rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-[#1a1a1a]" />
                <span className="text-xs font-bold text-[#1a1a1a] uppercase">Latest Announcement</span>
              </div>
              <h3 className="font-bold text-[#1a1a1a] mb-1 line-clamp-2">{latestAnnouncement.title}</h3>
              <p className="text-sm text-[#1a1a1a]/70 line-clamp-2">{latestAnnouncement.message}</p>
            </div>
          )}

          {/* Credits Card */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-bold uppercase opacity-70">Books Borrowed</span>
            </div>
            <div className="text-4xl font-bold">{borrowedCount}<span className="text-lg opacity-50">/5</span></div>
            <p className="text-sm opacity-70 mt-1">Maximum allowed</p>
          </div>

          {/* More Announcements */}
          {activeAnnouncements.length > 1 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-[rgba(26,26,26,0.1)]">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase">More Updates</span>
              </div>
              <div className="space-y-2">
                {activeAnnouncements.slice(0, -1).reverse().slice(0, 3).map((ann) => (
                  <div 
                    key={ann.id}
                    onClick={() => handleAnnouncementClick(ann)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1a1a1a] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="line-clamp-1">{ann.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowAnnouncementModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[#1a1a1a]" />
              <span className="text-xs font-bold text-gray-500 uppercase">Announcement</span>
            </div>
            
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">{selectedAnnouncement.title}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
            </p>
            
            <p className="text-gray-700 leading-relaxed">{selectedAnnouncement.message}</p>
          </div>
        </div>
      )}
    </section>
  );
}
