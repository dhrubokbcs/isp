import { fetchStudentsFromSupabase, updateStudentInSupabase, StudentFullProfile } from './supabaseStudents';

export interface LinkedStudentInfo {
  id: string;
  studentId: string;
  fullName: string;
  batchName?: string;
  classLevelName?: string;
  admissionAcademicYear?: number;
  isPrimaryForStudent: boolean;
}

export interface GuardianRecord {
  id: string; // Unique key (phone or composite id)
  fullName: string;
  relationship: 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN' | 'OTHER';
  relationshipLabel: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  occupation?: string;
  address?: string;
  isPrimary: boolean;
  linkedStudents: LinkedStudentInfo[];
  studentsCount: number;
}

export async function fetchGuardiansFromSupabase(
  query?: string,
  filter?: string
): Promise<GuardianRecord[]> {
  try {
    const students = await fetchStudentsFromSupabase();
    const guardianMap = new Map<string, GuardianRecord>();

    for (const s of students) {
      // 1. Check Father
      if (s.fatherName && s.fatherName.trim()) {
        const key = `father-${s.fatherPhone?.trim() || s.fatherName.trim().toLowerCase()}`;
        const isPrimary = s.primaryGuardian === 'FATHER';
        const linkedStudent: LinkedStudentInfo = {
          id: s.id,
          studentId: s.studentId,
          fullName: s.fullName,
          batchName: s.batchName,
          classLevelName: s.classLevelName,
          admissionAcademicYear: s.admissionAcademicYear,
          isPrimaryForStudent: isPrimary,
        };

        if (guardianMap.has(key)) {
          const existing = guardianMap.get(key)!;
          if (!existing.linkedStudents.some((ls) => ls.id === s.id)) {
            existing.linkedStudents.push(linkedStudent);
            existing.studentsCount = existing.linkedStudents.length;
          }
          if (isPrimary) existing.isPrimary = true;
          if (!existing.whatsappNumber && s.fatherWhatsapp) existing.whatsappNumber = s.fatherWhatsapp;
          if (!existing.occupation && s.fatherOccupation) existing.occupation = s.fatherOccupation;
          if (!existing.email && s.fatherEmail) existing.email = s.fatherEmail;
        } else {
          guardianMap.set(key, {
            id: key,
            fullName: s.fatherName.trim(),
            relationship: 'FATHER',
            relationshipLabel: 'Father',
            phone: s.fatherPhone?.trim() || '',
            whatsappNumber: s.fatherWhatsapp?.trim() || '',
            email: s.fatherEmail?.trim() || '',
            occupation: s.fatherOccupation?.trim() || '',
            address: s.presentAddress || '',
            isPrimary: isPrimary,
            linkedStudents: [linkedStudent],
            studentsCount: 1,
          });
        }
      }

      // 2. Check Mother
      if (s.motherName && s.motherName.trim()) {
        const key = `mother-${s.motherPhone?.trim() || s.motherName.trim().toLowerCase()}`;
        const isPrimary = s.primaryGuardian === 'MOTHER';
        const linkedStudent: LinkedStudentInfo = {
          id: s.id,
          studentId: s.studentId,
          fullName: s.fullName,
          batchName: s.batchName,
          classLevelName: s.classLevelName,
          admissionAcademicYear: s.admissionAcademicYear,
          isPrimaryForStudent: isPrimary,
        };

        if (guardianMap.has(key)) {
          const existing = guardianMap.get(key)!;
          if (!existing.linkedStudents.some((ls) => ls.id === s.id)) {
            existing.linkedStudents.push(linkedStudent);
            existing.studentsCount = existing.linkedStudents.length;
          }
          if (isPrimary) existing.isPrimary = true;
          if (!existing.whatsappNumber && s.motherWhatsapp) existing.whatsappNumber = s.motherWhatsapp;
          if (!existing.occupation && s.motherOccupation) existing.occupation = s.motherOccupation;
          if (!existing.email && s.motherEmail) existing.email = s.motherEmail;
        } else {
          guardianMap.set(key, {
            id: key,
            fullName: s.motherName.trim(),
            relationship: 'MOTHER',
            relationshipLabel: 'Mother',
            phone: s.motherPhone?.trim() || '',
            whatsappNumber: s.motherWhatsapp?.trim() || '',
            email: s.motherEmail?.trim() || '',
            occupation: s.motherOccupation?.trim() || '',
            address: s.presentAddress || '',
            isPrimary: isPrimary,
            linkedStudents: [linkedStudent],
            studentsCount: 1,
          });
        }
      }

      // 3. Check Other Guardian
      if (s.otherGuardianName && s.otherGuardianName.trim()) {
        const key = `other-${s.otherGuardianPhone?.trim() || s.otherGuardianName.trim().toLowerCase()}`;
        const isPrimary = s.primaryGuardian === 'OTHER';
        const linkedStudent: LinkedStudentInfo = {
          id: s.id,
          studentId: s.studentId,
          fullName: s.fullName,
          batchName: s.batchName,
          classLevelName: s.classLevelName,
          admissionAcademicYear: s.admissionAcademicYear,
          isPrimaryForStudent: isPrimary,
        };

        if (guardianMap.has(key)) {
          const existing = guardianMap.get(key)!;
          if (!existing.linkedStudents.some((ls) => ls.id === s.id)) {
            existing.linkedStudents.push(linkedStudent);
            existing.studentsCount = existing.linkedStudents.length;
          }
          if (isPrimary) existing.isPrimary = true;
        } else {
          guardianMap.set(key, {
            id: key,
            fullName: s.otherGuardianName.trim(),
            relationship: 'LEGAL_GUARDIAN',
            relationshipLabel: s.otherGuardianRelationship || 'Legal Guardian',
            phone: s.otherGuardianPhone?.trim() || '',
            address: s.presentAddress || '',
            isPrimary: isPrimary,
            linkedStudents: [linkedStudent],
            studentsCount: 1,
          });
        }
      }
    }

    let list = Array.from(guardianMap.values());

    // Filter by relationship / primary
    if (filter && filter !== 'ALL') {
      if (filter === 'PRIMARY') {
        list = list.filter((g) => g.isPrimary);
      } else if (filter === 'FATHER' || filter === 'MOTHER' || filter === 'LEGAL_GUARDIAN') {
        list = list.filter((g) => g.relationship === filter);
      }
    }

    // Search query
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.fullName.toLowerCase().includes(q) ||
          g.phone.includes(q) ||
          g.email?.toLowerCase().includes(q) ||
          g.occupation?.toLowerCase().includes(q) ||
          g.linkedStudents.some(
            (ls) => ls.fullName.toLowerCase().includes(q) || ls.studentId.toLowerCase().includes(q)
          )
      );
    }

    // Sort by primary first, then name
    list.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.fullName.localeCompare(b.fullName);
    });

    return list;
  } catch (err) {
    console.error('Error in fetchGuardiansFromSupabase:', err);
    return [];
  }
}

