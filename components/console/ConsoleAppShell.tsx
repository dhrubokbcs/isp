'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import { ispColors } from '@/theme/colors';

const DRAWER_WIDTH = 270;
const HEADER_HEIGHT = 64;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ('SUPERADMIN' | 'ADMIN' | 'TEACHER')[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// 1. Dedicated Teacher Navigation (Dashboard & Settings Only)
const teacherNavSections: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/teacher/dashboard',
        icon: <DashboardRoundedIcon fontSize="small" />,
        roles: ['TEACHER'],
      },
      {
        label: 'Settings',
        href: '/teacher/settings',
        icon: <SettingsRoundedIcon fontSize="small" />,
        roles: ['TEACHER'],
      },
    ],
  },
];

// 2. Admin & Management Navigation Sections
const adminNavSections: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <DashboardRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
  {
    title: 'ACADEMIC',
    items: [
      {
        label: 'Academic Years',
        href: '/admin/academics/years',
        icon: <CalendarMonthRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Programs',
        href: '/admin/academics/programs',
        icon: <SchoolRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Class Levels',
        href: '/admin/academics/classes',
        icon: <ClassRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Batches',
        href: '/admin/academics/batches',
        icon: <PeopleAltRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Subjects',
        href: '/admin/academics/subjects',
        icon: <MenuBookRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Rooms & Labs',
        href: '/admin/academics/rooms',
        icon: <MeetingRoomRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Timetable',
        href: '/admin/academics/timetable',
        icon: <AccessTimeRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      {
        label: 'Users',
        href: '/admin/people/users',
        icon: <ManageAccountsRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Students',
        href: '/admin/people/students',
        icon: <PeopleAltRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Teachers',
        href: '/admin/people/teachers',
        icon: <SchoolRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Guardians',
        href: '/admin/people/guardians',
        icon: <SecurityRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
  {
    title: 'ACADEMIC OPERATIONS',
    items: [
      {
        label: 'Faculty Attendance',
        href: '/admin/operations/faculty-attendance',
        icon: <CoPresentRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Student Attendance',
        href: '/admin/operations/attendance',
        icon: <HowToRegRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Class Sessions',
        href: '/admin/operations/sessions',
        icon: <CalendarMonthRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
  {
    title: 'EXAMINATION',
    items: [
      {
        label: 'Exams & Schedules',
        href: '/admin/examination/exams',
        icon: <AssignmentRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Marks & Results',
        href: '/admin/examination/results',
        icon: <AssignmentRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      {
        label: 'Fee Structures',
        href: '/admin/finance/structures',
        icon: <PaymentsRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Student Fees',
        href: '/admin/finance/student-fees',
        icon: <PaymentsRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Payments & Receipts',
        href: '/admin/finance/payments',
        icon: <PaymentsRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      {
        label: 'Notices',
        href: '/admin/communication/notices',
        icon: <CampaignRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: <SettingsRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Audit Logs',
        href: '/admin/system/audit-logs',
        icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN'],
      },
    ],
  },
];

export default function ConsoleAppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'SUPERADMIN' | 'ADMIN' | 'TEACHER'>('ADMIN');
  const [userName, setUserName] = React.useState('ISP User');
  const [userDesignation, setUserDesignation] = React.useState('Faculty Member');
  const [userEmployeeId, setUserEmployeeId] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Check if currently on Teacher Portal routes
  const isTeacherPortal = userRole === 'TEACHER' || pathname.startsWith('/teacher') || pathname.startsWith('/console/teacher');

  // Live sync user name, role, designation, and employee ID
  React.useEffect(() => {
    const fetchLiveAccount = async () => {
      try {
        let query = '';
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('isp_console_user');
          const storedRole = localStorage.getItem('isp_console_role');
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              if (parsed.id) query = `?userId=${parsed.id}`;
            } catch {
              // ignore
            }
          }
          if (!query && storedRole) {
            query = `?role=${storedRole}`;
          } else if (!query && (pathname.startsWith('/teacher') || pathname.startsWith('/console/teacher'))) {
            query = '?role=TEACHER';
          }
        }

        const res = await fetch(`/api/account${query}`);
        const data = await res.json();
        if (res.ok && data.success && data.account) {
          const acc = data.account;
          if (acc.fullName) {
            setUserName(acc.fullName);
            if (typeof window !== 'undefined') {
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
                  designation: acc.designation,
                  employeeId: acc.employeeId,
                })
              );
            }
          }
          if (acc.role) {
            setUserRole(acc.role);
            if (typeof window !== 'undefined') {
              localStorage.setItem('isp_console_role', acc.role);
            }
          }
          if (acc.designation) setUserDesignation(acc.designation);
          if (acc.employeeId) setUserEmployeeId(acc.employeeId);
          if (acc.email) setUserEmail(acc.email);
        }
      } catch (err) {
        console.warn('Could not sync live user account in header:', err);
      }
    };

    // 1. Initial immediate load from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('isp_console_role') as 'SUPERADMIN' | 'ADMIN' | 'TEACHER';
      if (storedRole) setUserRole(storedRole);

      const storedUser = localStorage.getItem('isp_console_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.role) setUserRole(parsed.role);
          if (parsed.designation) setUserDesignation(parsed.designation);
          if (parsed.employeeId) setUserEmployeeId(parsed.employeeId);
          if (parsed.email) setUserEmail(parsed.email);
        } catch {
          // ignore
        }
      }
    }

    // 2. Fetch live data from Supabase DB
    fetchLiveAccount();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isp_console_role');
      localStorage.removeItem('isp_console_user');
    }
    setAnchorEl(null);
    router.push('/login');
  };

  // Determine active nav sections: Dedicated Teacher Nav vs Admin Nav
  const activeSections = isTeacherPortal ? teacherNavSections : adminNavSections;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box
        sx={{
          height: HEADER_HEIGHT,
          minHeight: `${HEADER_HEIGHT}px`,
          maxHeight: `${HEADER_HEIGHT}px`,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          px: 3,
          borderBottom: `1px solid ${ispColors.border.default}`,
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '9px',
            bgcolor: isTeacherPortal ? '#061B57' : ispColors.primary[500],
            color: isTeacherPortal ? '#FFD21F' : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '17px',
          }}
        >
          ISP
        </Box>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary', fontSize: '15px' }}>
            {isTeacherPortal ? 'Teacher Portal' : 'ISP Console'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
            {isTeacherPortal ? 'Faculty Workspace' : 'Management & Ops'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Sections */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        {activeSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <Box key={sIdx} sx={{ mb: 2 }}>
              {section.title && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'text.disabled',
                    letterSpacing: '0.06em',
                  }}
                >
                  {section.title}
                </Typography>
              )}
              <List disablePadding>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        onClick={() => !isDesktop && setMobileOpen(false)}
                        sx={{
                          borderRadius: '8px',
                          py: 1,
                          px: 1.5,
                          minHeight: '40px',
                          bgcolor: isActive ? (isTeacherPortal ? '#EEF4FF' : ispColors.primary[50]) : 'transparent',
                          color: isActive ? '#1748D1' : ispColors.text.primary,
                          '&:hover': {
                            bgcolor: isActive ? '#EEF4FF' : ispColors.background.default,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            color: isActive ? '#1748D1' : ispColors.text.secondary,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }}>
                              {item.label}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* Bottom Profile Summary & Logout */}
      <Box sx={{ p: 2, borderTop: `1px solid ${ispColors.border.default}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: isTeacherPortal ? '#061B57' : ispColors.primary[500], color: isTeacherPortal ? '#FFD21F' : '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>
            {userName.charAt(0)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', display: 'block' }}>
              {isTeacherPortal ? (userEmployeeId || 'Faculty Member') : userRole}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Sign Out">
          <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: ispColors.background.default }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          bgcolor: '#FFFFFF',
          color: 'text.primary',
          borderBottom: `1px solid ${ispColors.border.default}`,
          boxShadow: 'none',
          height: HEADER_HEIGHT,
          boxSizing: 'border-box',
          justifyContent: 'center',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            height: HEADER_HEIGHT,
            minHeight: `${HEADER_HEIGHT}px !important`,
            maxHeight: `${HEADER_HEIGHT}px`,
            px: { xs: 2, sm: 3 },
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { lg: 'none' } }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '18px', color: '#061B57' }}>
              {isTeacherPortal ? 'Teacher Portal' : 'Indicator Student\'s Point'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <NotificationsRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Top Nav Avatar Button */}
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isTeacherPortal ? '#061B57' : ispColors.primary[600],
                  color: isTeacherPortal ? '#FFD21F' : '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: isTeacherPortal ? '2px solid rgba(255, 210, 31, 0.4)' : 'none',
                }}
              >
                {userName.charAt(0)}
              </Avatar>
            </IconButton>

            {/* Top Nav Avatar Dropdown Menu (Configured for Teacher Account) */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: { width: 280, mt: 1, p: 0.8, borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' },
                },
              }}
            >
              {/* Header: Teacher Avatar, Full Name, Designation & Badges */}
              <Box sx={{ px: 1.5, py: 1.2, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: isTeacherPortal ? '#061B57' : ispColors.primary[600],
                    color: isTeacherPortal ? '#FFD21F' : '#FFFFFF',
                    fontSize: '18px',
                    fontWeight: 800,
                    mt: 0.2,
                  }}
                >
                  {userName.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: '#061B57', fontSize: '14.5px', lineHeight: 1.2 }}>
                    {userName}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ color: '#64748B', fontSize: '12px', display: 'block', mt: 0.2 }}>
                    {isTeacherPortal ? userDesignation : (userEmail || 'Administrator')}
                  </Typography>
                  <Stack direction="row" spacing={0.6} sx={{ mt: 0.8 }}>
                    <Chip
                      label={isTeacherPortal ? 'FACULTY' : userRole}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '10px',
                        fontWeight: 800,
                        bgcolor: '#EEF4FF',
                        color: '#1748D1',
                        borderRadius: '4px',
                        border: '1px solid #BFDBFE',
                        letterSpacing: '0.5px',
                      }}
                    />
                    {isTeacherPortal && userEmployeeId && (
                      <Chip
                        icon={<BadgeRoundedIcon sx={{ fontSize: '12px !important', color: '#061B57 !important' }} />}
                        label={userEmployeeId}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '10px',
                          fontWeight: 800,
                          bgcolor: '#FFD21F',
                          color: '#061B57',
                          borderRadius: '4px',
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Menu Item 1: Dashboard */}
              <MenuItem
                component={Link}
                href={isTeacherPortal ? '/teacher/dashboard' : '/admin/dashboard'}
                onClick={() => setAnchorEl(null)}
                sx={{ fontWeight: 600, fontSize: '13.5px', py: 1, borderRadius: '8px' }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: '#1748D1' }}>
                  <DashboardRoundedIcon fontSize="small" />
                </ListItemIcon>
                Dashboard
              </MenuItem>

              {/* Menu Item 2: Account & Security */}
              <MenuItem
                component={Link}
                href={isTeacherPortal ? '/teacher/settings' : '/admin/account'}
                onClick={() => setAnchorEl(null)}
                sx={{ fontWeight: 600, fontSize: '13.5px', py: 1, borderRadius: '8px' }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: '#1748D1' }}>
                  <ManageAccountsRoundedIcon fontSize="small" />
                </ListItemIcon>
                Account &amp; Security
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              {/* Menu Item 3: Logout */}
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600, fontSize: '13.5px', py: 1, borderRadius: '8px' }}>
                <ListItemIcon sx={{ color: 'error.main', minWidth: 28 }}>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${ispColors.border.default}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Persistent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${ispColors.border.default}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: `${HEADER_HEIGHT}px`,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <Box sx={{ flexGrow: 1, p: { xs: 2.5, sm: 4 } }}>
          {children}
        </Box>

        {/* Small Height Console Footer */}
        <Box
          component="footer"
          sx={{
            py: 1.5,
            px: { xs: 2.5, sm: 4 },
            borderTop: `1px solid ${ispColors.border.default}`,
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '12.5px',
            }}
          >
            A product of OGIT
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '12.5px' }}>
              Built with
            </Typography>
            <FavoriteRoundedIcon sx={{ fontSize: 13, color: '#EF4444', mx: 0.2 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '12.5px' }}>
              by
            </Typography>
            <MuiLink
              href="https://web.sadi.com.bd"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '12.5px',
                transition: 'color 0.2s',
                '&:hover': {
                  color: ispColors.primary[600],
                },
              }}
            >
              Sadi Jubair
            </MuiLink>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
