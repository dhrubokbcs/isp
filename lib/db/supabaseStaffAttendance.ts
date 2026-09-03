import { StaffAttendanceRecord } from '@/lib/types/facultyAttendance';

// Preset Staff Members
export const DEFAULT_STAFF_MEMBERS = [
  { name: 'Abdur Rahim', role: 'Head of Accounts', shiftStart: '8:30 AM', shiftEnd: '5:30 PM' },
  { name: 'Farhana Yasmin', role: 'Senior Receptionist & Counselor', shiftStart: '8:00 AM', shiftEnd: '5:00 PM' },
  { name: 'Kamal Hossain', role: 'Academic Coordinator', shiftStart: '9:00 AM', shiftEnd: '6:00 PM' },
  { name: 'Nurul Islam', role: 'IT & Lab In-Charge', shiftStart: '9:00 AM', shiftEnd: '6:00 PM' },
  { name: 'Mohammad Selim', role: 'Campus Caretaker & Security', shiftStart: '7:00 AM', shiftEnd: '7:00 PM' },
];

let memoryStaffRecords: { [date: string]: StaffAttendanceRecord[] } = {};

export async function fetchStaffAttendanceForDate(dateStr: string): Promise<StaffAttendanceRecord[]> {
  if (!memoryStaffRecords[dateStr]) {
    // Generate default roster for the day
    memoryStaffRecords[dateStr] = DEFAULT_STAFF_MEMBERS.map((s, idx) => ({
      id: `staff-${dateStr}-${idx + 1}`,
      date: dateStr,
      staffName: s.name,
      staffRole: s.role,
      shiftStart: s.shiftStart,
      shiftEnd: s.shiftEnd,
      punchInTime: null,
      punchOutTime: null,
      workingHours: null,
      overtimeHours: null,
      status: 'ABSENT',
      remark: null,
    }));
  }
  return memoryStaffRecords[dateStr];
}

export async function punchStaffAttendance(payload: {
  id: string;
  date: string;
  action: 'PUNCH_IN' | 'PUNCH_OUT' | 'UPDATE_STATUS';
  time?: string;
  status?: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
  remark?: string;
}): Promise<StaffAttendanceRecord | null> {
  const records = await fetchStaffAttendanceForDate(payload.date);
  const rec = records.find((r) => r.id === payload.id);
  if (!rec) return null;

  const nowTime = payload.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (payload.action === 'PUNCH_IN') {
    rec.punchInTime = nowTime;
    rec.status = payload.status || 'PRESENT';
  } else if (payload.action === 'PUNCH_OUT') {
    rec.punchOutTime = nowTime;
    if (rec.punchInTime) {
      rec.workingHours = '8h 30m';
    }
  } else if (payload.action === 'UPDATE_STATUS') {
    if (payload.status) rec.status = payload.status;
    if (payload.remark !== undefined) rec.remark = payload.remark;
  }

  return rec;
}
