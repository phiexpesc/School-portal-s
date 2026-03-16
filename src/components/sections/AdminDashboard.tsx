import { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Plus, 
  Edit2, 
  Edit3,
  Trash2, 
  Search,
  X,
  Check,
  Library,
  ArrowLeft,
  Megaphone,
  Shield,
  GraduationCap,
  Mail,
  Calendar,
  QrCode,
  TrendingUp as TrendingUpIcon,
  Ticket,
  UserCheck
} from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { GradesModal } from './Grades';
import { MessagesModal } from './Messages';
import { TicketsModal } from './Tickets';
import type { View, Book, LibraryStats, BookFormData, Announcement, User, Event, Enrollment, Grade, Message, Ticket as TicketType, ProfileSettings } from '@/types';

interface AdminDashboardProps {
  setView: (view: View) => void;
  books: Book[];
  stats: LibraryStats;
  allBorrowedBooks: ({
    bookId: string;
    borrowedDate: string;
    dueDate: string;
    returned: boolean;
    book: Book;
    userName: string;
  })[];
  allUsers: User[];
  announcements: Announcement[];
  events: Event[];
  enrollments: Enrollment[];
  grades: Grade[];
  messages: Message[];
  tickets: TicketType[];
  profileSettings: ProfileSettings;
  onAddBook: (book: BookFormData) => void;
  onUpdateBook: (bookId: string, book: Partial<BookFormData>) => void;
  onDeleteBook: (bookId: string) => void;
  onAddAnnouncement: (title: string, message: string) => void;
  onUpdateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onAddEvent: (title: string, date: string, time: string, description: string, imageUrl?: string) => void;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEnrollment: (id: string, updates: Partial<Enrollment>) => void;
  onAddGrade: (studentId: string, subject: string, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', grade: number, maxGrade: number, remarks?: string) => void;
  onDeleteGrade: (gradeId: string) => void;
  onSendMessage: (senderId: string, senderName: string, senderRole: 'student' | 'teacher' | 'admin', recipientId: string, recipientName: string, subject: string, content: string) => void;
  onMarkMessageAsRead: (messageId: string) => void;
  onUpdateTicket: (id: string, updates: Partial<TicketType>) => void;
  onUpdateProfileSettings: (settings: Partial<ProfileSettings>) => void;
  pendingVerifications: User[];
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
}

export function AdminDashboard({ 
  setView, 
  books, 
  stats, 
  allBorrowedBooks,
  allUsers,
  announcements,
  events,
  enrollments,
  grades,
  messages,
  tickets,
  profileSettings,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onUpdateUser,
  onDeleteUser,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onUpdateEnrollment,
  onAddGrade,
  onDeleteGrade,
  onSendMessage,
  onMarkMessageAsRead,
  onUpdateTicket,
  onUpdateProfileSettings,
  pendingVerifications,
  onApproveUser,
  onRejectUser
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'borrowed' | 'announcements' | 'users' | 'events' | 'enrollments' | 'grades' | 'subjects' | 'tickets' | 'verifications'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showBookForm, setShowBookForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'book' | 'announcement' | 'user' | 'event'; id: string } | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);

