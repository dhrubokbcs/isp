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
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { ispColors } from '@/theme/colors';
import { authenticateUser } from '@/lib/db/users';

export default function ConsoleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('sadiworkmail@gmail.com');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate against User Database / Supabase Auth
      const authResult = authenticateUser(email, password);

      if (!authResult.success) {
        setError(authResult.error);
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
                    onClick={() => alert('Please contact the ISP Superadmin to reset your staff credentials.')}
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
    </Box>
  );
}