export async function updateGuardianDetailsInSupabase(
  guardianId: string,
  data: {
    fullName: string;
    phone: string;
    whatsappNumber?: string;
    email?: string;
    occupation?: string;
    relationship: 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN' | 'OTHER';
    linkedStudentIds: string[];
  }
): Promise<boolean> {
  try {
    // Update each linked student's guardian record
    let success = true;
    for (const studentId of data.linkedStudentIds) {
      const updates: any = {};
      if (data.relationship === 'FATHER') {
        updates.fatherName = data.fullName.trim();
        updates.fatherPhone = data.phone.trim();
        if (data.whatsappNumber !== undefined) updates.fatherWhatsapp = data.whatsappNumber.trim();
        if (data.email !== undefined) updates.fatherEmail = data.email.trim();
        if (data.occupation !== undefined) updates.fatherOccupation = data.occupation.trim();
      } else if (data.relationship === 'MOTHER') {
        updates.motherName = data.fullName.trim();
        updates.motherPhone = data.phone.trim();
        if (data.whatsappNumber !== undefined) updates.motherWhatsapp = data.whatsappNumber.trim();
        if (data.email !== undefined) updates.motherEmail = data.email.trim();
        if (data.occupation !== undefined) updates.motherOccupation = data.occupation.trim();
      } else {
        updates.otherGuardianName = data.fullName.trim();
        updates.otherGuardianPhone = data.phone.trim();
      }

      const ok = await updateStudentInSupabase(studentId, updates);
      if (!ok) success = false;
    }
    return success;
  } catch (err) {
    console.error('Error in updateGuardianDetailsInSupabase:', err);
    return false;
  }
}
