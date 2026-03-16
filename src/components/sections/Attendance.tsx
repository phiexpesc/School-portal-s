import { useState, useEffect, useRef } from 'react';
import { X, QrCode, Clock, Users, Check, AlertCircle, Calendar, Download, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { AttendanceSession, AttendanceRecord, Section } from '@/types';

interface AttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'teacher' | 'student';
  sections?: Section[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  currentUserId: string;
  currentUserName: string;
  onCreateSession?: (teacherId: string, sectionId: string, sectionName: string, expiresInMinutes: number) => void;
  onMarkAttendance?: (sessionId: string, studentId: string, studentName: string) => void;
}

const EXPIRY_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
];

export function AttendanceModal({
  isOpen,
  onClose,
  mode,
  sections = [],
  attendanceSessions,
  attendanceRecords,
  currentUserId,
  currentUserName,
  onCreateSession,
  onMarkAttendance
}: AttendanceProps) {
  const [selectedSection, setSelectedSection] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(10);
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Teacher's active sessions
  const teacherSessions = attendanceSessions.filter(s => 
    s.teacherId === currentUserId && s.isActive
  );

  // Get records for a session
  const getSessionRecords = (sessionId: string) => 
    attendanceRecords.filter(r => r.sessionId === sessionId);

  // Create new attendance session
  const handleCreateSession = () => {
    if (onCreateSession && selectedSection) {
      const section = sections.find(s => s.id === selectedSection);
      if (section) {
        onCreateSession(currentUserId, section.id, section.name, expiryMinutes);
      }
    }
  };

  // Initialize scanner for students
  useEffect(() => {
    if (scanMode && mode === 'student' && scannerContainerRef.current) {
      scannerRef.current = new Html5Qrcode('attendance-qr-reader');
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [scanMode]);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('environment')
        );
        const cameraId = backCamera ? backCamera.id : devices[0].id;
        
        await scannerRef.current.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScannedCode(decodedText),
          () => {}
        );
      }
    } catch (error) {
      console.error('Failed to start scanner:', error);
      setScanResult({
        success: false,
        message: 'Camera access denied. Please check permissions.'
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
  };

  const handleScannedCode = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.type === 'attendance' && data.sessionId && data.code) {
        // Find the session
        const session = attendanceSessions.find(s => 
          s.id === data.sessionId && s.qrCode === data.code && s.isActive
        );

        if (!session) {
          setScanResult({
            success: false,
            message: 'Invalid or expired attendance code.'
          });
          return;
        }

        // Check if already marked
        const alreadyMarked = attendanceRecords.some(r => 
          r.sessionId === session.id && r.studentId === currentUserId
        );

        if (alreadyMarked) {
          setScanResult({
            success: false,
            message: 'You have already marked attendance for this session.'
          });
          return;
        }

        // Check expiration
        if (Date.now() > session.expiresAt) {
          setScanResult({
            success: false,
            message: 'This attendance session has expired.'
          });
          return;
        }

        // Mark attendance
        if (onMarkAttendance) {
          onMarkAttendance(session.id, currentUserId, currentUserName);
          setScanResult({
            success: true,
            message: `Attendance marked for ${session.sectionName}!`
          });
          stopScanning();
        }
      }
    } catch {
      setScanResult({
        success: false,
        message: 'Invalid QR code format.'
      });
    }
  };

  // Download QR code
  const downloadQR = (session: AttendanceSession) => {
    const link = document.createElement('a');
    link.href = session.qrDataUrl;
    link.download = `attendance-${session.sectionName}-${new Date(session.date).toISOString().split('T')[0]}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {mode === 'teacher' ? 'Attendance Management' : 'Mark Attendance'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {mode === 'teacher' 
                  ? 'Generate QR codes for student attendance' 
                  : 'Scan QR code to mark your attendance'}
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

        {mode === 'teacher' ? (
          /* Teacher View */
          <div className="space-y-4">
            {/* Create New Session */}
            <div className="card p-4">
              <h4 className="font-bold text-sm mb-3">Create Attendance Session</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="micro-label block mb-1 text-xs">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Select section...</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="micro-label block mb-1 text-xs">Expires In</label>
                  <select
                    value={expiryMinutes}
                    onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                    className="input-field text-sm"
                  >
                    {EXPIRY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateSession}
                disabled={!selectedSection}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <QrCode size={16} />
                Generate QR Code
              </button>
            </div>

            {/* Active Sessions */}
            <div>
              <h4 className="font-bold text-sm mb-3">Active Sessions</h4>
              {teacherSessions.length === 0 ? (
                <div className="text-center py-6 bg-[var(--bg-primary)] rounded-xl border-[2px] border-dashed border-[rgba(26,26,26,0.2)]">
                  <Clock size={24} className="mx-auto mb-2 text-[var(--text-secondary)]" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No active attendance sessions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teacherSessions.map(session => {
                    const records = getSessionRecords(session.id);
                    const timeLeft = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 60000));
                    
                    return (
                      <div key={session.id} className="card p-4 border-[3px] border-[rgba(26,26,26,0.85)]">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-bold text-sm">{session.sectionName}</h5>
                            <p className="text-xs text-[var(--text-secondary)]">
                              <Calendar size={12} className="inline mr-1" />
                              {new Date(session.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            timeLeft > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {timeLeft > 0 ? `${timeLeft}m left` : 'Expired'}
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex items-center gap-4 mb-3">
                          <img
                            src={session.qrDataUrl}
                            alt="Attendance QR"
                            className="w-24 h-24 rounded-xl border-[2px] border-[rgba(26,26,26,0.85)]"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">
                              Show this QR code to students
                            </p>
                            <button
                              onClick={() => downloadQR(session)}
                              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                            >
                              <Download size={12} />
                              Download QR
                            </button>
                          </div>
                        </div>

                        {/* Attendance Count */}
                        <div className="flex items-center gap-2 p-2 bg-[var(--card-mint)] rounded-lg">
                          <Users size={14} />
                          <span className="text-xs font-bold">
                            {records.length} students marked present
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Student View */
          <div className="space-y-4">
            {!scanResult ? (
              <>
                {!scanMode ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                      <Camera size={32} />
                    </div>
                    <h4 className="font-bold text-base mb-2">Scan Attendance QR Code</h4>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      Point your camera at the QR code displayed by your teacher
                    </p>
                    <button
                      onClick={() => setScanMode(true)}
                      className="btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Camera size={16} />
                      Start Scanning
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div 
                      id="attendance-qr-reader" 
                      ref={scannerContainerRef}
                      className="w-full aspect-square rounded-xl overflow-hidden border-[3px] border-[rgba(26,26,26,0.85)]"
                    />
                    <button
                      onClick={() => {
                        stopScanning();
                        setScanMode(false);
                      }}
                      className="w-full btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={`p-6 rounded-xl border-[3px] text-center ${
                scanResult.success 
                  ? 'bg-[var(--card-mint)] border-[rgba(26,26,26,0.85)]' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  scanResult.success ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {scanResult.success ? (
                    <Check size={32} className="text-white" />
                  ) : (
                    <AlertCircle size={32} className="text-white" />
                  )}
                </div>
                
                <h4 className={`text-lg font-bold mb-2 ${scanResult.success ? '' : 'text-red-700'}`}>
                  {scanResult.success ? 'Success!' : 'Error'}
                </h4>
                
                <p className={`text-sm mb-4 ${scanResult.success ? 'text-[var(--text-secondary)]' : 'text-red-600'}`}>
                  {scanResult.message}
                </p>

                <button
                  onClick={() => {
                    setScanResult(null);
                    setScanMode(false);
                  }}
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
