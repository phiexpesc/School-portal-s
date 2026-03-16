import { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  User, 
  LogOut, 
  Shield, 
  Home,
  Menu,
  X,
  TrendingUp,
  Mail,
  Settings,
  Ticket,
  Clock,
  Users
} from 'lucide-react';
import type { View } from '@/types';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  userRole?: 'student' | 'teacher' | 'admin';
  onLogout: () => void;
  userName?: string;
  unreadMessages?: number;
}

export function Navbar({ currentView, setView, isLoggedIn, isAdmin, userRole = 'student', onLogout, userName, unreadMessages = 0 }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);

  const navItems: { view: View; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    { view: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: <Home size={20} /> },
    { view: 'library', label: 'Library', shortLabel: 'Library', icon: <BookOpen size={20} /> },
    { view: 'subjects', label: 'Subjects', shortLabel: 'Subjects', icon: <GraduationCap size={20} /> },
    { view: 'events', label: 'Events', shortLabel: 'Events', icon: <Calendar size={20} /> },
    { view: 'mybooks', label: 'My Books', shortLabel: 'My Books', icon: <BookOpen size={20} /> },
  ];

  const studentMenuItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'grades', label: 'My Grades', icon: <TrendingUp size={18} /> },
    { view: 'messages', label: 'Messages', icon: <Mail size={18} /> },
    { view: 'enrollment', label: 'Enrollment', icon: <GraduationCap size={18} /> },
    { view: 'profile', label: 'My Profile', icon: <Settings size={18} /> },
    { view: 'tickets', label: 'Support Tickets', icon: <Ticket size={18} /> },
    { view: 'attendance', label: 'Attendance', icon: <Clock size={18} /> },
  ];

  const teacherMenuItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'sections', label: 'My Sections', icon: <Users size={18} /> },
    { view: 'attendance', label: 'Attendance', icon: <Clock size={18} /> },
    { view: 'messages', label: 'Messages', icon: <Mail size={18} /> },
    { view: 'profile', label: 'My Profile', icon: <Settings size={18} /> },
  ];

  const handleNavClick = (view: View) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-md border-b-[3px] border-[rgba(26,26,26,0.1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2 text-lg sm:text-xl font-black"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg">S</span>
            </div>
            <span className="hidden sm:inline">School Portal</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {isLoggedIn && navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`nav-link flex items-center gap-2 ${currentView === item.view ? 'bg-white shadow-sm' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Admin Link - Desktop */}
            {isLoggedIn && isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`nav-link flex items-center gap-2 ${currentView === 'admin' ? 'bg-[var(--accent)]' : ''}`}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>
            )}

            {/* Student/Teacher Menu - Desktop */}
            {isLoggedIn && !isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setStudentMenuOpen(!studentMenuOpen)}
                  className={`nav-link flex items-center gap-2 ${
                    (userRole === 'teacher' ? teacherMenuItems : studentMenuItems).some(i => i.view === currentView) ? 'bg-[var(--accent)]' : ''
                  }`}
                >
                  <User size={18} />
                  <span>{userRole === 'teacher' ? 'Teacher Menu' : 'My Account'}</span>
                  {unreadMessages > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>
                
                {studentMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl border-[3px] border-[rgba(26,26,26,0.85)] shadow-lg py-2 z-50 max-h-[70vh] overflow-y-auto">
                    <p className="px-4 py-2 text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">
                      {userRole === 'teacher' ? 'Teacher Options' : 'My Account'}
                    </p>
                    {(userRole === 'teacher' ? teacherMenuItems : studentMenuItems).map((item) => (
                      <button
                        key={item.view}
                        onClick={() => {
                          handleNavClick(item.view);
                          setStudentMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-primary)] transition-colors ${
                          currentView === item.view ? 'bg-[var(--bg-primary)]' : ''
                        }`}
                      >
                        {item.icon}
                        <span className="text-sm font-bold">{item.label}</span>
                        {item.view === 'messages' && unreadMessages > 0 && (
                          <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {isLoggedIn ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l-2 border-[rgba(26,26,26,0.15)]">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border-[2px] border-[rgba(26,26,26,0.85)]">
                  <User size={16} />
                  <span className="text-sm font-bold">{userName || 'Student'}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-white/80 transition-colors border-[2px] border-transparent hover:border-[rgba(26,26,26,0.85)]"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('login')}
                className="btn-primary text-sm py-2 px-5"
              >
                Login
              </button>
            )}
          </div>

          {/* Tablet Navigation - Icon Only */}
          <div className="hidden sm:flex lg:hidden items-center gap-1">
            {isLoggedIn && navItems.slice(0, 4).map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`p-2.5 rounded-full transition-all ${currentView === item.view ? 'bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)]' : 'hover:bg-white/60'}`}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
            
            {/* Admin Link - Tablet */}
            {isLoggedIn && isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`p-2.5 rounded-full transition-all ${currentView === 'admin' ? 'bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)]' : 'hover:bg-white/60'}`}
                title="Admin"
              >
                <Shield size={20} />
              </button>
            )}
            
            {isLoggedIn ? (
              <div className="flex items-center gap-1 ml-1 pl-1 border-l-2 border-[rgba(26,26,26,0.15)]">
                <button
                  onClick={() => handleNavClick('mybooks')}
                  className={`p-2.5 rounded-full transition-all ${currentView === 'mybooks' ? 'bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)]' : 'hover:bg-white/60'}`}
                  title="My Books"
                >
                  <User size={20} />
                </button>
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-full hover:bg-white/80 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('login')}
                className="btn-primary text-sm py-2 px-4"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={() => handleNavClick('mybooks')}
                className={`p-2 rounded-full transition-all ${currentView === 'mybooks' ? 'bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)]' : 'hover:bg-white/60'}`}
              >
                <User size={22} />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/80 transition-colors border-[2px] border-[rgba(26,26,26,0.85)] bg-white"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && isLoggedIn && (
        <div className="fixed inset-0 z-40 sm:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-[72px] left-4 right-4 bg-white rounded-[24px] border-[3px] border-[rgba(26,26,26,0.85)] shadow-[0_18px_40px_rgba(0,0,0,0.20)] p-4 animate-in slide-in-from-top-2 fade-in duration-200 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-2xl border-[2px] border-[rgba(26,26,26,0.85)] mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">{userName || 'User'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isAdmin ? 'Administrator' : userRole === 'teacher' ? 'Teacher' : 'Student'}
                  </p>
                </div>
              </div>

              {/* Nav Items */}
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    currentView === item.view 
                      ? 'bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)]' 
                      : 'hover:bg-[var(--bg-primary)] border-[2px] border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentView === item.view ? 'bg-white' : 'bg-[var(--bg-primary)]'}`}>
                    {item.icon}
                  </div>
                  <span className="font-bold text-base">{item.label}</span>
                </button>
              ))}

              {/* Admin Link */}
              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    currentView === 'admin' 
                      ? 'bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)]' 
                      : 'hover:bg-[var(--card-lavender)] border-[2px] border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentView === 'admin' ? 'bg-white' : 'bg-[var(--card-lavender)]'}`}>
                    <Shield size={20} />
                  </div>
                  <span className="font-bold text-base">Admin Dashboard</span>
                </button>
              )}

              {/* Student/Teacher Menu Items */}
              {!isAdmin && (
                <>
                  <div className="pt-2 border-t-2 border-[rgba(26,26,26,0.1)]">
                    <p className="text-xs text-[var(--text-secondary)] px-4 mb-2">
                      {userRole === 'teacher' ? 'TEACHER MENU' : 'MY ACCOUNT'}
                    </p>
                    {(userRole === 'teacher' ? teacherMenuItems : studentMenuItems).map((item) => (
                      <button
                        key={item.view}
                        onClick={() => handleNavClick(item.view)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          currentView === item.view 
                            ? 'bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)]' 
                            : 'hover:bg-[var(--bg-primary)] border-[2px] border-transparent'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentView === item.view ? 'bg-white' : 'bg-[var(--bg-primary)]'}`}>
                          {item.icon}
                        </div>
                        <span className="font-bold text-base">{item.label}</span>
                        {item.view === 'messages' && unreadMessages > 0 && (
                          <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Logout */}
              <div className="pt-2 border-t-2 border-[rgba(26,26,26,0.1)]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 border-[2px] border-transparent hover:border-red-200 transition-all text-red-600"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <LogOut size={20} />
                  </div>
                  <span className="font-bold text-base">Logout</span>
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Mobile Login Menu */}
      {mobileMenuOpen && !isLoggedIn && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-[72px] left-4 right-4 bg-white rounded-[24px] border-[3px] border-[rgba(26,26,26,0.85)] shadow-[0_18px_40px_rgba(0,0,0,0.20)] p-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setView('login');
              }}
              className="w-full btn-primary"
            >
              Login to School Portal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
