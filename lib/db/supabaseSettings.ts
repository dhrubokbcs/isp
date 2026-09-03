const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getHeaders() {
  if (!SERVICE_KEY) {
    throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required.');
  }
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

export interface AttendanceSystemSettings {
  allowTeacherSelfAttendance: boolean;
  allowQrAttendance: boolean;
  lateGraceMinutes: number;
  autoNotifyAdminsOnLate: boolean;
  requireStudentCountOnExit: boolean;
  activeAcademicYear: string;
}

let memorySettings: AttendanceSystemSettings = {
  allowTeacherSelfAttendance: true,
  allowQrAttendance: false, // Secure default: Disabled until explicitly enabled by Admin
  lateGraceMinutes: 10,
  autoNotifyAdminsOnLate: false,
  requireStudentCountOnExit: true,
  activeAcademicYear: '2026',
};

/**
 * Fetch Attendance Settings from Supabase
 */
export async function getAttendanceSettings(): Promise<AttendanceSystemSettings> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/system_settings?key=eq.attendance_config&select=value`,
      { headers: getHeaders(), cache: 'no-store' }
    );
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows[0]?.value) {
        memorySettings = { ...memorySettings, ...rows[0].value };
      }
    }
  } catch {
    // fallback to memory
  }
  return memorySettings;
}

/**
 * Update Attendance Settings in Supabase
 */
export async function updateAttendanceSettings(
  partial: Partial<AttendanceSystemSettings>
): Promise<AttendanceSystemSettings> {
  memorySettings = { ...memorySettings, ...partial };
  try {
    const payload = {
      key: 'attendance_config',
      value: memorySettings,
      updated_at: new Date().toISOString(),
    };

    await fetch(`${SUPABASE_URL}/rest/v1/system_settings`, {
      method: 'POST',
      headers: { ...getHeaders(), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.warn('Could not persist settings to Supabase REST, kept in memory:', err.message);
  }
  return memorySettings;
}
