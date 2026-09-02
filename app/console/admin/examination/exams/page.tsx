'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Drawer,
  Divider,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { ExamRecord, ExamType, ExamStatus } from '@/lib/db/supabaseExams';

const EXAM_TYPE_CONFIG: Record<ExamType, { label: string; color: string; bg: string }> = {
  WEEKLY_MODEL_TEST: { label: 'Weekly Model Test', color: '#1748D1', bg: '#EEF4FF' },
  CHAPTER_ASSESSMENT: { label: 'Chapter Assessment', color: '#0D9488', bg: '#CCFBF1' },
  TERM_FINAL: { label: 'Term Final Exam', color: '#7C3AED', bg: '#F5F3FF' },
  SCHOLARSHIP_MOCK: { label: 'Scholarship Mock', color: '#D97706', bg: '#FEF3C7' },
};

const EXAM_STATUS_CONFIG: Record<ExamStatus, { label: string; status: 'active' | 'inactive' | 'pending' }> = {
  SCHEDULED: { label: 'Scheduled', status: 'pending' },
  ONGOING: { label: 'Ongoing', status: 'active' },
  COMPLETED: { label: 'Completed', status: 'active' },
  EVALUATED: { label: 'Evaluated', status: 'active' },
  CANCELLED: { label: 'Cancelled', status: 'inactive' },
};

