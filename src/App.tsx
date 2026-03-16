import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, FileText, Shield, QrCode, Check, AlertCircle, BookOpen, TrendingUp, X } from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { Login } from '@/components/sections/Login';
import { Hero } from '@/components/sections/Hero';
import { Subjects } from '@/components/sections/Subjects';
import { LibrarySearch } from '@/components/sections/LibrarySearch';
import { BookDetail } from '@/components/sections/BookDetail';
import { ReturnReminder } from '@/components/sections/ReturnReminder';
import { Events } from '@/components/sections/Events';
import { Testimonials } from '@/components/sections/Testimonials';
import { Newsletter } from '@/components/sections/Newsletter';
import { Footer } from '@/components/sections/Footer';
import { MyBooks } from '@/components/sections/MyBooks';
import { AdminDashboard } from '@/components/sections/AdminDashboard';
import { QRScanner } from '@/components/sections/QRScanner';
import { EnrollmentModal } from '@/components/sections/Enrollment';
import { GradesModal } from '@/components/sections/Grades';
import { MessagesModal } from '@/components/sections/Messages';
import { TicketsModal } from '@/components/sections/Tickets';
import { ProfileModal } from '@/components/sections/Profile';
import { SectionsModal } from '@/components/sections/Sections';
import { AttendanceModal } from '@/components/sections/Attendance';
import { StudentAttendanceModal } from '@/components/sections/StudentAttendance';
import { Ticket, Users, Clock, Plus, MessageSquare, CalendarDays } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useLoading } from '@/contexts/LoadingContext';
import type { View, Book } from '@/types';

gsap.registerPlugin(ScrollTrigger);

// Teacher Expandable FAB Menu Component
interface TeacherFabMenuProps {
  unreadCount: number;
  onSections: () => void;
  onGrades: () => void;
  onAttendance: () => void;
  onMessages: () => void;
}

function TeacherFabMenu({ unreadCount, onSections, onGrades, onAttendance, onMessages }: TeacherFabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'sections', label: 'My Sections', icon: Users, color: 'bg-[var(--card-mint)]', onClick: onSections },
    { id: 'grades', label: 'Student Grades', icon: TrendingUp, color: 'bg-[var(--card-yellow)]', onClick: onGrades },
    { id: 'attendance', label: 'Attendance', icon: Clock, color: 'bg-[var(--card-peach)]', onClick: onAttendance },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'bg-[var(--card-lavender)]', onClick: onMessages, badge: unreadCount },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Menu Items */}
      <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              item.onClick();
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 group`}
          >
            <span className="px-3 py-1.5 bg-white rounded-lg border-[2px] border-[rgba(26,26,26,0.85)] text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
            <div className={`w-12 h-12 rounded-full ${item.color} border-[3px] border-[rgba(26,26,26,0.85)] shadow-lg flex items-center justify-center hover:scale-110 transition-transform relative`}>
              <item.icon size={20} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 ${isOpen ? 'rotate-45' : ''}`}
        title="Menu"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

// Student Expandable FAB Menu Component
interface StudentFabMenuProps {
  unreadCount: number;
  onTickets: () => void;
  onMessages: () => void;
  onQRScanner: () => void;
  onAttendance: () => void;
}

