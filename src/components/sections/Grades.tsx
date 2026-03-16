import { useState, useEffect } from 'react';
import { X, TrendingUp, Award, BookOpen, Trash2 } from 'lucide-react';
import type { Grade } from '@/types';

interface GradesProps {
  isOpen: boolean;
  onClose: () => void;
  grades: Grade[];
  studentName: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
  allStudents?: { id: string; name: string; grade?: string }[];
  onAddGrade?: (studentId: string, subject: string, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', grade: number, maxGrade: number, remarks?: string) => void;
  onDeleteGrade?: (gradeId: string) => void;
}

const DEFAULT_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'Foreign Language'
];

const QUARTERS: ('Q1' | 'Q2' | 'Q3' | 'Q4')[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export function GradesModal({
  isOpen,
  onClose,
  grades,
  studentName,
  isAdmin = false,
  isTeacher = false,
  allStudents = [],
  onAddGrade,
  onDeleteGrade
}: GradesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [gradeValue, setGradeValue] = useState('');
  const [maxGrade, setMaxGrade] = useState('100');
  const [remarks, setRemarks] = useState('');
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);

  // Load subjects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('schoolPortalSubjects');
    if (saved) {
      setSubjects(JSON.parse(saved));
    }
  }, []);

  if (!isOpen) return null;

  // Group grades by student grade level, then by subject, then by quarter
  const gradesByGradeLevel: Record<string, Record<string, Record<string, Grade>>> = {};
  grades.forEach(grade => {
    const gradeLevel = grade.studentGrade || 'Unknown';
    if (!gradesByGradeLevel[gradeLevel]) {
      gradesByGradeLevel[gradeLevel] = {};
    }
    if (!gradesByGradeLevel[gradeLevel][grade.subject]) {
      gradesByGradeLevel[gradeLevel][grade.subject] = {};
    }
    // Store the latest grade for each quarter
    gradesByGradeLevel[gradeLevel][grade.subject][grade.quarter] = grade;
  });

  // Get sorted grade levels
  const sortedGradeLevels = Object.keys(gradesByGradeLevel).sort();

  // Group grades by subject (for backward compatibility)
  const gradesBySubject: Record<string, Grade[]> = {};
  grades.forEach(grade => {
    if (!gradesBySubject[grade.subject]) {
      gradesBySubject[grade.subject] = [];
    }
    gradesBySubject[grade.subject].push(grade);
  });

  // Calculate overall average
  const overallAverage = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / grades.length).toFixed(1)
    : '0';

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 75) return 'bg-blue-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddGrade && selectedStudent && selectedSubject && gradeValue) {
      onAddGrade(
        selectedStudent,
        selectedSubject,
        selectedQuarter,
        parseFloat(gradeValue),
        parseFloat(maxGrade),
        remarks
      );
      setShowAddForm(false);
      setSelectedStudent('');
      setSelectedSubject('');
      setGradeValue('');
      setRemarks('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {isAdmin || isTeacher ? 'Grade Management' : 'My Grades'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAdmin || isTeacher ? 'Post and manage student grades' : `Viewing grades for ${studentName}`}
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

        {/* Overall Stats */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card p-4 bg-[var(--card-lavender)]">
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} />
                <span className="micro-label text-[var(--text-secondary)]">Overall Average</span>
              </div>
              <p className={`text-2xl font-black ${getGradeColor(parseFloat(overallAverage))}`}>
                {overallAverage}%
              </p>
            </div>
            <div className="card p-4 bg-[var(--card-mint)]">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} />
                <span className="micro-label text-[var(--text-secondary)]">Subjects</span>
              </div>
              <p className="text-2xl font-black">{Object.keys(gradesBySubject).length}</p>
            </div>
          </div>
        )}

        {/* Add Grade Button (Admin/Teacher Only) */}
        {(isAdmin || isTeacher) && onAddGrade && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full btn-primary mb-4 flex items-center justify-center gap-2"
          >
            <TrendingUp size={16} />
            Post New Grade
          </button>
        )}

        {/* Add Grade Form (Admin/Teacher Only) */}
        {(isAdmin || isTeacher) && showAddForm && (
          <form onSubmit={handleSubmit} className="card p-4 mb-4 space-y-3">
            <h4 className="font-bold text-sm mb-3">Post New Grade</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="micro-label block mb-1 text-xs">Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">Select student...</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="micro-label block mb-1 text-xs">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input-field text-sm"
                  required
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="micro-label block mb-1 text-xs">Quarter</label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                  className="input-field text-sm"
                >
                  {QUARTERS.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="micro-label block mb-1 text-xs">Grade</label>
                <input
                  type="number"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g., 85"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="micro-label block mb-1 text-xs">Max Grade</label>
                <input
                  type="number"
                  value={maxGrade}
                  onChange={(e) => setMaxGrade(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g., 100"
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="micro-label block mb-1 text-xs">Remarks (Optional)</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input-field text-sm"
                placeholder="e.g., Great improvement!"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary text-sm"
              >
                Post Grade
              </button>
            </div>
          </form>
        )}

        {/* Grades List - Organized by Grade Level */}
        <div className="space-y-6">
          {grades.length === 0 ? (
            <div className="text-center py-8 bg-[var(--bg-primary)] rounded-xl border-[2px] border-dashed border-[rgba(26,26,26,0.2)]">
              <TrendingUp size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
              <p className="text-sm text-[var(--text-secondary)]">
                {isAdmin ? 'No grades posted yet.' : 'No grades available yet.'}
              </p>
            </div>
          ) : (
            sortedGradeLevels.map((gradeLevel) => {
              const subjects = gradesByGradeLevel[gradeLevel];
              return (
                <div key={gradeLevel} className="card p-4 border-[3px] border-[rgba(26,26,26,0.85)]">
                  {/* Grade Level Header */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-[rgba(26,26,26,0.1)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                      <BookOpen size={16} />
                    </div>
                    <h4 className="font-black text-base">{gradeLevel} Grade</h4>
                  </div>
                  
                  {/* Subjects for this grade level */}
                  <div className="space-y-4">
                    {Object.entries(subjects).map(([subject, quarters]) => {
                      const quarterGrades = Object.values(quarters);
                      const subjectAverage = quarterGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / quarterGrades.length;
                      
                      return (
                        <div key={`${gradeLevel}-${subject}`} className="bg-[var(--bg-primary)] rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-sm">{subject}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getGradeBg(subjectAverage)} ${getGradeColor(subjectAverage)}`}>
                              Avg: {subjectAverage.toFixed(1)}%
                            </span>
                          </div>
                          
                          {/* Quarters 1-4 Grid */}
                          <div className="grid grid-cols-4 gap-2">
                            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                              const grade = quarters[q];
                              if (!grade) {
                                return (
                                  <div key={q} className="p-2 bg-white rounded-lg border-[2px] border-dashed border-[rgba(26,26,26,0.2)] text-center">
                                    <span className="text-[10px] text-[var(--text-secondary)] block">{q}</span>
                                    <span className="text-xs text-gray-400">-</span>
                                  </div>
                                );
                              }
                              const percentage = (grade.grade / grade.maxGrade) * 100;
                              return (
                                <div key={q} className={`p-2 rounded-lg border-[2px] text-center ${getGradeBg(percentage)} relative group`}>
                                  {(isAdmin || isTeacher) && onDeleteGrade && (
                                    <button
                                      onClick={() => onDeleteGrade(grade.id)}
                                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Delete grade"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                  <span className="text-[10px] text-[var(--text-secondary)] block">{q}</span>
                                  <span className={`font-bold text-sm ${getGradeColor(percentage)}`}>
                                    {grade.grade}
                                  </span>
                                  {grade.remarks && (
                                    <span className="text-[8px] text-[var(--text-secondary)] block truncate">
                                      {grade.remarks}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
