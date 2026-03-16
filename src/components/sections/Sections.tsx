import { useState } from 'react';
import { X, Users, Plus, Trash2, UserPlus, UserMinus, GraduationCap, Search } from 'lucide-react';
import type { Section, User } from '@/types';

interface SectionsProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  students: User[];
  teacherId: string;
  onCreateSection: (name: string, grade: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddStudentToSection: (sectionId: string, studentId: string) => void;
  onRemoveStudentFromSection: (sectionId: string, studentId: string) => void;
}

const GRADE_LEVELS = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

export function SectionsModal({
  isOpen,
  onClose,
  sections,
  students,
  teacherId,
  onCreateSection,
  onDeleteSection,
  onAddStudentToSection,
  onRemoveStudentFromSection
}: SectionsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('6-8');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchStudent, setSearchStudent] = useState('');

  if (!isOpen) return null;

  // Filter sections for this teacher
  const teacherSections = sections.filter(s => s.teacherId === teacherId);

  // Get selected section details
  const activeSection = selectedSection 
    ? teacherSections.find(s => s.id === selectedSection)
    : null;

  // Get students in active section
  const studentsInSection = activeSection
    ? students.filter(s => activeSection.studentIds.includes(s.id))
    : [];

  // Get available students (not in this section, same grade)
  const availableStudents = activeSection
    ? students.filter(s => 
        s.role === 'student' && 
        !activeSection.studentIds.includes(s.id) &&
        s.grade === activeSection.grade &&
        (searchStudent === '' || s.name.toLowerCase().includes(searchStudent.toLowerCase()))
      )
    : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionName.trim()) {
      onCreateSection(newSectionName.trim(), selectedGrade);
      setNewSectionName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                My Sections
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Organize and manage your students
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

        {/* Create Section Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full btn-primary mb-4 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Create New Section
          </button>
        )}

        {/* Create Section Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateSubmit} className="card p-4 mb-4 space-y-3">
            <h4 className="font-bold text-sm mb-3">Create New Section</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="micro-label block mb-1 text-xs">Section Name</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g., Section A"
                  required
                />
              </div>
              <div>
                <label className="micro-label block mb-1 text-xs">Grade Level</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="input-field text-sm"
                >
                  {GRADE_LEVELS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary text-sm"
              >
                Create Section
              </button>
            </div>
          </form>
        )}

        {/* Sections List */}
        {teacherSections.length === 0 ? (
          <div className="text-center py-8 bg-[var(--bg-primary)] rounded-xl border-[2px] border-dashed border-[rgba(26,26,26,0.2)]">
            <Users size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              No sections created yet. Create your first section above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Section Selector */}
            <div className="flex flex-wrap gap-2">
              {teacherSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-[3px] transition-all ${
                    selectedSection === section.id
                      ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                      : 'bg-white border-[rgba(26,26,26,0.2)] hover:border-[rgba(26,26,26,0.4)]'
                  }`}
                >
                  <GraduationCap size={16} />
                  <span className="text-sm font-bold">{section.name}</span>
                  <span className="text-xs text-[var(--text-secondary)]">({section.grade})</span>
                  <span className="ml-1 px-2 py-0.5 bg-white/50 rounded-full text-xs">
                    {section.studentIds.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Section Details */}
            {activeSection && (
              <div className="card p-4 border-[3px] border-[rgba(26,26,26,0.85)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-base">{activeSection.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {activeSection.grade} • {activeSection.studentIds.length} students
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onDeleteSection(activeSection.id);
                      setSelectedSection(null);
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Students in Section */}
                <div className="mb-4">
                  <h5 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Users size={14} />
                    Students in Section
                  </h5>
                  {studentsInSection.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] py-2">
                      No students added yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {studentsInSection.map(student => (
                        <div
                          key={student.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card-mint)] rounded-full border-[2px] border-[rgba(26,26,26,0.85)]"
                        >
                          <span className="text-xs font-bold">{student.name}</span>
                          <button
                            onClick={() => onRemoveStudentFromSection(activeSection.id, student.id)}
                            className="p-0.5 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                            title="Remove student"
                          >
                            <UserMinus size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Students */}
                <div>
                  <h5 className="text-sm font-bold mb-2 flex items-center gap-2">
                    <UserPlus size={14} />
                    Add Students
                  </h5>
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 rounded-full border-[2px] border-[rgba(26,26,26,0.2)] text-sm"
                      placeholder="Search students..."
                    />
                  </div>
                  {availableStudents.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] py-2">
                      {searchStudent ? 'No matching students found.' : 'No available students for this grade level.'}
                    </p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {availableStudents.slice(0, 10).map(student => (
                        <button
                          key={student.id}
                          onClick={() => onAddStudentToSection(activeSection.id, student.id)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors text-left"
                        >
                          <span className="text-sm">{student.name}</span>
                          <UserPlus size={14} className="text-green-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
