'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  TextField,
  Stack,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import RemoveDoneRoundedIcon from '@mui/icons-material/RemoveDoneRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';

interface StudentRosterItem {
  studentDbId: string;
  studentId: string;
  fullName: string;
  phone?: string;
  batchName?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

interface BatchOption {
  id: string;
  name: string;
  code: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

const STATUS_BUTTON_CONFIG = {
  PRESENT: {
    label: 'Present',
    activeBg: '#16A34A',
    activeColor: '#FFFFFF',
    inactiveBg: '#F0FDF4',
    inactiveColor: '#166534',
    borderColor: '#BBF7D0',
  },
  ABSENT: {
    label: 'Absent',
    activeBg: '#DC2626',
    activeColor: '#FFFFFF',
    inactiveBg: '#FEF2F2',
    inactiveColor: '#991B1B',
    borderColor: '#FECACA',
  },
  LATE: {
    label: 'Late',
    activeBg: '#D97706',
    activeColor: '#FFFFFF',
    inactiveBg: '#FFFBEB',
    inactiveColor: '#92400E',
    borderColor: '#FDE68A',
  },
  EXCUSED: {
    label: 'Excused',
    activeBg: '#2563EB',
    activeColor: '#FFFFFF',
    inactiveBg: '#EFF6FF',
    inactiveColor: '#1E40AF',
    borderColor: '#BFDBFE',
  },
};

export default function AttendanceMarkingPage() {
  const { success, error: toastError, info } = useToast();

  const [batches, setBatches] = React.useState<BatchOption[]>([]);
  const [subjects, setSubjects] = React.useState<SubjectOption[]>([]);
  const [selectedBatchId, setSelectedBatchId] = React.useState<string>('');
  const [selectedSubjectName, setSelectedSubjectName] = React.useState<string>('');
  const [sessionDate, setSessionDate] = React.useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [students, setStudents] = React.useState<StudentRosterItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingRoster, setLoadingRoster] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [isPreviouslySaved, setIsPreviouslySaved] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // 1. Initial Load of Batches and Subjects
  React.useEffect(() => {
    async function loadMeta() {
      try {
        setLoading(true);
        const [bRes, sRes] = await Promise.all([
          fetch('/api/academics/batches'),
          fetch('/api/academics/subjects'),
        ]);

        const bData = await bRes.json();
        const sData = await sRes.json();

        const rawBatches = bData?.batches || [];
        const rawSubjects = sData?.subjects || [];

        setBatches(rawBatches);
        setSubjects(rawSubjects);

        if (rawBatches.length > 0) {
          setSelectedBatchId(rawBatches[0].id);
        }
        if (rawSubjects.length > 0) {
          setSelectedSubjectName(rawSubjects[0].name);
        } else {
          setSelectedSubjectName('Physics 1st Paper');
        }
      } catch (err) {
        console.error('Failed to load attendance metadata:', err);
        toastError('Failed to load batches or subjects from database');
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, [toastError]);

  // 2. Load Attendance Roster when Batch, Subject, or Date changes
  const loadRoster = React.useCallback(async () => {
    if (!selectedBatchId || !selectedSubjectName || !sessionDate) return;

    try {
      setLoadingRoster(true);
      setSavedSuccess(false);

      const params = new URLSearchParams({
        batchId: selectedBatchId,
        subjectName: selectedSubjectName,
        date: sessionDate,
      });

      const res = await fetch(`/api/attendance?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load session roster');
      }

      setSessionId(data.session?.id || null);
      setStudents(data.roster || []);
      setIsPreviouslySaved(Boolean(data.isPreviouslySaved));
    } catch (err: any) {
      console.error('Error loading attendance roster:', err);
      toastError(err.message || 'Error loading attendance roster');
      setStudents([]);
    } finally {
      setLoadingRoster(false);
    }
  }, [selectedBatchId, selectedSubjectName, sessionDate, toastError]);

  React.useEffect(() => {
    if (selectedBatchId && selectedSubjectName && sessionDate) {
      loadRoster();
    }
  }, [selectedBatchId, selectedSubjectName, sessionDate, loadRoster]);

  // 3. Mark Individual Student Status
  const handleStatusChange = (studentDbId: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents((prev) =>
      prev.map((s) => (s.studentDbId === studentDbId ? { ...s, status: newStatus } : s))
    );
    setSavedSuccess(false);
  };

  // 4. Bulk Mark All
  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    setSavedSuccess(false);
    info(`Marked all students as ${status === 'PRESENT' ? 'Present' : 'Absent'}`);
  };

  // 5. Save Attendance Records
  const handleSaveAttendance = async () => {
    if (!sessionId) {
      toastError('No active session found to save attendance');
      return;
    }

    if (students.length === 0) {
      toastError('No students to save attendance for');
      return;
    }

    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentDbId: s.studentDbId,
        status: s.status,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save attendance');
      }

      setSavedSuccess(true);
      setIsPreviouslySaved(true);
      success(`Attendance for ${students.length} students committed to Supabase!`);
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      toastError(err.message || 'Failed to save attendance records');
    } finally {
      setSaving(false);
    }
  };

  // Statistics
  const total = students.length;
  const present = students.filter((s) => s.status === 'PRESENT').length;
  const absent = students.filter((s) => s.status === 'ABSENT').length;
  const late = students.filter((s) => s.status === 'LATE').length;
  const excused = students.filter((s) => s.status === 'EXCUSED').length;
  const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

  const currentBatch = batches.find((b) => b.id === selectedBatchId);

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Class Session Attendance"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'Operations', href: '/admin/operations/attendance' },
          { label: 'Attendance' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            sx={{
              height: 42,
              px: 3,
              fontWeight: 700,
              bgcolor: '#1748D1',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        }
      />

      {savedSuccess && (
        <Alert
          icon={<CheckCircleRoundedIcon fontSize="inherit" />}
          severity="success"
          sx={{ mb: 3, borderRadius: '10px' }}
        >
          <strong>Attendance Committed!</strong> Records for session ({currentBatch?.name} &bull; {selectedSubjectName}, {sessionDate}) are synchronized with Supabase.
        </Alert>
      )}

      {/* Session Filter Bar (Direct surface, no card wrapper) */}
      <Box
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel>Student Batch</InputLabel>
              <Select
                value={selectedBatchId}
                label="Student Batch"
                onChange={(e) => setSelectedBatchId(e.target.value)}
                disabled={loading}
              >
                {batches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth size="small">
              <InputLabel>Subject / Course</InputLabel>
              <Select
                value={selectedSubjectName}
                label="Subject / Course"
                onChange={(e) => setSelectedSubjectName(e.target.value)}
                disabled={loading}
              >
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.name}>
                    {s.name} ({s.code})
                  </MenuItem>
                ))}
                {subjects.length === 0 && (
                  <MenuItem value="General Session">General Session</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Session Date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Box>
        </Box>

        {isPreviouslySaved && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#16A34A' }} />
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700 }}>
              Attendance was previously recorded for this session. Modifying choices below will update existing marks.
            </Typography>
          </Box>
        )}
      </Box>

      {/* KPI Stats & Bulk Action Bar */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        {/* KPI Counter Chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <span>Total Enrolled:</span>
                <strong>{total}</strong>
              </Box>
            }
            sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#334155' }}
          />
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <span>Present:</span>
                <strong>{present} ({attendanceRate}%)</strong>
              </Box>
            }
            sx={{ fontWeight: 800, bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
          />
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <span>Absent:</span>
                <strong>{absent}</strong>
              </Box>
            }
            sx={{ fontWeight: 800, bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
          />
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <span>Late:</span>
                <strong>{late}</strong>
              </Box>
            }
            sx={{ fontWeight: 800, bgcolor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}
          />
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <span>Excused:</span>
                <strong>{excused}</strong>
              </Box>
            }
            sx={{ fontWeight: 800, bgcolor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}
          />
        </Box>

        {/* Bulk Action Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DoneAllRoundedIcon sx={{ color: '#16A34A' }} />}
            onClick={() => handleMarkAll('PRESENT')}
            disabled={students.length === 0}
            sx={{
              fontWeight: 700,
              fontSize: '12.5px',
              textTransform: 'none',
              borderColor: '#BBF7D0',
              color: '#16A34A',
              '&:hover': { bgcolor: '#F0FDF4', borderColor: '#16A34A' },
            }}
          >
            Mark All Present
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RemoveDoneRoundedIcon sx={{ color: '#DC2626' }} />}
            onClick={() => handleMarkAll('ABSENT')}
            disabled={students.length === 0}
            sx={{
              fontWeight: 700,
              fontSize: '12.5px',
              textTransform: 'none',
              borderColor: '#FECACA',
              color: '#DC2626',
              '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' },
            }}
          >
            Mark All Absent
          </Button>
        </Stack>
      </Box>

      {/* Attendance Roster Table (No Card background) */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          border: `1px solid ${ispColors.border.default}`,
          boxShadow: 'none',
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px', py: 1.8, width: 80 }}>Roll #</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Student Details</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Batch Allocation</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px', pr: 3 }}>
                Attendance Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map((student, idx) => (
              <TableRow
                key={student.studentDbId}
                hover
                sx={{
                  bgcolor:
                    student.status === 'ABSENT'
                      ? '#FFFBFB'
                      : student.status === 'LATE'
                      ? '#FFFEFB'
                      : 'transparent',
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                {/* Roll / Index */}
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '13.5px' }}>
                  {(idx + 1).toString().padStart(2, '0')}
                </TableCell>

                {/* Student Details */}
                <TableCell sx={{ py: 1.8 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#061B57', fontSize: '14.5px' }}>
                    {student.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1748D1' }}>
                      ID: {student.studentId}
                    </Typography>
                    {student.phone && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        &bull; {student.phone}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Batch Allocation */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <SchoolRoundedIcon sx={{ fontSize: 16, color: '#1748D1' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>
                      {student.batchName || currentBatch?.name || 'Assigned Batch'}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Interactive Status Selector Buttons */}
                <TableCell align="right" sx={{ pr: 2 }}>
                  <Stack direction="row" spacing={0.8} sx={{ justifyContent: 'flex-end' }}>
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((st) => {
                      const cfg = STATUS_BUTTON_CONFIG[st];
                      const isSelected = student.status === st;

                      return (
                        <Button
                          key={st}
                          size="small"
                          onClick={() => handleStatusChange(student.studentDbId, st)}
                          sx={{
                            minWidth: { xs: 36, sm: 80 },
                            height: 32,
                            px: 1.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: '12px',
                            borderRadius: '6px',
                            bgcolor: isSelected ? cfg.activeBg : cfg.inactiveBg,
                            color: isSelected ? cfg.activeColor : cfg.inactiveColor,
                            border: `1px solid ${isSelected ? cfg.activeBg : cfg.borderColor}`,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: isSelected ? cfg.activeBg : cfg.inactiveBg,
                              opacity: 0.9,
                            },
                          }}
                        >
                          {cfg.label}
                        </Button>
                      );
                    })}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {loadingRoster ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading student roster from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <HowToRegRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Students Enrolled in this Batch
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      Admit students or allocate existing students to {currentBatch?.name || 'this batch'} to start taking attendance.
                    </Typography>
                    <Button
                      component={Link}
                      href="/admin/people/students/new"
                      variant="contained"
                      startIcon={<PersonAddRoundedIcon />}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Admit Student
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
