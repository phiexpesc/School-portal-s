import { useState, useEffect, useRef } from 'react';
import { X, Plus, QrCode, Clock, Users, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { AttendanceSession, AttendanceRecord, Section, User } from '@/types';

interface AttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'teacher' | 'student';
  currentUserId: string;
  currentUserName: string;
  sections: Section[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  onCreateSession?: (teacherId: string, sectionId: string, sectionName: string, expiresInMinutes: number) => Promise<void>;
  onMarkAttendance?: (sessionId: string, studentId: string, studentName: string) => Promise<void>;
  getAttendanceSessions: () => Promise<AttendanceSession[]>;
  getAttendanceRecords: () => Promise<AttendanceRecord[]>;
}

export function AttendanceModal({
  isOpen,
  onClose,
  mode,
  currentUserId,
  currentUserName,
  sections,
  attendanceSessions: initialSessions,
  attendanceRecords: initialRecords,
  onCreateSession,
  onMarkAttendance,
  getAttendanceSessions,
  getAttendanceRecords
}: AttendanceProps) {
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(initialSessions);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [selectedSection, setSelectedSection] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Load attendance data from Firebase
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const [sessions, records] = await Promise.all([
          getAttendanceSessions(),
          getAttendanceRecords()
        ]);
        setAttendanceSessions(sessions);
        setAttendanceRecords(records);
      } catch (error) {
        console.error('Error loading attendance:', error);
      }
    };

    if (isOpen) {
      loadAttendance();
    }
  }, [isOpen, getAttendanceSessions, getAttendanceRecords]);

  if (!isOpen) return null;

  // Teacher's active sessions
  const teacherSessions = attendanceSessions.filter(s =>
    s.teacherId === currentUserId && s.isActive
  );

  // Get records for a session
  const getSessionRecords = (sessionId: string) =>
    attendanceRecords.filter(r => r.sessionId === sessionId);

  // Create new attendance session
  const handleCreateSession = async () => {
    if (!onCreateSession || !selectedSection) return;
    
    setIsCreating(true);
    try {
      const section = sections.find(s => s.id === selectedSection);
      if (section) {
        await onCreateSession(currentUserId, section.id, section.name, expiryMinutes);
        const sessions = await getAttendanceSessions();
        setAttendanceSessions(sessions);
        setSelectedSection('');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
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
  }, [scanMode, mode]);

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

  const handleScannedCode = async (decodedText: string) => {
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
          await onMarkAttendance(session.id, currentUserId, currentUserName);
          const records = await getAttendanceRecords();
          setAttendanceRecords(records);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-[#1a1a1a]">
              {mode === 'teacher' ? 'Attendance Management' : 'Mark Attendance'}
            </h3>
            <p className="text-gray-500 mt-1">
              {mode === 'teacher'
                ? 'Generate QR codes for student attendance'
                : 'Scan QR code to mark your attendance'}
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
          {mode === 'teacher' ? (
            /* Teacher View */
            <div className="space-y-6">
              {/* Create New Session */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h4 className="font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Attendance Session
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full h-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4"
                    >
                      <option value="">Select section</option>
                      {sections.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expires in (minutes)
                    </label>
                    <input
                      type="number"
                      value={expiryMinutes}
                      onChange={(e) => setExpiryMinutes(parseInt(e.target.value))}
                      min="5"
                      max="120"
                      className="w-full h-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4"
                    />
                  </div>

                  <button
                    onClick={handleCreateSession}
                    disabled={!selectedSection || isCreating}
                    className="w-full py-3 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        Generate QR Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div>
                <h4 className="font-bold text-[#1a1a1a] mb-4">Active Sessions</h4>
                
                {teacherSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                    <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No active attendance sessions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teacherSessions.map(session => {
                      const records = getSessionRecords(session.id);
                      const timeLeft = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 60000));

                      return (
                        <div key={session.id} className="bg-gray-50 rounded-2xl p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h5 className="font-bold text-[#1a1a1a]">{session.sectionName}</h5>
                              <p className="text-sm text-gray-500">
                                {new Date(session.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              timeLeft > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {timeLeft > 0 ? `${timeLeft}m left` : 'Expired'}
                            </span>
                          </div>

                          {/* QR Code */}
                          <div className="bg-white rounded-xl p-4 mb-4 text-center">
                            <img
                              src={session.qrDataUrl}
                              alt="Attendance QR"
                              className="w-48 h-48 mx-auto mb-2"
                            />
                            <p className="text-sm text-gray-500">Show this QR code to students</p>
                          </div>

                          {/* Attendance Count */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              {records.length} students marked present
                            </div>
                            <button
                              onClick={() => downloadQR(session)}
                              className="flex items-center gap-2 text-sm text-[#1a1a1a] hover:underline"
                            >
                              <Download className="w-4 h-4" />
                              Download QR
                            </button>
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
            <div className="text-center">
              {!scanResult ? (
                <>
                  {!scanMode ? (
                    <div className="py-12">
                      <div className="w-24 h-24 rounded-full bg-[#c4f692] flex items-center justify-center mx-auto mb-6">
                        <QrCode className="w-12 h-12 text-[#1a1a1a]" />
                      </div>
                      <h4 className="text-xl font-bold text-[#1a1a1a] mb-2">Scan Attendance QR Code</h4>
                      <p className="text-gray-500 mb-6">
                        Point your camera at the QR code displayed by your teacher
                      </p>
                      <button
                        onClick={() => setScanMode(true)}
                        className="px-8 py-3 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors"
                      >
                        Start Scanning
                      </button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <div 
                        id="attendance-qr-reader" 
                        ref={scannerContainerRef}
                        className="rounded-2xl overflow-hidden mb-4"
                      />
                      <button
                        onClick={() => {
                          stopScanning();
                          setScanMode(false);
                        }}
                        className="text-gray-500 hover:text-[#1a1a1a]"
                      >
                        Cancel Scanning
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    scanResult.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {scanResult.success ? (
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-600" />
                    )}
                  </div>
                  <h4 className={`text-xl font-bold mb-2 ${scanResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {scanResult.success ? 'Success!' : 'Error'}
                  </h4>
                  <p className="text-gray-600 mb-6">{scanResult.message}</p>
                  <button
                    onClick={() => {
                      setScanResult(null);
                      setScanMode(false);
                    }}
                    className="px-8 py-3 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors"
                  >
                    Scan Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
