'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

import { createClient } from '@/utils/supabase/client';

function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');
  const errorEmail = searchParams.get('email');

  const [studentId, setStudentId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [focusedField, setFocusedField] = React.useState<'id' | 'password' | null>(null);

  React.useEffect(() => {
    if (oauthError === 'not_enrolled') {
      setErrorMsg(
        `No enrolled student found for Google account (${errorEmail || 'your email'}). Please sign in using your permanent Student ID, or contact administration.`
      );
    } else if (oauthError === 'oauth_failed') {
      setErrorMsg('Google authentication was cancelled or failed. Please try again.');
    }
  }, [oauthError, errorEmail]);

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setErrorMsg(err.message || 'Failed to initiate Google sign-in.');
      setGoogleLoading(false);
    }
  };

  // Student ID & Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password) {
      setErrorMsg('Please enter both your Student ID and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Success -> Redirect to Student Dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 460,
        width: '100%',
        borderRadius: '28px',
        bgcolor: 'rgba(6, 27, 87, 0.85)',
        backdropFilter: 'blur(28px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
        {/* Header Title */}
        <Box sx={{ mb: 3.2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.8, letterSpacing: '-0.02em', fontSize: { xs: '22px', sm: '24px' } }}>
            Student Sign In
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '13.5px', lineHeight: 1.5 }}>
            Sign in with your permanent Student ID to access your portal, class routines, and test results.
          </Typography>
        </Box>

        {/* Error Alert */}
        {errorMsg && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '14px',
              fontSize: '13px',
              lineHeight: 1.5,
              bgcolor: 'rgba(239, 68, 68, 0.15)',
              color: '#FECACA',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              '& .MuiAlert-icon': { color: '#F87171' },
            }}
          >
            {errorMsg}
          </Alert>
        )}

        {/* 1. Google OAuth Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          startIcon={
            googleLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )
          }
          sx={{
            py: 1.35,
            bgcolor: '#FFFFFF',
            color: '#061B57',
            fontWeight: 800,
            fontSize: '14px',
            borderRadius: '14px',
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            '&:hover': {
              bgcolor: '#F1F5F9',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            },
          }}
        >
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </Button>

        {/* Divider */}
        <Divider sx={{ my: 2.8, borderColor: 'rgba(255, 255, 255, 0.14)' }}>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.8px', px: 1 }}>
            OR SIGN IN WITH STUDENT ID
          </Typography>
        </Divider>

        {/* 2. Redesigned Student ID & Password Form */}
        <form onSubmit={handlePasswordLogin}>
          <Stack spacing={2.4}>
            {/* Student ID Field */}
            <Box>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: 0.8 }}>
                <PersonRoundedIcon sx={{ fontSize: 16, color: focusedField === 'id' ? '#FFD21F' : '#94A3B8', transition: 'color 0.2s' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: focusedField === 'id' ? '#FFD21F' : '#CBD5E1',
                    letterSpacing: '0.5px',
                    fontSize: '11.5px',
                    transition: 'color 0.2s',
                  }}
                >
                  STUDENT ID
                </Typography>
              </Stack>
              <TextField
                fullWidth
                required
                placeholder="Enter 8-digit Student ID (e.g. 20280001)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onFocus={() => setFocusedField('id')}
                onBlur={() => setFocusedField(null)}
                disabled={loading || googleLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: focusedField === 'id' ? 'rgba(255, 210, 31, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: focusedField === 'id' ? '#FFD21F' : '#94A3B8',
                            mr: 0.5,
                            transition: 'all 0.2s',
                          }}
                        >
                          <BadgeRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    bgcolor: 'rgba(2, 12, 38, 0.5)',
                    backdropFilter: 'blur(10px)',
                    color: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    letterSpacing: '0.3px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.35)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(255, 210, 31, 0.15), 0 8px 20px rgba(0, 0, 0, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFD21F',
                      borderWidth: '1.5px',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    opacity: 1,
                    fontSize: '13.5px',
                  },
                }}
              />
            </Box>

            {/* Password Field */}
            <Box>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: 0.8 }}>
                <KeyRoundedIcon sx={{ fontSize: 16, color: focusedField === 'password' ? '#FFD21F' : '#94A3B8', transition: 'color 0.2s' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: focusedField === 'password' ? '#FFD21F' : '#CBD5E1',
                    letterSpacing: '0.5px',
                    fontSize: '11.5px',
                    transition: 'color 0.2s',
                  }}
                >
                  PASSWORD
                </Typography>
              </Stack>
              <TextField
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your student password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={loading || googleLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: focusedField === 'password' ? 'rgba(255, 210, 31, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: focusedField === 'password' ? '#FFD21F' : '#94A3B8',
                            mr: 0.5,
                            transition: 'all 0.2s',
                          }}
                        >
                          <LockRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: showPassword ? '#FFD21F' : 'rgba(255, 255, 255, 0.5)',
                            '&:hover': {
                              color: '#FFFFFF',
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    bgcolor: 'rgba(2, 12, 38, 0.5)',
                    backdropFilter: 'blur(10px)',
                    color: '#FFFFFF',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    letterSpacing: '0.3px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.14)',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.35)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(255, 210, 31, 0.15), 0 8px 20px rgba(0, 0, 0, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFD21F',
                      borderWidth: '1.5px',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    opacity: 1,
                    fontSize: '13.5px',
                  },
                }}
              />
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || googleLoading}
              endIcon={!loading && <ArrowForwardRoundedIcon />}
              sx={{
                py: 1.45,
                mt: 0.5,
                bgcolor: '#FFD21F',
                color: '#061B57',
                fontWeight: 800,
                fontSize: '15px',
                borderRadius: '14px',
                textTransform: 'none',
                boxShadow: '0 4px 18px rgba(255, 210, 31, 0.35)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#F5C518',
                  boxShadow: '0 8px 24px rgba(255, 210, 31, 0.5)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#061B57' }} /> : 'Onboard'}
            </Button>
          </Stack>
        </form>

        {/* Help & Support Footer */}
        <Box
          sx={{
            mt: 3.2,
            pt: 2.5,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            textAlign: 'center',
          }}
        >
          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <HelpOutlineRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '12.5px' }}>
              Need assistance or forgot your password?
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: '#FFD21F', fontWeight: 700, display: 'block', mt: 0.3 }}>
            Contact ISP Campus Desk at 01800-000000
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', md: 'flex-end' },
        pr: { xs: 2, sm: 4, md: 8, lg: 12 },
        pl: { xs: 2, sm: 4, md: 4 },
        py: { xs: 4, md: 6 },
        backgroundImage: `url('/images/login-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <React.Suspense
        fallback={
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#FFFFFF' }} />
          </Box>
        }
      >
        <StudentLoginForm />
      </React.Suspense>
    </Box>
  );
}
