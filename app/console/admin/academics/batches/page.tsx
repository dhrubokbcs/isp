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
  Switch,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { BatchRecord } from '@/lib/db/supabaseAcademics';

export default function BatchesPage() {
  const { success, error: toastError, info } = useToast();

  const [batches, setBatches] = React.useState<BatchRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Form options
  const [academicYears, setAcademicYears] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);

  // Create Modal
  const [openDialog, setOpenDialog] = React.useState(false);
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [academicYearId, setAcademicYearId] = React.useState('');
  const [programId, setProgramId] = React.useState('');
  const [shift, setShift] = React.useState<'MORNING' | 'DAY' | 'EVENING'>('MORNING');
  const [maxCapacity, setMaxCapacity] = React.useState('40');
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Modal
  const [editBatch, setEditBatch] = React.useState<BatchRecord | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editCode, setEditCode] = React.useState('');
  const [editShift, setEditShift] = React.useState<'MORNING' | 'DAY' | 'EVENING'>('MORNING');
  const [editMaxCapacity, setEditMaxCapacity] = React.useState('40');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // Delete Modal
  const [deleteBatchItem, setDeleteBatchItem] = React.useState<BatchRecord | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [bRes, yRes, pRes] = await Promise.all([
        fetch('/api/academics/batches'),
        fetch('/api/academic-years'),
        fetch('/api/academics/programs'),
      ]);

      const bData = await bRes.json();
      const yData = await yRes.json();
      const pData = await pRes.json();

      setBatches(bData?.batches || []);
      setAcademicYears(yData?.years || []);
      setPrograms(pData?.programs || []);

      if (yData?.years?.length > 0 && !academicYearId) {
        setAcademicYearId(yData.years[0].id);
      }
    } catch (err) {
      console.error('Failed to load batch data:', err);
      toastError('Failed to load batches from database');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [academicYearId, toastError]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Create handler
  const handleOpenCreate = () => {
    setName('');
    setCode('');
    setMaxCapacity('40');
    setShift('MORNING');
    setOpenDialog(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !academicYearId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          academicYearId,
          programId: programId || undefined,
          shift,
          maxCapacity: parseInt(maxCapacity, 10) || 40,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create batch');
      }

      success(`Batch ${name} created successfully!`);
      setOpenDialog(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error creating batch');
    } finally {
      setSubmitting(false);
    }
  };

  // Status toggle handler
  const handleToggleStatus = async (batch: BatchRecord) => {
    const nextStatus = !batch.isActive;

    // Optimistic UI update
    setBatches((prev) =>
      prev.map((b) => (b.id === batch.id ? { ...b, isActive: nextStatus } : b))
    );

    try {
      const res = await fetch('/api/academics/batches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: batch.id,
          action: 'TOGGLE_STATUS',
          isActive: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status');
      }
      info(`Batch ${batch.name} is now ${nextStatus ? 'Active' : 'Paused'}.`);
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadData();
    }
  };

  // Edit handler
  const handleOpenEdit = (batch: BatchRecord) => {
    setEditBatch(batch);
    setEditName(batch.name);
    setEditCode(batch.code);
    setEditShift(batch.shift);
    setEditMaxCapacity(batch.maxCapacity.toString());
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBatch || !editName.trim() || !editCode.trim()) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/academics/batches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editBatch.id,
          name: editName,
          code: editCode,
          shift: editShift,
          maxCapacity: parseInt(editMaxCapacity, 10) || 40,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update batch');
      }

      success(`Batch ${editName} updated successfully!`);
      setEditBatch(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error updating batch');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete handler
  const handleOpenDelete = (batch: BatchRecord) => {
    setDeleteBatchItem(batch);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBatchItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/academics/batches?id=${deleteBatchItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete batch');
      }

      success(`Batch ${deleteBatchItem.name} deleted.`);
      setDeleteBatchItem(null);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Error deleting batch');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Batches"
        subtitle={`Total Academic Batches in Database: ${batches.length}`}
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
            Add Batch
          </Button>
        }
      />

      {/* Table (No Card background) */}
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
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Batch Name &amp; Code</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Academic Session</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Shift</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Enrollment Capacity</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {batches.map((batch) => {
              const fillRatio = Math.round((batch.currentEnrolled / batch.maxCapacity) * 100);
              return (
                <TableRow key={batch.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                      {batch.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                      <Chip
                        label={batch.code}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '11px',
                          bgcolor: '#EEF4FF',
                          color: '#1748D1',
                          border: '1px solid #C7D7FE',
                        }}
                      />
                      <Chip
                        label={batch.cohortLabel}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '11px',
                          bgcolor: batch.name.includes('SSC') ? '#ECFDF5' : '#FEF3C7',
                          color: batch.name.includes('SSC') ? '#065F46' : '#92400E',
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 600, color: '#061B57' }}>
                    {batch.academicYearName || 'Session 2028'}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={batch.shift}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '11px', bgcolor: '#F1F5F9', color: '#334155' }}
                    />
                  </TableCell>

                  <TableCell sx={{ minWidth: 160 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#061B57' }}>
                        {batch.currentEnrolled} / {batch.maxCapacity} Students
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {fillRatio}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(fillRatio, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: fillRatio > 90 ? '#EF4444' : '#1748D1',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusChip status={batch.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      <Tooltip title={batch.isActive ? 'Click to Pause Batch' : 'Click to Activate Batch'}>
                        <Switch
                          size="small"
                          checked={batch.isActive}
                          onChange={() => handleToggleStatus(batch)}
                          color="primary"
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="Edit Batch Details">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(batch)}
                          sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Batch">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(batch)}
                          sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading batches from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <GroupsRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Batches Created Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      Create student batches for target SSC, HSC, and annual coaching programs.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenCreate}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Create First Batch
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Batch Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateBatch}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Create Student Batch
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Batch Name"
                placeholder="e.g. SSC 2028 Science Morning A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Batch Code"
                placeholder="e.g. SSC28-M1"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <FormControl fullWidth required>
                <InputLabel>Academic Session / Year</InputLabel>
                <Select
                  value={academicYearId}
                  label="Academic Session / Year"
                  onChange={(e) => setAcademicYearId(e.target.value)}
                >
                  {academicYears.map((y) => (
                    <MenuItem key={y.id} value={y.id}>
                      {y.name} ({y.year})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Academic Program (Optional)</InputLabel>
                <Select
                  value={programId}
                  label="Academic Program (Optional)"
                  onChange={(e) => setProgramId(e.target.value)}
                >
                  <MenuItem value="">None / General</MenuItem>
                  {programs.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Shift</InputLabel>
                <Select
                  value={shift}
                  label="Shift"
                  onChange={(e) => setShift(e.target.value as any)}
                >
                  <MenuItem value="MORNING">Morning Shift</MenuItem>
                  <MenuItem value="DAY">Day Shift</MenuItem>
                  <MenuItem value="EVENING">Evening Shift</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Max Student Capacity"
                placeholder="40"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
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
              {submitting ? 'Saving...' : 'Save Batch'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Batch Modal */}
      <Dialog open={Boolean(editBatch)} onClose={() => setEditBatch(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Batch Details
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Batch Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Batch Code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Shift</InputLabel>
                <Select
                  value={editShift}
                  label="Shift"
                  onChange={(e) => setEditShift(e.target.value as any)}
                >
                  <MenuItem value="MORNING">Morning Shift</MenuItem>
                  <MenuItem value="DAY">Day Shift</MenuItem>
                  <MenuItem value="EVENING">Evening Shift</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="Max Student Capacity"
                value={editMaxCapacity}
                onChange={(e) => setEditMaxCapacity(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditBatch(null)} disabled={submittingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingEdit ? 'Updating...' : 'Update Batch'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Batch Confirmation Modal */}
      <Dialog open={Boolean(deleteBatchItem)} onClose={() => setDeleteBatchItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete Batch
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteBatchItem && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to permanently delete <strong>{deleteBatchItem.name}</strong> ({deleteBatchItem.code}) from database?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This will unassign all linked students and routine class sessions for this batch.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteBatchItem(null)} disabled={submittingDelete}>
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
