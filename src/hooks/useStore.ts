import { useState, useEffect, useCallback } from 'react';
import type { Book, User, BorrowedBook, Event, Testimonial, LibraryStats, BookFormData, Announcement, Enrollment, Grade, Message, Ticket, ProfileSettings, Section, AttendanceSession, AttendanceRecord } from '@/types';
import QRCodeLib from 'qrcode';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  BOOKS: 'books',
  EVENTS: 'events',
  ANNOUNCEMENTS: 'announcements',
  ENROLLMENTS: 'enrollments',
  GRADES: 'grades',
  MESSAGES: 'messages',
  TICKETS: 'tickets',
  SETTINGS: 'settings',
  SECTIONS: 'sections',
  ATTENDANCE_SESSIONS: 'attendanceSessions',
  ATTENDANCE_RECORDS: 'attendanceRecords',
  BORROWED_BOOKS: 'borrowedBooks'
} as const;

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
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [testimonials] = useState<Testimonial[]>(initialTestimonials);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Initialize data from Firebase
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if books collection is empty, if so, seed it
        const booksSnapshot = await getDocs(collection(db, COLLECTIONS.BOOKS));
        if (booksSnapshot.empty) {
          const batch = writeBatch(db);
          initialBooks.forEach((book) => {
            const ref = doc(db, COLLECTIONS.BOOKS, book.id);
            batch.set(ref, book);
          });
          await batch.commit();
        }

        // Check if events collection is empty
        const eventsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
        if (eventsSnapshot.empty) {
          const batch = writeBatch(db);
          initialEvents.forEach((event) => {
            const ref = doc(db, COLLECTIONS.EVENTS, event.id);
            batch.set(ref, event);
          });
          await batch.commit();
        }

        // Check if settings exist
        const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'profile'));
        if (!settingsDoc.exists()) {
          await setDoc(doc(db, COLLECTIONS.SETTINGS, 'profile'), defaultProfileSettings);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (loading) return;

    // Listen to books
    const unsubscribeBooks = onSnapshot(
      collection(db, COLLECTIONS.BOOKS),
      (snapshot) => {
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];
        setBooks(booksData);
      }
    );

    // Listen to events
    const unsubscribeEvents = onSnapshot(
      collection(db, COLLECTIONS.EVENTS),
      (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        setEvents(eventsData);
      }
    );

    return () => {
      unsubscribeBooks();
      unsubscribeEvents();
    };
  }, [loading]);

  // Check for saved session on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('schoolPortalUserId');
    if (savedUserId) {
      const loadUser = async () => {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, savedUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          setIsLoggedIn(true);
        }
      };
      loadUser();
    }
  }, []);

  // Save user session
  useEffect(() => {
    if (user) {
      localStorage.setItem('schoolPortalUserId', user.id);
    } else {
      localStorage.removeItem('schoolPortalUserId');
    }
  }, [user]);

  // Login/Logout
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; role?: 'student' | 'teacher' | 'admin'; error?: string; pending?: boolean }> => {
    try {
      // Admin login with hardcoded credentials
      if (email === 'admin@schoolportal.edu' && password === 'admin') {
        setIsLoggedIn(true);
        setUser(adminUser);
        await setDoc(doc(db, COLLECTIONS.USERS, adminUser.id), adminUser);
        return { success: true, role: 'admin' };
      }

      // Query user by email
      const usersQuery = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        return { success: false, error: 'Account not found. Please register first.' };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data() as User & { password: string };

      if (userData.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      if (userData.verificationPending) {
        return { success: false, error: 'Your account is pending admin approval. Please wait for verification.', pending: true };
      }

      if (!userData.verified) {
        return { success: false, error: 'Your account has not been approved. Please contact admin.' };
      }

      const { password: _, ...userWithoutPassword } = userData;
      setIsLoggedIn(true);
      setUser(userWithoutPassword);
      return { success: true, role: userData.role };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login.' };
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('schoolPortalUserId');
  }, []);

  // Register new user
  const register = useCallback(async (name: string, email: string, password: string, role: 'student' | 'teacher' | 'admin', grade?: string) => {
    try {
      // Check if email already exists
      const usersQuery = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
      const snapshot = await getDocs(usersQuery);
      
      if (!snapshot.empty) {
        return { success: false, error: 'Email already registered. Please login instead.' };
      }

      if (email === 'admin@schoolportal.edu') {
        return { success: false, error: 'This email is reserved. Please use a different email.' };
      }

      const isStudent = role === 'student';
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role,
        grade: isStudent ? grade || '7th' : undefined,
        borrowedBooks: [],
        verified: isStudent,
        verificationPending: !isStudent,
        createdAt: Timestamp.now()
      };

      await setDoc(doc(db, COLLECTIONS.USERS, newUser.id), newUser);

      if (isStudent) {
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword as User);
        setIsLoggedIn(true);
        return { success: true, error: null, autoVerified: true };
      } else {
        return { success: true, error: null, pending: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration.' };
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      await updateDoc(userRef, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [user]);

  // Book operations
  const MAX_BOOKS_PER_STUDENT = 5;

  const rentBook = useCallback(async (bookId: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'Please login first.' };

    try {
      // Check current borrowed count
      const borrowedQuery = query(
        collection(db, COLLECTIONS.BORROWED_BOOKS),
        where('userId', '==', user.id),
        where('returned', '==', false)
      );
      const borrowedSnapshot = await getDocs(borrowedQuery);
      
      if (borrowedSnapshot.size >= MAX_BOOKS_PER_STUDENT) {
        return { 
          success: false, 
          message: `You can only borrow up to ${MAX_BOOKS_PER_STUDENT} books at a time. Please return some books first.` 
        };
      }

      const bookRef = doc(db, COLLECTIONS.BOOKS, bookId);
      const bookDoc = await getDoc(bookRef);
      
      if (!bookDoc.exists()) {
        return { success: false, message: 'Book not found.' };
      }

      const bookData = bookDoc.data() as Book;
      if (bookData.available <= 0) {
        return { success: false, message: 'Book is not available.' };
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const borrowedBook: BorrowedBook = {
        bookId,
        borrowedDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        returned: false
      };

      const batch = writeBatch(db);
      
      // Update book availability
      batch.update(bookRef, { available: increment(-1) });
      
      // Add borrowed book record
      const borrowedRef = doc(collection(db, COLLECTIONS.BORROWED_BOOKS));
      batch.set(borrowedRef, {
        ...borrowedBook,
        userId: user.id,
        id: borrowedRef.id
      });

      // Update user's borrowed books
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      batch.update(userRef, {
        borrowedBooks: [...user.borrowedBooks, borrowedBook]
      });

      await batch.commit();

      setUser(prev => prev ? {
        ...prev,
        borrowedBooks: [...prev.borrowedBooks, borrowedBook]
      } : null);

      return { success: true };
    } catch (error) {
      console.error('Error renting book:', error);
      return { success: false, message: 'An error occurred.' };
    }
  }, [user]);

  const returnBook = useCallback(async (bookId: string) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);

      // Update book availability
      const bookRef = doc(db, COLLECTIONS.BOOKS, bookId);
      batch.update(bookRef, { available: increment(1) });

      // Find and update borrowed book record
      const borrowedQuery = query(
        collection(db, COLLECTIONS.BORROWED_BOOKS),
        where('userId', '==', user.id),
        where('bookId', '==', bookId),
        where('returned', '==', false)
      );
      const borrowedSnapshot = await getDocs(borrowedQuery);
      
      if (!borrowedSnapshot.empty) {
        const borrowedDoc = borrowedSnapshot.docs[0];
        batch.update(borrowedDoc.ref, {
          returned: true,
          returnedDate: new Date().toISOString().split('T')[0]
        });
      }

      // Update user's borrowed books
      const updatedBorrowedBooks = user.borrowedBooks.map(bb =>
        bb.bookId === bookId && !bb.returned
          ? { ...bb, returned: true, returnedDate: new Date().toISOString().split('T')[0] }
          : bb
      );

      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      batch.update(userRef, { borrowedBooks: updatedBorrowedBooks });

      await batch.commit();

      setUser(prev => prev ? { ...prev, borrowedBooks: updatedBorrowedBooks } : null);
    } catch (error) {
      console.error('Error returning book:', error);
    }
  }, [user]);

  // Get borrowed books with full details
  const getBorrowedBooksDetails = useCallback(async () => {
    if (!user) return [];
    
    try {
      const borrowedQuery = query(
        collection(db, COLLECTIONS.BORROWED_BOOKS),
        where('userId', '==', user.id),
        where('returned', '==', false)
      );
      const snapshot = await getDocs(borrowedQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const book = books.find(b => b.id === data.bookId);
        return { ...data, book } as BorrowedBook & { book: Book };
      }).filter(item => item.book);
    } catch (error) {
      console.error('Error getting borrowed books:', error);
      return [];
    }
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
  const getDueSoonBooks = useCallback(async () => {
    if (!user) return [];
    
    try {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const borrowedQuery = query(
        collection(db, COLLECTIONS.BORROWED_BOOKS),
        where('userId', '==', user.id),
        where('returned', '==', false)
      );
      const snapshot = await getDocs(borrowedQuery);

      return snapshot.docs
        .map(doc => doc.data() as BorrowedBook)
        .filter(bb => {
          const dueDate = new Date(bb.dueDate);
          return dueDate <= threeDaysFromNow && dueDate >= today;
        });
    } catch (error) {
      console.error('Error getting due soon books:', error);
      return [];
    }
  }, [user]);

  // Admin functions
  const addBook = useCallback(async (bookData: BookFormData) => {
    try {
      const newBook: Book = {
        id: Date.now().toString(),
        ...bookData,
        available: bookData.total
      };
      await setDoc(doc(db, COLLECTIONS.BOOKS, newBook.id), newBook);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  }, []);

  const updateBook = useCallback(async (bookId: string, bookData: Partial<BookFormData>) => {
    try {
      const bookRef = doc(db, COLLECTIONS.BOOKS, bookId);
      const bookDoc = await getDoc(bookRef);
      
      if (!bookDoc.exists()) return;
      
      const currentBook = bookDoc.data() as Book;
      const updates: Partial<Book> = { ...bookData };

      if (bookData.total !== undefined) {
        const borrowed = currentBook.total - currentBook.available;
        updates.available = Math.max(0, bookData.total - borrowed);
      }

      await updateDoc(bookRef, updates);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  }, []);

  const deleteBook = useCallback(async (bookId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.BOOKS, bookId));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }, []);

  const getLibraryStats = useCallback(async (): Promise<LibraryStats> => {
    try {
      const booksSnapshot = await getDocs(collection(db, COLLECTIONS.BOOKS));
      const totalBooks = booksSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
      const totalAvailable = booksSnapshot.docs.reduce((sum, doc) => sum + (doc.data().available || 0), 0);
      const totalBorrowed = totalBooks - totalAvailable;

      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const borrowedSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.BORROWED_BOOKS), where('returned', '==', false))
      );

      let overdueBooks = 0;
      let dueSoonBooks = 0;

      borrowedSnapshot.forEach(doc => {
        const data = doc.data();
        const dueDate = new Date(data.dueDate);
        if (dueDate < today) {
          overdueBooks++;
        } else if (dueDate <= threeDaysFromNow) {
          dueSoonBooks++;
        }
      });

      const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));

      return {
        totalBooks,
        totalBorrowed,
        totalAvailable,
        overdueBooks,
        dueSoonBooks,
        totalUsers: usersSnapshot.size
      };
    } catch (error) {
      console.error('Error getting library stats:', error);
      return {
        totalBooks: 0,
        totalBorrowed: 0,
        totalAvailable: 0,
        overdueBooks: 0,
        dueSoonBooks: 0,
        totalUsers: 0
      };
    }
  }, []);

  const getAllBorrowedBooks = useCallback(async () => {
    try {
      const borrowedSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.BORROWED_BOOKS), where('returned', '==', false))
      );

      const result: (BorrowedBook & { book: Book; userName: string })[] = [];

      for (const borrowedDoc of borrowedSnapshot.docs) {
        const borrowedData = borrowedDoc.data();
        const book = books.find(b => b.id === borrowedData.bookId);
        
        if (book) {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, borrowedData.userId));
          const userName = userDoc.exists() ? (userDoc.data() as User).name : 'Unknown';
          
          result.push({
            ...borrowedData,
            book,
            userName
          } as BorrowedBook & { book: Book; userName: string });
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting all borrowed books:', error);
      return [];
    }
  }, [books]);

  // Announcement functions
  const getAnnouncements = useCallback(async (): Promise<Announcement[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ANNOUNCEMENTS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    } catch (error) {
      console.error('Error getting announcements:', error);
      return [];
    }
  }, []);

  const addAnnouncement = useCallback(async (title: string, message: string) => {
    try {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title,
        message,
        createdAt: new Date().toISOString(),
        active: true
      };
      await setDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, newAnnouncement.id), newAnnouncement);
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  }, []);

  const updateAnnouncement = useCallback(async (id: string, updates: Partial<Announcement>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id), updates);
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  }, []);

  const getActiveAnnouncements = useCallback(async (): Promise<Announcement[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.ANNOUNCEMENTS), where('active', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    } catch (error) {
      console.error('Error getting active announcements:', error);
      return [];
    }
  }, []);

  // User management functions
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const { password, ...userWithoutPassword } = data;
        return { id: doc.id, ...userWithoutPassword } as User;
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), updates);
      if (user?.id === userId) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, [user]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }, []);

  // Verification functions
  const getPendingVerifications = useCallback(async (): Promise<User[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where('verificationPending', '==', true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const { password, ...userWithoutPassword } = data;
        return { id: doc.id, ...userWithoutPassword } as User;
      });
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      return [];
    }
  }, []);

  const approveUser = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        verified: true,
        verificationPending: false
      });
    } catch (error) {
      console.error('Error approving user:', error);
    }
  }, []);

  const rejectUser = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        verified: false,
        verificationPending: false
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  }, []);

  // Event management functions
  const addEvent = useCallback(async (title: string, date: string, time: string, description: string, imageUrl?: string) => {
    try {
      const newEvent: Event = {
        id: Date.now().toString(),
        title,
        date,
        time,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=250&fit=crop'
      };
      await setDoc(doc(db, COLLECTIONS.EVENTS, newEvent.id), newEvent);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), updates);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, []);

  // ========== ENROLLMENT SYSTEM ==========
  const getEnrollments = useCallback(async (): Promise<Enrollment[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ENROLLMENTS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
    } catch (error) {
      console.error('Error getting enrollments:', error);
      return [];
    }
  }, []);

  const addEnrollment = useCallback(async (studentId: string, studentName: string, gradeLevel: string, notes?: string) => {
    try {
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
      await setDoc(doc(db, COLLECTIONS.ENROLLMENTS, newEnrollment.id), newEnrollment);
      return newEnrollment;
    } catch (error) {
      console.error('Error adding enrollment:', error);
      throw error;
    }
  }, []);

  const updateEnrollment = useCallback(async (id: string, updates: Partial<Enrollment>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.ENROLLMENTS, id), updates);
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  }, []);

  const deleteEnrollment = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ENROLLMENTS, id));
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    }
  }, []);

  const getStudentEnrollments = useCallback(async (studentId: string): Promise<Enrollment[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.ENROLLMENTS), where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
    } catch (error) {
      console.error('Error getting student enrollments:', error);
      return [];
    }
  }, []);

  // ========== GRADES SYSTEM ==========
  const getGrades = useCallback(async (): Promise<Grade[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.GRADES));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    } catch (error) {
      console.error('Error getting grades:', error);
      return [];
    }
  }, []);

  const addGrade = useCallback(async (studentId: string, subject: string, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', grade: number, maxGrade: number, remarks?: string, postedBy?: string) => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, studentId));
      const student = userDoc.exists() ? (userDoc.data() as User) : null;

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
      await setDoc(doc(db, COLLECTIONS.GRADES, newGrade.id), newGrade);
      return newGrade;
    } catch (error) {
      console.error('Error adding grade:', error);
      throw error;
    }
  }, []);

  const updateGrade = useCallback(async (id: string, updates: Partial<Grade>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.GRADES, id), updates);
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  }, []);

  const deleteGrade = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.GRADES, id));
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  }, []);

  const getStudentGrades = useCallback(async (studentId: string): Promise<Grade[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.GRADES), where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
    } catch (error) {
      console.error('Error getting student grades:', error);
      return [];
    }
  }, []);

  // ========== MESSAGING SYSTEM ==========
  const getMessages = useCallback(async (): Promise<Message[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.MESSAGES));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (senderId: string, senderName: string, senderRole: 'student' | 'teacher' | 'admin', recipientId: string, recipientName: string, subject: string, content: string) => {
    try {
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
      await setDoc(doc(db, COLLECTIONS.MESSAGES, newMessage.id), newMessage);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);

  const markMessageAsRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.MESSAGES, id), { read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.MESSAGES, id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, []);

  const getUserMessages = useCallback(async (userId: string): Promise<Message[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('recipientId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (error) {
      console.error('Error getting user messages:', error);
      return [];
    }
  }, []);

  const getUnreadMessageCount = useCallback(async (userId: string): Promise<number> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }, []);

  // ========== TICKET SYSTEM ==========
  const getTickets = useCallback(async (): Promise<Ticket[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.TICKETS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
    } catch (error) {
      console.error('Error getting tickets:', error);
      return [];
    }
  }, []);

  const createTicket = useCallback(async (userId: string, userName: string, userEmail: string, subject: string, message: string, category: 'bug' | 'feature' | 'support' | 'other') => {
    try {
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
      await setDoc(doc(db, COLLECTIONS.TICKETS, newTicket.id), newTicket);
      return newTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }, []);

  const updateTicket = useCallback(async (id: string, updates: Partial<Ticket>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.TICKETS, id), updates);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  }, []);

  const deleteTicket = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TICKETS, id));
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  }, []);

  const getUserTickets = useCallback(async (userId: string): Promise<Ticket[]> => {
    try {
      const q = query(collection(db, COLLECTIONS.TICKETS), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
    } catch (error) {
      console.error('Error getting user tickets:', error);
      return [];
    }
  }, []);

  // ========== PROFILE SETTINGS ==========
  const getProfileSettings = useCallback(async (): Promise<ProfileSettings> => {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'profile'));
      if (docSnap.exists()) {
        return docSnap.data() as ProfileSettings;
      }
      return defaultProfileSettings;
    } catch (error) {
      console.error('Error getting profile settings:', error);
      return defaultProfileSettings;
    }
  }, []);

  const updateProfileSettings = useCallback(async (updates: Partial<ProfileSettings>) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.SETTINGS, 'profile'), updates);
    } catch (error) {
      console.error('Error updating profile settings:', error);
    }
  }, []);

  // Sections Management
  const getSections = useCallback(async (): Promise<Section[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.SECTIONS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
    } catch (error) {
      console.error('Error getting sections:', error);
      return [];
    }
  }, []);

  const createSection = useCallback(async (name: string, grade: string, teacherId: string, teacherName: string) => {
    try {
      const newSection: Section = {
        id: Date.now().toString(),
        name,
        grade,
        teacherId,
        teacherName,
        studentIds: [],
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, COLLECTIONS.SECTIONS, newSection.id), newSection);
    } catch (error) {
      console.error('Error creating section:', error);
    }
  }, []);

  const deleteSection = useCallback(async (sectionId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.SECTIONS, sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  }, []);

  const addStudentToSection = useCallback(async (sectionId: string, studentId: string) => {
    try {
      const sectionRef = doc(db, COLLECTIONS.SECTIONS, sectionId);
      const sectionDoc = await getDoc(sectionRef);
      if (sectionDoc.exists()) {
        const currentStudentIds = sectionDoc.data().studentIds || [];
        await updateDoc(sectionRef, {
          studentIds: [...currentStudentIds, studentId]
        });
      }
    } catch (error) {
      console.error('Error adding student to section:', error);
    }
  }, []);

  const removeStudentFromSection = useCallback(async (sectionId: string, studentId: string) => {
    try {
      const sectionRef = doc(db, COLLECTIONS.SECTIONS, sectionId);
      const sectionDoc = await getDoc(sectionRef);
      if (sectionDoc.exists()) {
        const currentStudentIds = sectionDoc.data().studentIds || [];
        await updateDoc(sectionRef, {
          studentIds: currentStudentIds.filter((id: string) => id !== studentId)
        });
      }
    } catch (error) {
      console.error('Error removing student from section:', error);
    }
  }, []);

  // Attendance Management
  const getAttendanceSessions = useCallback(async (): Promise<AttendanceSession[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ATTENDANCE_SESSIONS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceSession));
    } catch (error) {
      console.error('Error getting attendance sessions:', error);
      return [];
    }
  }, []);

  const getAttendanceRecords = useCallback(async (): Promise<AttendanceRecord[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ATTENDANCE_RECORDS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error) {
      console.error('Error getting attendance records:', error);
      return [];
    }
  }, []);

  const createAttendanceSession = useCallback(async (teacherId: string, sectionId: string, sectionName: string, expiresInMinutes: number) => {
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiresAt = Date.now() + expiresInMinutes * 60000;
      
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

      await setDoc(doc(db, COLLECTIONS.ATTENDANCE_SESSIONS, newSession.id), newSession);
    } catch (error) {
      console.error('Error creating attendance session:', error);
    }
  }, []);

  const markAttendance = useCallback(async (sessionId: string, studentId: string, studentName: string) => {
    try {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        sessionId,
        studentId,
        studentName,
        date: new Date().toISOString(),
        status: 'present',
        scannedAt: Date.now()
      };
      await setDoc(doc(db, COLLECTIONS.ATTENDANCE_RECORDS, newRecord.id), newRecord);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  }, []);

  const cleanupExpiredSessions = useCallback(async () => {
    try {
      const now = Date.now();
      const q = query(
        collection(db, COLLECTIONS.ATTENDANCE_SESSIONS),
        where('expiresAt', '<', now),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isActive: false });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  return {
    books,
    filteredBooks,
    user,
    events,
    testimonials,
    isLoggedIn,
    isAdmin,
    loading,
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
