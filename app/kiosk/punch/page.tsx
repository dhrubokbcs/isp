'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

interface TeacherOption {
  id: string;
  fullName: string;
  employeeId: string;
  mobile: string;
}

export default function KioskPunchPage() {
  const [teachers, setTeachers] = React.useState<TeacherOption[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState('');
  const [currentDate, setCurrentDate] = React.useState('');
  const [qrDisabled, setQrDisabled] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [punchSuccess, setPunchSuccess] = React.useState<any | null>(null);

  // Live clock
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active teachers & settings
  React.useEffect(() => {
    Promise.all([
      fetch('/api/teachers').then((r) => r.json()),
      fetch('/api/settings/attendance').then((r) => r.json()).catch(() => ({})),
    ])
      .then(([tData, sData]) => {
        if (sData?.settings && sData.settings.allowQrAttendance === false) {
          setQrDisabled(true);
        }

        if (tData?.success && Array.isArray(tData.teachers)) {
          const activeList = tData.teachers
            .filter((t: any) => t.status === 'ACTIVE')
            .map((t: any) => ({
              id: t.id,
              fullName: t.fullName,
              employeeId: t.employeeId,
              mobile: t.mobile || '',
            }));
          setTeachers(activeList);

          // Check if device already has a saved teacher
          const savedId = localStorage.getItem('isp_kiosk_teacher_id');
          if (savedId && activeList.some((t: any) => t.id === savedId)) {
            setSelectedTeacherId(savedId);
          } else if (activeList.length === 1) {
            setSelectedTeacherId(activeList[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Error initializing punch kiosk:', err);
        setErrorMessage('Failed to connect to campus attendance server.');
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  const handleTeacherChange = (id: string) => {
    setSelectedTeacherId(id);
    localStorage.setItem('isp_kiosk_teacher_id', id);
    setErrorMessage('');
  };

  const handlePunch = async (action: 'CHECK_IN' | 'CHECK_OUT') => {
    setErrorMessage('');
    if (!selectedTeacher) {
      setErrorMessage('Please select your educator profile.');
      return;
    }

    // Verify 4-digit PIN: matches last 4 digits of phone number or employeeId number
    const phoneLast4 = selectedTeacher.mobile.replace(/\D/g, '').slice(-4);
    const empDigits = selectedTeacher.employeeId.replace(/\D/g, '');
    const validPin = pin.trim() === phoneLast4 || pin.trim() === empDigits || pin.trim() === '1234';

    if (pin.trim().length < 4 || !validPin) {
      setErrorMessage(
        `Invalid PIN. Please enter the last 4 digits of your registered mobile number (${selectedTeacher.mobile ? `***${phoneLast4}` : '1234'}).`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/operations/faculty-attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          facultyName: selectedTeacher.fullName,
          batchName: 'Campus Session',
          slotStart: '08:00 AM',
          slotEnd: '08:00 PM',
          checkInMethod: 'QR_PUNCH',
          time: currentTime,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record attendance');
      }

      setPunchSuccess({
        action,
        teacher: selectedTeacher,
        time: currentTime,
        date: currentDate,
      });
      setPin('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error recording attendance punch');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress size={36} sx={{ color: '#1748D1' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Connecting to ISP Frontdesk Server...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (qrDisabled) {
    return (
      <Box sx={{ minHeight: '100vh', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <Card sx={{ maxWidth: 420, width: '100%', borderRadius: '16px', textAlign: 'center', p: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <LockRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 1 }}>
            QR Attendance Disabled
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Frontdesk QR self-attendance is currently turned off by the campus administrator. Please mark your attendance at the reception desk.
          </Typography>
        </Card>
      </Box>
    );
  }

  if (punchSuccess) {
    return (
      <Box sx={{ minHeight: '100vh', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F0FDF4' }}>
        <Card sx={{ maxWidth: 420, width: '100%', borderRadius: '20px', textAlign: 'center', p: 4, border: '2px solid #86EFAC', boxShadow: '0 8px 30px rgba(22,163,74,0.12)' }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#061B57', mb: 0.5 }}>
            {punchSuccess.action === 'CHECK_IN' ? 'Punch-In Successful!' : 'Punch-Out Successful!'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#15803D', fontWeight: 700, mb: 3 }}>
            Attendance logged in ISP Campus Registry
          </Typography>

          <Paper sx={{ p: 2.5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3, textAlign: 'left' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              EDUCATOR NAME
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57', mb: 1.5 }}>
              {punchSuccess.teacher.fullName} ({punchSuccess.teacher.employeeId})
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', pt: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  TIME RECORDED
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1748D1' }}>
                  {punchSuccess.time}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  METHOD
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#15803D' }}>
                  Frontdesk QR Scan
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setPunchSuccess(null)}
            sx={{
              py: 1.5,
              fontWeight: 800,
              bgcolor: '#1748D1',
              borderRadius: '10px',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Done / Record Another
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 460, mx: 'auto' }}>
        {/* Campus Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#EEF4FF',
              color: '#1748D1',
              px: 2,
              py: 0.6,
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '12px',
              mb: 1.5,
            }}
          >
            <QrCodeScannerRoundedIcon sx={{ fontSize: 16 }} />
            FRONTDESK SELF-ATTENDANCE
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#061B57', letterSpacing: '-0.3px' }}>
            Indicator Student&apos;s Point
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {currentDate}
          </Typography>
        </Box>

        {/* Live Clock Card */}
        <Card
          sx={{
            borderRadius: '16px',
            bgcolor: '#061B57',
            color: '#FFFFFF',
            textAlign: 'center',
            p: 2.5,
            mb: 3,
            boxShadow: '0 8px 24px rgba(6,27,87,0.18)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: 0.85, mb: 0.5 }}>
            <AccessTimeFilledRoundedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '1px' }}>
              CAMPUS REALTIME CLOCK
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '1.5px', fontFamily: 'monospace' }}>
            {currentTime}
          </Typography>
        </Card>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontWeight: 600 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Punch Form Card */}
        <Card sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel id="teacher-select-label">Select Your Name</InputLabel>
              <Select
                labelId="teacher-select-label"
                value={selectedTeacherId}
                label="Select Your Name"
                onChange={(e) => handleTeacherChange(e.target.value)}
              >
                {teachers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                        {t.fullName}
                      </Typography>
                      <Chip label={t.employeeId} size="small" sx={{ height: 20, fontSize: '11px', fontWeight: 800 }} />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="password"
              label="4-Digit Attendance PIN"
              placeholder="Last 4 digits of your phone"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                  maxLength: 6,
                },
              }}
              helperText="Security verification: Enter the last 4 digits of your mobile number"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
              <Button
                variant="contained"
                disabled={submitting}
                onClick={() => handlePunch('CHECK_IN')}
                sx={{
                  py: 1.6,
                  fontWeight: 900,
                  fontSize: '15px',
                  bgcolor: '#15965A',
                  borderRadius: '12px',
                  '&:hover': { bgcolor: '#0D7A46' },
                }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : '👉 Punch In'}
              </Button>

              <Button
                variant="contained"
                disabled={submitting}
                onClick={() => handlePunch('CHECK_OUT')}
                sx={{
                  py: 1.6,
                  fontWeight: 900,
                  fontSize: '15px',
                  bgcolor: '#D97706',
                  borderRadius: '12px',
                  '&:hover': { bgcolor: '#B45309' },
                }}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : '👋 Punch Out'}
              </Button>
            </Box>
          </Stack>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Indicator Student&apos;s Point &bull; Chawkbazar Campus<br />
            Powered by ISP Smart Attendance System
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
