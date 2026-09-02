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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { AcademicProgram } from '@/lib/db/supabaseAcademics';

export default function ProgramsPage() {
  const { success, error: toastError, info } = useToast();

  const [programs, setPrograms] = React.useState<AcademicProgram[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Create Modal
  const [openDialog, setOpenDialog] = React.useState(false);
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Edit Modal
  const [editProg, setEditProg] = React.useState<AcademicProgram | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editCode, setEditCode] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // Delete Modal
  const [deleteProgItem, setDeleteProgItem] = React.useState<AcademicProgram | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  const loadPrograms = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics/programs');
      const data = await res.json();
      if (data?.success && Array.isArray(data.programs)) {
        setPrograms(data.programs);
      } else {
        setPrograms([]);
      }
    } catch (err) {
      console.error('Failed to load programs:', err);
      toastError('Failed to load programs from database');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  // Create handler
  const handleOpenCreate = () => {
    setName('');
    setCode('');
    setDescription('');
    setOpenDialog(true);
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, description }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create program');
      }

      success(`Program ${name} registered in database!`);
      setOpenDialog(false);
      loadPrograms();
    } catch (err: any) {
      toastError(err.message || 'Error creating program');
    } finally {
      setSubmitting(false);
    }
  };

  // Status toggle handler
  const handleToggleStatus = async (prog: AcademicProgram) => {
    const nextStatus = !prog.isActive;

    // Optimistic UI update
    setPrograms((prev) =>
      prev.map((p) => (p.id === prog.id ? { ...p, isActive: nextStatus } : p))
    );

    try {
      const res = await fetch('/api/academics/programs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prog.id,
          action: 'TOGGLE_STATUS',
          isActive: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status');
      }
      info(`Program ${prog.name} is now ${nextStatus ? 'Active' : 'Paused'}.`);
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadPrograms();
    }
  };

  // Edit handler
  const handleOpenEdit = (prog: AcademicProgram) => {
    setEditProg(prog);
    setEditName(prog.name);
    setEditCode(prog.code);
    setEditDescription(prog.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProg || !editName.trim() || !editCode.trim()) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/academics/programs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editProg.id,
          name: editName,
          code: editCode,
          description: editDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update program');
      }

      success(`Program ${editName} updated successfully!`);
      setEditProg(null);
      loadPrograms();
    } catch (err: any) {
      toastError(err.message || 'Error updating program');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete handler
  const handleOpenDelete = (prog: AcademicProgram) => {
    setDeleteProgItem(prog);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProgItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/academics/programs?id=${deleteProgItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete program');
      }

      success(`Program ${deleteProgItem.name} deleted.`);
      setDeleteProgItem(null);
      loadPrograms();
    } catch (err: any) {
      toastError(err.message || 'Error deleting program');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Programs &amp; Curricula"
        subtitle={`Total Programs in Database: ${programs.length}`}
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
            Add Program
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
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Program Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Program Code</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {programs.map((prog) => (
              <TableRow key={prog.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '14.5px', color: '#061B57' }}>
                  {prog.name}
                </TableCell>

                <TableCell>
                  <Chip
                    label={prog.code}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '11px',
                      bgcolor: '#EEF4FF',
                      color: '#1748D1',
                      border: '1px solid #C7D7FE',
                    }}
                  />
                </TableCell>

                <TableCell sx={{ color: 'text.secondary', fontSize: '13.5px' }}>
                  {prog.description || 'Standard academic curriculum'}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip status={prog.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    <Tooltip title={prog.isActive ? 'Click to Pause Program' : 'Click to Activate Program'}>
                      <Switch
                        size="small"
                        checked={prog.isActive}
                        onChange={() => handleToggleStatus(prog)}
                        color="primary"
                      />
                    </Tooltip>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit Program Details">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(prog)}
                        sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Program">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDelete(prog)}
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
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading programs from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <SchoolRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Programs Registered
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      Register programs like SSC Care, HSC Academic Care, or Varsity Admission.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenCreate}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Add First Program
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Program Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateProgram}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Register Academic Program
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Program Name"
                placeholder="e.g. SSC Special Care Program, HSC Science Care"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Program Code"
                placeholder="e.g. SSC-PRO, HSC-SCI, MED-ADM"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Curriculum Description"
                placeholder="Brief outline of target examination and subjects covered"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              {submitting ? 'Saving...' : 'Save Program'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Program Modal */}
      <Dialog open={Boolean(editProg)} onClose={() => setEditProg(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Program Details
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Program Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Program Code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Curriculum Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditProg(null)} disabled={submittingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingEdit ? 'Updating...' : 'Update Program'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Program Confirmation Modal */}
      <Dialog open={Boolean(deleteProgItem)} onClose={() => setDeleteProgItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete Program
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteProgItem && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to permanently delete <strong>{deleteProgItem.name}</strong> ({deleteProgItem.code}) from database?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This program will no longer be available for assigning student batches.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteProgItem(null)} disabled={submittingDelete}>
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