function StudentFabMenu({ unreadCount, onTickets, onMessages, onQRScanner, onAttendance }: StudentFabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'tickets', label: 'Support Tickets', icon: Ticket, color: 'bg-[var(--card-yellow)]', onClick: onTickets },
    { id: 'attendance', label: 'My Attendance', icon: CalendarDays, color: 'bg-[var(--card-peach)]', onClick: onAttendance },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'bg-[var(--card-lavender)]', onClick: onMessages, badge: unreadCount },
    { id: 'qr', label: 'Scan QR Code', icon: QrCode, color: 'bg-[var(--accent)]', onClick: onQRScanner, isMain: true },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Menu Items */}
      <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              item.onClick();
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 group`}
          >
            <span className="px-3 py-1.5 bg-white rounded-lg border-[2px] border-[rgba(26,26,26,0.85)] text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
            <div className={`${item.isMain ? 'w-14 h-14' : 'w-12 h-12'} rounded-full ${item.color} border-[3px] border-[rgba(26,26,26,0.85)] shadow-lg flex items-center justify-center hover:scale-110 transition-transform relative`}>
              <item.icon size={item.isMain ? 24 : 20} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 ${isOpen ? 'rotate-45' : ''}`}
        title="Menu"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanResult, setQrScanResult] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    book?: Book;
  } | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showGrades, setShowGrades] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showStudentAttendance, setShowStudentAttendance] = useState(false);
  const [showDataNotice, setShowDataNotice] = useState(() => {
    // Check if user has already dismissed the notice
    return !localStorage.getItem('schoolPortalDataNoticeDismissed');
  });
  const mainRef = useRef<HTMLDivElement>(null);

  const { startLoading, stopLoading } = useLoading();

  const dismissDataNotice = () => {
    localStorage.setItem('schoolPortalDataNoticeDismissed', 'true');
    setShowDataNotice(false);
  };

  const {
    books,
    filteredBooks,
    user,
    events,
    testimonials,
    isLoggedIn,
    isAdmin,
    searchQuery,
    selectedGenre,
    genres,
    setSearchQuery,
    setSelectedGenre,
    login,
    logout,
    register,
    updateUserProfile,
    rentBook,
    returnBook,
    getBorrowedBooksDetails,
    getDueSoonBooks,
    addBook,
    updateBook,
    deleteBook,
    getLibraryStats,
    getAllBorrowedBooks,
    getAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAllUsers,
    updateUser,
    deleteUser,
    addEvent,
    updateEvent,
    deleteEvent,
    getEnrollments,
    addEnrollment,
    updateEnrollment,
    getGrades,
    addGrade,
    deleteGrade,
    getMessages,
    sendMessage,
    markMessageAsRead,
    getUnreadMessageCount,
    getTickets,
    createTicket,
    updateTicket,
    getProfileSettings,
    updateProfileSettings,
    getPendingVerifications,
    approveUser,
    rejectUser,
    getSections,
    createSection,
    deleteSection,
    addStudentToSection,
    removeStudentFromSection,
    getAttendanceSessions,
    getAttendanceRecords,
    createAttendanceSession,
    markAttendance,
    cleanupExpiredSessions
  } = useStore();

  // Get data from store
  const enrollments = getEnrollments();
  const grades = getGrades();
  const messages = getMessages();
  const tickets = getTickets();
  const profileSettings = getProfileSettings();
  const sections = getSections();
  const attendanceSessions = getAttendanceSessions();
  const attendanceRecords = getAttendanceRecords();
  const unreadCount = user ? getUnreadMessageCount(user.id) : 0;

  // Cleanup expired attendance sessions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredSessions();
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [cleanupExpiredSessions]);

  // Handle QR code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const qr = urlParams.get('qr');
    const bookId = urlParams.get('book');
    const action = urlParams.get('action') as 'rent' | 'return';

    if (qr && bookId && action && isLoggedIn && user) {
      const book = books.find(b => b.id === bookId);
      if (book) {
        const hasBorrowedBook = user.borrowedBooks.some(bb => bb.bookId === bookId && !bb.returned);
        
        if (action === 'rent') {
          if (hasBorrowedBook) {
            setQrScanResult({
              show: true,
              success: false,
              message: 'You have already borrowed this book.',
              book
            });
          } else if (book.available <= 0) {
            setQrScanResult({
              show: true,
              success: false,
              message: 'This book is currently out of stock.',
              book
            });
          } else {
            rentBook(bookId);
            setQrScanResult({
              show: true,
              success: true,
              message: `Successfully rented "${book.title}"!`,
              book
            });
          }
        } else if (action === 'return') {
          if (!hasBorrowedBook) {
            setQrScanResult({
              show: true,
              success: false,
              message: 'You have not borrowed this book.',
              book
            });
          } else {
            returnBook(bookId);
            setQrScanResult({
              show: true,
              success: true,
              message: `Successfully returned "${book.title}"!`,
              book
            });
          }
        }

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (qr && !isLoggedIn) {
      // Store QR params and redirect to login
      setCurrentView('login');
    }
  }, [isLoggedIn, user, books, rentBook, returnBook]);

  const borrowedBooksDetails = getBorrowedBooksDetails();
  const dueSoonBooks = getDueSoonBooks();

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    startLoading('Logging in...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const result = login(email, password);
    if (result.success) {
      // Check role and redirect accordingly
      if (result.role === 'admin') {
        setCurrentView('admin');
      } else {
        // Student and teacher go to dashboard
        setCurrentView('dashboard');
      }
    }
    stopLoading();
    return result;
  };

  // Handle register
  const handleRegister = async (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin', grade?: string) => {
    startLoading('Creating account...');
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = register(name, email, password, role, grade);
    if (result.success) {
      if (role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('dashboard');
      }
    }
    stopLoading();
    return result;
  };

  // Handle logout
  const handleLogout = () => {
    startLoading('Logging out...');
    setTimeout(() => {
      logout();
      setCurrentView('login');
      stopLoading();
    }, 300);
  };

  // Check if user has borrowed a specific book
  const hasBorrowed = (bookId: string) => {
    return user?.borrowedBooks.some(bb => bb.bookId === bookId && !bb.returned) || false;
  };

  // Handle book rent
  const [rentMessage, setRentMessage] = useState<{ show: boolean; message: string; isError: boolean } | null>(null);

  const handleRent = async (bookId: string) => {
    startLoading('Processing...');
    await new Promise(resolve => setTimeout(resolve, 300));
    const result = rentBook(bookId);
    stopLoading();
    if (!result.success && result.message) {
      setRentMessage({ show: true, message: result.message, isError: true });
      setTimeout(() => setRentMessage(null), 4000);
    } else if (result.success) {
      const book = books.find(b => b.id === bookId);
      setRentMessage({ 
        show: true, 
        message: `Successfully borrowed "${book?.title}"!`, 
        isError: false 
      });
      setTimeout(() => setRentMessage(null), 3000);
    }
  };

  // Handle book return
  const handleReturn = async (bookId: string) => {
    startLoading('Returning book...');
    await new Promise(resolve => setTimeout(resolve, 300));
    returnBook(bookId);
    stopLoading();
  };

  // Global scroll snap for pinned sections
  useEffect(() => {
    if (currentView !== 'dashboard') return;

    // Wait for all ScrollTriggers to be created
    const timeout = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;

            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out'
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentView]);

  // Cleanup ScrollTriggers when view changes
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [currentView]);

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} onRegister={handleRegister} />;

      case 'dashboard':
        return (
          <main ref={mainRef} className="relative">
            <Hero 
              setView={setCurrentView} 
              user={user} 
              dueSoonCount={dueSoonBooks.length}
              announcements={getAnnouncements()}
            />
            <Subjects />
            <LibrarySearch
              books={books}
              filteredBooks={filteredBooks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              genres={genres}
              setView={setCurrentView}
              setSelectedBook={setSelectedBook}
            />
            <BookDetail
              book={selectedBook || books[0]}
              setView={setCurrentView}
              onRent={handleRent}
              hasBorrowed={hasBorrowed}
            />
            <ReturnReminder
              setView={setCurrentView}
              borrowedBooks={borrowedBooksDetails}
            />
            <Events events={events} />
            <Testimonials testimonials={testimonials} />
            <Newsletter />
            <Footer setView={setCurrentView} />

            {/* Floating QR Scanner Button */}
            <button
              onClick={() => setShowQRScanner(true)}
              className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              title="Scan QR Code"
            >
              <QrCode size={24} />
            </button>

            {/* QR Scanner Modal */}
            {showQRScanner && (
              <QRScanner
                books={books}
                onRent={handleRent}
                onReturn={handleReturn}
                hasBorrowed={hasBorrowed}
                onClose={() => setShowQRScanner(false)}
              />
            )}
          </main>
        );

      case 'library':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-6xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                Library
              </h2>
              
              {/* Search and Filters */}
              <div className="card p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search books..."
                      className="input-field w-full"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`chip ${selectedGenre === genre ? 'bg-[var(--accent)]' : ''}`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => {
                  const alreadyBorrowed = hasBorrowed(book.id);
                  const canRent = book.available > 0 && !alreadyBorrowed;
                  
                  return (
                    <div
                      key={book.id}
                      className="card p-4 hover:shadow-xl transition-shadow flex flex-col"
                    >
                      <div 
                        onClick={() => {
                          setSelectedBook(book);
                          setCurrentView('mybooks');
                        }}
                        className="cursor-pointer flex-1"
                      >
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-48 object-cover rounded-xl border-[2px] border-[rgba(26,26,26,0.85)] mb-4"
                        />
                        <h3 className="font-bold truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                          {book.title}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] truncate">
                          {book.author}
                        </p>
                        <div className="flex items-center justify-between mt-3 mb-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-primary)]">
                            {book.genre}
                          </span>
                          <span className={`text-xs font-bold ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {book.available > 0 ? `${book.available} available` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Rent Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canRent) {
                            handleRent(book.id);
                          }
                        }}
                        disabled={!canRent}
                        className={`w-full py-2.5 px-4 rounded-full font-bold text-sm border-[3px] border-[rgba(26,26,26,0.85)] transition-all ${
                          alreadyBorrowed 
                            ? 'bg-[var(--card-mint)] text-green-700 cursor-default' 
                            : canRent 
                              ? 'bg-[var(--accent)] hover:translate-y-[-2px] hover:shadow-md' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {alreadyBorrowed ? '✓ Borrowed' : canRent ? 'Rent Book' : 'Unavailable'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)]">No books found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'subjects':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-5xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                Subjects
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Science', color: 'var(--card-mint)', count: 12, icon: '🔬' },
                  { name: 'History', color: 'var(--card-peach)', count: 8, icon: '📚' },
                  { name: 'Languages', color: 'var(--card-lavender)', count: 15, icon: '🌍' },
                  { name: 'Math', color: 'var(--card-yellow)', count: 10, icon: '🔢' },
                  { name: 'Art', color: '#FFD1DC', count: 6, icon: '🎨' },
                  { name: 'Coding', color: '#E0FFE0', count: 9, icon: '💻' },
                ].map((subject) => (
                  <div
                    key={subject.name}
                    className="card p-6 cursor-pointer hover:scale-[1.02] transition-transform"
                    style={{ background: subject.color }}
                  >
                    <div className="text-4xl mb-4">{subject.icon}</div>
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      {subject.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {subject.count} books available
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <Events events={events} />
          </div>
        );

      case 'mybooks':
        return (
          <MyBooks
            setView={setCurrentView}
            borrowedBooks={borrowedBooksDetails}
            onReturn={handleReturn}
            selectedBook={selectedBook}
          />
        );

      case 'admin':
        return (
          <AdminDashboard
            setView={setCurrentView}
            books={books}
            stats={getLibraryStats()}
            allBorrowedBooks={getAllBorrowedBooks()}
            allUsers={getAllUsers()}
            announcements={getAnnouncements()}
            events={events}
            enrollments={enrollments}
            grades={grades}
            messages={messages}
            tickets={tickets}
            profileSettings={profileSettings}
            onAddBook={addBook}
            onUpdateBook={updateBook}
            onDeleteBook={deleteBook}
            onAddAnnouncement={addAnnouncement}
            onUpdateAnnouncement={updateAnnouncement}
            onDeleteAnnouncement={deleteAnnouncement}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onAddEvent={addEvent}
            onUpdateEvent={updateEvent}
            onDeleteEvent={deleteEvent}
            onUpdateEnrollment={updateEnrollment}
            onAddGrade={addGrade}
            onDeleteGrade={deleteGrade}
            onSendMessage={sendMessage}
            onMarkMessageAsRead={markMessageAsRead}
            onUpdateTicket={updateTicket}
            onUpdateProfileSettings={updateProfileSettings}
            pendingVerifications={getPendingVerifications()}
            onApproveUser={approveUser}
            onRejectUser={rejectUser}
          />
        );

      case 'terms':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-3xl mx-auto">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="btn-secondary flex items-center gap-2 mb-6"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <div className="card p-6 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                    Terms and Conditions
                  </h2>
                </div>
                <div className="space-y-6 text-[var(--text-secondary)]">
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">1. Acceptance of Terms</h3>
                    <p>By accessing and using the School Portal, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">2. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your account information, including your password. You agree to accept responsibility for all activities that occur under your account.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">3. Library Services</h3>
                    <p>Users may borrow books subject to availability. Books must be returned by the due date to avoid late fees ($0.50 per day per book). Damaged or lost books may incur replacement costs.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">4. Prohibited Activities</h3>
                    <p>Users may not: share account credentials, misuse library resources, damage school property, or engage in any unlawful activities through the portal.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">5. Privacy</h3>
                    <p>We collect and store user information solely for the purpose of providing library services. Your data is stored locally and is not shared with third parties.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">6. Changes to Terms</h3>
                    <p>We reserve the right to modify these terms at any time. Continued use of the portal after changes constitutes acceptance of the new terms.</p>
                  </section>
                  <p className="text-sm pt-4 border-t border-[rgba(26,26,26,0.1)]">Last updated: January 2026</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-3xl mx-auto">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="btn-secondary flex items-center gap-2 mb-6"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <div className="card p-6 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--card-lavender)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                    Privacy Policy
                  </h2>
                </div>
                <div className="space-y-6 text-[var(--text-secondary)]">
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Information We Collect</h3>
                    <p>We collect the following information when you register:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Name and email address</li>
                      <li>Account type (student/admin)</li>
                      <li>Grade level (for students)</li>
                      <li>Borrowing history</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">How We Use Your Information</h3>
                    <p>Your information is used solely for:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Managing library book loans and returns</li>
                      <li>Sending due date reminders</li>
                      <li>Displaying announcements</li>
                      <li>Administrative purposes</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Data Storage</h3>
                    <p>All data is stored locally in your browser using localStorage. We do not transmit your data to external servers or third parties.</p>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Your Rights</h3>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Access your personal information</li>
                      <li>Request correction of inaccurate data</li>
                      <li>Request deletion of your account</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at help@schoolportal.edu</p>
                  </section>
                  <p className="text-sm pt-4 border-t border-[rgba(26,26,26,0.1)]">Last updated: January 2026</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'grades':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                My Grades
              </h2>
              <GradesModal
                isOpen={true}
                onClose={() => setCurrentView('dashboard')}
                grades={user ? grades.filter(g => g.studentId === user.id) : []}
                studentName={user?.name || 'Student'}
                onDeleteGrade={user?.role === 'admin' ? deleteGrade : undefined}
              />
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                Messages
              </h2>
              <MessagesModal
                isOpen={true}
                onClose={() => setCurrentView('dashboard')}
                currentUser={user!}
                messages={user ? messages.filter(m => m.recipientId === user.id || m.senderId === user.id) : []}
                users={getAllUsers().map(u => ({ id: u.id, name: u.name, role: u.role }))}
                onSendMessage={(recipientId, recipientName, subject, content) => {
                  if (user) {
                    sendMessage(user.id, user.name, user.role, recipientId, recipientName, subject, content);
                  }
                }}
                onMarkAsRead={markMessageAsRead}
              />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                My Profile
              </h2>
              {user && (
                <ProfileModal
                  isOpen={true}
                  onClose={() => setCurrentView('dashboard')}
                  user={user}
                  onUpdateProfile={updateUserProfile}
                />
              )}
            </div>
          </div>
        );

      case 'enrollment':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                Course Enrollment
              </h2>
              {user && (
                <EnrollmentModal
                  isOpen={true}
                  onClose={() => setCurrentView('dashboard')}
                  studentName={user.name}
                  enrollments={enrollments.filter(e => e.studentId === user.id)}
                  onEnroll={(gradeLevel, reason) => addEnrollment(user.id, user.name, gradeLevel, reason)}
                  onRetry={(enrollmentId) => {
                    const enrollment = enrollments.find(e => e.id === enrollmentId);
                    if (enrollment) {
                      updateEnrollment(enrollmentId, { 
                        status: 'pending', 
                        attempts: enrollment.attempts + 1 
                      });
                    }
                  }}
                />
              )}
            </div>
          </div>
        );

      case 'tickets':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                Support Tickets
              </h2>
              {user && (
                <TicketsModal
                  isOpen={true}
                  onClose={() => setCurrentView('dashboard')}
                  currentUserId={user.id}
                  tickets={tickets.filter(t => t.userId === user.id)}
                  profileSettings={profileSettings}
                  onCreateTicket={(subject, message, category) => {
                    createTicket(user.id, user.name, user.email, subject, message, category);
                  }}
                />
              )}
            </div>
          </div>
        );

      case 'sections':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                My Sections
              </h2>
              {user && user.role === 'teacher' && (
                <SectionsModal
                  isOpen={true}
                  onClose={() => setCurrentView('dashboard')}
                  sections={sections}
                  students={getAllUsers().filter(u => u.role === 'student')}
                  teacherId={user.id}
                  onCreateSection={(name, grade) => createSection(name, grade, user.id, user.name)}
                  onDeleteSection={deleteSection}
                  onAddStudentToSection={addStudentToSection}
                  onRemoveStudentFromSection={removeStudentFromSection}
                />
              )}
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
            <div className="absolute inset-0 dot-grid pointer-events-none" />
            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-4xl font-black mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                Attendance
              </h2>
              {user && (
                <AttendanceModal
                  isOpen={true}
                  onClose={() => setCurrentView('dashboard')}
                  mode={user.role === 'teacher' ? 'teacher' : 'student'}
                  sections={sections.filter(s => s.teacherId === user.id)}
                  attendanceSessions={attendanceSessions}
                  attendanceRecords={attendanceRecords}
                  currentUserId={user.id}
                  currentUserName={user.name}
                  onCreateSession={createAttendanceSession}
                  onMarkAttendance={markAttendance}
                />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Data Persistence Notice */}
      {showDataNotice && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:max-w-lg bg-yellow-100 border-[3px] border-yellow-400 rounded-2xl p-4 z-[60] shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-yellow-900" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-yellow-900 mb-1">Data Storage Notice</h4>
              <p className="text-xs text-yellow-800 mb-2">
                Your data is stored locally in this browser only. It will NOT sync across devices or browsers. 
                For permanent storage, a backend database is required.
              </p>
              <button
                onClick={dismissDataNotice}
                className="text-xs font-bold text-yellow-900 underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
            <button
              onClick={dismissDataNotice}
              className="p-1 hover:bg-yellow-200 rounded-full transition-colors"
            >
              <X size={16} className="text-yellow-900" />
            </button>
          </div>
        </div>
      )}

      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userRole={user?.role}
        onLogout={handleLogout}
        userName={user?.name}
        unreadMessages={unreadCount}
      />
      {renderContent()}

      {/* QR Scan Result Modal */}
      {qrScanResult?.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`card p-6 max-w-md w-full text-center ${qrScanResult.success ? 'bg-[var(--card-mint)]' : 'bg-red-50'}`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${qrScanResult.success ? 'bg-green-500' : 'bg-red-500'}`}>
              {qrScanResult.success ? <Check size={32} className="text-white" /> : <AlertCircle size={32} className="text-white" />}
            </div>
            <h3 className="text-xl font-bold mb-2">{qrScanResult.success ? 'Success!' : 'Error'}</h3>
            <p className="text-[var(--text-secondary)] mb-4">{qrScanResult.message}</p>
            {qrScanResult.book && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl mb-4">
                <BookOpen size={20} className="text-[var(--text-secondary)]" />
                <div className="text-left">
                  <p className="font-bold text-sm">{qrScanResult.book.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{qrScanResult.book.author}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setQrScanResult(null)}
              className="btn-primary w-full"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (Student Only) - Expandable */}
      {isLoggedIn && !isAdmin && user?.role === 'student' && currentView === 'dashboard' && (
        <StudentFabMenu
          unreadCount={unreadCount}
          onTickets={() => setShowTickets(true)}
          onMessages={() => setShowMessages(true)}
          onQRScanner={() => setShowQRScanner(true)}
          onAttendance={() => setShowStudentAttendance(true)}
        />
      )}

      {/* Floating Action Button (Teacher Only) - Expandable */}
      {isLoggedIn && user?.role === 'teacher' && currentView === 'dashboard' && (
        <TeacherFabMenu
          unreadCount={unreadCount}
          onSections={() => setShowSections(true)}
          onGrades={() => setShowGrades(true)}
          onAttendance={() => setShowAttendance(true)}
          onMessages={() => setShowMessages(true)}
        />
      )}

      {/* Student Modals */}
      {showEnrollment && user && (
        <EnrollmentModal
          isOpen={showEnrollment}
          onClose={() => setShowEnrollment(false)}
          studentName={user.name}
          enrollments={enrollments.filter(e => e.studentId === user.id)}
          onEnroll={(gradeLevel, reason) => addEnrollment(user.id, user.name, gradeLevel, reason)}
          onRetry={(enrollmentId) => {
            const enrollment = enrollments.find(e => e.id === enrollmentId);
            if (enrollment) {
              updateEnrollment(enrollmentId, { 
                status: 'pending', 
                attempts: enrollment.attempts + 1 
              });
            }
          }}
        />
      )}

      {/* Section & Teacher Info for Students */}
      {isLoggedIn && user?.role === 'student' && (
        <div className="fixed bottom-6 left-6 z-40">
          {(() => {
            const studentSection = sections.find(s => s.studentIds.includes(user.id));
            if (studentSection) {
              return (
                <div className="card p-3 border-[2px] border-[rgba(26,26,26,0.85)] bg-white shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--card-mint)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{studentSection.name}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">Teacher: {studentSection.teacherName}</p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {showGrades && user && user.role === 'student' && (
        <GradesModal
          isOpen={showGrades}
          onClose={() => setShowGrades(false)}
          grades={grades.filter(g => g.studentId === user.id)}
          studentName={user.name}
        />
      )}

      {showGrades && user && user.role === 'teacher' && (
        <GradesModal
          isOpen={showGrades}
          onClose={() => setShowGrades(false)}
          grades={grades.filter(g => {
            // Show grades for students in teacher's sections
            const teacherSectionIds = sections.filter(s => s.teacherId === user.id).map(s => s.id);
            const studentSection = sections.find(s => s.studentIds.includes(g.studentId));
            return studentSection && teacherSectionIds.includes(studentSection.id);
          })}
          studentName="My Students"
          isTeacher={true}
          allStudents={sections
            .filter(s => s.teacherId === user.id)
            .flatMap(s => s.studentIds.map(id => {
              const student = getAllUsers().find(u => u.id === id);
              return student ? { id: student.id, name: student.name, grade: student.grade } : null;
            }).filter(Boolean) as { id: string; name: string; grade?: string }[])}
          onAddGrade={(studentId, subject, quarter, grade, maxGrade, remarks) => {
            addGrade(studentId, subject, quarter, grade, maxGrade, remarks, user.name);
          }}
          onDeleteGrade={deleteGrade}
        />
      )}

      {showStudentAttendance && user && user.role === 'student' && (
        <StudentAttendanceModal
          isOpen={showStudentAttendance}
          onClose={() => setShowStudentAttendance(false)}
          studentId={user.id}
          attendanceRecords={attendanceRecords}
        />
      )}

      {showMessages && user && (
        <MessagesModal
          isOpen={showMessages}
          onClose={() => setShowMessages(false)}
          currentUser={user}
          messages={messages.filter(m => m.recipientId === user.id || m.senderId === user.id)}
          users={getAllUsers().map(u => ({ id: u.id, name: u.name, role: u.role }))}
          onSendMessage={(recipientId, recipientName, subject, content) => {
            sendMessage(user.id, user.name, user.role, recipientId, recipientName, subject, content);
          }}
          onMarkAsRead={markMessageAsRead}
        />
      )}

      {showTickets && user && (
        <TicketsModal
          isOpen={showTickets}
          onClose={() => setShowTickets(false)}
          currentUserId={user.id}
          tickets={tickets.filter(t => t.userId === user.id)}
          profileSettings={profileSettings}
          onCreateTicket={(subject, message, category) => {
            createTicket(user.id, user.name, user.email, subject, message, category);
          }}
        />
      )}

      {showProfile && user && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={user}
          onUpdateProfile={updateUserProfile}
        />
      )}

      {/* Rent Message Toast */}
      {rentMessage?.show && (
        <div className={`fixed bottom-24 right-6 z-50 px-4 py-3 rounded-xl border-[3px] shadow-lg animate-in slide-in-from-right ${
          rentMessage.isError 
            ? 'bg-red-100 border-red-300 text-red-800' 
            : 'bg-[var(--card-mint)] border-[rgba(26,26,26,0.85)]'
        }`}>
          <p className="text-sm font-bold">{rentMessage.message}</p>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          books={books}
          onRent={handleRent}
          onReturn={handleReturn}
          hasBorrowed={hasBorrowed}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Sections Modal (Teacher) */}
      {showSections && user && user.role === 'teacher' && (
        <SectionsModal
          isOpen={showSections}
          onClose={() => setShowSections(false)}
          sections={sections}
          students={getAllUsers().filter(u => u.role === 'student')}
          teacherId={user.id}
          onCreateSection={(name, grade) => createSection(name, grade, user.id, user.name)}
          onDeleteSection={deleteSection}
          onAddStudentToSection={addStudentToSection}
          onRemoveStudentFromSection={removeStudentFromSection}
        />
      )}

      {/* Attendance Modal */}
      {showAttendance && user && (
        <AttendanceModal
          isOpen={showAttendance}
          onClose={() => setShowAttendance(false)}
          mode={user.role === 'teacher' ? 'teacher' : 'student'}
          sections={sections.filter(s => s.teacherId === user.id)}
          attendanceSessions={attendanceSessions}
          attendanceRecords={attendanceRecords}
          currentUserId={user.id}
          currentUserName={user.name}
          onCreateSession={createAttendanceSession}
          onMarkAttendance={markAttendance}
        />
      )}
    </div>
  );
}

export default App;
