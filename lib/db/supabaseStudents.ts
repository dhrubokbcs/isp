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

export interface StudentFullProfile {
  id: string;
  studentId: string;
  userId: string;
  fullName: string;
  nickname?: string;
  preferredName?: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  alternativePhone?: string;
  preferredContactMethod?: string;
  avatarUrl?: string;

  // Personal
  dob?: string;
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  birthRegNumber?: string;
  nidNumber?: string;

  // School
  institutionName?: string;
  institutionType?: string;
  schoolClass?: string;
  schoolSection?: string;
  schoolRoll?: string;
  schoolRegNumber?: string;
  schoolStudentId?: string;
  schoolShift?: string;
  medium?: string;
  groupStream?: string;

  // Address
  presentAddress?: string;
  presentArea?: string;
  presentUpazila?: string;
  presentDistrict?: string;
  presentPostalCode?: string;
  permanentAddress?: string;
  permanentArea?: string;
  permanentUpazila?: string;
  permanentDistrict?: string;
  permanentPostalCode?: string;
  sameAsPresent?: boolean;

  // Family / Guardian
  primaryGuardian: 'FATHER' | 'MOTHER' | 'OTHER';
  fatherName?: string;
  fatherPhone?: string;
  fatherWhatsapp?: string;
  fatherEmail?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherWhatsapp?: string;
  motherEmail?: string;
  motherOccupation?: string;
  otherGuardianName?: string;
  otherGuardianPhone?: string;
  otherGuardianRelationship?: string;

  // Emergency
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyAltPhone?: string;
  emergencyAddress?: string;

  // ISP
  admissionDate: string;
  admissionAcademicYear: number;
  batchId?: string;
  batchName?: string;
  programId?: string;
  programName?: string;
  classLevelId?: string;
  classLevelName?: string;
  enrollmentStatus: string;
  admissionSource?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export function mapStudentRecord(row: any): StudentFullProfile {
  const user = row.user || {};
  const meta = user.metadata || {};
  const batch = row.batches || row.batch || {};

  const primaryGuardian = meta.primaryGuardian || (row.relationship === 'MOTHER' ? 'MOTHER' : 'FATHER');

  return {
    id: row.id,
    studentId: row.student_id,
    userId: row.user_id,
    fullName: user.full_name || meta.fullName || '',
    nickname: meta.nickname || '',
    preferredName: meta.preferredName || '',
    email: user.email || meta.email || '',
    phone: user.phone || meta.phone || '',
    whatsappNumber: meta.whatsappNumber || '',
    alternativePhone: meta.alternativePhone || '',
    preferredContactMethod: meta.preferredContactMethod || 'PHONE_CALL',
    avatarUrl: user.avatar_url || '',

    // Personal
    dob: row.dob || meta.dob || '',
    gender: row.gender || meta.gender || 'Male',
    bloodGroup: meta.bloodGroup || '',
    nationality: meta.nationality || 'Bangladeshi',
    religion: meta.religion || 'Islam',
    birthRegNumber: meta.birthRegNumber || '',
    nidNumber: meta.nidNumber || '',

    // School
    institutionName: meta.institutionName || '',
    institutionType: meta.institutionType || 'School',
    schoolClass: meta.schoolClass || '',
    schoolSection: meta.schoolSection || '',
    schoolRoll: meta.schoolRoll || '',
    schoolRegNumber: meta.schoolRegNumber || '',
    schoolStudentId: meta.schoolStudentId || '',
    schoolShift: meta.schoolShift || 'Morning',
    medium: meta.medium || 'Bangla Medium',
    groupStream: meta.groupStream || 'Science',

    // Address
    presentAddress: row.address || meta.presentAddress || '',
    presentArea: meta.presentArea || '',
    presentUpazila: meta.presentUpazila || '',
    presentDistrict: meta.presentDistrict || 'Chattogram',
    presentPostalCode: meta.presentPostalCode || '',
    permanentAddress: meta.permanentAddress || '',
    permanentArea: meta.permanentArea || '',
    permanentUpazila: meta.permanentUpazila || '',
    permanentDistrict: meta.permanentDistrict || 'Chattogram',
    permanentPostalCode: meta.permanentPostalCode || '',
    sameAsPresent: meta.sameAsPresent ?? true,

    // Family / Guardian
    primaryGuardian: primaryGuardian,
    fatherName: meta.fatherName || (primaryGuardian === 'FATHER' ? row.guardian_name : ''),
    fatherPhone: meta.fatherPhone || (primaryGuardian === 'FATHER' ? row.guardian_phone : ''),
    fatherWhatsapp: meta.fatherWhatsapp || '',
    fatherEmail: meta.fatherEmail || '',
    fatherOccupation: meta.fatherOccupation || '',
    motherName: meta.motherName || (primaryGuardian === 'MOTHER' ? row.guardian_name : ''),
    motherPhone: meta.motherPhone || (primaryGuardian === 'MOTHER' ? row.guardian_phone : ''),
    motherWhatsapp: meta.motherWhatsapp || '',
    motherEmail: meta.motherEmail || '',
    motherOccupation: meta.motherOccupation || '',
    otherGuardianName: meta.otherGuardianName || (primaryGuardian === 'OTHER' ? row.guardian_name : ''),
    otherGuardianPhone: meta.otherGuardianPhone || (primaryGuardian === 'OTHER' ? row.guardian_phone : ''),
    otherGuardianRelationship: meta.otherGuardianRelationship || '',

    // Emergency
    emergencyName: meta.emergencyName || '',
    emergencyRelationship: meta.emergencyRelationship || '',
    emergencyPhone: meta.emergencyPhone || '',
    emergencyAltPhone: meta.emergencyAltPhone || '',
    emergencyAddress: meta.emergencyAddress || '',

    // ISP
    admissionDate: meta.admissionDate || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    admissionAcademicYear: row.admission_academic_year,
    batchId: row.batch_id || '',
    batchName: batch.name || meta.batchName || 'Unassigned Batch',
    programId: meta.programId || '',
    programName: meta.programName || '',
    classLevelId: meta.classLevelId || '',
    classLevelName: meta.classLevelName || '',
    enrollmentStatus: meta.enrollmentStatus || 'ENROLLED',
    admissionSource: meta.admissionSource || 'DIRECT_VISIT',
    notes: meta.notes || '',
    status: (user.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'),
    createdAt: row.created_at,
  };
}

export async function fetchStudentsFromSupabase(query?: string): Promise<StudentFullProfile[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/students?select=*,user:users(*),batches(id,name,code)&order=created_at.desc`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.error('Failed to fetch students from Supabase:', res.status, await res.text());
      return [];
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    let list = rows.map(mapStudentRecord);

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.batchName?.toLowerCase().includes(q) ||
          s.institutionName?.toLowerCase().includes(q)
      );
    }

    return list;
  } catch (err) {
    console.error('Error in fetchStudentsFromSupabase:', err);
    return [];
  }
}

export async function getStudentById(id: string): Promise<StudentFullProfile | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/students?id=eq.${id}&select=*,user:users(*),batches(id,name,code)&limit=1`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    );

    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return mapStudentRecord(rows[0]);
  } catch (err) {
    console.error('Error in getStudentById:', err);
    return null;
  }
}