export default function ExamsSchedulesPage() {
  const { success, error: toastError, info } = useToast();

  const [exams, setExams] = React.useState<ExamRecord[]>([]);
  const [counts, setCounts] = React.useState({ total: 0, scheduled: 0, ongoing: 0, completed: 0, evaluated: 0 });
  const [batches, setBatches] = React.useState<{ id: string; name: string; code?: string }[]>([]);
  const [teachers, setTeachers] = React.useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [batchFilter, setBatchFilter] = React.useState('ALL');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  // Create Modal
  const [openCreate, setOpenCreate] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [code, setCode] = React.useState('');
  const [examType, setExamType] = React.useState<ExamType>('WEEKLY_MODEL_TEST');
  const [batchName, setBatchName] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [examDate, setExamDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = React.useState('10:00 AM');
  const [endTime, setEndTime] = React.useState('11:30 AM');
  const [durationMinutes, setDurationMinutes] = React.useState('90');
  const [room, setRoom] = React.useState('Hall A (Room 301)');
  const [totalMarks, setTotalMarks] = React.useState('100');
  const [passMarks, setPassMarks] = React.useState('40');
  const [cqMarks, setCqMarks] = React.useState('70');
  const [mcqMarks, setMcqMarks] = React.useState('30');
  const [invigilator, setInvigilator] = React.useState('');
  const [syllabus, setSyllabus] = React.useState('');
  const [submittingCreate, setSubmittingCreate] = React.useState(false);

  // Edit Modal
  const [editExam, setEditExam] = React.useState<ExamRecord | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editCode, setEditCode] = React.useState('');
  const [editExamType, setEditExamType] = React.useState<ExamType>('WEEKLY_MODEL_TEST');
  const [editBatchName, setEditBatchName] = React.useState('');
  const [editSubject, setEditSubject] = React.useState('');
  const [editExamDate, setEditExamDate] = React.useState('');
  const [editStartTime, setEditStartTime] = React.useState('');
  const [editEndTime, setEditEndTime] = React.useState('');
  const [editDurationMinutes, setEditDurationMinutes] = React.useState('90');
  const [editRoom, setEditRoom] = React.useState('');
  const [editTotalMarks, setEditTotalMarks] = React.useState('100');
  const [editPassMarks, setEditPassMarks] = React.useState('40');
  const [editCqMarks, setEditCqMarks] = React.useState('70');
  const [editMcqMarks, setEditMcqMarks] = React.useState('30');
  const [editInvigilator, setEditInvigilator] = React.useState('');
  const [editSyllabus, setEditSyllabus] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<ExamStatus>('SCHEDULED');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // View Details Drawer
  const [selectedExam, setSelectedExam] = React.useState<ExamRecord | null>(null);

  // Delete Modal
  const [deleteExamItem, setDeleteExamItem] = React.useState<ExamRecord | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  // Fetch Data
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      if (batchFilter !== 'ALL') params.set('batch', batchFilter);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/examination/exams?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch exam schedules');
      }

      setExams(data.exams || []);
      if (data.counts) setCounts(data.counts);
      if (data.batches) setBatches(data.batches);
      if (data.teachers) setTeachers(data.teachers);
    } catch (err: any) {
      toastError(err.message || 'Error loading examination schedules');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, batchFilter, typeFilter, statusFilter, toastError]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setTitle('');
    setCode(`ISP-${Math.floor(1000 + Math.random() * 9000)}`);
    setExamType('WEEKLY_MODEL_TEST');
    setBatchName(batches[0]?.name || 'SSC 2026 Batch');
    setSubject('Higher Mathematics');
    setExamDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setStartTime('10:00 AM');
    setEndTime('11:30 AM');
    setDurationMinutes('90');
    setRoom('Hall A (Room 301)');
    setTotalMarks('100');
    setPassMarks('40');
    setCqMarks('70');
    setMcqMarks('30');
    setInvigilator(teachers[0]?.name || 'Prof. M. Rahman');
    setSyllabus('Comprehensive syllabus evaluation test');
    setOpenCreate(true);
  };

  // Submit Create
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !batchName || !subject.trim() || !examDate) {
      toastError('Please fill in all mandatory exam fields.');
      return;
    }

    setSubmittingCreate(true);
    try {
      const res = await fetch('/api/examination/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          code,
          examType,
          batchName,
          subject,
          examDate,
          startTime,
          endTime,
          durationMinutes: Number(durationMinutes) || 90,
          room,
          totalMarks: Number(totalMarks) || 100,
          passMarks: Number(passMarks) || 40,
          cqMarks: Number(cqMarks) || 0,
          mcqMarks: Number(mcqMarks) || 0,
          invigilator,
          syllabus,
          status: 'SCHEDULED',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to schedule exam');
      }

      success(`Exam "${title}" scheduled successfully!`);
      setOpenCreate(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error creating exam schedule');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (exam: ExamRecord) => {
    setEditExam(exam);
    setEditTitle(exam.title);
    setEditCode(exam.code);
    setEditExamType(exam.examType);
    setEditBatchName(exam.batchName);
    setEditSubject(exam.subject);
    setEditExamDate(exam.examDate);
    setEditStartTime(exam.startTime);
    setEditEndTime(exam.endTime);
    setEditDurationMinutes(exam.durationMinutes.toString());
    setEditRoom(exam.room);
    setEditTotalMarks(exam.totalMarks.toString());
    setEditPassMarks(exam.passMarks.toString());
    setEditCqMarks((exam.cqMarks || 0).toString());
    setEditMcqMarks((exam.mcqMarks || 0).toString());
    setEditInvigilator(exam.invigilator || '');
    setEditSyllabus(exam.syllabus || '');
    setEditStatus(exam.status);
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExam) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/examination/exams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editExam.id,
          title: editTitle,
          code: editCode,
          examType: editExamType,
          batchName: editBatchName,
          subject: editSubject,
          examDate: editExamDate,
          startTime: editStartTime,
          endTime: editEndTime,
          durationMinutes: Number(editDurationMinutes),
          room: editRoom,
          totalMarks: Number(editTotalMarks),
          passMarks: Number(editPassMarks),
          cqMarks: Number(editCqMarks),
          mcqMarks: Number(editMcqMarks),
          invigilator: editInvigilator,
          syllabus: editSyllabus,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update exam');
      }

      success('Exam schedule updated successfully!');
      setEditExam(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error updating exam');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Submit Delete
  const handleDeleteExam = async () => {
    if (!deleteExamItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/examination/exams?id=${deleteExamItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete exam');
      }

      info(`Exam "${deleteExamItem.title}" deleted.`);
      setDeleteExamItem(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting exam');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* 1. Page Header */}
      <PageHeader
        title="Exams &amp; Schedules"
        subtitle="Schedule model tests, term assessments, hall room seatings, and question allocations across all student batches."
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              fontWeight: 700,
              bgcolor: '#1748D1',
              color: '#FFFFFF',
              px: 2.5,
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(23, 72, 209, 0.25)',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Schedule New Exam
          </Button>
        }
      />

      {/* 2. Key Metrics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Scheduled
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#061B57', mt: 0.5 }}>
                    {counts.total}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#EEF4FF', color: '#1748D1', borderRadius: '10px' }}>
                  <AssignmentRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Upcoming / Active
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0D9488', mt: 0.5 }}>
                    {counts.scheduled + counts.ongoing}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#CCFBF1', color: '#0D9488', borderRadius: '10px' }}>
                  <CalendarMonthRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Evaluated / Done
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#7C3AED', mt: 0.5 }}>
                    {counts.completed + counts.evaluated}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#F5F3FF', color: '#7C3AED', borderRadius: '10px' }}>
                  <CheckCircleRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Average Duration
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
                    95m
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#FEF3C7', color: '#D97706', borderRadius: '10px' }}>
                  <TimerRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Search and Filters Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title, subject, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Batch Filter</InputLabel>
              <Select
                value={batchFilter}
                label="Batch Filter"
                onChange={(e) => setBatchFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Batches</MenuItem>
                {batches.map((b) => (
                  <MenuItem key={b.id} value={b.name}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Exam Type</InputLabel>
              <Select
                value={typeFilter}
                label="Exam Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Assessment Types</MenuItem>
                <MenuItem value="WEEKLY_MODEL_TEST">Weekly Model Test</MenuItem>
                <MenuItem value="CHAPTER_ASSESSMENT">Chapter Assessment</MenuItem>
                <MenuItem value="TERM_FINAL">Term Final Exam</MenuItem>
                <MenuItem value="SCHOLARSHIP_MOCK">Scholarship Mock</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="ONGOING">Ongoing</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="EVALUATED">Evaluated</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Refresh Table">
              <IconButton onClick={loadData} color="primary" sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* 4. Exams Data Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        {loading && <LinearProgress />}
        <Table sx={{ minWidth: 950 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>EXAM CODE &amp; TITLE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>TYPE &amp; BATCH</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>SUBJECT &amp; SYLLABUS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>DATE &amp; TIME</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>ROOM &amp; MARKS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <AssignmentRoundedIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    No examination schedules found
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Try adjusting your filters or click Schedule New Exam to add one.
                  </Typography>
                  <Button variant="outlined" size="small" onClick={handleOpenCreate}>
                    Schedule an Exam
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => {
                const typeCfg = EXAM_TYPE_CONFIG[exam.examType] || EXAM_TYPE_CONFIG.WEEKLY_MODEL_TEST;
                const statusCfg = EXAM_STATUS_CONFIG[exam.status] || EXAM_STATUS_CONFIG.SCHEDULED;

                return (
                  <TableRow key={exam.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    {/* Exam Title & Code */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, bgcolor: '#EEF4FF', color: '#1748D1', borderRadius: '8px', display: 'flex' }}>
                          <MenuBookRoundedIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', fontSize: '14px' }}>
                            {exam.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Code: {exam.code}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Type & Batch */}
                    <TableCell>
                      <Chip
                        label={typeCfg.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '11px',
                          fontWeight: 800,
                          bgcolor: typeCfg.bg,
                          color: typeCfg.color,
                          borderRadius: '4px',
                          mb: 0.5,
                          display: 'inline-flex',
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '12.5px' }}>
                        {exam.batchName}
                      </Typography>
                    </TableCell>

                    {/* Subject & Syllabus */}
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#061B57', fontSize: '13.5px' }}>
                        {exam.subject}
                      </Typography>
                      {exam.syllabus && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            maxWidth: 220,
                          }}
                        >
                          {exam.syllabus}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#172033', fontSize: '13px' }}>
                        {exam.examDate}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {exam.startTime} – {exam.endTime} ({exam.durationMinutes}m)
                      </Typography>
                    </TableCell>

                    {/* Room & Marks */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <MeetingRoomRoundedIcon sx={{ fontSize: 15, color: '#64748B' }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                          {exam.room}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Total: <strong>{exam.totalMarks}</strong> &bull; Pass: {exam.passMarks}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusChip status={statusCfg.status} label={statusCfg.label} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="View Docket / Details">
                          <IconButton size="small" onClick={() => setSelectedExam(exam)} sx={{ color: '#1748D1' }}>
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Schedule">
                          <IconButton size="small" onClick={() => handleOpenEdit(exam)} sx={{ color: 'text.secondary' }}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Exam">
                          <IconButton size="small" onClick={() => setDeleteExamItem(exam)} sx={{ color: 'error.main' }}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 5. Schedule New Exam Dialog */}
      <Dialog open={openCreate} onClose={() => !submittingCreate && setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentRoundedIcon sx={{ color: '#1748D1' }} />
          Schedule New Examination
        </DialogTitle>
        <form onSubmit={handleCreateExam}>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Exam Title"
                placeholder="e.g. Higher Mathematics Paper 1 Model Test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Exam Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    helperText="Unique institutional identifier"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Exam Type</InputLabel>
                    <Select
                      value={examType}
                      label="Exam Type"
                      onChange={(e) => setExamType(e.target.value as ExamType)}
                    >
                      <MenuItem value="WEEKLY_MODEL_TEST">Weekly Model Test</MenuItem>
                      <MenuItem value="CHAPTER_ASSESSMENT">Chapter Assessment</MenuItem>
                      <MenuItem value="TERM_FINAL">Term Final Exam</MenuItem>
                      <MenuItem value="SCHOLARSHIP_MOCK">Scholarship Mock</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Target Batch</InputLabel>
                    <Select
                      value={batchName}
                      label="Target Batch"
                      onChange={(e) => setBatchName(e.target.value)}
                    >
                      {batches.map((b) => (
                        <MenuItem key={b.id} value={b.name}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Subject"
                    placeholder="e.g. Higher Mathematics, Physics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    type="date"
                    label="Exam Date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="Start Time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="End Time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="11:30 AM"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Room / Hall Allocation"
                    placeholder="e.g. Hall A (Room 301)"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Invigilator</InputLabel>
                    <Select
                      value={invigilator}
                      label="Assigned Invigilator"
                      onChange={(e) => setInvigilator(e.target.value)}
                    >
                      {teachers.map((t) => (
                        <MenuItem key={t.id} value={t.name}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Total Marks"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Pass Mark"
                    value={passMarks}
                    onChange={(e) => setPassMarks(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="CQ Marks"
                    value={cqMarks}
                    onChange={(e) => setCqMarks(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="MCQ Marks"
                    value={mcqMarks}
                    onChange={(e) => setMcqMarks(e.target.value)}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={2.5}
                label="Syllabus &amp; Exam Scope"
                placeholder="Specify the chapters, units, or topic guidelines for this examination..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenCreate(false)} disabled={submittingCreate} sx={{ fontWeight: 700, color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingCreate}
              sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
            >
              {submittingCreate ? 'Scheduling...' : 'Confirm & Schedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 6. Edit Exam Dialog */}
      <Dialog open={Boolean(editExam)} onClose={() => !submittingEdit && setEditExam(null)} maxWidth="sm" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EditRoundedIcon sx={{ color: '#1748D1' }} />
          Modify Examination Schedule
        </DialogTitle>
        <form onSubmit={handleSaveEdit}>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Exam Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editStatus}
                      label="Status"
                      onChange={(e) => setEditStatus(e.target.value as ExamStatus)}
                    >
                      <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                      <MenuItem value="ONGOING">Ongoing</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="EVALUATED">Evaluated</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Exam Type</InputLabel>
                    <Select
                      value={editExamType}
                      label="Exam Type"
                      onChange={(e) => setEditExamType(e.target.value as ExamType)}
                    >
                      <MenuItem value="WEEKLY_MODEL_TEST">Weekly Model Test</MenuItem>
                      <MenuItem value="CHAPTER_ASSESSMENT">Chapter Assessment</MenuItem>
                      <MenuItem value="TERM_FINAL">Term Final Exam</MenuItem>
                      <MenuItem value="SCHOLARSHIP_MOCK">Scholarship Mock</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Subject"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Room / Hall"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    type="date"
                    label="Date"
                    value={editExamDate}
                    onChange={(e) => setEditExamDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="Start Time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="End Time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Total Marks"
                    value={editTotalMarks}
                    onChange={(e) => setEditTotalMarks(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Pass Mark"
                    value={editPassMarks}
                    onChange={(e) => setEditPassMarks(e.target.value)}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Syllabus"
                value={editSyllabus}
                onChange={(e) => setEditSyllabus(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditExam(null)} disabled={submittingEdit} sx={{ fontWeight: 700, color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ fontWeight: 700, bgcolor: '#1748D1', '&:hover': { bgcolor: '#092B91' } }}
            >
              {submittingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 7. View Details Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedExam)}
        onClose={() => setSelectedExam(null)}
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(2px)' } },
          paper: { sx: { width: { xs: '100%', sm: 460 }, p: 3.5, bgcolor: '#FFFFFF' } },
        }}
      >
        {selectedExam && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
                Examination Docket
              </Typography>
              <IconButton onClick={() => setSelectedExam(null)} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: '#EEF4FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 800, letterSpacing: '0.5px' }}>
                  {selectedExam.code}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mt: 0.3 }}>
                  {selectedExam.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, fontWeight: 600 }}>
                  {selectedExam.batchName} &bull; {selectedExam.subject}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Schedule &amp; Hall Information
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: '#1748D1' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Exam Date: <strong>{selectedExam.examDate}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 18, color: '#1748D1' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Timing: {selectedExam.startTime} – {selectedExam.endTime} ({selectedExam.durationMinutes} mins)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MeetingRoomRoundedIcon sx={{ fontSize: 18, color: '#1748D1' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Hall Allocation: <strong>{selectedExam.room}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonOutlineRoundedIcon sx={{ fontSize: 18, color: '#1748D1' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Assigned Invigilator: {selectedExam.invigilator || 'Campus Staff'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Evaluation &amp; Mark Distribution
                </Typography>
                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        TOTAL MARKS
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57' }}>
                        {selectedExam.totalMarks}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        PASS MARK
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0D9488' }}>
                        {selectedExam.passMarks}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {selectedExam.syllabus && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Syllabus / Scope
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, bgcolor: '#F8FAFC', p: 1.5, borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: 1.6 }}>
                    {selectedExam.syllabus}
                  </Typography>
                </Box>
              )}

              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSelectedExam(null);
                  handleOpenEdit(selectedExam);
                }}
                sx={{ fontWeight: 700, mt: 2 }}
              >
                Edit Exam Specs
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* 8. Delete Confirmation Modal */}
      <Dialog open={Boolean(deleteExamItem)} onClose={() => !submittingDelete && setDeleteExamItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#061B57' }}>
          Delete Examination?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete the schedule for{' '}
            <strong>{deleteExamItem?.title}</strong>? This action will remove the timetable slot and room allocation.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteExamItem(null)} disabled={submittingDelete} sx={{ fontWeight: 700, color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteExam}
            disabled={submittingDelete}
            color="error"
            sx={{ fontWeight: 700 }}
          >
            {submittingDelete ? 'Deleting...' : 'Delete Exam'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
