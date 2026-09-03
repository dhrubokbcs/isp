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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Switch,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';

export interface TimetableSession {
  id: string;
  batchId?: string;
  batchName: string;
  cohort: string;
  subject: string;
  teacherName: string;
  roomNumber: string;
  dayOfWeek: 'SATURDAY' | 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS = ['ALL', 'SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export default function TimetablePage() {
  const { success, error: toastError, info } = useToast();

  const [sessions, setSessions] = React.useState<TimetableSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState('ALL');

  // Academic Dropdown Options (Dynamically Loaded)
  const [batches, setBatches] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);

  // Add Modal State
  const [openDialog, setOpenDialog] = React.useState(false);
  const [formBatchId, setFormBatchId] = React.useState('');
  const [formSubjectName, setFormSubjectName] = React.useState('');
  const [formTeacherName, setFormTeacherName] = React.useState('');
  const [formRoomNumber, setFormRoomNumber] = React.useState('Room 101');
  const [formDayOfWeek, setFormDayOfWeek] = React.useState('SATURDAY');
  const [formStartTime, setFormStartTime] = React.useState('07:30 AM');
  const [formEndTime, setFormEndTime] = React.useState('09:00 AM');
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Modal State
  const [editSession, setEditSession] = React.useState<TimetableSession | null>(null);
  const [editBatchName, setEditBatchName] = React.useState('');
  const [editSubjectName, setEditSubjectName] = React.useState('');
  const [editTeacherName, setEditTeacherName] = React.useState('');
  const [editRoomNumber, setEditRoomNumber] = React.useState('');
  const [editDayOfWeek, setEditDayOfWeek] = React.useState('SATURDAY');
  const [editStartTime, setEditStartTime] = React.useState('');
  const [editEndTime, setEditEndTime] = React.useState('');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // Delete Modal
  const [deleteSessionItem, setDeleteSessionItem] = React.useState<TimetableSession | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  // Load Timetable and Dynamic Options
  const loadTimetable = React.useCallback(async () => {
    try {
      setLoading(true);
      const [timeRes, batchRes, teachRes, subjRes, roomRes] = await Promise.all([
        fetch('/api/academics/timetable'),
        fetch('/api/academics/batches'),
        fetch('/api/teachers'),
        fetch('/api/academics/subjects'),
        fetch('/api/academics/rooms'),
      ]);

      if (timeRes.ok) {
        const data = await timeRes.json();
        setSessions(data.sessions || []);
      }

      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatches(bData.batches || []);
      }

      if (teachRes.ok) {
        const tData = await teachRes.json();
        setTeachers(tData.teachers || []);
      }

      if (subjRes.ok) {
        const sData = await subjRes.json();
        setSubjects(sData.subjects || []);
      }

      if (roomRes.ok) {
        const rData = await roomRes.json();
        setRooms(rData.rooms || []);
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
      toastError('Failed to load routine from database');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const filteredSessions = React.useMemo(() => {
    if (selectedDay === 'ALL') return sessions;
    return sessions.filter((s) => s.dayOfWeek === selectedDay);
  }, [sessions, selectedDay]);

  // Open Create Modal
  const handleOpenCreate = () => {
    if (batches.length > 0) setFormBatchId(batches[0].id);
    if (subjects.length > 0) setFormSubjectName(subjects[0].name);
    if (teachers.length > 0) setFormTeacherName(teachers[0].fullName || teachers[0].nickname);
    if (rooms.length > 0) setFormRoomNumber(rooms[0].roomNumber);
    setFormDayOfWeek('SATURDAY');
    setFormStartTime('07:30 AM');
    setFormEndTime('09:00 AM');
    setOpenDialog(true);
  };

  // Submit Create Session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const batchObj = batches.find((b) => b.id === formBatchId);
    const batchName = batchObj?.name || 'Academic Batch';

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: formBatchId,
          batchName,
          subject: formSubjectName,
          teacherName: formTeacherName,
          roomNumber: formRoomNumber,
          dayOfWeek: formDayOfWeek,
          startTime: formStartTime,
          endTime: formEndTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add class session');
      }

      success(`Session for ${formSubjectName} (${formDayOfWeek}) added to routine!`);
      setOpenDialog(false);
      loadTimetable();
    } catch (err: any) {
      toastError(err.message || 'Error scheduling session');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle
  const handleToggleStatus = async (s: TimetableSession) => {
    const nextStatus = !s.isActive;
    setSessions((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, isActive: nextStatus } : item))
    );

    try {
      const res = await fetch('/api/academics/timetable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, action: 'TOGGLE_STATUS', isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status');
      info(`Class slot is now ${nextStatus ? 'Active' : 'Paused'}.`);
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadTimetable();
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (s: TimetableSession) => {
    setEditSession(s);
    setEditBatchName(s.batchName);
    setEditSubjectName(s.subject);
    setEditTeacherName(s.teacherName);
    setEditRoomNumber(s.roomNumber);
    setEditDayOfWeek(s.dayOfWeek);
    setEditStartTime(s.startTime);
    setEditEndTime(s.endTime);
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/academics/timetable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editSession.id,
          batchName: editBatchName,
          subject: editSubjectName,
          teacherName: editTeacherName,
          roomNumber: editRoomNumber,
          dayOfWeek: editDayOfWeek,
          startTime: editStartTime,
          endTime: editEndTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update session');

      success(`Routine slot updated successfully!`);
      setEditSession(null);
      loadTimetable();
    } catch (err: any) {
      toastError(err.message || 'Error updating session');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete Session
  const handleConfirmDelete = async () => {
    if (!deleteSessionItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/academics/timetable?id=${deleteSessionItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete session');

      success(`Class period for ${deleteSessionItem.subject} removed from routine.`);
      setDeleteSessionItem(null);
      loadTimetable();
    } catch (err: any) {
      toastError(err.message || 'Error deleting session');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Timetable &amp; Class Schedules"
        subtitle={`Total Scheduled Classes: ${sessions.length} · (Active: ${sessions.filter((s) => s.isActive).length})`}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              height: 42,
              px: 2.5,
              fontWeight: 700,
              bgcolor: '#1748D1',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Schedule Class Slot
          </Button>
        }
      />

      {/* Day of Week Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedDay}
          onChange={(_, val) => setSelectedDay(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { fontWeight: 700, fontSize: '13px' },
            '& .Mui-selected': { color: '#1748D1' },
          }}
        >
          {DAYS.map((d) => (
            <Tab key={d} label={d === 'ALL' ? 'All Days' : d} value={d} />
          ))}
        </Tabs>
      </Box>

      {/* Table Container */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          border: `1px solid ${ispColors.border.default}`,
          boxShadow: 'none',
        }}
      >
        <Table sx={{ minWidth: 850 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Day &amp; Time Slot</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Batch</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Assigned Instructor</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Room / Lab</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredSessions.map((s) => (
              <TableRow key={s.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                    {s.startTime} &mdash; {s.endTime}
                  </Typography>
                  <Chip
                    label={s.dayOfWeek}
                    size="small"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      fontSize: '11px',
                      bgcolor: '#EEF4FF',
                      color: '#1748D1',
                      borderRadius: '4px',
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                    {s.batchName}
                  </Typography>
                </TableCell>

                <TableCell sx={{ fontWeight: 600, color: '#061B57', fontSize: '14px' }}>
                  {s.subject}
                </TableCell>

                <TableCell sx={{ fontWeight: 600, color: '#061B57' }}>
                  {s.teacherName}
                </TableCell>

                <TableCell>
                  <Chip
                    label={s.roomNumber}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '11.5px', bgcolor: '#F1F5F9', color: '#334155', borderRadius: '4px' }}
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    <Tooltip title={s.isActive ? 'Click to Pause Class Slot' : 'Click to Activate Slot'}>
                      <Switch
                        size="small"
                        checked={s.isActive}
                        onChange={() => handleToggleStatus(s)}
                        color="primary"
                      />
                    </Tooltip>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit Session Slot">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(s)}
                        sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Class Session">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteSessionItem(s)}
                        sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mt: 1.5 }}>
                    Loading routine from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Sessions Scheduled
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      There are no class periods scheduled for {selectedDay === 'ALL' ? 'this week' : selectedDay}.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenCreate}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Schedule First Class
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Schedule Slot Modal (Fully Dynamic Dropdowns) */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSession}>
          <DialogTitle sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Schedule New Class Slot
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Batch</InputLabel>
                    <Select
                      value={formBatchId}
                      label="Batch"
                      onChange={(e) => setFormBatchId(e.target.value)}
                    >
                      {batches.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={formSubjectName}
                      label="Subject"
                      onChange={(e) => setFormSubjectName(e.target.value)}
                    >
                      {subjects.map((s) => (
                        <MenuItem key={s.id || s.code} value={s.name}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Teacher / Instructor</InputLabel>
                    <Select
                      value={formTeacherName}
                      label="Teacher / Instructor"
                      onChange={(e) => setFormTeacherName(e.target.value)}
                    >
                      {teachers.map((t) => (
                        <MenuItem key={t.id} value={t.fullName}>
                          {t.fullName} {t.designation ? `(${t.designation})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Room / Lab</InputLabel>
                    <Select
                      value={formRoomNumber}
                      label="Room / Lab"
                      onChange={(e) => setFormRoomNumber(e.target.value)}
                    >
                      {rooms.map((r) => (
                        <MenuItem key={r.id || r.roomNumber} value={r.roomNumber}>
                          {r.roomNumber} - {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      value={formDayOfWeek}
                      label="Day of Week"
                      onChange={(e) => setFormDayOfWeek(e.target.value)}
                    >
                      {DAYS.filter((d) => d !== 'ALL').map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="Start Time"
                    placeholder="07:30 AM"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="End Time"
                    placeholder="09:00 AM"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Save Class Slot'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Session Slot Modal */}
      <Dialog open={Boolean(editSession)} onClose={() => setEditSession(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Class Slot Details
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Batch</InputLabel>
                    <Select
                      value={editBatchName}
                      label="Batch"
                      onChange={(e) => setEditBatchName(e.target.value)}
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
                  <FormControl fullWidth required>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={editSubjectName}
                      label="Subject"
                      onChange={(e) => setEditSubjectName(e.target.value)}
                    >
                      {subjects.map((s) => (
                        <MenuItem key={s.id || s.code} value={s.name}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Teacher / Instructor</InputLabel>
                    <Select
                      value={editTeacherName}
                      label="Teacher / Instructor"
                      onChange={(e) => setEditTeacherName(e.target.value)}
                    >
                      {teachers.map((t) => (
                        <MenuItem key={t.id} value={t.fullName}>
                          {t.fullName} {t.designation ? `(${t.designation})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Room / Lab</InputLabel>
                    <Select
                      value={editRoomNumber}
                      label="Room / Lab"
                      onChange={(e) => setEditRoomNumber(e.target.value)}
                    >
                      {rooms.map((r) => (
                        <MenuItem key={r.id || r.roomNumber} value={r.roomNumber}>
                          {r.roomNumber} - {r.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      value={editDayOfWeek}
                      label="Day of Week"
                      onChange={(e) => setEditDayOfWeek(e.target.value)}
                    >
                      {DAYS.filter((d) => d !== 'ALL').map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="Start Time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <TextField
                    required
                    fullWidth
                    label="End Time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditSession(null)} disabled={submittingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingEdit ? <CircularProgress size={22} color="inherit" /> : 'Update Class Slot'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Session Confirmation Modal */}
      <Dialog open={Boolean(deleteSessionItem)} onClose={() => setDeleteSessionItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete Class Schedule Slot
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteSessionItem && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to remove the <strong>{deleteSessionItem.subject}</strong> class session on{' '}
                <strong>{deleteSessionItem.dayOfWeek} ({deleteSessionItem.startTime})</strong> from the routine?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This will delete this routine slot from student and teacher timetables.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteSessionItem(null)} disabled={submittingDelete}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={submittingDelete}
            sx={{ fontWeight: 700 }}
          >
            {submittingDelete ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
