export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  grade: string;
  pages: number;
  available: number;
  total: number;
  coverUrl?: string;
}

export interface BorrowedBook {
  bookId: string;
  borrowedDate: string;
  dueDate: string;
  returned: boolean;
  returnedDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  grade?: string;
  borrowedBooks: BorrowedBook[];
  profileImage?: string;
  phone?: string;
  address?: string;
  verified: boolean;
  verificationPending: boolean;
  sectionId?: string;
  // Additional profile fields
  birthdate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  parentName?: string;
  studentIdNumber?: string;
}

// Section/Team for teachers to organize students
export interface Section {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  studentIds: string[];
  createdAt: string;
}

// Attendance System
export interface AttendanceSession {
  id: string;
  teacherId: string;
  sectionId: string;
  sectionName: string;
  date: string;
  qrCode: string;
  qrDataUrl: string;
  expiresAt: number;
  createdAt: number;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  scannedAt: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  imageUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  grade: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalBorrowed: number;
  totalAvailable: number;
  overdueBooks: number;
  dueSoonBooks: number;
  totalUsers: number;
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  genre: string;
  grade: string;
  pages: number;
  total: number;
  coverUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  active: boolean;
}

// Enrollment System
export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  status: 'pending' | 'approved' | 'rejected';
  enrollmentDate: string;
  attempts: number;
  notes?: string;
}

// Grades System
export interface Grade {
  id: string;
  studentId: string;
  studentGrade: string;
  subject: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  grade: number;
  maxGrade: number;
  remarks?: string;
  datePosted: string;
  postedBy: string;
}

// Communication System
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'admin';
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Feedback/Ticket System
export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: 'bug' | 'feature' | 'support' | 'other';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  adminResponse?: string;
  respondedAt?: string;
}

// Profile Settings
export interface ProfileSettings {
  supportEmail: string;
}

export type View = 'dashboard' | 'library' | 'subjects' | 'events' | 'mybooks' | 'login' | 'admin' | 'terms' | 'privacy' | 'grades' | 'messages' | 'profile' | 'enrollment' | 'tickets' | 'sections' | 'attendance';

// Individual Grade Levels
export const INDIVIDUAL_GRADES = [
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',  // High School
  'Grade 11', 'Grade 12'  // Senior High School
] as const;

export type IndividualGrade = typeof INDIVIDUAL_GRADES[number];

// Subject Management
export interface GradeSubject {
  id: string;
  name: string;
  gradeLevel: string;
}

export interface SubjectConfig {
  id: string;
  name: string;
  gradeLevels: string[];
}
