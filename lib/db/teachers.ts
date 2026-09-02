export interface Teacher {
  id: string;
  employeeId: string; // e.g. "ISP1001"
  fullName: string;
  nickname: string;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other';
  bio?: string;
  educationalDetails: string;
  experience: string;
  mobile: string;
  whatsapp: string;
  email: string;
  initialPassword?: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function generateRandomPassword(length: number = 8): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz!@#$';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Database store — starts strictly empty with no fallback/mock data
export const INITIAL_TEACHERS: Teacher[] = [];
let teachersMemory: Teacher[] = [];

export function getTeachers(): Teacher[] {
  return [...teachersMemory];
}

export function getNextEmployeeId(): string {
  const ids = teachersMemory
    .map((t) => {
      const match = t.employeeId.match(/^ISP(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = ids.length > 0 ? Math.max(...ids) : 1000;
  return `ISP${max + 1}`;
}

export function addTeacher(newTeacherData: Omit<Teacher, 'id' | 'employeeId' | 'createdAt' | 'updatedAt'>): Teacher {
  const employeeId = getNextEmployeeId();
  const id = `t-${Date.now()}`;
  const now = new Date().toISOString();

  const createdTeacher: Teacher = {
    ...newTeacherData,
    id,
    employeeId,
    initialPassword: newTeacherData.initialPassword || generateRandomPassword(),
    status: newTeacherData.status || 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };

  teachersMemory.unshift(createdTeacher);
  return createdTeacher;
}

export function updateTeacherStatus(employeeId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
  const teacher = teachersMemory.find((t) => t.employeeId === employeeId);
  if (teacher) {
    teacher.status = status;
    teacher.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}