  // Subjects Management
  const SUBJECTS_KEY = 'schoolPortalSubjects';
  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem(SUBJECTS_KEY);
    return saved ? JSON.parse(saved) : [
      'Mathematics', 'Science', 'English', 'History', 'Geography',
      'Computer Science', 'Art', 'Music', 'Physical Education', 'Foreign Language'
    ];
  });
  const [newSubject, setNewSubject] = useState('');
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editSubjectValue, setEditSubjectValue] = useState('');

  const saveSubjects = (newSubjects: string[]) => {
    setSubjects(newSubjects);
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(newSubjects));
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      saveSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const updateSubject = (oldSubject: string) => {
    if (editSubjectValue.trim() && !subjects.includes(editSubjectValue.trim())) {
      const updated = subjects.map(s => s === oldSubject ? editSubjectValue.trim() : s);
      saveSubjects(updated);
      setEditingSubject(null);
      setEditSubjectValue('');
    }
  };

  const deleteSubject = (subject: string) => {
    if (confirm(`Are you sure you want to delete "${subject}"?`)) {
      saveSubjects(subjects.filter(s => s !== subject));
    }
  };

  const [bookFormData, setBookFormData] = useState<BookFormData>({
    title: '',
    author: '',
    description: '',
    genre: 'Fiction',
    grade: '5-8',
    pages: 0,
    total: 1,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
  });

  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    grade: '7th',
    password: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    imageUrl: ''
  });

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      onUpdateBook(editingBook.id, bookFormData);
    } else {
      onAddBook(bookFormData);
    }
    setShowBookForm(false);
    setEditingBook(null);
    resetBookForm();
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAnnouncement(announcementForm.title, announcementForm.message);
    setShowAnnouncementForm(false);
    setAnnouncementForm({ title: '', message: '' });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updates: Partial<User> = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
      };
      if (userForm.role === 'student') {
        updates.grade = userForm.grade;
      }
      onUpdateUser(editingUser.id, updates);
    }
    setShowUserForm(false);
    setEditingUser(null);
    resetUserForm();
  };

  const resetBookForm = () => {
    setBookFormData({
      title: '',
      author: '',
      description: '',
      genre: 'Fiction',
      grade: '5-8',
      pages: 0,
      total: 1,
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
    });
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'student',
      grade: '7th',
      password: ''
    });
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      date: '',
      time: '',
      description: '',
      imageUrl: ''
    });
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onUpdateEvent(editingEvent.id, eventForm);
    } else {
      onAddEvent(eventForm.title, eventForm.date, eventForm.time, eventForm.description, eventForm.imageUrl);
    }
    setShowEventForm(false);
    setEditingEvent(null);
    resetEventForm();
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      imageUrl: event.imageUrl || ''
    });
    setShowEventForm(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      grade: book.grade,
      pages: book.pages,
      total: book.total,
      coverUrl: book.coverUrl
    });
    setShowBookForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      grade: user.grade || '7th',
      password: ''
    });
    setShowUserForm(true);
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'books', label: 'Books', icon: Library },
    { id: 'borrowed', label: 'Borrowed', icon: BookOpen },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'enrollments', label: 'Enrollments', icon: GraduationCap },
    { id: 'grades', label: 'Grades', icon: TrendingUpIcon },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'verifications', label: 'Verifications', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 pb-12 px-4">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('dashboard')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div>
              <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                Admin Dashboard
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                Manage library, announcements, and users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold">Admin Mode</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] font-bold transition-all text-sm sm:text-base ${
                activeTab === tab.id 
                  ? 'bg-[var(--accent)]' 
                  : 'bg-white hover:bg-[var(--bg-primary)]'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="card p-4 sm:p-6 bg-[var(--card-mint)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Library size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="micro-label text-[var(--text-secondary)] text-xs">Total Books</p>
                    <p className="text-2xl sm:text-3xl font-black">{stats.totalBooks}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 sm:p-6 bg-[var(--card-lavender)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <BookOpen size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="micro-label text-[var(--text-secondary)] text-xs">Available</p>
                    <p className="text-2xl sm:text-3xl font-black">{stats.totalAvailable}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 sm:p-6 bg-[var(--card-peach)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <TrendingUp size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="micro-label text-[var(--text-secondary)] text-xs">Borrowed</p>
                    <p className="text-2xl sm:text-3xl font-black">{stats.totalBorrowed}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 sm:p-6 bg-red-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <AlertCircle size={24} className="sm:w-7 sm:h-7 text-red-600" />
                  </div>
                  <div>
                    <p className="micro-label text-red-600 text-xs">Overdue</p>
                    <p className="text-2xl sm:text-3xl font-black text-red-600">{stats.overdueBooks}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 sm:p-6 bg-orange-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Clock size={24} className="sm:w-7 sm:h-7 text-orange-600" />
                  </div>
                  <div>
                    <p className="micro-label text-orange-600 text-xs">Due Soon</p>
                    <p className="text-2xl sm:text-3xl font-black text-orange-600">{stats.dueSoonBooks}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 sm:p-6 bg-[var(--card-yellow)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Users size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="micro-label text-[var(--text-secondary)] text-xs">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-black">{allUsers.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setActiveTab('books'); setShowBookForm(true); }}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add Book
                </button>
                <button
                  onClick={() => { setActiveTab('announcements'); setShowAnnouncementForm(true); }}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Megaphone size={16} />
                  Post Announcement
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Users size={16} />
                  Manage Users
                </button>
                <button
                  onClick={() => setShowQRGenerator(true)}
                  className="btn-secondary flex items-center gap-2 text-sm bg-[var(--card-yellow)]"
                >
                  <QrCode size={16} />
                  Generate QR Codes
                </button>
                <button
                  onClick={() => setShowMessagesModal(true)}
                  className="btn-secondary flex items-center gap-2 text-sm bg-[var(--card-lavender)]"
                >
                  <Mail size={16} />
                  Messages
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books..."
                  className="input-field pl-11 text-sm"
                />
              </div>
              <button
                onClick={() => { setEditingBook(null); resetBookForm(); setShowBookForm(true); }}
                className="btn-primary flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Book
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="card p-3 sm:p-4">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-xl border-[2px] border-[rgba(26,26,26,0.85)] mb-3 sm:mb-4"
                  />
                  <h3 className="font-bold truncate mb-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                    {book.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate mb-2">
                    {book.author}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-[var(--bg-primary)]">
                      {book.genre}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {book.available}/{book.total}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="flex-1 btn-secondary py-2 text-xs sm:text-sm flex items-center justify-center gap-1"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ type: 'book', id: book.id })}
                      className="px-2 sm:px-3 py-2 rounded-full border-[3px] border-red-600 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="card p-8 sm:p-12 text-center">
                <p className="text-[var(--text-secondary)] text-sm">No books found.</p>
              </div>
            )}
          </div>
        )}

        {/* Borrowed Tab */}
        {activeTab === 'borrowed' && (
          <div className="space-y-3 sm:space-y-4">
            {allBorrowedBooks.length > 0 ? (
              allBorrowedBooks.map((item) => {
                const daysRemaining = getDaysRemaining(item.dueDate);
                const isOverdue = daysRemaining < 0;
                const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3;

                return (
                  <div key={item.bookId} className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <img
                      src={item.book.coverUrl}
                      alt={item.book.title}
                      className="w-full sm:w-20 h-32 sm:h-28 object-cover rounded-xl border-[2px] border-[rgba(26,26,26,0.85)] flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                          isOverdue ? 'bg-red-100 text-red-600' :
                          isDueSoon ? 'bg-orange-100 text-orange-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {isOverdue ? `Overdue by ${Math.abs(daysRemaining)} days` :
                           isDueSoon ? `Due in ${daysRemaining} days` :
                           `Due in ${daysRemaining} days`}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {item.book.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-2">
                        {item.book.author}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <span>By: <strong>{item.userName}</strong></span>
                        <span>Borrowed: {new Date(item.borrowedDate).toLocaleDateString()}</span>
                        <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-lavender)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                  <BookOpen size={28} className="sm:w-9 sm:h-9" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  No borrowed books
                </h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  All books have been returned.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Active Announcements ({announcements.filter(a => a.active).length})
              </h3>
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                New Announcement
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className={`card p-4 sm:p-5 ${ann.active ? 'bg-[var(--card-mint)]' : 'bg-gray-100 opacity-60'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            ann.active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                          }`}>
                            {ann.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-[10px] sm:text-xs text-[var(--text-secondary)]">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-base sm:text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                          {ann.title}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {ann.message}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateAnnouncement(ann.id, { active: !ann.active })}
                          className={`px-3 py-2 rounded-full text-xs font-bold border-[2px] ${
                            ann.active 
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-400' 
                              : 'bg-green-100 text-green-700 border-green-400'
                          }`}
                        >
                          {ann.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'announcement', id: ann.id })}
                          className="px-3 py-2 rounded-full border-[2px] border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-yellow)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Megaphone size={28} className="sm:w-9 sm:h-9" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No announcements
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    Create an announcement to notify users
                  </p>
                  <button
                    onClick={() => setShowAnnouncementForm(true)}
                    className="btn-primary text-sm"
                  >
                    Create Announcement
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="input-field pl-11 text-sm"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div key={u.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-sm sm:text-base">{u.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm sm:text-base truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                          {u.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : 'Student'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate flex items-center gap-1">
                        <Mail size={12} />
                        {u.email}
                      </p>
                      {u.grade && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                          <GraduationCap size={12} />
                          Grade: {u.grade}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'user', id: u.id })}
                        className="px-3 py-2 rounded-full border-[3px] border-red-600 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-lavender)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Users size={28} className="sm:w-9 sm:h-9" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No users found
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {userSearchQuery ? 'Try a different search term' : 'No registered users yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                School Events ({events.length})
              </h3>
              <button
                onClick={() => { setEditingEvent(null); resetEventForm(); setShowEventForm(true); }}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add Event
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {events.length > 0 ? (
                events.slice().reverse().map((event) => (
                  <div key={event.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full sm:w-32 h-40 sm:h-24 object-cover rounded-xl border-[2px] border-[rgba(26,26,26,0.85)] flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--text-secondary)] mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {event.time}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'event', id: event.id })}
                        className="px-3 py-2 rounded-full border-[3px] border-red-600 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-peach)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Calendar size={28} className="sm:w-9 sm:h-9" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No events yet
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm mb-4">
                    Create events to inform students about upcoming activities
                  </p>
                  <button
                    onClick={() => { setEditingEvent(null); resetEventForm(); setShowEventForm(true); }}
                    className="btn-primary text-sm"
                  >
                    Create Event
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Student Enrollment Applications ({enrollments.length})
              </h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {enrollments.length > 0 ? (
                enrollments.slice().reverse().map((enrollment) => (
                  <div key={enrollment.id} className="card p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            enrollment.status === 'approved' ? 'bg-green-100 text-green-700' :
                            enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {enrollment.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            Attempt {enrollment.attempts}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base">{enrollment.studentName}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Applying for: {enrollment.course}</p>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">
                          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </p>
                        {enrollment.notes && (
                          <div className="mt-2 p-2 bg-[var(--bg-primary)] rounded-lg">
                            <p className="text-xs text-[var(--text-secondary)]">
                              <span className="font-bold">Reason:</span> {enrollment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {enrollment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onUpdateEnrollment(enrollment.id, { status: 'approved' })}
                              className="px-3 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold border-[2px] border-green-400"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onUpdateEnrollment(enrollment.id, { status: 'rejected' })}
                              className="px-3 py-2 rounded-full bg-red-100 text-red-700 text-xs font-bold border-[2px] border-red-400"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-mint)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <GraduationCap size={28} className="sm:w-9 sm:h-9" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No enrollment applications yet
                  </h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Grade Management ({grades.length} grades)
              </h3>
              <button
                onClick={() => setShowGradesModal(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Post Grade
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {grades.length > 0 ? (
                grades.slice().reverse().map((grade) => (
                  <div key={grade.id} className="card p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[var(--accent)]">
                            {grade.quarter}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            {new Date(grade.datePosted).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base">{grade.subject}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Student: {allUsers.find(u => u.id === grade.studentId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-black ${
                          (grade.grade / grade.maxGrade) * 100 >= 75 ? 'text-green-600' :
                          (grade.grade / grade.maxGrade) * 100 >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {grade.grade}/{grade.maxGrade}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this grade?')) {
                              onDeleteGrade(grade.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          title="Delete grade"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-lavender)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <TrendingUpIcon size={28} className="sm:w-9 sm:h-9" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No grades posted yet
                  </h3>
                  <button
                    onClick={() => setShowGradesModal(true)}
                    className="btn-primary text-sm mt-4"
                  >
                    Post First Grade
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Subject Management ({subjects.length} subjects)
              </h3>
            </div>

            {/* Add New Subject */}
            <div className="card p-4">
              <h4 className="font-bold text-sm mb-3">Add New Subject</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter subject name..."
                  className="input-field flex-1 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                />
                <button
                  onClick={addSubject}
                  disabled={!newSubject.trim() || subjects.includes(newSubject.trim())}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            {/* Subjects List */}
            <div className="space-y-2">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <div key={subject} className="card p-3 flex items-center justify-between">
                    {editingSubject === subject ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editSubjectValue}
                          onChange={(e) => setEditSubjectValue(e.target.value)}
                          className="input-field flex-1 text-sm"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') updateSubject(subject);
                            if (e.key === 'Escape') {
                              setEditingSubject(null);
                              setEditSubjectValue('');
                            }
                          }}
                        />
                        <button
                          onClick={() => updateSubject(subject)}
                          className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSubject(null);
                            setEditSubjectValue('');
                          }}
                          className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-sm">{subject}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingSubject(subject);
                              setEditSubjectValue(subject);
                            }}
                            className="p-2 rounded-lg bg-[var(--card-yellow)] hover:bg-[var(--accent)] transition-colors"
                            title="Edit subject"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteSubject(subject)}
                            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="Delete subject"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="card p-8 text-center">
                  <p className="text-[var(--text-secondary)]">No subjects configured yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Support Tickets ({tickets.filter(t => t.status !== 'closed').length} open)
              </h3>
              <button
                onClick={() => setShowTicketsModal(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Ticket size={16} />
                View All Tickets
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {tickets.filter(t => t.status !== 'closed').length > 0 ? (
                tickets.filter(t => t.status !== 'closed').slice().reverse().map((ticket) => (
                  <div key={ticket.id} className="card p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            ticket.category === 'bug' ? 'bg-red-100 text-red-700' :
                            ticket.category === 'feature' ? 'bg-blue-100 text-blue-700' :
                            ticket.category === 'support' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ticket.category.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                            ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base">{ticket.subject}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                          From: {ticket.userName} ({ticket.userEmail})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {ticket.status === 'open' && (
                          <button
                            onClick={() => onUpdateTicket(ticket.id, { status: 'in-progress' })}
                            className="px-3 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border-[2px] border-blue-400"
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => setShowTicketsModal(true)}
                          className="btn-secondary text-xs py-2 px-3"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-yellow)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <Check size={28} className="sm:w-9 sm:h-9 text-green-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    All caught up!
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    No open tickets at the moment
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Book Form Modal */}
        {showBookForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h3>
                <button
                  onClick={() => { setShowBookForm(false); setEditingBook(null); }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Title</label>
                  <input
                    type="text"
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Author</label>
                  <input
                    type="text"
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Description</label>
                  <textarea
                    value={bookFormData.description}
                    onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                    className="input-field rounded-2xl py-3 text-sm"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Genre</label>
                    <select
                      value={bookFormData.genre}
                      onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                      className="input-field text-sm"
                    >
                      {['Fiction', 'Science', 'History', 'Biography', 'Classic', 'Coding'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Grade</label>
                    <select
                      value={bookFormData.grade}
                      onChange={(e) => setBookFormData({ ...bookFormData, grade: e.target.value })}
                      className="input-field text-sm"
                    >
                      {['K-2', '3-5', '5-8', '6-8', '9-12'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Pages</label>
                    <input
                      type="number"
                      value={bookFormData.pages}
                      onChange={(e) => setBookFormData({ ...bookFormData, pages: parseInt(e.target.value) || 0 })}
                      className="input-field text-sm"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Total Copies</label>
                    <input
                      type="number"
                      value={bookFormData.total}
                      onChange={(e) => setBookFormData({ ...bookFormData, total: parseInt(e.target.value) || 1 })}
                      className="input-field text-sm"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Cover Image URL</label>
                  <input
                    type="url"
                    value={bookFormData.coverUrl}
                    onChange={(e) => setBookFormData({ ...bookFormData, coverUrl: e.target.value })}
                    className="input-field text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-3 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowBookForm(false); setEditingBook(null); }}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <Check size={16} />
                    {editingBook ? 'Update' : 'Add'} Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Announcement Form Modal */}
        {showAnnouncementForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card p-4 sm:p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  New Announcement
                </h3>
                <button
                  onClick={() => { setShowAnnouncementForm(false); setAnnouncementForm({ title: '', message: '' }); }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAnnouncementSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Title</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g., Library Hours Extended"
                    required
                  />
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Message</label>
                  <textarea
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    className="input-field rounded-2xl py-3 text-sm"
                    rows={4}
                    placeholder="Enter your announcement message..."
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAnnouncementForm(false); setAnnouncementForm({ title: '', message: '' }); }}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <Megaphone size={16} />
                    Post Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Edit Modal */}
        {showUserForm && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card p-4 sm:p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  Edit User
                </h3>
                <button
                  onClick={() => { setShowUserForm(false); setEditingUser(null); }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Full Name</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserForm({ ...userForm, role: 'student' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
                        userForm.role === 'student' 
                          ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]' 
                          : 'bg-white border-[rgba(26,26,26,0.2)]'
                      }`}
                    >
                      <GraduationCap size={18} />
                      <span className="text-sm font-bold">Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserForm({ ...userForm, role: 'admin' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
                        userForm.role === 'admin' 
                          ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]' 
                          : 'bg-white border-[rgba(26,26,26,0.2)]'
                      }`}
                    >
                      <Shield size={18} />
                      <span className="text-sm font-bold">Admin</span>
                    </button>
                  </div>
                </div>
                {userForm.role === 'student' && (
                  <div>
                    <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Grade Level</label>
                    <select
                      value={userForm.grade}
                      onChange={(e) => setUserForm({ ...userForm, grade: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="K-2">K-2 (Kindergarten - 2nd)</option>
                      <option value="3-5">3-5 (Elementary)</option>
                      <option value="6-8">6-8 (Middle School)</option>
                      <option value="9-12">9-12 (High School)</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowUserForm(false); setEditingUser(null); }}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <Check size={16} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  onClick={() => { setShowEventForm(false); setEditingEvent(null); }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Event Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g., Science Fair"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Date</label>
                    <input
                      type="text"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g., Friday, March 20"
                      required
                    />
                  </div>
                  <div>
                    <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Time</label>
                    <input
                      type="text"
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="input-field text-sm"
                      placeholder="e.g., 2:00 PM"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="input-field rounded-2xl py-3 text-sm"
                    rows={3}
                    placeholder="Describe the event..."
                    required
                  />
                </div>
                <div>
                  <label className="micro-label block mb-1.5 sm:mb-2 text-xs">Image URL (optional)</label>
                  <input
                    type="url"
                    value={eventForm.imageUrl}
                    onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                    className="input-field text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-3 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowEventForm(false); setEditingEvent(null); }}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <Calendar size={16} />
                    {editingEvent ? 'Update' : 'Add'} Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Pending Verifications ({pendingVerifications.length})
              </h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {pendingVerifications.length > 0 ? (
                pendingVerifications.map((user) => (
                  <div key={user.id} className="card p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                            {user.role.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            Pending Approval
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base">{user.name}</h4>
                        <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApproveUser(user.id)}
                          className="px-3 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold border-[2px] border-green-400 flex items-center gap-1"
                        >
                          <Check size={12} />
                          Approve
                        </button>
                        <button
                          onClick={() => onRejectUser(user.id)}
                          className="px-3 py-2 rounded-full bg-red-100 text-red-700 text-xs font-bold border-[2px] border-red-400 flex items-center gap-1"
                        >
                          <X size={12} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[var(--card-mint)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                    <UserCheck size={28} className="sm:w-9 sm:h-9 text-green-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    No pending verifications
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    All accounts have been verified
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card p-5 sm:p-6 w-full max-w-sm text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={28} className="sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Delete {deleteConfirm.type === 'book' ? 'Book' : deleteConfirm.type === 'announcement' ? 'Announcement' : 'User'}?
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-5 sm:mb-6">
                This action cannot be undone. The {deleteConfirm.type} will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'book') onDeleteBook(deleteConfirm.id);
                    else if (deleteConfirm.type === 'announcement') onDeleteAnnouncement(deleteConfirm.id);
                    else if (deleteConfirm.type === 'user') onDeleteUser(deleteConfirm.id);
                    else if (deleteConfirm.type === 'event') onDeleteEvent(deleteConfirm.id);
                    setDeleteConfirm(null);
                  }}
                  className="flex-1 bg-red-600 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-full border-[3px] border-[rgba(26,26,26,0.85)] hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Generator Modal */}
        {showQRGenerator && (
          <QRCodeGenerator
            books={books}
            onClose={() => setShowQRGenerator(false)}
          />
        )}

        {/* Grades Modal */}
        {showGradesModal && (
          <GradesModal
            isOpen={showGradesModal}
            onClose={() => setShowGradesModal(false)}
            grades={grades}
            studentName="All Students"
            isAdmin={true}
            allStudents={allUsers.filter(u => u.role === 'student').map(u => ({ id: u.id, name: u.name }))}
            onAddGrade={onAddGrade}
          />
        )}

        {/* Tickets Modal */}
        {showTicketsModal && (
          <TicketsModal
            isOpen={showTicketsModal}
            onClose={() => setShowTicketsModal(false)}
            currentUserId="admin"
            tickets={tickets}
            profileSettings={profileSettings}
            onCreateTicket={() => {}}
            onUpdateSettings={onUpdateProfileSettings}
            isAdmin={true}
            onUpdateTicket={onUpdateTicket}
          />
        )}

        {/* Messages Modal */}
        {showMessagesModal && (
          <MessagesModal
            isOpen={showMessagesModal}
            onClose={() => setShowMessagesModal(false)}
            currentUser={{ id: 'admin', name: 'Admin', email: 'admin@schoolportal.edu', role: 'admin', borrowedBooks: [], verified: true, verificationPending: false }}
            messages={messages.filter(m => m.recipientId === 'admin' || m.senderId === 'admin')}
            users={allUsers.map(u => ({ id: u.id, name: u.name, role: u.role }))}
            onSendMessage={(recipientId, recipientName, subject, content) => {
              onSendMessage('admin', 'Admin', 'admin', recipientId, recipientName, subject, content);
            }}
            onMarkAsRead={onMarkMessageAsRead}
          />
        )}
      </div>
    </div>
  );
}
