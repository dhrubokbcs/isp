const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
});

export interface UserAccountData {
  id: string;
  fullName: string;
  nickname: string;
  birthday: string;
  gender: string;
  bio: string;
  educationalDetails: string;
  experience: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  role: string;
  status: string;
  linkedAccounts: {
    google?: {
      linked: boolean;
      email?: string;
    };
  };
  integrations: {
    zoom?: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
    googleMeet?: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
  };
  payout: {
    method: 'BANK' | 'MFS';
    bank?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      branchName: string;
      routingNumber: string;
    };
    mfs?: {
      provider: 'bKash' | 'Rocket' | 'Upay' | 'Nagad' | 'mCash' | 'tap';
      number: string;
    };
  };
}

export async function fetchUserAccount(userId?: string): Promise<UserAccountData | null> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/users?select=*&limit=1`;
    if (userId) {
      url = `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*&limit=1`;
    } else {
      // Default to SUPERADMIN or first active user
      url = `${SUPABASE_URL}/rest/v1/users?role=eq.SUPERADMIN&select=*&limit=1`;
    }

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      console.error('Failed to fetch user account:', await res.text());
      return null;
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) return null;

    const u = rows[0];
    const meta = u.metadata || {};

    return {
      id: u.id,
      fullName: u.full_name || '',
      nickname: meta.nickname || '',
      birthday: meta.birthday || meta.dob || '',
      gender: meta.gender || 'Male',
      bio: meta.bio || '',
      educationalDetails: meta.educationalDetails || meta.education || '',
      experience: meta.experience || '',
      email: u.email || '',
      phone: u.phone || '',
      whatsappNumber: meta.whatsappNumber || meta.whatsapp || '',
      role: u.role || 'STAFF',
      status: u.status || 'ACTIVE',
      linkedAccounts: meta.linkedAccounts || {
        google: { linked: false },
      },
      integrations: meta.integrations || {
        zoom: { enabled: false, clientId: '', clientSecret: '' },
        googleMeet: { enabled: false, clientId: '', clientSecret: '' },
      },
      payout: meta.payout || {
        method: 'BANK',
        bank: { accountName: '', accountNumber: '', bankName: '', branchName: '', routingNumber: '' },
        mfs: { provider: 'bKash', number: '' },
      },
    };
  } catch (err) {
    console.error('Error in fetchUserAccount:', err);
    return null;
  }
}

export async function updateUserAccount(
  userId: string,
  data: Partial<UserAccountData>
): Promise<boolean> {
  try {
    // 1. Fetch existing user metadata
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: getHeaders(),
    });
    if (!checkRes.ok) return false;
    const existingRows = await checkRes.json();
    if (!existingRows || existingRows.length === 0) return false;

    const existing = existingRows[0];
    const existingMeta = existing.metadata || {};

    const updatedMeta = {
      ...existingMeta,
      ...(data.nickname !== undefined && { nickname: data.nickname }),
      ...(data.birthday !== undefined && { birthday: data.birthday, dob: data.birthday }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.educationalDetails !== undefined && { educationalDetails: data.educationalDetails }),
      ...(data.experience !== undefined && { experience: data.experience }),
      ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber, whatsapp: data.whatsappNumber }),
      ...(data.linkedAccounts !== undefined && { linkedAccounts: data.linkedAccounts }),
      ...(data.integrations !== undefined && { integrations: data.integrations }),
      ...(data.payout !== undefined && { payout: data.payout }),
    };

    const updatePayload: any = {
      metadata: updatedMeta,
      updated_at: new Date().toISOString(),
    };

    if (data.fullName !== undefined) updatePayload.full_name = data.fullName.trim();
    if (data.email !== undefined) updatePayload.email = data.email.trim();
    if (data.phone !== undefined) updatePayload.phone = data.phone.trim();

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        Prefer: 'return=representation',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!patchRes.ok) {
      console.error('Failed to update user account:', await patchRes.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateUserAccount:', err);
    return false;
  }
}
