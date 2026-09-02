'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import { ispColors } from '@/theme/colors';

export default function ConsoleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('sadiworkmail@gmail.com');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Forgot Password Modal State
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotOtpSent, setForgotOtpSent] = React.useState(false);
  const [forgotOtpCode, setForgotOtpCode] = React.useState('');
  const [forgotNewPassword, setForgotNewPassword] = React.useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = React.useState('');
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [forgotMessage, setForgotMessage] = React.useState<string | null>(null);
  const [forgotError, setForgotError] = React.useState<string | null>(null);

  const handleSendForgotOtp = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), purpose: 'PASSWORD_RESET' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }
      setForgotOtpSent(true);
      setForgotMessage(`6-digit code sent to ${forgotEmail}. Check your inbox or spam folder.`);
    } catch (err: any) {
      setForgotError(err.message || 'Error sending verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyResetPassword = async () => {
    if (!forgotOtpCode || forgotOtpCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit code sent to your email.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: forgotOtpCode.trim(),
          purpose: 'PASSWORD_RESET',
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }
      setPassword(forgotNewPassword);
      setEmail(forgotEmail);
      setForgotOpen(false);
      alert('Password reset successfully! You can now log in.');
    } catch (err: any) {
      setForgotError(err.message || 'Error resetting password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate against Supabase Database with bcrypt password verification
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const authResult = await res.json();

      if (!res.ok || !authResult.success) {
        setError(authResult.error || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      const { user } = authResult;

      // 2. Reject student / guardian on console subdomain
      if (user.role === 'STUDENT' || user.role === 'GUARDIAN') {
        setError(
          `${user.role === 'STUDENT' ? 'Student' : 'Guardian'} access is not permitted on this console. Please sign in via the student & guardian portal at ispctg.live`
        );
        setLoading(false);
        return;
      }

      // 3. Persist verified session in client storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('isp_console_role', user.role);
        localStorage.setItem(
          'isp_console_user',
          JSON.stringify({
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
          })
        );
      }

      // 4. Automatic redirection to respective portal based on resolved role
      if (user.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else {
        // SUPERADMIN or ADMIN
        router.push('/admin/dashboard');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: ispColors.background.default,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: '16px',
          border: `1px solid ${ispColors.border.default}`,
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
          bgcolor: '#FFFFFF',
        }}
      >
        <CardContent sx={{ p: { xs: 3.5, sm: 5 } }}>
          {/* Brand Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '16px',
                bgcolor: ispColors.primary[600],
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '24px',
                mb: 2,
                boxShadow: `0 6px 16px ${ispColors.primary[200]}`,
              }}
            >
              ISP
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: ispColors.primary[900], mb: 0.5, letterSpacing: '-0.02em' }}>
              Indicator Student&apos;s Point
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '15px' }}>
              Login in your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontSize: '14px' }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary', fontSize: '14px' }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '14px' }}>
                    Password
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: ispColors.primary[600], cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotEmail(email);
                      setForgotOtpSent(false);
                      setForgotOtpCode('');
                      setForgotMessage(null);
                      setForgotError(null);
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  height: 50,
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  mt: 1,
                  boxShadow: `0 4px 14px ${ispColors.primary[300]}`,
                  '&:hover': {
                    boxShadow: `0 6px 18px ${ispColors.primary[400]}`,
                  },
                }}
              >
                {loading ? 'Onboarding...' : 'Onboard'}
              </Button>
            </Stack>
          </form>

        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* FORGOT PASSWORD EMAIL OTP MODAL                               */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={forgotOpen}
        onClose={() => !forgotLoading && setForgotOpen(false)}
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
            Enter your registered staff email address to receive a secure 6-digit verification code.
          </Typography>

          {forgotError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {forgotError}
            </Alert>
          )}

          {forgotMessage && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
              {forgotMessage}
            </Alert>
          )}

          {!forgotOtpSent ? (
            <TextField
              required
              fullWidth
              type="email"
              label="Registered Email Address"
              placeholder="e.g. sadiworkmail@gmail.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <Stack spacing={2.5}>
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
            onClick={() => setForgotOpen(false)}
            disabled={forgotLoading}
            sx={{ fontWeight: 700, color: '#64748B' }}
          >
            Cancel
          </Button>

          {!forgotOtpSent ? (
            <Button
              variant="contained"
              onClick={handleSendForgotOtp}
              disabled={forgotLoading}
              sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
            >
              {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Code'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleVerifyResetPassword}
              disabled={forgotLoading || forgotOtpCode.length !== 6}
              sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
            >
              {forgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
