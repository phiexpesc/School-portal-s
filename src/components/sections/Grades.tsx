import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GraduationCap, BookOpen } from 'lucide-react';
import type { Grade, User } from '@/types';

interface GradesProps {
  isOpen: boolean;
  onClose: () => void;
  grades: Grade[];
  currentUserId: string;
  studentName?: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
  students?: User[];
  onAddGrade?: (studentId: string, subject: string, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', grade: number, maxGrade: number, remarks?: string) => Promise<void>;
  onDeleteGrade?: (gradeId: string) => Promise<void>;
  getGrades: () => Promise<Grade[]>;
  getStudentGrades: (studentId: string) => Promise<Grade[]>;
}

const QUARTERS: ('Q1' | 'Q2' | 'Q3' | 'Q4')[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export function Grades({ 
  isOpen, 
  onClose, 
  grades: initialGrades,
  currentUserId,
  studentName,
  isAdmin = false,
  isTeacher = false,
  students = [],
  onAddGrade,
  onDeleteGrade,
  getGrades,
  getStudentGrades
}: GradesProps) {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [gradeValue, setGradeValue] = useState('');
  const [maxGrade, setMaxGrade] = useState('100');
  const [remarks, setRemarks] = useState('');

  // Load grades from Firebase
  useEffect(() => {
    const loadGrades = async () => {
      try {
        const data = isAdmin || isTeacher 
          ? await getGrades() 
          : await getStudentGrades(currentUserId);
        setGrades(data);
      } catch (error) {
        console.error('Error loading grades:', error);
      }
    };

    if (isOpen) {
      loadGrades();
    }
  }, [isOpen, isAdmin, isTeacher, currentUserId, getGrades, getStudentGrades]);

  if (!isOpen) return null;

  const gradesBySubject: Record<string, Grade[]> = {};
  grades.forEach(grade => {
    if (!gradesBySubject[grade.subject]) {
      gradesBySubject[grade.subject] = [];
    }
    gradesBySubject[grade.subject].push(grade);
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddGrade && selectedStudent && selectedSubject && gradeValue) {
      try {
        await onAddGrade(
          selectedStudent,
          selectedSubject,
          selectedQuarter,
          parseFloat(gradeValue),
          parseFloat(maxGrade),
          remarks
        );
        // Refresh grades
        const data = await getGrades();
        setGrades(data);
        setShowAddForm(false);
        setSelectedStudent('');
        setSelectedSubject('');
        setGradeValue('');
        setRemarks('');
      } catch (error) {
        console.error('Error adding grade:', error);
      }
    }
  };

  const handleDelete = async (gradeId: string) => {
    if (onDeleteGrade) {
      try {
        await onDeleteGrade(gradeId);
        const data = await getGrades();
        setGrades(data);
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-[#1a1a1a]">
              {isAdmin || isTeacher ? 'Grade Management' : 'My Grades'}
            </h3>
            <p className="text-gray-500 mt-1">
              {isAdmin || isTeacher ? 'Post and manage student grades' : `Viewing grades for ${studentName}`}
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
          {/* Overall Stats */}
          {!isAdmin && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#c4f692] rounded-2xl p-5">
                <div className="text-sm text-[#1a1a1a]/70 mb-1">Overall Average</div>
                <div className="text-3xl font-bold text-[#1a1a1a]">{overallAverage}%</div>
              </div>
              <div className="bg-[#d4c5f9] rounded-2xl p-5">
                <div className="text-sm text-[#1a1a1a]/70 mb-1">Subjects</div>
                <div className="text-3xl font-bold text-[#1a1a1a]">{Object.keys(gradesBySubject).length}</div>
              </div>
            </div>
          )}

          {/* Add Grade Button */}
          {(isAdmin || isTeacher) && onAddGrade && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 mb-6 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Grade
            </button>
          )}

          {/* Add Grade Form */}
          {(isAdmin || isTeacher) && showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3"
                    required
                  >
                    <option value="">Select student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3"
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value as any)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3"
                  >
                    {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="number"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3"
                    placeholder="0-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Grade</label>
                  <input
                    type="number"
                    value={maxGrade}
                    onChange={(e) => setMaxGrade(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3"
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3"
                  placeholder="e.g., Great improvement!"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors"
                >
                  Save Grade
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Grades List */}
          <div className="space-y-4">
            {grades.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{isAdmin ? 'No grades posted yet.' : 'No grades available yet.'}</p>
              </div>
            ) : (
              Object.entries(gradesBySubject).map(([subject, subjectGrades]) => {
                const subjectAverage = subjectGrades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / subjectGrades.length;
                
                return (
                  <div key={subject} className="bg-gray-50 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1a1a1a]">{subject}</h4>
                          <p className="text-sm text-gray-500">Average: {subjectAverage.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {QUARTERS.map((q) => {
                        const grade = subjectGrades.find(g => g.quarter === q);
                        if (!grade) {
                          return (
                            <div key={q} className="bg-white rounded-xl p-3 text-center">
                              <div className="text-xs text-gray-400 mb-1">{q}</div>
                              <div className="text-lg font-bold text-gray-300">-</div>
                            </div>
                          );
                        }
                        const percentage = (grade.grade / grade.maxGrade) * 100;
                        return (
                          <div key={q} className={`rounded-xl p-3 text-center relative ${getGradeBg(percentage)}`}>
                            {(isAdmin || isTeacher) && onDeleteGrade && (
                              <button
                                onClick={() => handleDelete(grade.id)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/50 flex items-center justify-center hover:bg-white transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            )}
                            <div className="text-xs text-gray-600 mb-1">{q}</div>
                            <div className={`text-lg font-bold ${getGradeColor(percentage)}`}>
                              {grade.grade}
                            </div>
                            {grade.remarks && (
                              <div className="text-xs text-gray-500 mt-1 truncate">{grade.remarks}</div>
                            )}
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
    </div>
  );
}
