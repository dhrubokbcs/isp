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
  IconButton,
  Tooltip,
  Switch,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { CampusRoom } from '@/lib/db/supabaseAcademics';

export default function RoomsPage() {
  const { success, error: toastError, info } = useToast();

  const [rooms, setRooms] = React.useState<CampusRoom[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Add Modal
  const [openDialog, setOpenDialog] = React.useState(false);
  const [roomNumber, setRoomNumber] = React.useState('');
  const [name, setName] = React.useState('');
  const [roomType, setRoomType] = React.useState<'LECTURE_HALL' | 'SCIENCE_LAB' | 'COMPUTER_LAB' | 'EXAM_HALL'>('LECTURE_HALL');
  const [capacity, setCapacity] = React.useState('40');
  const [floor, setFloor] = React.useState('1st Floor');
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Modal
  const [editRoom, setEditRoom] = React.useState<CampusRoom | null>(null);
  const [editNumber, setEditNumber] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editType, setEditType] = React.useState<'LECTURE_HALL' | 'SCIENCE_LAB' | 'COMPUTER_LAB' | 'EXAM_HALL'>('LECTURE_HALL');
  const [editCapacity, setEditCapacity] = React.useState('40');
  const [editFloor, setEditFloor] = React.useState('1st Floor');
  const [editStatus, setEditStatus] = React.useState<'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'>('AVAILABLE');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // Delete Modal
  const [deleteRoomItem, setDeleteRoomItem] = React.useState<CampusRoom | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  const loadRooms = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics/rooms');
      const data = await res.json();
      if (data?.success && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('Failed to load campus rooms:', err);
      toastError('Failed to load rooms from database');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Add Room
  const handleOpenCreate = () => {
    setRoomNumber('');
    setName('');
    setCapacity('45');
    setFloor('1st Floor');
    setOpenDialog(true);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber,
          name: name || roomNumber,
          roomType,
          capacity: parseInt(capacity, 10) || 40,
          floor,
          status: 'AVAILABLE',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create room');
      }

      success(`Room ${roomNumber} added to campus inventory!`);
      setOpenDialog(false);
      loadRooms();
    } catch (err: any) {
      toastError(err.message || 'Error creating room');
    } finally {
      setSubmitting(false);
    }
  };

  // Status toggle
  const handleToggleStatus = async (room: CampusRoom) => {
    const nextStatus: 'AVAILABLE' | 'MAINTENANCE' = room.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';

    // Optimistic UI update
    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, status: nextStatus } : r))
    );

    try {
      const res = await fetch('/api/academics/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: room.id,
          action: 'TOGGLE_STATUS',
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle room status');
      }
      info(`Room ${room.roomNumber} is now ${nextStatus === 'AVAILABLE' ? 'Available' : 'Under Maintenance'}.`);
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadRooms();
    }
  };

  // Edit Room
  const handleOpenEdit = (room: CampusRoom) => {
    setEditRoom(room);
    setEditNumber(room.roomNumber);
    setEditName(room.name);
    setEditType(room.roomType);
    setEditCapacity(room.capacity.toString());
    setEditFloor(room.floor);
    setEditStatus(room.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom || !editNumber.trim()) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/academics/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editRoom.id,
          roomNumber: editNumber,
          name: editName || editNumber,
          roomType: editType,
          capacity: parseInt(editCapacity, 10) || 40,
          floor: editFloor,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update room');
      }

      success(`Room ${editNumber} updated successfully!`);
      setEditRoom(null);
      loadRooms();
    } catch (err: any) {
      toastError(err.message || 'Error updating room');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete Room
  const handleOpenDelete = (room: CampusRoom) => {
    setDeleteRoomItem(room);
  };

  const handleConfirmDelete = async () => {
    if (!deleteRoomItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/academics/rooms?id=${deleteRoomItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete room');
      }

      success(`Room ${deleteRoomItem.roomNumber} has been removed.`);
      setDeleteRoomItem(null);
      loadRooms();
    } catch (err: any) {
      toastError(err.message || 'Error deleting room');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Rooms &amp; Laboratories"
        subtitle={`Total Campus Facilities: ${rooms.length} (Available: ${rooms.filter((r) => r.status === 'AVAILABLE').length})`}
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
            Add Room
          </Button>
        }
      />

      {/* Table (No Card background, Facilities column removed) */}
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
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Room Number &amp; Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Facility Type</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Capacity</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rooms.map((r) => (
              <TableRow key={r.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                    {r.roomNumber}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {r.name}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={r.roomType.replace('_', ' ')}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '11px',
                      bgcolor: '#EEF4FF',
                      color: '#1748D1',
                    }}
                  />
                </TableCell>

                <TableCell sx={{ fontWeight: 700, color: '#061B57', fontSize: '13.5px' }}>
                  {r.capacity} Seats
                </TableCell>

                <TableCell sx={{ color: 'text.secondary', fontSize: '13.5px' }}>
                  {r.floor}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip status={r.status === 'AVAILABLE' ? 'ACTIVE' : 'INACTIVE'} />
                    <Tooltip title={r.status === 'AVAILABLE' ? 'Click to Mark as Maintenance / Unavailable' : 'Click to Mark as Available'}>
                      <Switch
                        size="small"
                        checked={r.status === 'AVAILABLE'}
                        onChange={() => handleToggleStatus(r)}
                        color="primary"
                      />
                    </Tooltip>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit Room Details">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(r)}
                        sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Room">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDelete(r)}
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
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading rooms...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <MeetingRoomRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Rooms Configured
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      Register campus classrooms, science labs, and exam halls.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenCreate}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Add First Room
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Room Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateRoom}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Add Campus Room or Lab
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Room Number"
                placeholder="e.g. Room 101, Lab 201"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
              <TextField
                fullWidth
                label="Room Name / Title"
                placeholder="e.g. Galileo Lecture Hall, Physics Lab"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Facility Type</InputLabel>
                <Select
                  value={roomType}
                  label="Facility Type"
                  onChange={(e) => setRoomType(e.target.value as any)}
                >
                  <MenuItem value="LECTURE_HALL">Lecture Hall / Classroom</MenuItem>
                  <MenuItem value="SCIENCE_LAB">Science Laboratory</MenuItem>
                  <MenuItem value="COMPUTER_LAB">Computer &amp; ICT Lab</MenuItem>
                  <MenuItem value="EXAM_HALL">Central Exam Hall</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Seating Capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <TextField
                fullWidth
                label="Floor / Wing"
                placeholder="e.g. 1st Floor, Main Campus"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
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
              {submitting ? 'Saving...' : 'Save Room'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={Boolean(editRoom)} onClose={() => setEditRoom(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Room Details
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Room Number"
                value={editNumber}
                onChange={(e) => setEditNumber(e.target.value)}
              />
              <TextField
                fullWidth
                label="Room Name / Title"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Facility Type</InputLabel>
                <Select
                  value={editType}
                  label="Facility Type"
                  onChange={(e) => setEditType(e.target.value as any)}
                >
                  <MenuItem value="LECTURE_HALL">Lecture Hall / Classroom</MenuItem>
                  <MenuItem value="SCIENCE_LAB">Science Laboratory</MenuItem>
                  <MenuItem value="COMPUTER_LAB">Computer &amp; ICT Lab</MenuItem>
                  <MenuItem value="EXAM_HALL">Central Exam Hall</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Seating Capacity"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
              />
              <TextField
                fullWidth
                label="Floor / Wing"
                value={editFloor}
                onChange={(e) => setEditFloor(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editStatus}
                  label="Status"
                  onChange={(e) => setEditStatus(e.target.value as any)}
                >
                  <MenuItem value="AVAILABLE">Available</MenuItem>
                  <MenuItem value="OCCUPIED">Occupied</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance / Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditRoom(null)} disabled={submittingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingEdit ? 'Updating...' : 'Update Room'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Room Confirmation Modal */}
      <Dialog open={Boolean(deleteRoomItem)} onClose={() => setDeleteRoomItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete Campus Room
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteRoomItem && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to delete <strong>{deleteRoomItem.roomNumber}</strong> ({deleteRoomItem.name}) from campus inventory?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This room will no longer be available for timetable class assignments.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteRoomItem(null)} disabled={submittingDelete}>
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
