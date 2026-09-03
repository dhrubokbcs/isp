'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Button,
  Stack,
  Container,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';

import { StudentSessionPayload } from '@/lib/auth/studentSession';
import { ispColors } from '@/theme/colors';

interface StudentAppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: 'Class Routine', href: '/dashboard#routine', icon: <CalendarMonthRoundedIcon fontSize="small" /> },
  { label: 'Exams & Results', href: '/dashboard#exams', icon: <AssignmentRoundedIcon fontSize="small" /> },
  { label: 'Fees & Payments', href: '/dashboard#fees', icon: <AccountBalanceWalletRoundedIcon fontSize="small" /> },
  { label: 'Notices', href: '/dashboard#notices', icon: <CampaignRoundedIcon fontSize="small" /> },
];

export default function StudentAppShell({ children }: StudentAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [student, setStudent] = React.useState<StudentSessionPayload | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Fetch student session profile
  React.useEffect(() => {
    fetch('/api/auth/student/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.student) {
          setStudent(data.student);
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/student/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Top Institutional Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#061B57',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64, display: 'flex', justifyContent: 'space-between' }}>
            {/* Left Brand */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  p: 0.8,
                  bgcolor: 'rgba(255, 210, 31, 0.15)',
                  color: '#FFD21F',
                  borderRadius: '10px',
                  display: 'flex',
                }}
              >
                <SchoolRoundedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, fontSize: '15px' }}>
                  INDICATOR STUDENT&apos;S POINT
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', letterSpacing: '0.5px', fontSize: '11px', display: 'block' }}>
                  Student Digital Campus Portal
                </Typography>
              </Box>
            </Stack>

            {/* Right Student Info & Actions */}
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {student && (
                <>
                  <Chip
                    label={`ID: ${student.studentId}`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 210, 31, 0.2)',
                      color: '#FFD21F',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: { xs: 'none', sm: 'inline-flex' },
                    }}
                  />
                  {student.batchName && (
                    <Chip
                      label={student.batchName}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '12px',
                        display: { xs: 'none', md: 'inline-flex' },
                      }}
                    />
                  )}
                </>
              )}

              <Tooltip title="Notifications">
                <IconButton size="small" sx={{ color: '#CBD5E1' }}>
                  <NotificationsNoneRoundedIcon />
                </IconButton>
              </Tooltip>

              {/* Avatar Dropdown Trigger */}
              <IconButton onClick={handleOpenMenu} sx={{ p: 0.5 }}>
                <Avatar
                  src={student?.avatarUrl}
                  sx={{
                    bgcolor: '#1748D1',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    width: 36,
                    height: 36,
                    fontSize: '14px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {student?.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                </Avatar>
              </IconButton>

              {/* Profile Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      minWidth: 240,
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      border: '1px solid #E2E8F0',
                      p: 1,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57' }}>
                    {student?.fullName || 'Student'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    ID: {student?.studentId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    {student?.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#DC2626', fontWeight: 600, fontSize: '13.5px', py: 1, borderRadius: '8px' }}>
                  <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </Container>

        {/* 2. Secondary Portal Navigation Bar */}
        <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Container maxWidth="xl">
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.8 }}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.href}
                    startIcon={item.icon}
                    sx={{
                      color: isActive ? '#FFD21F' : '#E2E8F0',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '13px',
                      textTransform: 'none',
                      px: 2,
                      py: 0.6,
                      borderRadius: '6px',
                      bgcolor: isActive ? 'rgba(255, 210, 31, 0.15)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Container>
        </Box>
      </AppBar>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 2.5, sm: 4 } }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 3, borderTop: '1px solid #E2E8F0', bgcolor: '#FFFFFF', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          Indicator Student&apos;s Point (ISP) &bull; Chawkbazar, Chattogram &bull; Student Digital Campus
        </Typography>
      </Box>
    </Box>
  );
}
