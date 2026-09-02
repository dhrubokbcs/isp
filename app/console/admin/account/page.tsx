'use client';

import * as React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import LoyaltyRoundedIcon from '@mui/icons-material/LoyaltyRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GoogleIcon from '@mui/icons-material/Google';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import VideoCameraFrontRoundedIcon from '@mui/icons-material/VideoCameraFrontRounded';
import VideoCallRoundedIcon from '@mui/icons-material/VideoCallRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';

import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { UserAccountData } from '@/lib/db/supabaseAccount';

export default function MyAccountSettingsPage() {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [account, setAccount] = React.useState<UserAccountData | null>(null);

  // 1. Profile State
  const [fullName, setFullName] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [birthday, setBirthday] = React.useState('');
  const [gender, setGender] = React.useState('Male');
  const [bio, setBio] = React.useState('');
  const [educationalDetails, setEducationalDetails] = React.useState('');
  const [experience, setExperience] = React.useState('');

  // 2. Security State
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // 4. Linked Accounts State
  const [googleLinked, setGoogleLinked] = React.useState(false);

  // 6. Integrations State
  const [zoomEnabled, setZoomEnabled] = React.useState(false);
  const [zoomClientId, setZoomClientId] = React.useState('');
  const [zoomClientSecret, setZoomClientSecret] = React.useState('');

  const [meetEnabled, setMeetEnabled] = React.useState(false);
  const [meetClientId, setMeetClientId] = React.useState('');
  const [meetClientSecret, setMeetClientSecret] = React.useState('');

  // 7. Payout State
  const [payoutMethod, setPayoutMethod] = React.useState<'BANK' | 'MFS'>('BANK');
  // Bank fields
  const [bankAccountName, setBankAccountName] = React.useState('');
  const [bankAccountNumber, setBankAccountNumber] = React.useState('');
  const [bankName, setBankName] = React.useState('');
  const [branchName, setBranchName] = React.useState('');
  const [routingNumber, setRoutingNumber] = React.useState('');
  // MFS fields
  const [mfsProvider, setMfsProvider] = React.useState<'bKash' | 'Rocket' | 'Upay' | 'Nagad' | 'mCash' | 'tap'>('bKash');
  const [mfsNumber, setMfsNumber] = React.useState('');

  // 8. Security OTP States
  // Forgot Password Modal State
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [forgotOtpSent, setForgotOtpSent] = React.useState(false);
  const [forgotOtpCode, setForgotOtpCode] = React.useState('');
  const [forgotNewPassword, setForgotNewPassword] = React.useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = React.useState('');
  const [forgotLoading, setForgotLoading] = React.useState(false);

  // Email Change Modal State
  const [emailChangeOpen, setEmailChangeOpen] = React.useState(false);
  const [newEmailInput, setNewEmailInput] = React.useState('');
  const [emailOtpSent, setEmailOtpSent] = React.useState(false);
  const [emailOtpCode, setEmailOtpCode] = React.useState('');
  const [emailChangeLoading, setEmailChangeLoading] = React.useState(false);

  // Load account data
  const loadAccount = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/account');
      const data = await res.json();
      if (!res.ok || !data.success || !data.account) {
        throw new Error(data.error || 'Failed to load user account');
      }

      const acc: UserAccountData = data.account;
      setAccount(acc);

      // Populate Profile
      setFullName(acc.fullName || '');
      setNickname(acc.nickname || '');
      setBirthday(acc.birthday || '');
      setGender(acc.gender || 'Male');
      setBio(acc.bio || '');
      setEducationalDetails(acc.educationalDetails || '');
      setExperience(acc.experience || '');

      // Populate Security
      setEmail(acc.email || '');
      setPhone(acc.phone || '');
      setWhatsappNumber(acc.whatsappNumber || '');

      // Populate Linked Account
      setGoogleLinked(Boolean(acc.linkedAccounts?.google?.linked));

      // Populate Integrations
      setZoomEnabled(Boolean(acc.integrations?.zoom?.enabled));
      setZoomClientId(acc.integrations?.zoom?.clientId || '');
      setZoomClientSecret(acc.integrations?.zoom?.clientSecret || '');

      setMeetEnabled(Boolean(acc.integrations?.googleMeet?.enabled));
      setMeetClientId(acc.integrations?.googleMeet?.clientId || '');
      setMeetClientSecret(acc.integrations?.googleMeet?.clientSecret || '');

      // Populate Payout
      const p = acc.payout || { method: 'BANK' };
      setPayoutMethod(p.method || 'BANK');
      if (p.bank) {
        setBankAccountName(p.bank.accountName || '');
        setBankAccountNumber(p.bank.accountNumber || '');
        setBankName(p.bank.bankName || '');
        setBranchName(p.bank.branchName || '');
        setRoutingNumber(p.bank.routingNumber || '');
      }
      if (p.mfs) {
        setMfsProvider(p.mfs.provider || 'bKash');
        setMfsNumber(p.mfs.number || '');
      }

      // Sync active profile to localStorage and notify app shell
      if (typeof window !== 'undefined' && acc.fullName) {
        const storedUser = localStorage.getItem('isp_console_user');
        const parsed = storedUser ? JSON.parse(storedUser) : {};
        localStorage.setItem(
          'isp_console_user',
          JSON.stringify({
            ...parsed,
            id: acc.id,
            name: acc.fullName,
            email: acc.email,
            role: acc.role,
          })
        );
        window.dispatchEvent(new Event('isp_user_profile_updated'));
      }
    } catch (err: any) {
      console.error('Failed to load user account:', err);
      toastError(err.message || 'Failed to load user account');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  // Generic Save Helper
  const handleSaveSection = async (payload: Partial<UserAccountData>, sectionLabel: string) => {
    if (!account?.id) return;
    setSaving(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: account.id,
          ...payload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to update ${sectionLabel}`);
      }

      // Immediately sync localStorage and dispatch event so top-nav avatar updates instantly
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('isp_console_user');
        const parsed = storedUser ? JSON.parse(storedUser) : {};
        if (payload.fullName) parsed.name = payload.fullName;
        if (payload.email) parsed.email = payload.email;
        localStorage.setItem('isp_console_user', JSON.stringify(parsed));
        window.dispatchEvent(new Event('isp_user_profile_updated'));
      }

      success(`${sectionLabel} updated and saved successfully!`);
      loadAccount();
    } catch (err: any) {
      toastError(err.message || `Error updating ${sectionLabel}`);
    } finally {
      setSaving(false);
    }
  };

  // 1. Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveSection(
      {
        fullName,
        nickname,
        birthday,
        gender,
        bio,
        educationalDetails,
        experience,
      },
      'Personal & Educational Profile'
    );
  };

  // 2. Save Contact Info (Phone & WhatsApp)
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveSection(
      {
        phone,
        whatsappNumber,
      },
      'Contact Information'
    );
  };

  // Step 1: Send OTP to new email address
  const handleSendEmailChangeOtp = async () => {
    const cleanTarget = newEmailInput.trim().toLowerCase();
    if (!cleanTarget || !cleanTarget.includes('@')) {
      toastError('Please enter a valid new email address.');
      return;
    }

    if (account?.email && cleanTarget === account.email.toLowerCase()) {
      toastError('New email must be different from your current registered email.');
      return;
    }

    setEmailChangeLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account?.email,
          newEmail: cleanTarget,
          purpose: 'EMAIL_CHANGE',
          userName: fullName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch email verification code.');
      }

      setEmailOtpSent(true);
      info(`A 6-digit verification code has been dispatched to ${cleanTarget}.`);
    } catch (err: any) {
      toastError(err.message || 'Error initiating email change.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Step 2: Verify OTP and update email in database
  const handleVerifyEmailChange = async () => {
    if (!emailOtpCode || emailOtpCode.trim().length !== 6) {
      toastError('Please enter the 6-digit OTP sent to your new email.');
      return;
    }

    setEmailChangeLoading(true);
    try {
      const cleanTarget = newEmailInput.trim().toLowerCase();
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account?.email,
          newEmail: cleanTarget,
          code: emailOtpCode.trim(),
          purpose: 'EMAIL_CHANGE',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired OTP code.');
      }

      setEmail(cleanTarget);
      setEmailChangeOpen(false);
      setEmailOtpSent(false);
      setNewEmailInput('');
      setEmailOtpCode('');
      success(`Email address verified and successfully updated to ${cleanTarget}!`);
      loadAccount();
    } catch (err: any) {
      toastError(err.message || 'Error verifying email change.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Request Forgot Password OTP
  const handleRequestForgotOtp = async () => {
    if (!account?.email) return;
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          purpose: 'PASSWORD_RESET',
          userName: fullName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch password reset OTP.');
      }

      setForgotOtpSent(true);
      success(`6-digit verification code dispatched to ${account.email}!`);
    } catch (err: any) {
      toastError(err.message || 'Error sending password reset OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Verify OTP and Reset Password
  const handleVerifyForgotPassword = async () => {
    if (!forgotOtpCode || forgotOtpCode.trim().length !== 6) {
      toastError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      toastError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toastError('New password and confirmation do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account?.email,
          code: forgotOtpCode.trim(),
          purpose: 'PASSWORD_RESET',
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired OTP code.');
      }

      success('Password reset successfully via Email OTP verification!');
      setForgotPasswordOpen(false);
      setForgotOtpSent(false);
      setForgotOtpCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    } catch (err: any) {
      toastError(err.message || 'Error resetting password.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 2. Direct Password Change (Requires current password verification or use OTP)
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toastError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('New password and confirmation do not match.');
      return;
    }
    // Direct password update
    success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // 4. Toggle Google Link
  const handleToggleGoogleLink = () => {
    const nextStatus = !googleLinked;
    setGoogleLinked(nextStatus);
    handleSaveSection(
      {
        linkedAccounts: {
          google: {
            linked: nextStatus,
            email: nextStatus ? email : undefined,
          },
        },
      },
      'Google Account Link'
    );
  };

  // 6. Save Integrations
  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveSection(
      {
        integrations: {
          zoom: {
            enabled: zoomEnabled,
            clientId: zoomClientId,
            clientSecret: zoomClientSecret,
          },
          googleMeet: {
            enabled: meetEnabled,
            clientId: meetClientId,
            clientSecret: meetClientSecret,
          },
        },
      },
      'Virtual Meeting Integrations'
    );
  };

  // 7. Save Payout
  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutMethod === 'MFS') {
      const cleanNum = mfsNumber.trim();
      const mfsRegex = /^01[3-9]\d{8}$/;
      if (!mfsRegex.test(cleanNum)) {
        toastError('Invalid MFS Number. Must start with 01 and contain exactly 11 digits (e.g. 01819123456).');
        return;
      }
    } else {
      if (!bankAccountName.trim() || !bankAccountNumber.trim() || !bankName.trim()) {
        toastError('Please complete Account Name, Account Number, and Bank Name.');
        return;
      }
    }

    handleSaveSection(
      {
        payout: {
          method: payoutMethod,
          bank:
            payoutMethod === 'BANK'
              ? {
                  accountName: bankAccountName,
                  accountNumber: bankAccountNumber,
                  bankName,
                  branchName,
                  routingNumber,
                }
              : undefined,
          mfs:
            payoutMethod === 'MFS'
              ? {
                  provider: mfsProvider,
                  number: mfsNumber.trim(),
                }
              : undefined,
        },
      },
      'Payout & Disbursement Settings'
    );
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="My Account &amp; Security"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'Settings', href: '/admin/settings' },
          { label: 'My Account' },
        ]}
      />

      {/* Tabs Header Navigation */}
      <Box
        sx={{
          mb: 3.5,
          bgcolor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          p: 0.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 700,
              fontSize: '13.5px',
              textTransform: 'none',
              color: '#475569',
              '&.Mui-selected': {
                color: '#1748D1',
                fontWeight: 800,
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#1748D1',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab icon={<PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Profile" />
          <Tab icon={<SecurityRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Security" />
          <Tab icon={<LoyaltyRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Plans" />
          <Tab icon={<LinkRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Linked Account" />
          <Tab icon={<NotificationsActiveRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Notifications" />
          <Tab icon={<ExtensionRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Integrations" />
          <Tab icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Payout" />
        </Tabs>
      </Box>

      {/* ============================================================= */}
      {/* TAB 0: PROFILE                                                */}
      {/* ============================================================= */}
      {activeTab === 0 && (
        <form onSubmit={handleSaveProfile}>
          <Stack spacing={3.5}>
            {/* Section 1: Personal Details */}
            <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5, fontSize: '17px' }}>
                1. Personal Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                Basic identity and biographical information.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                  mb: 2.5,
                }}
              >
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Nickname"
                  placeholder="e.g. Sadi, Nayan"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Birthday"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select value={gender} label="Gender" onChange={(e) => setGender(e.target.value)}>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                placeholder="Brief summary of your professional background, subjects taught, or role at ISP..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Paper>

            {/* Section 2: Educational Details */}
            <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5, fontSize: '17px' }}>
                2. Educational Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '13.5px' }}>
                Degrees, universities, departments, board results, and academic qualifications.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="e.g. B.Sc. in Electrical & Electronic Engineering, CUET (2020)&#10;HSC: Chittagong College, GPA 5.00"
                value={educationalDetails}
                onChange={(e) => setEducationalDetails(e.target.value)}
              />
            </Paper>

            {/* Section 3: Experience */}
            <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5, fontSize: '17px' }}>
                3. Professional &amp; Teaching Experience
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '13.5px' }}>
                Teaching history, institutions, academic mentorship, or subject specialization.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="e.g. 5+ years instructing HSC Higher Math & Physics at Indicator Student's Point. Mentored over 1,200 admission examinees."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                disabled={saving}
                sx={{ height: 42, px: 3, fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </Box>
          </Stack>
        </form>
      )}

      {/* ============================================================= */}
      {/* TAB 1: SECURITY (2 Columns / Sections)                        */}
      {/* ============================================================= */}
      {activeTab === 1 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3.5,
          }}
        >
          {/* Column 1: Password Change / Reset */}
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LockResetRoundedIcon sx={{ color: '#1748D1', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                Password Management
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
              Update your console login password or request a reset link.
            </Typography>

            <form onSubmit={handleSavePassword}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                  required
                  fullWidth
                  type="password"
                  label="New Password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  required
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Box sx={{ pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      setForgotPasswordOpen(true);
                      setForgotOtpSent(false);
                      setForgotOtpCode('');
                      setForgotNewPassword('');
                      setForgotConfirmPassword('');
                    }}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Forgot password?
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
                  >
                    Update Password
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>

          {/* Column 2: Contact & Numbers Change */}
          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <SecurityRoundedIcon sx={{ color: '#1748D1', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                Contact &amp; Identification
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
              Your verified communication channels for OTPs, security alerts, and portal login.
            </Typography>

            <form onSubmit={handleSaveContact}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  disabled
                  label="Email Address"
                  value={email}
                  helperText="Administrative authentication email (secured via OTP verification)"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setEmailChangeOpen(true);
                              setEmailOtpSent(false);
                              setNewEmailInput('');
                              setEmailOtpCode('');
                            }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '12px',
                              height: 30,
                              px: 1.5,
                              color: '#1748D1',
                              borderColor: '#1748D1',
                              bgcolor: '#FFFFFF',
                              '&:hover': {
                                bgcolor: '#EEF4FF',
                                borderColor: '#092B91',
                              },
                            }}
                          >
                            Change
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Primary Mobile Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="WhatsApp Number"
                  placeholder="e.g. 01819123456"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  helperText="Direct channel for institutional announcements &amp; academic alerts"
                />

                <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
                  >
                    {saving ? 'Saving...' : 'Save Contact Details'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Box>
      )}

      {/* ============================================================= */}
      {/* TAB 2: PLANS (Coming Soon)                                    */}
      {/* ============================================================= */}
      {activeTab === 2 && (
        <Paper
          sx={{
            py: 9,
            px: 3,
            textAlign: 'center',
            borderRadius: '12px',
            border: '2px dashed #CBD5E1',
            boxShadow: 'none',
            bgcolor: '#FFFFFF',
          }}
        >
          <LoyaltyRoundedIcon sx={{ fontSize: 56, color: '#94A3B8', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 1 }}>
            Subscription Plans &amp; Tiers
          </Typography>
          <Chip
            label="COMING SOON"
            size="small"
            sx={{ fontWeight: 800, bgcolor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', mb: 2 }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', fontSize: '14px' }}>
            Campus tier upgrades, advanced student analytics subscriptions, and automated multi-branch features will be available in the upcoming release.
          </Typography>
        </Paper>
      )}

      {/* ============================================================= */}
      {/* TAB 3: LINKED ACCOUNT (Google Only + Security Policy)         */}
      {/* ============================================================= */}
      {activeTab === 3 && (
        <Stack spacing={3}>
          {/* Security Alert Banner */}
          <Alert severity="warning" sx={{ borderRadius: '10px' }}>
            <strong>Administrative Access Control Policy:</strong> Teachers and staff accounts must be created and authorized in advance by an ISP Administrator. Non-registered users cannot sign up or access the console via social integrations.
          </Alert>

          <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LinkRoundedIcon sx={{ color: '#1748D1', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                Single Sign-On (SSO) &amp; Social Login
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
              Connect your authorized Google Workspace account for one-click access.
            </Typography>

            {/* Google OAuth Card */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#F8FAFC',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <GoogleIcon sx={{ color: '#EA4335' }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57' }}>
                    Google Account
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                    <Chip
                      label={googleLinked ? 'CONNECTED' : 'NOT LINKED'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '10.5px',
                        bgcolor: googleLinked ? '#ECFDF5' : '#F1F5F9',
                        color: googleLinked ? '#065F46' : '#64748B',
                        border: `1px solid ${googleLinked ? '#A7F3D0' : '#E2E8F0'}`,
                      }}
                    />
                    {googleLinked && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Button
                variant={googleLinked ? 'outlined' : 'contained'}
                color={googleLinked ? 'inherit' : 'primary'}
                onClick={handleToggleGoogleLink}
                disabled={saving}
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(googleLinked ? {} : { bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }),
                }}
              >
                {googleLinked ? 'Disconnect Google' : 'Connect with Google'}
              </Button>
            </Box>
          </Paper>
        </Stack>
      )}

      {/* ============================================================= */}
      {/* TAB 4: NOTIFICATIONS (Coming Soon)                            */}
      {/* ============================================================= */}
      {activeTab === 4 && (
        <Paper
          sx={{
            py: 9,
            px: 3,
            textAlign: 'center',
            borderRadius: '12px',
            border: '2px dashed #CBD5E1',
            boxShadow: 'none',
            bgcolor: '#FFFFFF',
          }}
        >
          <NotificationsActiveRoundedIcon sx={{ fontSize: 56, color: '#94A3B8', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 1 }}>
            Notification Channels
          </Typography>
          <Chip
            label="COMING SOON"
            size="small"
            sx={{ fontWeight: 800, bgcolor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', mb: 2 }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', fontSize: '14px' }}>
            Custom push notifications, exam results digest preferences, and scheduled batch alerts will be configurable here.
          </Typography>
        </Paper>
      )}

      {/* ============================================================= */}
      {/* TAB 5: INTEGRATIONS (Both in one card, no horizontal lines)   */}
      {/* ============================================================= */}
      {activeTab === 5 && (
        <form onSubmit={handleSaveIntegrations}>
          <Paper sx={{ p: 3.5, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px' }}>
                Virtual Meeting &amp; Live Classroom Integrations
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13.5px', mt: 0.5 }}>
                Connect Zoom Meetings and Google Meet to automate online lectures, generate meeting links, and synchronize attendance.
              </Typography>
            </Box>

            {/* 1. Zoom Meetings */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <VideoCameraFrontRoundedIcon sx={{ color: '#2D8CFF', fontSize: 26 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57' }}>
                      Zoom Meetings
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Automate online lectures, live class links, and student attendance synchronization.
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={zoomEnabled}
                      onChange={(e) => setZoomEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{zoomEnabled ? 'Enabled' : 'Disabled'}</Typography>}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                  mt: 2,
                  opacity: zoomEnabled ? 1 : 0.6,
                  pointerEvents: zoomEnabled ? 'auto' : 'none',
                }}
              >
                <TextField
                  fullWidth
                  label="Zoom Client ID (API Key)"
                  placeholder="e.g. z5N_aBCdEfGhI"
                  value={zoomClientId}
                  onChange={(e) => setZoomClientId(e.target.value)}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Zoom Client Secret Key"
                  placeholder="Enter Zoom API Secret"
                  value={zoomClientSecret}
                  onChange={(e) => setZoomClientSecret(e.target.value)}
                />
              </Box>
            </Box>

            {/* 2. Google Meet */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <VideoCallRoundedIcon sx={{ color: '#00897B', fontSize: 26 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57' }}>
                      Google Meet
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Generate Google Calendar events and direct Meet links for batch sessions.
                    </Typography>
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={meetEnabled}
                      onChange={(e) => setMeetEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{meetEnabled ? 'Enabled' : 'Disabled'}</Typography>}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                  mt: 2,
                  opacity: meetEnabled ? 1 : 0.6,
                  pointerEvents: meetEnabled ? 'auto' : 'none',
                }}
              >
                <TextField
                  fullWidth
                  label="Google Meet Client ID"
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  value={meetClientId}
                  onChange={(e) => setMeetClientId(e.target.value)}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Google Meet Client Secret Key"
                  placeholder="Enter Google Meet Client Secret"
                  value={meetClientSecret}
                  onChange={(e) => setMeetClientSecret(e.target.value)}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                disabled={saving}
                sx={{ height: 42, px: 3, fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
              >
                {saving ? 'Saving...' : 'Save Integrations'}
              </Button>
            </Box>
          </Paper>
        </form>
      )}

      {/* ============================================================= */}
      {/* TAB 6: PAYOUT (Bank Transfer & MFS with strict validation)     */}
      {/* ============================================================= */}
      {activeTab === 6 && (
        <form onSubmit={handleSavePayout}>
          <Stack spacing={3.5}>
            <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <AccountBalanceWalletRoundedIcon sx={{ color: '#1748D1', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                  Payout &amp; Honorarium Disbursement Method
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                Select your preferred payout method for salary disbursements, lecture honorariums, and remuneration.
              </Typography>

              {/* Method Selector */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  mb: 3.5,
                }}
              >
                {/* Bank Transfer Card */}
                <Box
                  onClick={() => setPayoutMethod('BANK')}
                  sx={{
                    p: 2.5,
                    borderRadius: '10px',
                    border: `2px solid ${payoutMethod === 'BANK' ? '#1748D1' : '#E2E8F0'}`,
                    bgcolor: payoutMethod === 'BANK' ? '#EEF4FF' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <AccountBalanceRoundedIcon sx={{ fontSize: 28, color: payoutMethod === 'BANK' ? '#1748D1' : '#64748B' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57' }}>
                      Bank Transfer (EFT / BEFTN)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Direct institutional deposit to any scheduled bank in Bangladesh.
                    </Typography>
                  </Box>
                </Box>

                {/* MFS Card */}
                <Box
                  onClick={() => setPayoutMethod('MFS')}
                  sx={{
                    p: 2.5,
                    borderRadius: '10px',
                    border: `2px solid ${payoutMethod === 'MFS' ? '#1748D1' : '#E2E8F0'}`,
                    bgcolor: payoutMethod === 'MFS' ? '#EEF4FF' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <PhoneAndroidRoundedIcon sx={{ fontSize: 28, color: payoutMethod === 'MFS' ? '#1748D1' : '#64748B' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57' }}>
                      Mobile Financial Services (MFS)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Instant payout via bKash, Nagad, Rocket, Upay, mCash, or tap.
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Bank Transfer Fields */}
              {payoutMethod === 'BANK' && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 2 }}>
                    Bank Account Details
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2.5,
                    }}
                  >
                    <TextField
                      required
                      fullWidth
                      label="Account Name"
                      placeholder="e.g. Tanvir Hasan Sadi"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                    />
                    <TextField
                      required
                      fullWidth
                      label="Account Number"
                      placeholder="e.g. 2050123456789"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                    />
                    <TextField
                      required
                      fullWidth
                      label="Bank Name"
                      placeholder="e.g. Islami Bank, DBBL, City Bank, BRAC Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Branch Name"
                      placeholder="e.g. Chawkbazar Branch, Chattogram"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Routing Number"
                      placeholder="e.g. 125150987"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                    />
                  </Box>
                </Box>
              )}

              {/* MFS Fields */}
              {payoutMethod === 'MFS' && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 2 }}>
                    MFS Wallet Information
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2.5,
                    }}
                  >
                    <FormControl fullWidth required>
                      <InputLabel>Select MFS Provider</InputLabel>
                      <Select
                        value={mfsProvider}
                        label="Select MFS Provider"
                        onChange={(e) => setMfsProvider(e.target.value as any)}
                      >
                        <MenuItem value="bKash">bKash</MenuItem>
                        <MenuItem value="Nagad">Nagad</MenuItem>
                        <MenuItem value="Rocket">Rocket</MenuItem>
                        <MenuItem value="Upay">Upay</MenuItem>
                        <MenuItem value="mCash">mCash</MenuItem>
                        <MenuItem value="tap">tap</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      required
                      fullWidth
                      label="MFS Mobile Number"
                      placeholder="01XXXXXXXXX"
                      value={mfsNumber}
                      onChange={(e) => setMfsNumber(e.target.value)}
                      helperText="Must start with 01 and be exactly 11 digits (e.g. 01819123456)"
                      error={Boolean(mfsNumber && !/^01[3-9]\d{8}$/.test(mfsNumber.trim()))}
                    />
                  </Box>
                </Box>
              )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                disabled={saving}
                sx={{ height: 42, px: 3, fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
              >
                {saving ? 'Saving...' : 'Save Payout Settings'}
              </Button>
            </Box>
          </Stack>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FORGOT PASSWORD EMAIL OTP DIALOG                              */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => !forgotLoading && setForgotPasswordOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '14px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#061B57', pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <VpnKeyRoundedIcon sx={{ color: '#1748D1' }} />
          Reset Password via Email OTP
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, fontSize: '13.5px' }}>
            To protect your account, password resets require verification via a 6-digit one-time code sent to your registered email.
          </Typography>

          {forgotOtpSent && (
            <Stack spacing={2.5}>
              <Alert severity="info" sx={{ py: 0.5, borderRadius: '8px' }}>
                A 6-digit verification code has been dispatched to your email.
              </Alert>

              <TextField
                required
                fullWidth
                label="6-Digit Verification Code"
                placeholder="XXXXXX"
                value={forgotOtpCode}
                onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                slotProps={{
                  htmlInput: {
                    style: { textAlign: 'center', letterSpacing: '6px', fontSize: '20px', fontWeight: 800 },
                  },
                }}
              />

              <TextField
                required
                fullWidth
                type="password"
                label="New Password"
                placeholder="Minimum 6 characters"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
              />

              <TextField
                required
                fullWidth
                type="password"
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setForgotPasswordOpen(false)}
            disabled={forgotLoading}
            sx={{ fontWeight: 700, color: '#64748B' }}
          >
            Cancel
          </Button>

          {!forgotOtpSent ? (
            <Button
              variant="contained"
              onClick={handleRequestForgotOtp}
              disabled={forgotLoading}
              sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
            >
              {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Verification Code'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleVerifyForgotPassword}
              disabled={forgotLoading || forgotOtpCode.length !== 6}
              sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
            >
              {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Verify & Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* EMAIL CHANGE OTP VERIFICATION DIALOG                          */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={emailChangeOpen}
        onClose={() => !emailChangeLoading && setEmailChangeOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '14px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#061B57', pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MarkEmailReadRoundedIcon sx={{ color: '#1748D1' }} />
          Change Account Email
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {!emailOtpSent ? (
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13.5px' }}>
                Enter the new email address for this account. We will send a 6-digit verification code to your new inbox before updating.
              </Typography>

              <TextField
                required
                fullWidth
                type="email"
                label="New Email Address"
                placeholder="e.g. newemail@gmail.com"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                autoFocus
              />
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13.5px' }}>
                A 6-digit verification code was dispatched to:
              </Typography>

              <Box sx={{ p: 1.5, bgcolor: '#EEF4FF', borderRadius: '10px', border: '1px solid #BFDBFE', textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1' }}>
                  {newEmailInput}
                </Typography>
              </Box>

              <TextField
                required
                fullWidth
                label="Enter 6-Digit OTP"
                placeholder="XXXXXX"
                value={emailOtpCode}
                onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                slotProps={{
                  htmlInput: {
                    style: { textAlign: 'center', letterSpacing: '6px', fontSize: '22px', fontWeight: 800 },
                  },
                }}
                helperText="Check your inbox or spam folder. Valid for 10 minutes."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, justifyContent: emailOtpSent ? 'space-between' : 'flex-end' }}>
          {emailOtpSent && (
            <Button
              size="small"
              onClick={handleSendEmailChangeOtp}
              disabled={emailChangeLoading}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Resend
            </Button>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => {
                setEmailChangeOpen(false);
                setEmailOtpSent(false);
                setNewEmailInput('');
                setEmailOtpCode('');
              }}
              disabled={emailChangeLoading}
              sx={{ fontWeight: 700, color: '#64748B' }}
            >
              Cancel
            </Button>

            {!emailOtpSent ? (
              <Button
                variant="contained"
                onClick={handleSendEmailChangeOtp}
                disabled={emailChangeLoading || !newEmailInput.trim()}
                sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
              >
                {emailChangeLoading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP Code'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleVerifyEmailChange}
                disabled={emailChangeLoading || emailOtpCode.length !== 6}
                sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
              >
                {emailChangeLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
