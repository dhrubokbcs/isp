'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Stack,
  Skeleton,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { FacultyAttendanceRecord } from '@/lib/types/facultyAttendance';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function TeacherDashboardPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [teacher, setTeacher] = React.useState<any>(null);
  const [batches, setBatches] = React.useState<any[]>([]);
  const [timetable, setTimetable] = React.useState<any[]>([]);
  const [students, setStudents] = React.useState<any[]>([]);
  const [exams, setExams] = React.useState<any[]>([]);

  // Attendance Settings & Live Sessions
  const [allowSelfAttendance, setAllowSelfAttendance] = React.useState(true);
  const [todayAttendanceLogs, setTodayAttendanceLogs] = React.useState<FacultyAttendanceRecord[]>([]);
  const [punchingSessionId, setPunchingSessionId] = React.useState<string | null>(null);

  // Check-out Dialog
  const [checkoutDialogOpen, setCheckoutDialogOpen] = React.useState(false);
  const [activeCheckoutSession, setActiveCheckoutSession] = React.useState<any>(null);
  const [checkoutStudentCount, setCheckoutStudentCount] = React.useState('15');
  const [checkoutTopic, setCheckoutTopic] = React.useState('');
  const [checkoutRemark, setCheckoutRemark] = React.useState('');
  const [submittingCheckout, setSubmittingCheckout] = React.useState(false);

  // Get current weekday in uppercase (e.g. "SATURDAY", "SUNDAY")
  const todayWeekday = React.useMemo(() => {
    const dayIndex = new Date().getDay();
    return DAYS_OF_WEEK[dayIndex];
  }, []);

  const todayIsoDate = React.useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const todayFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const loadTeacherData = React.useCallback(async () => {
    setLoading(true);
    try {
      // 1. Resolve logged in teacher account
      let userId = '';
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('isp_console_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.id) userId = parsed.id;
          } catch {
            // ignore
          }
        }
      }

      const accountQuery = userId ? `?userId=${userId}` : '?role=TEACHER';
      const [accRes, batchRes, timeRes, stuRes, examRes, settingsRes, attRes] = await Promise.all([
        fetch(`/api/account${accountQuery}`),
        fetch('/api/academics/batches'),
        fetch('/api/academics/timetable'),
        fetch('/api/students'),
        fetch('/api/examination/exams'),
        fetch('/api/settings/attendance'),
        fetch(`/api/operations/faculty-attendance?date=${todayIsoDate}`),
      ]);

      if (accRes.ok) {
        const accData = await accRes.json();
        if (accData.success && accData.account) {
          setTeacher(accData.account);
        }
      }

      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatches(bData.batches || []);
      }

      if (timeRes.ok) {
        const tData = await timeRes.json();
        setTimetable(tData.sessions || []);
      }

      if (stuRes.ok) {
        const sData = await stuRes.json();
        setStudents(sData.students || []);
      }

      if (examRes.ok) {
        const eData = await examRes.json();
        setExams(eData.exams || []);
      }

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.success && sData.settings) {
          setAllowSelfAttendance(Boolean(sData.settings.allowTeacherSelfAttendance));
        }
      }

      if (attRes.ok) {
        const aData = await attRes.json();
        if (aData.success) {
          setTodayAttendanceLogs(aData.records || []);
        }
      }
    } catch (err) {
      console.error('Failed to load teacher portal data:', err);
    } finally {
      setLoading(false);
    }
  }, [todayIsoDate]);

  React.useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  // Filter timetable for today
  const todaySchedule = React.useMemo(() => {
    const teacherName = teacher?.fullName?.toLowerCase() || '';
    const daySessions = timetable.filter((session) => session.dayOfWeek?.toUpperCase() === todayWeekday);

    // If matches teacher or general slots
    return daySessions.map((session) => {
      // Find matching live attendance record
      const matchLog = todayAttendanceLogs.find(
        (log) =>
          log.batchName?.toLowerCase() === session.batchName?.toLowerCase() &&
          (log.facultyName?.toLowerCase().includes(teacherName) || !session.teacherName)
      );

      return {
        ...session,
        attendanceRecord: matchLog || null,
        isStarted: matchLog?.status === 'IN_PROGRESS',
        isCompleted: matchLog?.status === 'PRESENT' || matchLog?.status === 'LATE',
        entryTime: matchLog?.entryTime,
        exitTime: matchLog?.exitTime,
        duration: matchLog?.duration,
      };
    });
  }, [timetable, todayWeekday, teacher, todayAttendanceLogs]);

  // 1. Teacher Check-in Handler
  const handleTeacherCheckIn = async (session: any) => {
    setPunchingSessionId(session.id);
    try {
      const res = await fetch('/api/operations/faculty-attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_IN',
          checkInMethod: 'TEACHER_PORTAL',
          date: todayIsoDate,
          batchName: session.batchName,
          slotStart: session.startTime || '8:00 AM',
          slotEnd: session.endTime || '9:30 AM',
          facultyName: teacher?.fullName || 'Teacher',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to check in');
      }

      success(`Checked in for ${session.batchName}! Classroom session started.`);
      loadTeacherData();
    } catch (err: any) {
      toastError(err.message || 'Error checking in');
    } finally {
      setPunchingSessionId(null);
    }
  };

  // 2. Open Checkout Dialog
  const handleOpenCheckout = (session: any) => {
    setActiveCheckoutSession(session);
    setCheckoutStudentCount('15');
    setCheckoutTopic('');
    setCheckoutRemark('');
    setCheckoutDialogOpen(true);
  };

  // 3. Confirm Check-out Handler
  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckoutSession) return;

    setSubmittingCheckout(true);
    try {
      const recordId = activeCheckoutSession.attendanceRecord?.id;
      const res = await fetch('/api/operations/faculty-attendance/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: recordId,
          action: 'CHECK_OUT',
          checkInMethod: 'TEACHER_PORTAL',
          entryTime: activeCheckoutSession.attendanceRecord?.entryTime,
          totalStudents: checkoutStudentCount,
          topicCovered: checkoutTopic,
          remark: checkoutRemark,
          status: 'PRESENT',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to check out');
      }

      success(`Session completed for ${activeCheckoutSession.batchName}! Attendance logged.`);
      setCheckoutDialogOpen(false);
      loadTeacherData();
    } catch (err: any) {
      toastError(err.message || 'Error checking out');
    } finally {
      setSubmittingCheckout(false);
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* 1. Global Page Header */}
      <PageHeader
        title="Teacher Operational Dashboard"
        subtitle={`${teacher?.fullName || 'Faculty Member'} · ${teacher?.designation || 'Senior Faculty'} · ${todayFormatted}`}
        action={
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              component={Link}
              href="/admin/operations/attendance"
              variant="contained"
              startIcon={<HowToRegRoundedIcon />}
            >
              Take Student Attendance
            </Button>
            <Button
              component={Link}
              href="/admin/examination/exams"
              variant="outlined"
              startIcon={<AssignmentRoundedIcon />}
            >
              Exam Marks
            </Button>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={loadTeacherData}
                sx={{
                  border: `1px solid ${ispColors.border.default}`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.default' },
                }}
              >
                <RefreshRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {/* 2. Global KPI Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Assigned Batches"
            value={loading ? '-' : String(batches.length || 0)}
            subtitle="Active batches enrolled"
            icon={<SchoolRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Today's Classes"
            value={loading ? '-' : `${todaySchedule.length}`}
            subtitle={`Scheduled for ${todayWeekday}`}
            icon={<AccessTimeRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Enrolled Students"
            value={loading ? '-' : String(students.length || 0)}
            subtitle="Headcount across batches"
            icon={<PeopleAltRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Scheduled Exams"
            value={loading ? '-' : String(exams.length || 0)}
            subtitle="Tests & assessments"
            icon={<AssignmentRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
      </Grid>

      {/* 3. Main Schedule & Attendance Punch Cards */}
      <Grid container spacing={3}>
        {/* Left Column: Today's Schedule & Attendance Card */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px' }}>
                    Today&apos;s Class Sessions &amp; Attendance Check-In
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3, fontSize: '13.5px' }}>
                    Punch in upon arrival, start class, take student roll, and log completed teaching hours.
                  </Typography>
                </Box>
                {allowSelfAttendance ? (
                  <Chip
                    label="Self Check-in Active"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                  />
                ) : (
                  <Chip
                    icon={<LockRoundedIcon sx={{ fontSize: '14px !important' }} />}
                    label="Reception Controlled"
                    size="small"
                    sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, borderRadius: '6px' }}
                  />
                )}
              </Box>

              {!allowSelfAttendance && (
                <Alert severity="info" sx={{ mb: 2.5, borderRadius: '8px', fontSize: '13px' }}>
                  Self check-in is currently locked by Admin. Your classroom attendance is marked by Campus Reception upon arrival.
                </Alert>
              )}

              {loading ? (
                <Stack spacing={1.5}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '8px' }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: '8px' }} />
                </Stack>
              ) : todaySchedule.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 5,
                    px: 2,
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    border: `1px dashed ${ispColors.border.default}`,
                  }}
                >
                  <EventNoteRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    No Scheduled Classes for {todayWeekday}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Enjoy your non-teaching day or review upcoming batches and exam evaluations.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${ispColors.border.default}` }}>
                  <Table size="medium">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Time Slot</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Batch</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Subject &amp; Room</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>Attendance Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>
                          Session Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todaySchedule.map((session, i) => {
                        const rec = session.attendanceRecord;
                        const isPunching = punchingSessionId === session.id;

                        return (
                          <TableRow key={session.id || i} hover>
                            <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                                {session.startTime} - {session.endTime}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#061B57', fontSize: '13.5px' }}>
                              {session.batchName || 'Batch'}
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.3}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '13px' }}>
                                  {session.subject || 'Higher Mathematics'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                  <MeetingRoomRoundedIcon sx={{ fontSize: 13 }} />
                                  {session.roomNumber || 'Room 401'}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {session.isCompleted ? (
                                <Chip
                                  icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                  label={`Completed (${rec?.duration || '1h 30m'})`}
                                  size="small"
                                  sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, borderRadius: '6px' }}
                                />
                              ) : session.isStarted ? (
                                <Chip
                                  label={`In Class (Started ${rec?.entryTime})`}
                                  size="small"
                                  sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, borderRadius: '6px' }}
                                />
                              ) : (
                                <Chip
                                  label="Scheduled"
                                  size="small"
                                  sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600, borderRadius: '6px' }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {session.isCompleted ? (
                                <Button
                                  component={Link}
                                  href={`/admin/operations/attendance?batchId=${session.batchId || ''}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '12px', fontWeight: 600, textTransform: 'none' }}
                                >
                                  Review Roll
                                </Button>
                              ) : session.isStarted ? (
                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                  <Button
                                    component={Link}
                                    href={`/admin/operations/attendance?batchId=${session.batchId || ''}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '12px', fontWeight: 600, textTransform: 'none' }}
                                  >
                                    Mark Students
                                  </Button>
                                  {allowSelfAttendance && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      startIcon={<StopRoundedIcon />}
                                      onClick={() => handleOpenCheckout(session)}
                                      sx={{ fontSize: '12px', fontWeight: 700, textTransform: 'none' }}
                                    >
                                      Finish Class
                                    </Button>
                                  )}
                                </Stack>
                              ) : (
                                allowSelfAttendance ? (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<PlayArrowRoundedIcon />}
                                    disabled={isPunching}
                                    onClick={() => handleTeacherCheckIn(session)}
                                    sx={{
                                      bgcolor: '#059669',
                                      '&:hover': { bgcolor: '#047857' },
                                      fontSize: '12.5px',
                                      fontWeight: 700,
                                      textTransform: 'none',
                                    }}
                                  >
                                    {isPunching ? 'Starting...' : 'Punch In'}
                                  </Button>
                                ) : (
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                    Pending Reception
                                  </Typography>
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Assigned Batches */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '16px' }}>
                  My Assigned Batches
                </Typography>
                <Chip
                  label={`${batches.length} Batches`}
                  size="small"
                  sx={{ bgcolor: '#EEF4FF', color: '#1748D1', fontWeight: 700, fontSize: '11px', borderRadius: '4px' }}
                />
              </Box>

              {loading ? (
                <Stack spacing={1.5}>
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '6px' }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '6px' }} />
                </Stack>
              ) : batches.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                  No specific batches currently assigned.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {batches.slice(0, 5).map((batch) => (
                    <Box
                      key={batch.id}
                      sx={{
                        p: 1.5,
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {batch.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {batch.programName || 'Academic Batch'}
                        </Typography>
                      </Box>
                      <Button
                        component={Link}
                        href="/admin/operations/attendance"
                        size="small"
                        sx={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        Roll
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Check-Out / Complete Class Modal */}
      <Dialog open={checkoutDialogOpen} onClose={() => !submittingCheckout && setCheckoutDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleConfirmCheckout}>
          <DialogTitle sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px' }}>
            Complete Class &amp; Log Attendance
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Finishing session for <strong>{activeCheckoutSession?.batchName}</strong> ({activeCheckoutSession?.subject}).
              </Typography>

              <TextField
                required
                fullWidth
                type="number"
                label="Total Students Attended"
                value={checkoutStudentCount}
                onChange={(e) => setCheckoutStudentCount(e.target.value)}
              />

              <TextField
                fullWidth
                label="Topic / Chapter Covered"
                placeholder="e.g. Higher Math - Chapter 7 Trigonometry Ex 7.2"
                value={checkoutTopic}
                onChange={(e) => setCheckoutTopic(e.target.value)}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Remarks / Homework Assigned"
                placeholder="e.g. Completed lecture, assigned Ex 7.2 homework..."
                value={checkoutRemark}
                onChange={(e) => setCheckoutRemark(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCheckoutDialogOpen(false)} disabled={submittingCheckout} sx={{ color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingCheckout}
              sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 700 }}
            >
              {submittingCheckout ? <CircularProgress size={22} color="inherit" /> : 'Confirm & Complete'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
