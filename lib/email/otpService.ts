import crypto from 'crypto';
import { sendOtpEmail } from './mailer';
import { hashPassword } from '@/lib/security/password';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getHeaders = () => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required.');
  }
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
};

interface StoredOtp {
  hashedCode: string;
  purpose: 'PASSWORD_RESET' | 'EMAIL_CHANGE';
  email: string;
  newEmail?: string;
  expiresAt: number; // timestamp
  attempts: number;
}

// In-memory OTP storage cache for fast validation across API calls
const otpStore = new Map<string, StoredOtp>();

function getStoreKey(email: string, purpose: string): string {
  return `${email.toLowerCase().trim()}_${purpose}`;
}

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP, store its hash, and dispatch via Email.
 */
export async function generateAndSendOtp(params: {
  email: string;
  purpose: 'PASSWORD_RESET' | 'EMAIL_CHANGE';
  newEmail?: string;
  userName?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = params.email.toLowerCase().trim();
    const destinationEmail =
      params.purpose === 'EMAIL_CHANGE' && params.newEmail ? params.newEmail.toLowerCase().trim() : cleanEmail;

    // 1. Verify user exists if PASSWORD_RESET (generic message returned for privacy)
    if (params.purpose === 'PASSWORD_RESET') {
      const userRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,full_name`,
        { headers: getHeaders() }
      );
      if (userRes.ok) {
        const users = await userRes.json();
        if (!users || users.length === 0) {
          // Return generic message to prevent account enumeration
          return {
            success: true,
            message: `If an account exists for ${destinationEmail}, a verification code has been sent.`,
          };
        }
      }
    }

    // 2. Generate cryptographically secure 6-digit OTP (100000 - 999999)
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = hashOtp(otpCode);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 3. Store hashed OTP in memory store
    const storeKey = getStoreKey(cleanEmail, params.purpose);
    otpStore.set(storeKey, {
      hashedCode,
      purpose: params.purpose,
      email: cleanEmail,
      newEmail: params.newEmail ? params.newEmail.toLowerCase().trim() : undefined,
      expiresAt,
      attempts: 0,
    });

    // Also persist hashed OTP in user metadata in Supabase for resilience
    try {
      const userCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,metadata`,
        { headers: getHeaders() }
      );
      if (userCheck.ok) {
        const rows = await userCheck.json();
        if (rows && rows.length > 0) {
          const user = rows[0];
          await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({
              metadata: {
                ...(user.metadata || {}),
                pending_otp: {
                  hashedCode,
                  purpose: params.purpose,
                  newEmail: params.newEmail,
                  expiresAt,
                },
              },
            }),
          });
        }
      }
    } catch (persistErr) {
      console.warn('Could not persist OTP hash in DB metadata, relying on memory store:', persistErr);
    }

    // 4. Dispatch Email via Gmail Nodemailer
    const mailResult = await sendOtpEmail({
      to: destinationEmail,
      userName: params.userName,
      otpCode,
      purpose: params.purpose,
      expiresMinutes: 10,
    });

    if (!mailResult.success) {
      return { success: false, error: mailResult.error || 'Failed to dispatch OTP email.' };
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${destinationEmail}.`,
    };
  } catch (err: any) {
    console.error('Error in generateAndSendOtp:', err);
    return { success: false, error: err.message || 'Error generating OTP.' };
  }
}

/**
 * Verify OTP code and execute the requested action (Password Reset or Email Change).
 */
export async function verifyOtpAndExecute(params: {
  email: string;
  code: string;
  purpose: 'PASSWORD_RESET' | 'EMAIL_CHANGE';
  newPassword?: string;
  newEmail?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = params.email.toLowerCase().trim();
    const inputCode = params.code.trim();
    const storeKey = getStoreKey(cleanEmail, params.purpose);

    let record = otpStore.get(storeKey);

    // Fallback: Check Supabase DB metadata if memory store missed
    if (!record) {
      const userCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,metadata`,
        { headers: getHeaders() }
      );
      if (userCheck.ok) {
        const rows = await userCheck.json();
        if (rows && rows.length > 0) {
          const pending = rows[0].metadata?.pending_otp;
          if (pending && pending.purpose === params.purpose) {
            record = {
              hashedCode: pending.hashedCode || hashOtp(pending.code || ''),
              purpose: pending.purpose,
              email: cleanEmail,
              newEmail: pending.newEmail,
              expiresAt: pending.expiresAt,
              attempts: 0,
            };
          }
        }
      }
    }

    if (!record) {
      return { success: false, error: 'No active OTP request found. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(storeKey);
      return { success: false, error: 'This verification code has expired. Please request a new one.' };
    }

    const inputHash = hashOtp(inputCode);
    const expectedBuffer = Buffer.from(record.hashedCode, 'hex');
    const inputBuffer = Buffer.from(inputHash, 'hex');

    const matches =
      expectedBuffer.length === inputBuffer.length && crypto.timingSafeEqual(expectedBuffer, inputBuffer);

    if (!matches) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        otpStore.delete(storeKey);
        return { success: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
      }
      return { success: false, error: 'Incorrect verification code. Please check your email and try again.' };
    }

    // OTP Verified! Consume it:
    otpStore.delete(storeKey);

    // -------------------------------------------------------------
    // ACTION 1: PASSWORD RESET
    // -------------------------------------------------------------
    if (params.purpose === 'PASSWORD_RESET') {
      if (!params.newPassword || params.newPassword.length < 8) {
        return { success: false, error: 'New password must be at least 8 characters.' };
      }

      // Find user
      const userCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,metadata`,
        { headers: getHeaders() }
      );
      if (!userCheck.ok) return { success: false, error: 'User lookup failed.' };
      const rows = await userCheck.json();
      if (!rows || rows.length === 0) return { success: false, error: 'User not found.' };

      const user = rows[0];
      const passwordHash = await hashPassword(params.newPassword);
      const updatedMeta = { ...(user.metadata || {}) };
      delete updatedMeta.initialPassword;
      delete updatedMeta.pending_otp;
      updatedMeta.lastPasswordReset = new Date().toISOString();

      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          password_hash: passwordHash,
          metadata: updatedMeta,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!patchRes.ok) {
        return { success: false, error: 'Failed to update password in database.' };
      }

      return { success: true, message: 'Password reset successfully! You can now log in with your new password.' };
    }

    // -------------------------------------------------------------
    // ACTION 2: EMAIL CHANGE
    // -------------------------------------------------------------
    if (params.purpose === 'EMAIL_CHANGE') {
      if (!record.newEmail) {
        return { success: false, error: 'No new email address was attached to this verification code.' };
      }
      if (params.newEmail && params.newEmail.toLowerCase().trim() !== record.newEmail) {
        return { success: false, error: 'Verification email mismatch. The code was issued for a different address.' };
      }
      const targetNewEmail = record.newEmail;

      // Check if new email is already taken by another user
      const duplicateCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(targetNewEmail)}&select=id`,
        { headers: getHeaders() }
      );
      if (duplicateCheck.ok) {
        const dupes = await duplicateCheck.json();
        if (dupes && dupes.length > 0) {
          return { success: false, error: 'This new email address is already registered to another user.' };
        }
      }

      // Find user by old email
      const userCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,metadata`,
        { headers: getHeaders() }
      );
      if (!userCheck.ok) return { success: false, error: 'User lookup failed.' };
      const rows = await userCheck.json();
      if (!rows || rows.length === 0) return { success: false, error: 'User not found.' };

      const user = rows[0];
      const updatedMeta = { ...(user.metadata || {}) };
      delete updatedMeta.pending_otp;

      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          email: targetNewEmail,
          metadata: updatedMeta,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!patchRes.ok) {
        return { success: false, error: 'Failed to update email address in database.' };
      }

      return {
        success: true,
        message: `Email address updated successfully to ${targetNewEmail}!`,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in verifyOtpAndExecute:', err);
    return { success: false, error: err.message || 'Error verifying OTP.' };
  }
}
