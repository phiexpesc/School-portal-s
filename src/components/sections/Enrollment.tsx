import { useState, useEffect } from 'react';
import { X, Plus, Clock, CheckCircle, XCircle, Loader2, GraduationCap } from 'lucide-react';
import type { Enrollment, User } from '@/types';
import { INDIVIDUAL_GRADES } from '@/types';

interface EnrollmentProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  enrollments: Enrollment[];
  isAdmin?: boolean;
  students?: User[];
  onAddEnrollment?: (studentId: string, studentName: string, gradeLevel: string, notes?: string) => Promise<void>;
  onUpdateEnrollment?: (id: string, updates: Partial<Enrollment>) => Promise<void>;
  onRetry?: (enrollment: Enrollment) => void;
  getEnrollments: () => Promise<Enrollment[]>;
  getStudentEnrollments: (studentId: string) => Promise<Enrollment[]>;
}

export function EnrollmentModal({
  isOpen,
  onClose,
  currentUser,
  enrollments: initialEnrollments,
  isAdmin = false,
  students = [],
  onAddEnrollment,
  onUpdateEnrollment,
  onRetry,
  getEnrollments,
  getStudentEnrollments
}: EnrollmentProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [showForm, setShowForm] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(INDIVIDUAL_GRADES[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load enrollments from Firebase
  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const data = isAdmin 
          ? await getEnrollments() 
          : await getStudentEnrollments(currentUser.id);
        setEnrollments(data);
      } catch (error) {
        console.error('Error loading enrollments:', error);
      }
    };

    if (isOpen) {
      loadEnrollments();
    }
  }, [isOpen, isAdmin, currentUser.id, getEnrollments, getStudentEnrollments]);

  if (!isOpen) return null;

  const getStatusIcon = (status: Enrollment['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: Enrollment['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEnrollment) return;

    setIsSubmitting(true);
    try {
      await onAddEnrollment(currentUser.id, currentUser.name, selectedGrade, notes);
      const data = await getStudentEnrollments(currentUser.id);
      setEnrollments(data);
      setShowForm(false);
      setNotes('');
    } catch (error) {
      console.error('Error submitting enrollment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    if (!onUpdateEnrollment) return;
    
    try {
      await onUpdateEnrollment(id, { status });
      const data = await getEnrollments();
      setEnrollments(data);
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-[#1a1a1a]">Student Enrollment</h3>
            <p className="text-gray-500 mt-1">
              {isAdmin ? 'Managing applications' : 'Apply for school enrollment'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Enrollments List */}
          <div className="mb-8">
            <h4 className="font-bold text-[#1a1a1a] mb-4">
              {isAdmin ? 'All Applications' : `My Applications (${enrollments.length})`}
            </h4>

            {enrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No applications yet.</p>
                {!isAdmin && <p className="text-sm">Submit your enrollment application below!</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="bg-gray-50 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(enrollment.status)}
                        <div>
                          <div className="font-bold text-[#1a1a1a]">
                            {isAdmin ? enrollment.studentName : enrollment.course}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="text-sm text-gray-600 mb-3">
                        Grade Level: {enrollment.course}
                      </div>
                    )}

                    {enrollment.notes && (
                      <div className="text-sm text-gray-600 bg-white rounded-xl p-3 mb-3">
                        {enrollment.notes}
                      </div>
                    )}

                    {enrollment.status === 'rejected' && onRetry && !isAdmin && (
                      <button
                        onClick={() => onRetry(enrollment)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Reapply with updated information
                      </button>
                    )}

                    {isAdmin && enrollment.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleStatusUpdate(enrollment.id, 'approved')}
                          className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(enrollment.id, 'rejected')}
                          className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrollment Form */}
          {!isAdmin && (
            <div>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Application
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-[#1a1a1a]">New Enrollment Application</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade Level
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full h-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4"
                    >
                      {INDIVIDUAL_GRADES.map((grade) => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Enrollment (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-24 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4 py-3 resize-none"
                      placeholder="Tell us why you want to enroll..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
