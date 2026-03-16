import { useState } from 'react';
import { X, GraduationCap, Check, Clock, AlertCircle, Plus, RefreshCw, User, FileText, Calendar } from 'lucide-react';
import type { Enrollment } from '@/types';

interface EnrollmentProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  enrollments: Enrollment[];
  onEnroll: (gradeLevel: string, reason: string) => void;
  onRetry?: (enrollmentId: string) => void;
  isAdmin?: boolean;
}

const GRADE_LEVELS = [
  { value: 'Grade 7', label: 'Grade 7 (High School - Junior)' },
  { value: 'Grade 8', label: 'Grade 8 (High School - Junior)' },
  { value: 'Grade 9', label: 'Grade 9 (High School - Junior)' },
  { value: 'Grade 10', label: 'Grade 10 (High School - Junior)' },
  { value: 'Grade 11', label: 'Grade 11 (Senior High School)' },
  { value: 'Grade 12', label: 'Grade 12 (Senior High School)' }
];

export function EnrollmentModal({
  isOpen,
  onClose,
  studentName,
  enrollments,
  onEnroll,
  onRetry,
  isAdmin = false
}: EnrollmentProps) {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGrade && reason) {
      onEnroll(selectedGrade, reason);
      setSelectedGrade('');
      setReason('');
      setShowForm(false);
    }
  };

  const getStatusIcon = (status: Enrollment['status']) => {
    switch (status) {
      case 'approved':
        return <Check size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'rejected':
        return <AlertCircle size={16} className="text-red-600" />;
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Student Enrollment
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAdmin ? `Managing applications for ${studentName}` : 'Apply for school enrollment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Enrollment Applications */}
        <div className="mb-6">
          <h4 className="font-bold mb-3 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
            My Applications ({enrollments.length})
          </h4>
          
          {enrollments.length === 0 ? (
            <div className="text-center py-6 bg-[var(--bg-primary)] rounded-xl border-[2px] border-dashed border-[rgba(26,26,26,0.2)]">
              <User size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                No applications yet. Submit your enrollment application below!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="card p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(enrollment.status)}`}>
                        {getStatusIcon(enrollment.status)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{enrollment.course} Grade Level</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          <Calendar size={10} className="inline mr-1" />
                          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(enrollment.status)}`}>
                      {enrollment.status}
                    </span>
                  </div>
                  {enrollment.notes && (
                    <div className="mt-2 p-2 bg-[var(--bg-primary)] rounded-lg">
                      <p className="text-xs text-[var(--text-secondary)]">
                        <FileText size={10} className="inline mr-1" />
                        {enrollment.notes}
                      </p>
                    </div>
                  )}
                  {enrollment.status === 'rejected' && onRetry && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => onRetry(enrollment.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--card-yellow)] hover:bg-[var(--accent)] transition-colors text-xs font-bold"
                      >
                        <RefreshCw size={12} />
                        Retry Application
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
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                New Enrollment Application
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="micro-label block text-xs mb-1">Grade Level</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="input-field text-sm"
                    required
                  >
                    <option value="">Select grade level...</option>
                    {GRADE_LEVELS.map(grade => (
                      <option key={grade.value} value={grade.value}>{grade.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="micro-label block text-xs mb-1">Reason for Enrollment</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field text-sm w-full min-h-[80px] resize-none"
                    placeholder="Please tell us why you want to enroll..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedGrade || !reason}
                    className="flex-1 btn-primary text-sm disabled:opacity-50"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-[var(--card-mint)] rounded-xl">
          <p className="text-xs text-[var(--text-secondary)]">
            <strong>Note:</strong> Enrollment applications require admin approval. 
            You will be notified once your application is reviewed.
          </p>
        </div>
      </div>
    </div>
  );
}
