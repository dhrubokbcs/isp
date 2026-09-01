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
} from '@mui/material';
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
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { ispColors } from '@/theme/colors';

const DRAWER_WIDTH = 270;

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

const navSections: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <DashboardRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
      {
        label: 'Teacher Portal',
        href: '/teacher/dashboard',
        icon: <SchoolRoundedIcon fontSize="small" />,
        roles: ['TEACHER'],
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
        roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'],
      },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      {
        label: 'Students',
        href: '/admin/people/students',
        icon: <PeopleAltRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'],
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
        label: 'Class Sessions',
        href: '/admin/operations/sessions',
        icon: <CalendarMonthRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'],
      },
      {
        label: 'Attendance',
        href: '/admin/operations/attendance',
        icon: <HowToRegRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'],
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
        roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'],
      },
      {
        label: 'Marks & Results',
        href: '/admin/examination/results',
        icon: <AssignmentRoundedIcon fontSize="small" />,
        roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'],
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
        roles: ['SUPERADMIN', 'ADMIN', 'TEACHER'],
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
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
  const [userName, setUserName] = React.useState('ISP Administrator');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Sync role from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('isp_console_role') as 'SUPERADMIN' | 'ADMIN' | 'TEACHER';
      if (storedRole) setUserRole(storedRole);

      const storedUser = localStorage.getItem('isp_console_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) setUserName(parsed.name);
        } catch {
          // ignore
        }
      }
    }
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

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box
        sx={{
          height: 68,
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
            bgcolor: ispColors.primary[500],
            color: '#FFFFFF',
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
            ISP Console
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
            Faculty &amp; Management
          </Typography>
        </Box>
      </Box>

      {/* Role Badge Indicator */}
      <Box sx={{ px: 2.5, py: 2, bgcolor: ispColors.background.default, borderBottom: `1px solid ${ispColors.border.subtle}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            LOGGED IN AS:
          </Typography>
          <Chip
            label={userRole}
            size="small"
            sx={{
              height: '22px',
              fontSize: '11px',
              fontWeight: 700,
              bgcolor: userRole === 'SUPERADMIN' ? '#FEF3C7' : ispColors.primary[100],
              color: userRole === 'SUPERADMIN' ? '#92400E' : ispColors.primary[800],
            }}
          />
        </Box>
      </Box>

      {/* Navigation Sections */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        {navSections.map((section, sIdx) => {
          // Filter items based on active role
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
                          bgcolor: isActive ? ispColors.primary[50] : 'transparent',
                          color: isActive ? ispColors.primary[700] : ispColors.text.primary,
                          '&:hover': {
                            bgcolor: isActive ? ispColors.primary[50] : ispColors.background.default,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            color: isActive ? ispColors.primary[600] : ispColors.text.secondary,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontSize: '14px', fontWeight: isActive ? 600 : 500 }}>
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
          <Avatar sx={{ width: 34, height: 34, bgcolor: ispColors.primary[500], fontSize: '14px', fontWeight: 600 }}>
            {userName.charAt(0)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>
              {userRole}
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
          height: 68,
          justifyContent: 'center',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { lg: 'none' } }}
            >
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px', color: 'text.primary' }}>
              Indicator Student&apos;s Point
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <NotificationsRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Chip
              label={userRole}
              size="small"
              sx={{
                height: 26,
                fontWeight: 600,
                fontSize: '12px',
                bgcolor: ispColors.primary[50],
                color: ispColors.primary[700],
              }}
            />

            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: ispColors.primary[600], fontSize: '14px', fontWeight: 600 }}>
                {userName.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: { width: 200, mt: 1, p: 0.5, borderRadius: '10px' },
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{userName}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{userRole} Account</Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main', minWidth: 28 }}>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                Sign Out
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
          p: { xs: 2.5, sm: 4 },
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '68px',
          minHeight: 'calc(100vh - 68px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
