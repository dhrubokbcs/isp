import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface MailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Returns a configured Nodemailer transporter using Gmail SMTP.
 * Requires GMAIL_USER (your Gmail/Workspace address) and
 * GMAIL_APP_PASSWORD (16-character Google App Password) in .env.local.
 */
export function getMailTransporter(): nodemailer.Transporter | null {
  const user = process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
}

/**
 * Verify whether Gmail SMTP connection is operational.
 */
export async function verifyGmailConnection(): Promise<{ success: boolean; message: string }> {
  const transporter = getMailTransporter();
  if (!transporter) {
    return {
      success: false,
      message: 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.',
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: 'Gmail SMTP connection verified successfully!',
    };
  } catch (err: any) {
    console.error('Gmail SMTP Verification Error:', err);
    return {
      success: false,
      message: err.message || 'Failed to authenticate with Gmail SMTP.',
    };
  }
}

/**
 * Core send mail function.
 */
export async function sendMail(options: SendMailOptions): Promise<MailResult> {
  const transporter = getMailTransporter();
  const defaultFrom =
    process.env.EMAIL_FROM ||
    `Indicator Student's Point <${process.env.GMAIL_USER || 'no-reply@ispctg.com'}>`;

  if (!transporter) {
    const errorMsg =
      'Gmail SMTP credentials are missing in .env.local. Set GMAIL_USER and GMAIL_APP_PASSWORD to send real emails.';
    console.warn(`[Nodemailer Notice] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[Nodemailer Error] Error sending email:', err);
    return {
      success: false,
      error: err.message || 'Unknown error sending email via Gmail.',
    };
  }
}

/* ========================================================================= */
/* BRANDED HTML EMAIL TEMPLATES                                              */
/* ========================================================================= */

/**
 * Branded Welcome Email for newly admitted students
 */
export async function sendStudentAdmissionWelcomeEmail(params: {
  to: string;
  studentName: string;
  studentId: string;
  batchName?: string;
  admissionYear?: number;
}): Promise<MailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; color: #172033; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
          .header { background-color: #061B57; color: #FFFFFF; padding: 28px; text-align: center; }
          .badge { display: inline-block; background-color: #1748D1; color: #FFFFFF; font-weight: 800; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin-top: 10px; }
          .body { padding: 32px 28px; line-height: 1.6; }
          .card { background-color: #F1F5F9; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #E2E8F0; }
          .footer { background-color: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
          .button { display: inline-block; background-color: #1748D1; color: #FFFFFF !important; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 22px;">Indicator Student's Point</h1>
            <p style="margin: 4px 0 0; opacity: 0.85; font-size: 14px;">Admission Confirmation &bull; Session ${params.admissionYear || 2028}</p>
          </div>
          <div class="body">
            <h2 style="color: #061B57; margin-top: 0;">Welcome, ${params.studentName}!</h2>
            <p>Congratulations! Your admission to <strong>Indicator Student's Point (ISP)</strong> has been confirmed and registered in our campus database.</p>
            
            <div class="card">
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748B; text-transform: uppercase; font-weight: 700;">Your Permanent Student Identification</p>
              <div style="font-size: 24px; font-weight: 800; color: #1748D1; letter-spacing: 1px;">${params.studentId}</div>
              <p style="margin: 8px 0 0; font-size: 14px; color: #334155;"><strong>Assigned Batch:</strong> ${params.batchName || 'General Academic Track'}</p>
            </div>

            <p>Please preserve this 8-digit Student ID for class attendance, exam hall entries, and routine report cards.</p>
            
            <div style="text-align: center;">
              <a href="http://localhost:3000" class="button">Access ISP Student Portal</a>
            </div>
          </div>
          <div class="footer">
            Indicator Student's Point (ISP) &bull; Chawkbazar, Chattogram<br>
            Official Support: +880 1819-123456 | admin@ispctg.com
          </div>
        </div>
      </body>
    </html>
  `;

  return sendMail({
    to: params.to,
    subject: `Admission Confirmation — Welcome to ISP (${params.studentId})`,
    html,
    text: `Welcome to Indicator Student's Point, ${params.studentName}! Your Permanent Student ID is ${params.studentId}. Assigned Batch: ${params.batchName || 'General Track'}.`,
  });
}

/**
 * Branded Test Email to verify SMTP setup
 */
export async function sendTestEmail(toEmail: string): Promise<MailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; color: #172033; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
          .header { background-color: #1748D1; color: #FFFFFF; padding: 24px; text-align: center; }
          .body { padding: 28px; line-height: 1.6; }
          .badge { display: inline-block; background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">ISP Gmail Nodemailer Test</h2>
            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Indicator Student's Point Academic Platform</p>
          </div>
          <div class="body">
            <p><span class="badge">&#10003; SMTP Service Operational</span></p>
            <p>Hello,</p>
            <p>This is an automated verification email dispatched from your Next.js application using <strong>Gmail Nodemailer SMTP</strong>.</p>
            <p>Your institutional email dispatch pipeline is working and ready to deliver admission confirmations, guardian alerts, and money receipts.</p>
            <p style="color: #64748B; font-size: 12px; margin-top: 24px;">Timestamp: ${new Date().toUTCString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendMail({
    to: toEmail,
    subject: `[ISP Verification] Gmail Nodemailer Operational`,
    html,
    text: `ISP Gmail Nodemailer Test: Your SMTP service is fully operational. Dispatched at: ${new Date().toUTCString()}`,
  });
}

/**
 * Branded OTP Verification Email for Password Reset and Email Change
 */
export async function sendOtpEmail(params: {
  to: string;
  userName?: string;
  otpCode: string;
  purpose: 'PASSWORD_RESET' | 'EMAIL_CHANGE';
  expiresMinutes?: number;
}): Promise<MailResult> {
  const isPasswordReset = params.purpose === 'PASSWORD_RESET';
  const title = isPasswordReset ? 'Password Reset Verification' : 'Email Address Verification';
  const subtitle = isPasswordReset
    ? 'Use the 6-digit one-time code below to reset your console password.'
    : 'Use the 6-digit one-time code below to confirm updating your account email address.';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; color: #172033; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
          .header { background-color: #061B57; color: #FFFFFF; padding: 26px; text-align: center; }
          .body { padding: 32px 28px; line-height: 1.6; text-align: center; }
          .otp-box { display: inline-block; background-color: #EEF4FF; border: 2px dashed #1748D1; border-radius: 12px; padding: 16px 32px; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; color: #1748D1; letter-spacing: 8px; font-family: 'Segoe UI', Roboto, sans-serif; }
          .expiry { font-size: 13px; color: #DC2626; font-weight: 700; margin-top: 4px; }
          .notice { font-size: 13px; color: #64748B; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px; line-height: 1.5; }
          .footer { background-color: #F8FAFC; padding: 18px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 20px;">Indicator Student's Point</h1>
            <p style="margin: 4px 0 0; opacity: 0.85; font-size: 13px;">Security &bull; Account Verification</p>
          </div>
          <div class="body">
            <h2 style="color: #061B57; margin-top: 0; font-size: 20px;">${title}</h2>
            <p style="color: #475569; font-size: 14px; margin-bottom: 0;">${subtitle}</p>

            <div class="otp-box">
              <div class="otp-code">${params.otpCode}</div>
              <div class="expiry">Valid for ${params.expiresMinutes || 10} minutes</div>
            </div>

            <p style="font-size: 13.5px; color: #334155; margin: 0;">
              Enter this code in your browser to complete verification.
            </p>

            <div class="notice">
              <strong>Security Notice:</strong> If you did not initiate this request, please disregard this email or notify the ISP Superadmin immediately. Never share this code with anyone.
            </div>
          </div>
          <div class="footer">
            Indicator Student's Point (ISP) &bull; Chawkbazar, Chattogram<br>
            Automated Security Verification Service
          </div>
        </div>
      </body>
    </html>
  `;

  return sendMail({
    to: params.to,
    subject: `[ISP Security] ${params.otpCode} is your ${isPasswordReset ? 'Password Reset' : 'Email Verification'} code`,
    html,
    text: `Your ISP verification OTP is: ${params.otpCode}. Valid for ${params.expiresMinutes || 10} minutes.`,
  });
}