export async function createStudentInSupabase(data: {
  fullName: string;
  phone?: string;
  email?: string;
  admissionYear: number;
  batchId?: string;
  gender?: string;
  dob?: string;
  presentAddress?: string;
  primaryGuardian?: 'FATHER' | 'MOTHER' | 'OTHER';
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  otherGuardianName?: string;
  otherGuardianPhone?: string;
  [key: string]: any;
}): Promise<StudentFullProfile> {
  const admissionYear = data.admissionYear || 2028;

  // 1. Fetch current next_student_serial for this academic year
  let serial = 1;
  let yearRowId: string | null = null;

  try {
    const yRes = await fetch(
      `${SUPABASE_URL}/rest/v1/academic_years?year=eq.${admissionYear}&select=*&limit=1`,
      { headers: getHeaders() }
    );
    const years = await yRes.json();
    if (Array.isArray(years) && years.length > 0) {
      serial = years[0].next_student_serial || 1;
      yearRowId = years[0].id;
    }
  } catch (e) {
    console.error('Failed to get academic year serial, using fallback serial:', e);
  }

  const studentId = `${admissionYear}${serial.toString().padStart(4, '0')}`;

  // 2. Primary Guardian resolution
  const primaryGuardian = data.primaryGuardian || 'FATHER';
  let guardianName = data.fatherName || '';
  let guardianPhone = data.fatherPhone || '';
  let relationship = 'FATHER';

  if (primaryGuardian === 'MOTHER') {
    guardianName = data.motherName || '';
    guardianPhone = data.motherPhone || '';
    relationship = 'MOTHER';
  } else if (primaryGuardian === 'OTHER') {
    guardianName = data.otherGuardianName || '';
    guardianPhone = data.otherGuardianPhone || '';
    relationship = data.otherGuardianRelationship || 'LEGAL_GUARDIAN';
  }

  // 3. Create public.users entry (role: STUDENT)
  const userEmail = data.email && data.email.trim()
    ? data.email.trim().toLowerCase()
    : `${studentId}@ispctg.edu.bd`;

  const userPayload = {
    full_name: data.fullName.trim(),
    email: userEmail,
    phone: data.phone ? data.phone.trim() : null,
    role: 'STUDENT',
    status: 'ACTIVE',
    metadata: {
      ...data,
      primaryGuardian,
      studentId,
    },
  };

  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(userPayload),
  });

  if (!userRes.ok) {
    const err = await userRes.text();
    throw new Error(`Failed to create student user account: ${err}`);
  }

  const userRows = await userRes.json();
  const createdUser = Array.isArray(userRows) ? userRows[0] : userRows;

  // 4. Create public.students entry
  const studentPayload = {
    student_id: studentId,
    user_id: createdUser.id,
    admission_academic_year: admissionYear,
    batch_id: data.batchId || null,
    gender: data.gender || 'Male',
    dob: data.dob || null,
    address: data.presentAddress || null,
    guardian_name: guardianName || null,
    guardian_phone: guardianPhone || null,
    relationship: relationship,
  };

  const studentRes = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
    method: 'POST',
    headers: { ...getHeaders(), Prefer: 'return=representation' },
    body: JSON.stringify(studentPayload),
  });

  if (!studentRes.ok) {
    // Cleanup created user
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${createdUser.id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const err = await studentRes.text();
    throw new Error(`Failed to create student profile: ${err}`);
  }

  const studentRows = await studentRes.json();
  const createdStudent = Array.isArray(studentRows) ? studentRows[0] : studentRows;

  // 5. Increment next_student_serial in academic_years
  if (yearRowId) {
    fetch(`${SUPABASE_URL}/rest/v1/academic_years?id=eq.${yearRowId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ next_student_serial: serial + 1 }),
    }).catch((e) => console.error('Error incrementing serial:', e));
  }

  return mapStudentRecord({
    ...createdStudent,
    user: createdUser,
  });
}

export async function updateStudentInSupabase(
  id: string,
  data: Partial<StudentFullProfile>
): Promise<boolean> {
  // First fetch student row to get user_id
  const student = await getStudentById(id);
  if (!student) return false;

  const userUpdates: any = { updated_at: new Date().toISOString() };
  if (data.fullName) userUpdates.full_name = data.fullName.trim();
  if (data.email) userUpdates.email = data.email.trim().toLowerCase();
  if (data.phone) userUpdates.phone = data.phone.trim();
  if (data.status) userUpdates.status = data.status;

  // Update metadata with all new fields
  userUpdates.metadata = {
    ...data,
  };

  // Update public.users
  const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${student.userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(userUpdates),
  });

  // Update public.students
  const studentUpdates: any = { updated_at: new Date().toISOString() };
  if (data.gender) studentUpdates.gender = data.gender;
  if (data.dob) studentUpdates.dob = data.dob;
  if (data.presentAddress) studentUpdates.address = data.presentAddress;
  if (data.batchId !== undefined) studentUpdates.batch_id = data.batchId || null;

  if (data.primaryGuardian) {
    if (data.primaryGuardian === 'FATHER') {
      studentUpdates.guardian_name = data.fatherName || student.fatherName;
      studentUpdates.guardian_phone = data.fatherPhone || student.fatherPhone;
      studentUpdates.relationship = 'FATHER';
    } else if (data.primaryGuardian === 'MOTHER') {
      studentUpdates.guardian_name = data.motherName || student.motherName;
      studentUpdates.guardian_phone = data.motherPhone || student.motherPhone;
      studentUpdates.relationship = 'MOTHER';
    } else if (data.primaryGuardian === 'OTHER') {
      studentUpdates.guardian_name = data.otherGuardianName || student.otherGuardianName;
      studentUpdates.guardian_phone = data.otherGuardianPhone || student.otherGuardianPhone;
      studentUpdates.relationship = data.otherGuardianRelationship || 'LEGAL_GUARDIAN';
    }
  }

  const studentRes = await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(studentUpdates),
  });

  return userRes.ok && studentRes.ok;
}

export async function deleteStudentInSupabase(id: string): Promise<boolean> {
  const student = await getStudentById(id);
  if (!student) return false;

  // Deleting user cascades to student
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${student.userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return res.ok;
}
