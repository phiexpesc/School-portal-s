import { useState, useEffect, useCallback } from 'react';
import type { Book, User, BorrowedBook, Event, Testimonial, LibraryStats, BookFormData, Announcement, Enrollment, Grade, Message, Ticket, ProfileSettings, Section, AttendanceSession, AttendanceRecord } from '@/types';
import QRCodeLib from 'qrcode';

// User with password for database storage
interface UserWithPassword extends User {
  password: string;
}

// LocalStorage keys
const USER_DB_KEY = 'schoolPortalUserDB';
const ANNOUNCEMENTS_KEY = 'schoolPortalAnnouncements';
const BOOKS_KEY = 'schoolPortalBooks';
const EVENTS_KEY = 'schoolPortalEvents';
const ENROLLMENTS_KEY = 'schoolPortalEnrollments';
const GRADES_KEY = 'schoolPortalGrades';
const MESSAGES_KEY = 'schoolPortalMessages';
const TICKETS_KEY = 'schoolPortalTickets';
const PROFILE_SETTINGS_KEY = 'schoolPortalProfileSettings';
const SECTIONS_KEY = 'schoolPortalSections';
const ATTENDANCE_SESSIONS_KEY = 'schoolPortalAttendanceSessions';
const ATTENDANCE_RECORDS_KEY = 'schoolPortalAttendanceRecords';

// Initial sample books data
const initialBooks: Book[] = [
  {
    id: '1',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    description: 'A classic tale of curiosity, nature, and friendship—perfect for grades 5–8.',
    genre: 'Classic',
    grade: '5-8',
    pages: 320,
    available: 3,
    total: 5,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
  },
  {
    id: '2',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    description: 'Explore the mysteries of the universe, from black holes to the Big Bang.',
    genre: 'Science',
    grade: '9-12',
    pages: 256,
    available: 2,
    total: 4,
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'
  },
  {
    id: '3',
    title: 'Coding for Kids',
    author: 'Sarah Johnson',
    description: 'Learn programming fundamentals with fun projects and games.',
    genre: 'Coding',
    grade: '3-8',
    pages: 180,
    available: 5,
    total: 6,
    coverUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop'
  },
  {
    id: '4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A masterpiece of American literature set in the Jazz Age.',
    genre: 'Fiction',
    grade: '9-12',
    pages: 180,
    available: 4,
    total: 6,
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop'
  },
  {
    id: '5',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A brief history of humankind, from ancient ancestors to modern society.',
    genre: 'History',
    grade: '9-12',
    pages: 443,
    available: 3,
    total: 5,
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop'
  },
  {
    id: '6',
    title: 'Charlotte\'s Web',
    author: 'E.B. White',
    description: 'A heartwarming story of friendship between a pig and a spider.',
    genre: 'Fiction',
    grade: '3-6',
    pages: 192,
    available: 6,
    total: 8,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop'
  },
  {
    id: '7',
    title: 'The Elements',
    author: 'Theodore Gray',
    description: 'A visual exploration of every known atom in the universe.',
    genre: 'Science',
    grade: '6-12',
    pages: 240,
    available: 2,
    total: 3,
    coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=600&fit=crop'
  },
  {
    id: '8',
    title: 'Becoming',
    author: 'Michelle Obama',
    description: 'An intimate, powerful, and inspiring memoir by the former First Lady.',
    genre: 'Biography',
    grade: '9-12',
    pages: 448,
    available: 3,
    total: 4,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'
  }
];

// Initial events data
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Science Fair Prep',
    date: 'Tuesday',
    time: '3:30 PM',
    description: 'Get help with your science fair project and meet mentors.',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop'
  },
  {
    id: '2',
    title: 'Creative Writing Club',
    date: 'Wednesday',
    time: '4:00 PM',
    description: 'Share your stories and learn new writing techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop'
  },
  {
    id: '3',
    title: 'Library Orientation',
    date: 'Friday',
    time: '2:00 PM',
    description: 'Learn how to use the library resources effectively.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=250&fit=crop'
  }
];

