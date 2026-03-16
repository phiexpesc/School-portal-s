import { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle, TrendingUp, CalendarDays } from 'lucide-react';
import type { AttendanceRecord } from '@/types';

interface StudentAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  attendanceRecords: AttendanceRecord[];
}

export function StudentAttendanceModal({
  isOpen,
  onClose,
  studentId,
  attendanceRecords
}: StudentAttendanceProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  if (!isOpen) return null;

  // Get student's attendance records
  const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);

  // Calculate statistics
  const totalPresent = studentRecords.filter(r => r.status === 'present').length;
  const totalLate = studentRecords.filter(r => r.status === 'late').length;
  const totalAbsent = studentRecords.filter(r => r.status === 'absent').length;
  const totalRecords = studentRecords.length;
  const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  // Get records for selected month
  const monthRecords = studentRecords.filter(r => {
    const date = new Date(r.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  // Group by date for calendar view
  const recordsByDate: Record<string, AttendanceRecord> = {};
  monthRecords.forEach(r => {
    const dateKey = new Date(r.date).toDateString();
    recordsByDate[dateKey] = r;
  });

  // Generate calendar days
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-300';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'absent': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-500 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={14} className="text-green-600" />;
      case 'late': return <Clock size={14} className="text-yellow-600" />;
      case 'absent': return <AlertCircle size={14} className="text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                My Attendance
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Track your attendance record
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

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card p-3 bg-[var(--card-mint)]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} />
              <span className="text-[10px] text-[var(--text-secondary)]">Attendance Rate</span>
            </div>
            <p className={`text-xl font-black ${attendanceRate >= 75 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {attendanceRate}%
            </p>
          </div>
          <div className="card p-3 bg-green-50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-green-600" />
              <span className="text-[10px] text-[var(--text-secondary)]">Present</span>
            </div>
            <p className="text-xl font-black text-green-600">{totalPresent}</p>
          </div>
          <div className="card p-3 bg-yellow-50">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-yellow-600" />
              <span className="text-[10px] text-[var(--text-secondary)]">Late</span>
            </div>
            <p className="text-xl font-black text-yellow-600">{totalLate}</p>
          </div>
          <div className="card p-3 bg-red-50">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-red-600" />
              <span className="text-[10px] text-[var(--text-secondary)]">Absent</span>
            </div>
            <p className="text-xl font-black text-red-600">{totalAbsent}</p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
            className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
          >
            ←
          </button>
          <span className="font-bold text-sm">
            {monthNames[selectedMonth]} {selectedYear}
          </span>
          <button
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
            className="p-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
          >
            →
          </button>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-[var(--text-secondary)] py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = new Date(selectedYear, selectedMonth, day).toDateString();
              const record = recordsByDate[dateKey];

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg border-[2px] flex flex-col items-center justify-center text-xs ${
                    record
                      ? getStatusColor(record.status)
                      : 'border-dashed border-[rgba(26,26,26,0.2)] bg-[var(--bg-primary)]'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  {record && getStatusIcon(record.status)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Records */}
        <div>
          <h4 className="font-bold text-sm mb-3">Recent Records</h4>
          {studentRecords.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {studentRecords.slice().reverse().slice(0, 10).map((record) => (
                <div key={record.id} className={`card p-2 flex items-center justify-between ${getStatusColor(record.status)}`}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <span className="text-xs font-bold capitalize">{record.status}</span>
                  </div>
                  <span className="text-[10px]">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-[var(--bg-primary)] rounded-xl">
              <p className="text-sm text-[var(--text-secondary)]">No attendance records yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
