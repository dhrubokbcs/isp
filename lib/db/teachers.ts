export interface Teacher {
  id: string;
  employeeId: string; // e.g. "ISP1001"
  fullName: string;
  nickname: string;
  designation?: string; // e.g. "Senior Faculty", "Lecturer", "Department Head", "Mentor"
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

// 100% Database-driven store — starts strictly empty with no mock data
export const INITIAL_TEACHERS: Teacher[] = [];

export function getTeachers(): Teacher[] {
  return [];
}

export function getNextEmployeeId(): string {
  return 'ISP1001';
}