// Initial testimonials data
const initialTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'The library search makes everything faster.',
    author: 'Maya',
    grade: '7th grade'
  },
  {
    id: '2',
    quote: 'I never miss a return date now.',
    author: 'Leo',
    grade: '6th grade'
  },
  {
    id: '3',
    quote: 'Subjects page helps me plan my week.',
    author: 'Sara',
    grade: '8th grade'
  }
];

// Admin user
const adminUser: User = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@schoolportal.edu',
  role: 'admin',
  borrowedBooks: [],
  verified: true,
  verificationPending: false
};

// Default profile settings
const defaultProfileSettings: ProfileSettings = {
  supportEmail: 'atggoal@gmail.com'
};

export function useStore() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [testimonials] = useState<Testimonial[]>(initialTestimonials);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('schoolPortalUser');
    const savedBooks = localStorage.getItem(BOOKS_KEY);
    const savedEvents = localStorage.getItem(EVENTS_KEY);
    const savedLoginState = localStorage.getItem('schoolPortalLoggedIn');
    
    // Load books from localStorage or use initial data
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    } else {
      // First time - save initial books to localStorage
      localStorage.setItem(BOOKS_KEY, JSON.stringify(initialBooks));
    }

    // Load events from localStorage or use initial data
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      // First time - save initial events to localStorage
      localStorage.setItem(EVENTS_KEY, JSON.stringify(initialEvents));
    }

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      // Sync with user database to get latest borrowed books
      const db = getUserDB();
      const dbUser = db.find(u => u.id === parsedUser.id);
      if (dbUser) {
        // Use borrowed books from database (most up-to-date)
        setUser({ ...parsedUser, borrowedBooks: dbUser.borrowedBooks });
      } else {
        setUser(parsedUser);
      }
    }

    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('schoolPortalUser', JSON.stringify(user));
    }
  }, [user]);

  // Save user login state
  useEffect(() => {
    localStorage.setItem('schoolPortalLoggedIn', String(isLoggedIn));
  }, [isLoggedIn]);

  // Get user database from localStorage
  const getUserDB = (): UserWithPassword[] => {
    const db = localStorage.getItem(USER_DB_KEY);
    return db ? JSON.parse(db) : [];
  };

  // Login/Logout
  const login = useCallback((email: string, password: string): { success: boolean; role?: 'student' | 'teacher' | 'admin'; error?: string; pending?: boolean } => {
    // Admin login with hardcoded credentials
    if (email === 'admin@schoolportal.edu' && password === 'admin') {
      setIsLoggedIn(true);
      setUser(adminUser);
      return { success: true, role: 'admin' };
    }
    
    // Check user database
    const db = getUserDB();
    const foundUser = db.find(u => u.email === email);
    
    if (!foundUser) {
      return { success: false, error: 'Account not found. Please register first.' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Check verification status
    if (foundUser.verificationPending) {
      return { success: false, error: 'Your account is pending admin approval. Please wait for verification.', pending: true };
    }

    if (!foundUser.verified) {
      return { success: false, error: 'Your account has not been approved. Please contact admin.' };
    }
    
    // Login successful
    const { password: _, ...userWithoutPassword } = foundUser;
    setIsLoggedIn(true);
    setUser(userWithoutPassword);
    return { success: true, role: foundUser.role };
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  // Register new user
  const register = useCallback((name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin', grade?: string) => {
    // Check if email already exists in database
    const db = getUserDB();
    if (db.some(u => u.email === email)) {
      return { success: false, error: 'Email already registered. Please login instead.' };
    }
    
    // Check reserved emails
    if (email === 'admin@schoolportal.edu') {
      return { success: false, error: 'This email is reserved. Please use a different email.' };
    }
    
    // Determine verification status
    // Students are auto-verified, teachers need approval
    const isStudent = role === 'student';
    
    // Create new user with password
    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
      grade: isStudent ? grade || '7th' : undefined,
      borrowedBooks: [],
      verified: isStudent,
      verificationPending: !isStudent
    };
    
    // Save to database
    db.push(newUser);
    localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
    
    // For students, auto-login. For teachers, show pending message
    if (isStudent) {
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      setIsLoggedIn(true);
      return { success: true, error: null, autoVerified: true };
    } else {
      return { success: true, error: null, pending: true };
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback((updates: Partial<User>) => {
    if (!user) return;
    
    const db = getUserDB();
    const userIndex = db.findIndex(u => u.id === user.id);
    if (userIndex >= 0) {
      db[userIndex] = { ...db[userIndex], ...updates };
      localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
      
      const { password: _, ...userWithoutPassword } = db[userIndex];
      setUser(userWithoutPassword);
    }
  }, [user]);

  // Book operations
  const MAX_BOOKS_PER_STUDENT = 5;

  const rentBook = useCallback((bookId: string): { success: boolean; message?: string } => {
    // Check if user has reached the book limit
    const currentBorrowedCount = user?.borrowedBooks.filter(bb => !bb.returned).length || 0;
    if (currentBorrowedCount >= MAX_BOOKS_PER_STUDENT) {
      return { 
        success: false, 
        message: `You can only borrow up to ${MAX_BOOKS_PER_STUDENT} books at a time. Please return some books first.` 
      };
    }

    // Update books availability
    setBooks(prev => {
      const book = prev.find(b => b.id === bookId);
      if (!book || book.available <= 0) return prev;

      const updatedBooks = prev.map(b =>
        b.id === bookId ? { ...b, available: b.available - 1 } : b
      );
      
      // Save to localStorage for persistence
      localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
      
      return updatedBooks;
    });

    // Update current user's borrowed books
    setUser(prev => {
      if (!prev) return prev;
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

      const newBorrowedBook: BorrowedBook = {
        bookId,
        borrowedDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        returned: false
      };

      const updatedUser = {
        ...prev,
        borrowedBooks: [...prev.borrowedBooks, newBorrowedBook]
      };

      // Update user in database
      const db = getUserDB();
      const userIndex = db.findIndex(u => u.id === prev.id);
      if (userIndex >= 0) {
        db[userIndex] = { ...db[userIndex], borrowedBooks: updatedUser.borrowedBooks };
        localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
      }

      return updatedUser;
    });

    return { success: true };
  }, [user]);

  const returnBook = useCallback((bookId: string) => {
    // Update books availability
    setBooks(prev => {
      const updatedBooks = prev.map(b =>
        b.id === bookId ? { ...b, available: Math.min(b.available + 1, b.total) } : b
      );
      
      // Save to localStorage for persistence
      localStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
      
      return updatedBooks;
    });

    // Update current user's borrowed books
    setUser(prev => {
      if (!prev) return prev;

      const updatedBorrowedBooks = prev.borrowedBooks.map(bb =>
        bb.bookId === bookId && !bb.returned
          ? { ...bb, returned: true, returnedDate: new Date().toISOString().split('T')[0] }
          : bb
      );

      const updatedUser = {
        ...prev,
        borrowedBooks: updatedBorrowedBooks
      };

      // Update user in database
      const db = getUserDB();
      const userIndex = db.findIndex(u => u.id === prev.id);
      if (userIndex >= 0) {
        db[userIndex] = { ...db[userIndex], borrowedBooks: updatedBorrowedBooks };
        localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
      }

      return updatedUser;
    });
  }, []);

  // Get borrowed books with full details
  const getBorrowedBooksDetails = useCallback(() => {
    if (!user) return [];
    
    return user.borrowedBooks
      .filter(bb => !bb.returned)
      .map(bb => {
        const book = books.find(b => b.id === bb.bookId);
        return { ...bb, book };
      })
      .filter(item => item.book) as (BorrowedBook & { book: Book })[];
  }, [user, books]);

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // Get genres
  const genres = ['All', ...Array.from(new Set(books.map(b => b.genre)))];

  // Get due soon books (within 3 days)
  const getDueSoonBooks = useCallback(() => {
    if (!user) return [];
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    return user.borrowedBooks.filter(bb => {
      if (bb.returned) return false;
      const dueDate = new Date(bb.dueDate);
      return dueDate <= threeDaysFromNow && dueDate >= today;
    });
  }, [user]);

  // Admin functions
  const addBook = useCallback((bookData: BookFormData) => {
    const newBook: Book = {
      id: Date.now().toString(),
      ...bookData,
      available: bookData.total
    };
    setBooks(prev => {
      const updated = [...prev, newBook];
      localStorage.setItem(BOOKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateBook = useCallback((bookId: string, bookData: Partial<BookFormData>) => {
    setBooks(prev => {
      const updated = prev.map(book => {
        if (book.id !== bookId) return book;
        
        const newBook = { ...book, ...bookData };
        
        // If total is being updated, recalculate available properly
        if (bookData.total !== undefined) {
          // Calculate how many are currently borrowed
          const borrowed = book.total - book.available;
          // New available = new total - borrowed
          newBook.available = Math.max(0, bookData.total - borrowed);
        }
        
        return newBook;
      });
      localStorage.setItem(BOOKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteBook = useCallback((bookId: string) => {
    setBooks(prev => {
      const updated = prev.filter(book => book.id !== bookId);
      localStorage.setItem(BOOKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getLibraryStats = useCallback((): LibraryStats => {
    const totalBooks = books.reduce((sum, book) => sum + book.total, 0);
    const totalAvailable = books.reduce((sum, book) => sum + book.available, 0);
    const totalBorrowed = totalBooks - totalAvailable;
    
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // Count overdue and due soon from ALL users in database
    let overdueBooks = 0;
    let dueSoonBooks = 0;
    
    const db = getUserDB();
    db.forEach(dbUser => {
      dbUser.borrowedBooks.forEach(bb => {
        if (bb.returned) return;
        const dueDate = new Date(bb.dueDate);
        if (dueDate < today) {
          overdueBooks++;
        } else if (dueDate <= threeDaysFromNow) {
          dueSoonBooks++;
        }
      });
    });
    
    return {
      totalBooks,
      totalBorrowed,
      totalAvailable,
      overdueBooks,
      dueSoonBooks,
      totalUsers: db.length
    };
  }, [books]);

  const getAllBorrowedBooks = useCallback(() => {
    // Get all borrowed books from all users in the database
    const allBorrowed: (BorrowedBook & { book: Book; userName: string })[] = [];
    
    const db = getUserDB();
    
    db.forEach(dbUser => {
      dbUser.borrowedBooks
        .filter(bb => !bb.returned)
        .forEach(bb => {
          const book = books.find(b => b.id === bb.bookId);
          if (book) {
            allBorrowed.push({ 
              ...bb, 
              book, 
              userName: dbUser.name 
            });
          }
        });
    });
    
    return allBorrowed;
  }, [books]);

  // Announcement functions
  const getAnnouncements = useCallback((): Announcement[] => {
    const saved = localStorage.getItem(ANNOUNCEMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const addAnnouncement = useCallback((title: string, message: string) => {
    const announcements = getAnnouncements();
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title,
      message,
      createdAt: new Date().toISOString(),
      active: true
    };
    announcements.push(newAnnouncement);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }, [getAnnouncements]);

  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    const announcements = getAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    if (index >= 0) {
      announcements[index] = { ...announcements[index], ...updates };
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    }
  }, [getAnnouncements]);

  const deleteAnnouncement = useCallback((id: string) => {
    const announcements = getAnnouncements();
    const filtered = announcements.filter(a => a.id !== id);
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(filtered));
  }, [getAnnouncements]);

  const getActiveAnnouncements = useCallback((): Announcement[] => {
    return getAnnouncements().filter(a => a.active);
  }, [getAnnouncements]);

  // User management functions
  const getAllUsers = useCallback((): User[] => {
    const db = getUserDB();
    return db.map(({ password: _, ...user }) => user);
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    const db = getUserDB();
    const index = db.findIndex(u => u.id === userId);
    if (index >= 0) {
      db[index] = { ...db[index], ...updates };
      localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
      
      // Update current user if it's the same user
      if (user?.id === userId) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    }
  }, [user]);

  const deleteUser = useCallback((userId: string) => {
    const db = getUserDB();
    const filtered = db.filter(u => u.id !== userId);
    localStorage.setItem(USER_DB_KEY, JSON.stringify(filtered));
  }, []);

  // Verification functions
  const getPendingVerifications = useCallback((): User[] => {
    const db = getUserDB();
    return db
      .filter(u => u.verificationPending)
      .map(({ password: _, ...user }) => user);
  }, []);

  const approveUser = useCallback((userId: string) => {
    const db = getUserDB();
    const index = db.findIndex(u => u.id === userId);
    if (index >= 0) {
      db[index] = { 
        ...db[index], 
        verified: true, 
        verificationPending: false 
      };
      localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
    }
  }, []);

  const rejectUser = useCallback((userId: string) => {
    const db = getUserDB();
    const index = db.findIndex(u => u.id === userId);
    if (index >= 0) {
      db[index] = { 
        ...db[index], 
        verified: false, 
        verificationPending: false 
      };
      localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
    }
  }, []);

  // Event management functions
  const addEvent = useCallback((title: string, date: string, time: string, description: string, imageUrl?: string) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      date,
      time,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=250&fit=crop'
    };
    setEvents(prev => {
      const updated = [...prev, newEvent];
      localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateEvent = useCallback((eventId: string, updates: Partial<Event>) => {
    setEvents(prev => {
      const updated = prev.map(e => e.id === eventId ? { ...e, ...updates } : e);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== eventId);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ========== ENROLLMENT SYSTEM ==========
  const getEnrollments = useCallback((): Enrollment[] => {
    const saved = localStorage.getItem(ENROLLMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const addEnrollment = useCallback((studentId: string, studentName: string, gradeLevel: string, notes?: string) => {
    const enrollments = getEnrollments();
    const newEnrollment: Enrollment = {
      id: Date.now().toString(),
      studentId,
      studentName,
      course: gradeLevel,
      status: 'pending',
      enrollmentDate: new Date().toISOString(),
      attempts: 1,
      notes
    };
    enrollments.push(newEnrollment);
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
    return newEnrollment;
  }, [getEnrollments]);

  const updateEnrollment = useCallback((id: string, updates: Partial<Enrollment>) => {
    const enrollments = getEnrollments();
    const index = enrollments.findIndex(e => e.id === id);
    if (index >= 0) {
      enrollments[index] = { ...enrollments[index], ...updates };
      localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
    }
  }, [getEnrollments]);

  const deleteEnrollment = useCallback((id: string) => {
    const enrollments = getEnrollments();
    const filtered = enrollments.filter(e => e.id !== id);
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(filtered));
  }, [getEnrollments]);

  const getStudentEnrollments = useCallback((studentId: string): Enrollment[] => {
    return getEnrollments().filter(e => e.studentId === studentId);
  }, [getEnrollments]);

  // ========== GRADES SYSTEM ==========
  const getGrades = useCallback((): Grade[] => {
    const saved = localStorage.getItem(GRADES_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const addGrade = useCallback((studentId: string, subject: string, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', grade: number, maxGrade: number, remarks?: string, postedBy?: string) => {
    const grades = getGrades();
    // Get student's grade level from user database
    const userDB = getUserDB();
    const student = userDB.find(u => u.id === studentId);
    const newGrade: Grade = {
      id: Date.now().toString(),
      studentId,
      studentGrade: student?.grade || 'Unknown',
      subject,
      quarter,
      grade,
      maxGrade,
      remarks,
      datePosted: new Date().toISOString(),
      postedBy: postedBy || 'Admin'
    };
    grades.push(newGrade);
    localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    return newGrade;
  }, [getGrades]);

  const updateGrade = useCallback((id: string, updates: Partial<Grade>) => {
    const grades = getGrades();
    const index = grades.findIndex(g => g.id === id);
    if (index >= 0) {
      grades[index] = { ...grades[index], ...updates };
      localStorage.setItem(GRADES_KEY, JSON.stringify(grades));
    }
  }, [getGrades]);

  const deleteGrade = useCallback((id: string) => {
    const grades = getGrades();
    const filtered = grades.filter(g => g.id !== id);
    localStorage.setItem(GRADES_KEY, JSON.stringify(filtered));
  }, [getGrades]);

  const getStudentGrades = useCallback((studentId: string): Grade[] => {
    return getGrades().filter(g => g.studentId === studentId);
  }, [getGrades]);

  // ========== MESSAGING SYSTEM ==========
  const getMessages = useCallback((): Message[] => {
    const saved = localStorage.getItem(MESSAGES_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const sendMessage = useCallback((senderId: string, senderName: string, senderRole: 'student' | 'teacher' | 'admin', recipientId: string, recipientName: string, subject: string, content: string) => {
    const messages = getMessages();
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      senderRole,
      recipientId,
      recipientName,
      subject,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return newMessage;
  }, [getMessages]);

  const markMessageAsRead = useCallback((id: string) => {
    const messages = getMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index >= 0) {
      messages[index] = { ...messages[index], read: true };
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [getMessages]);

  const deleteMessage = useCallback((id: string) => {
    const messages = getMessages();
    const filtered = messages.filter(m => m.id !== id);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(filtered));
  }, [getMessages]);

  const getUserMessages = useCallback((userId: string): Message[] => {
    return getMessages().filter(m => m.recipientId === userId || m.senderId === userId);
  }, [getMessages]);

  const getUnreadMessageCount = useCallback((userId: string): number => {
    return getMessages().filter(m => m.recipientId === userId && !m.read).length;
  }, [getMessages]);

  // ========== TICKET SYSTEM ==========
  const getTickets = useCallback((): Ticket[] => {
    const saved = localStorage.getItem(TICKETS_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const createTicket = useCallback((userId: string, userName: string, userEmail: string, subject: string, message: string, category: 'bug' | 'feature' | 'support' | 'other') => {
    const tickets = getTickets();
    const newTicket: Ticket = {
      id: Date.now().toString(),
      userId,
      userName,
      userEmail,
      subject,
      message,
      category,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    tickets.push(newTicket);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    return newTicket;
  }, [getTickets]);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    const tickets = getTickets();
    const index = tickets.findIndex(t => t.id === id);
    if (index >= 0) {
      tickets[index] = { ...tickets[index], ...updates };
      localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    }
  }, [getTickets]);

  const deleteTicket = useCallback((id: string) => {
    const tickets = getTickets();
    const filtered = tickets.filter(t => t.id !== id);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(filtered));
  }, [getTickets]);

  const getUserTickets = useCallback((userId: string): Ticket[] => {
    return getTickets().filter(t => t.userId === userId);
  }, [getTickets]);

  // ========== PROFILE SETTINGS ==========
  const getProfileSettings = useCallback((): ProfileSettings => {
    const saved = localStorage.getItem(PROFILE_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultProfileSettings;
  }, []);

  const updateProfileSettings = useCallback((updates: Partial<ProfileSettings>) => {
    const settings = getProfileSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(updated));
  }, [getProfileSettings]);

  // Sections Management
  const getSections = useCallback((): Section[] => {
    const saved = localStorage.getItem(SECTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const createSection = useCallback((name: string, grade: string, teacherId: string, teacherName: string) => {
    const sections = getSections();
    const newSection: Section = {
      id: Date.now().toString(),
      name,
      grade,
      teacherId,
      teacherName,
      studentIds: [],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(SECTIONS_KEY, JSON.stringify([...sections, newSection]));
  }, [getSections]);

  const deleteSection = useCallback((sectionId: string) => {
    const sections = getSections();
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections.filter(s => s.id !== sectionId)));
  }, [getSections]);

  const addStudentToSection = useCallback((sectionId: string, studentId: string) => {
    const sections = getSections();
    const updated = sections.map(s => 
      s.id === sectionId 
        ? { ...s, studentIds: [...s.studentIds, studentId] }
        : s
    );
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(updated));
  }, [getSections]);

  const removeStudentFromSection = useCallback((sectionId: string, studentId: string) => {
    const sections = getSections();
    const updated = sections.map(s => 
      s.id === sectionId 
        ? { ...s, studentIds: s.studentIds.filter(id => id !== studentId) }
        : s
    );
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(updated));
  }, [getSections]);

  // Attendance Management
  const getAttendanceSessions = useCallback((): AttendanceSession[] => {
    const saved = localStorage.getItem(ATTENDANCE_SESSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const getAttendanceRecords = useCallback((): AttendanceRecord[] => {
    const saved = localStorage.getItem(ATTENDANCE_RECORDS_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const createAttendanceSession = useCallback(async (teacherId: string, sectionId: string, sectionName: string, expiresInMinutes: number) => {
    const sessions = getAttendanceSessions();
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = Date.now() + expiresInMinutes * 60000;
    
    // Generate QR code data
    const qrData = JSON.stringify({
      type: 'attendance',
      sessionId: Date.now().toString(),
      code
    });
    
    const qrDataUrl = await QRCodeLib.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' }
    });

    const newSession: AttendanceSession = {
      id: Date.now().toString(),
      teacherId,
      sectionId,
      sectionName,
      date: new Date().toISOString(),
      qrCode: code,
      qrDataUrl,
      expiresAt,
      createdAt: Date.now(),
      isActive: true
    };

    localStorage.setItem(ATTENDANCE_SESSIONS_KEY, JSON.stringify([...sessions, newSession]));
  }, [getAttendanceSessions]);

  const markAttendance = useCallback((sessionId: string, studentId: string, studentName: string) => {
    const records = getAttendanceRecords();
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      sessionId,
      studentId,
      studentName,
      date: new Date().toISOString(),
      status: 'present',
      scannedAt: Date.now()
    };
    localStorage.setItem(ATTENDANCE_RECORDS_KEY, JSON.stringify([...records, newRecord]));
  }, [getAttendanceRecords]);

  const cleanupExpiredSessions = useCallback(() => {
    const sessions = getAttendanceSessions();
    const now = Date.now();
    const updated = sessions.map(s => 
      s.expiresAt < now ? { ...s, isActive: false } : s
    );
    localStorage.setItem(ATTENDANCE_SESSIONS_KEY, JSON.stringify(updated));
  }, [getAttendanceSessions]);

  const isAdmin = user?.role === 'admin';

  return {
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
    // Announcement functions
    getAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getActiveAnnouncements,
    // User management functions
    getAllUsers,
    updateUser,
    deleteUser,
    getPendingVerifications,
    approveUser,
    rejectUser,
    // Event management functions
    addEvent,
    updateEvent,
    deleteEvent,
    // Enrollment functions
    getEnrollments,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
    getStudentEnrollments,
    // Grades functions
    getGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    getStudentGrades,
    // Messaging functions
    getMessages,
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    getUserMessages,
    getUnreadMessageCount,
    // Ticket functions
    getTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    getUserTickets,
    // Profile settings
    getProfileSettings,
    updateProfileSettings,
    // Sections
    getSections,
    createSection,
    deleteSection,
    addStudentToSection,
    removeStudentFromSection,
    // Attendance
    getAttendanceSessions,
    getAttendanceRecords,
    createAttendanceSession,
    markAttendance,
    cleanupExpiredSessions
  };
}
