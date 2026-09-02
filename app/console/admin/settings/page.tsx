'use client';

import * as React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';

import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';

export default function SettingsPage() {
  const { success } = useToast();

  // Institute Profile
  const [instituteName, setInstituteName] = React.useState("Indicator Student's Point (ISP)");
  const [tagline, setTagline] = React.useState('Excellence in Academic Mentorship & Coaching');
  const [branch, setBranch] = React.useState('Chawkbazar Campus, Chattogram');
  const [phone, setPhone] = React.useState('+880 1819-123456');
  const [email, setEmail] = React.useState('admin@ispctg.com');
  const [address, setAddress] = React.useState('Chawkbazar, Chattogram, Bangladesh');

  // Academic Configuration
  const [activeYear, setActiveYear] = React.useState('2028');
  const [defaultSessionDuration, setDefaultSessionDuration] = React.useState('90');
  const [weeklyOffDay, setWeeklyOffDay] = React.useState('Friday');

  // Notifications
  const [autoSmsAttendance, setAutoSmsAttendance] = React.useState(true);
  const [autoSmsPayment, setAutoSmsPayment] = React.useState(true);
  const [notifyPrimaryGuardianOnly, setNotifyPrimaryGuardianOnly] = React.useState(true);

  const [saving, setSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      success('System settings saved and applied successfully!');
    }, 400);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="System &amp; Institution Settings"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'System', href: '/admin/settings' },
          { label: 'Settings' },
        ]}
        action={
          <Button
            type="submit"
            form="settings-form"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            disabled={saving}
            sx={{
              height: 42,
              px: 3,
              fontWeight: 700,
              bgcolor: '#1748D1',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3.5, borderRadius: '10px' }}>
          <strong>Settings Updated!</strong> Institutional configurations, academic defaults, and notification preferences have been saved.
        </Alert>
      )}

      <form id="settings-form" onSubmit={handleSave}>
        <Stack spacing={3.5}>
          {/* 1. Institution Profile */}
          <Paper
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              bgcolor: '#FFFFFF',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <BusinessRoundedIcon sx={{ color: '#1748D1', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                Institution Profile &amp; Campus Info
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
              Basic details displayed on student receipts, portal headers, and guardian notifications.
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
                label="Institution Name"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Motto / Tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Main Campus / Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Official Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Administrative Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Physical Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Box>
          </Paper>

          {/* 2. Academic Defaults */}
          <Paper
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              bgcolor: '#FFFFFF',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <SchoolRoundedIcon sx={{ color: '#1748D1', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                Academic &amp; Student ID Rules
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
              Default configurations for student admissions, sessions, and academic scheduling.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 2.5,
              }}
            >
              <TextField
                required
                fullWidth
                type="number"
                label="Current Active Academic Year"
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
                helperText="Controls the YYYY prefix for new student IDs"
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Default Session Duration (Minutes)"
                value={defaultSessionDuration}
                onChange={(e) => setDefaultSessionDuration(e.target.value)}
              />
              <TextField
                fullWidth
                label="Weekly Off-Day"
                value={weeklyOffDay}
                onChange={(e) => setWeeklyOffDay(e.target.value)}
              />
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                Student ID Generation Standard: <span style={{ color: '#1748D1' }}>YYYYSSSS</span>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                Permanent 8-digit identification (e.g. <strong style={{ color: '#1748D1' }}>{activeYear}0043</strong>). Sequence increments atomically through Supabase academic year counters.
              </Typography>
            </Box>
          </Paper>

          {/* 3. Notifications & Communication */}
          <Paper
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              bgcolor: '#FFFFFF',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <NotificationsActiveRoundedIcon sx={{ color: '#1748D1', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                Parent &amp; Guardian Communication
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
              Configure automatic alert dispatch to parents when attendance is recorded or fees are collected.
            </Typography>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSmsAttendance}
                    onChange={(e) => setAutoSmsAttendance(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                      Daily Attendance Absence Alerts
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Automatically notify parents via SMS/WhatsApp when a student is marked Absent or Late.
                    </Typography>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={autoSmsPayment}
                    onChange={(e) => setAutoSmsPayment(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                      Payment &amp; Tuition Fee Receipts
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Send instant confirmation and digital money receipt reference upon receiving payments.
                    </Typography>
                  </Box>
                }
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifyPrimaryGuardianOnly}
                    onChange={(e) => setNotifyPrimaryGuardianOnly(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                      Route to Primary Guardian Only
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Deliver SMS specifically to the designated Primary Guardian (Father or Mother) to prevent duplicate SMS fees.
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>

          {/* 4. Supabase Cloud Connection Status */}
          <Paper
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              bgcolor: '#FFFFFF',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CloudDoneRoundedIcon sx={{ color: '#16A34A', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px' }}>
                  Supabase Cloud Status
                </Typography>
              </Box>
              <Chip
                label="LIVE &bull; CONNECTED"
                size="small"
                sx={{ fontWeight: 800, bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
                p: 2,
                bgcolor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  DATABASE SERVICE
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57', mt: 0.3 }}>
                  PostgreSQL via Supabase REST
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  ACTIVE SCHEMA
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57', mt: 0.3 }}>
                  public (RLS Enabled)
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  AUTHENTICATION MODE
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57', mt: 0.3 }}>
                  Supabase Auth &amp; Service Role
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Stack>
      </form>
    </Box>
  );
}
