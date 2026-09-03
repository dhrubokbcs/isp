export interface FacultyAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  batchName: string;
  slotStart: string;
  slotEnd: string;
  facultyName: string;
  subjectName?: string | null;
  roomName?: string | null;
  entryTime?: string | null;
  exitTime?: string | null;
  totalStudents: number;
  signature?: string | null;
  remark?: string | null;
  examBatch?: string | null;
  duration?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PRESENT' | 'LATE' | 'CANCELLED' | 'SUSPENDED' | 'NO_STUDENT' | 'ABSENT';
  checkInMethod?: 'TEACHER_PORTAL' | 'ADMIN_RECEPTION' | 'SYSTEM_AUTO';
  substituteFacultyName?: string | null;
  topicCovered?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  staffName: string;
  staffRole: string; // 'Accountant' | 'Receptionist' | 'Office Assistant' | 'Caretaker' | 'Coordinator'
  shiftStart: string; // e.g. "8:30 AM"
  shiftEnd: string; // e.g. "5:30 PM"
  punchInTime?: string | null;
  punchOutTime?: string | null;
  workingHours?: string | null;
  overtimeHours?: string | null;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
  remark?: string | null;
}

export interface AttendanceStats {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  scheduledUpcoming: number;
  totalStudentsFootfall: number;
  totalDurationMinutes: number;
  totalDurationFormatted: string;
  cancelledOrSuspended: number;
  facultyBreakdown: { faculty: string; sessions: number; minutes: number }[];
}

// Convert HH:MM:SS or H:MM:SS or HH:MM AM/PM to minutes
export function parseDurationToMinutes(durationStr?: string | null): number {
  if (!durationStr) return 0;
  const match = durationStr.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?$/);
  if (match) {
    const hours = parseInt(match[1], 10) || 0;
    const mins = parseInt(match[2], 10) || 0;
    return hours * 60 + mins;
  }
  return 0;
}

// Format current time into "H:MM:SS AM/PM" or "H:MM AM/PM"
export function formatCurrentTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// Auto calculate duration from entryTime and exitTime (e.g. "7:31:00 AM", "8:45:00 AM")
export function calculateDurationString(entryTime?: string | null, exitTime?: string | null): string {
  if (!entryTime || !exitTime) return '';
  try {
    const parseTime = (t: string) => {
      const parts = t.trim().split(' ');
      const isPM = parts[1]?.toUpperCase() === 'PM';
      const isAM = parts[1]?.toUpperCase() === 'AM';
      const timeParts = parts[0].split(':').map(Number);
      let hour = timeParts[0] || 0;
      const min = timeParts[1] || 0;
      if (isPM && hour < 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
      return hour * 60 + min;
    };

    const startMin = parseTime(entryTime);
    const endMin = parseTime(exitTime);
    let diff = endMin - startMin;
    if (diff < 0) diff += 24 * 60; // crossover midnight
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}:${m.toString().padStart(2, '0')}:00`;
  } catch {
    return '';
  }
}
