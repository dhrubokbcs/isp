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
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { TimetableSession } from '@/lib/db/supabaseAcademics';

const DAYS = ['ALL', 'SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export default function TimetablePage() {
  const { success, error: toastError, info } = useToast();

  const [sessions, setSessions] = React.useState<TimetableSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState('ALL');

  // Add Modal
  const [openDialog, setOpenDialog] = React.useState(false);
  const [batchName, setBatchName] = React.useState('SSC 2028 Science Morning A');
  const [cohort, setCohort] = React.useState('SSC 2028');
  const [subject, setSubject] = React.useState('Physics 1st Paper');
  const [teacherName, setTeacherName] = React.useState('');
  const [roomNumber, setRoomNumber] = React.useState('Room 101');
  const [dayOfWeek, setDayOfWeek] = React.useState('SATURDAY');
  const [startTime, setStartTime] = React.useState('08:00 AM');
  const [endTime, setEndTime] = React.useState('09:30 AM');
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Modal
  const [editSession, setEditSession] = React.useState<TimetableSession | null>(null);
  const [editBatch, setEditBatch] = React.useState('');
  const [editCohort, setEditCohort] = React.useState('');
  const [editSubject, setEditSubject] = React.useState('');
  const [editTeacher, setEditTeacher] = React.useState('');
  const [editRoom, setEditRoom] = React.useState('');
  const [editDay, setEditDay] = React.useState('SATURDAY');
  const [editStart, setEditStart] = React.useState('');
  const [editEnd, setEditEnd] = React.useState('');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // Delete Modal
  const [deleteSessionItem, setDeleteSessionItem] = React.useState<TimetableSession | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  const loadTimetable = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics/timetable');
      const data = await res.json();
      if (data?.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Failed to load timetable:', err);
      toastError('Failed to load routine from database');
      setSessions([]);
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

  // Create handler
  const handleOpenCreate = () => {
    setTeacherName('');
    setOpenDialog(true);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim() || !subject.trim() || !teacherName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchName,
          cohort,
          subject,
          teacherName,
          roomNumber,
          dayOfWeek,
          startTime,
          endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add class session');
      }

      success(`Session for ${subject} scheduled successfully!`);
      setOpenDialog(false);
      loadTimetable();
    } catch (err: any) {
      toastError(err.message || 'Error scheduling session');
    } finally {
      setSubmitting(false);
    }
  };

  // Status toggle handler
  const handleToggleStatus = async (s: TimetableSession) => {
    const nextStatus = !s.isActive;

    // Optimistic UI update
    setSessions((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, isActive: nextStatus } : item))
    );

    try {
      const res = await fetch('/api/academics/timetable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: s.id,
          action: 'TOGGLE_STATUS',
          isActive: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }
      info(`Class session is now ${nextStatus ? 'Active' : 'Paused / Cancelled'}.`);
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadTimetable();
    }
  };

  // Edit handler
  const handleOpenEdit = (s: TimetableSession) => {
    setEditSession(s);
    setEditBatch(s.batchName);
    setEditCohort(s.cohort);
    setEditSubject(s.subject);
    setEditTeacher(s.teacherName);
    setEditRoom(s.roomNumber);
    setEditDay(s.dayOfWeek);
    setEditStart(s.startTime);
    setEditEnd(s.endTime);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession || !editBatch.trim() || !editSubject.trim() || !editTeacher.trim()) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/academics/timetable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editSession.id,
          batchName: editBatch,
          cohort: editCohort,
          subject: editSubject,
          teacherName: editTeacher,
          roomNumber: editRoom,
          dayOfWeek: editDay,
          startTime: editStart,
          endTime: editEnd,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update session');
      }

      success(`Class session for ${editSubject} updated!`);
      setEditSession(null);
      loadTimetable();
    } catch (err: any) {
      toastError(err.message || 'Error updating session');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete handler
  const handleOpenDelete = (s: TimetableSession) => {
    setDeleteSessionItem(s);
  };

  const handleConfirmDelete = async () => {
    if (!deleteSessionItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/academics/timetable?id=${deleteSessionItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete session');
      }

      success(`Class session for ${deleteSessionItem.subject} removed from routine.`);
      setDeleteSessionItem(null);
      loadTimetable();
    } catch (err: any) {
      toastError(err.message || 'Error deleting session');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Timetable &amp; Class Schedules"
        subtitle={`Total Scheduled Classes: ${sessions.length} (Active: ${sessions.filter((s) => s.isActive).length})`}
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

      {/* Table (No Card background) */}
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
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Batch &amp; Cohort</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Instructor / Teacher</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Room</TableCell>
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
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                    {s.batchName}
                  </Typography>
                  <Chip
                    label={s.cohort}
                    size="small"
                    sx={{
                      mt: 0.4,
                      fontWeight: 700,
                      fontSize: '11px',
                      bgcolor: s.cohort.includes('SSC') ? '#ECFDF5' : '#FEF3C7',
                      color: s.cohort.includes('SSC') ? '#065F46' : '#92400E',
                    }}
                  />
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
                    sx={{ fontWeight: 700, fontSize: '11.5px', bgcolor: '#F1F5F9', color: '#334155' }}
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    <Tooltip title={s.isActive ? 'Click to Pause Class Session' : 'Click to Activate Session'}>
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
                        onClick={() => handleOpenDelete(s)}
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
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
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

      {/* Schedule Slot Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSession}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Schedule New Class Slot
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Batch Name"
                placeholder="e.g. SSC 2028 Science Morning A"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Target Cohort"
                placeholder="e.g. SSC 2028, HSC 2027, Session 2026"
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Subject"
                placeholder="e.g. Physics 1st Paper, Chemistry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Teacher / Instructor"
                placeholder="e.g. Irfanur Rashid Nayan"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={dayOfWeek}
                  label="Day of Week"
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  {DAYS.filter((d) => d !== 'ALL').map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Room Number"
                placeholder="e.g. Room 101, Lab 201"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Start Time"
                  placeholder="08:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="End Time"
                  placeholder="09:30 AM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </Box>
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
              {submitting ? 'Saving...' : 'Save Schedule Slot'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Session Slot Modal */}
      <Dialog open={Boolean(editSession)} onClose={() => setEditSession(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Class Slot Details
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Batch Name"
                value={editBatch}
                onChange={(e) => setEditBatch(e.target.value)}
              />
              <TextField
                fullWidth
                label="Target Cohort"
                value={editCohort}
                onChange={(e) => setEditCohort(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Subject"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Teacher / Instructor"
                value={editTeacher}
                onChange={(e) => setEditTeacher(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={editDay}
                  label="Day of Week"
                  onChange={(e) => setEditDay(e.target.value)}
                >
                  {DAYS.filter((d) => d !== 'ALL').map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Room Number"
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Start Time"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="End Time"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                />
              </Box>
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
              {submittingEdit ? 'Updating...' : 'Update Class Slot'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Session Confirmation Modal */}
      <Dialog open={Boolean(deleteSessionItem)} onClose={() => setDeleteSessionItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
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
