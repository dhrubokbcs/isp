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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { ClassLevel } from '@/lib/db/supabaseAcademics';

export default function ClassLevelsPage() {
  const { success, error: toastError } = useToast();

  const [classes, setClasses] = React.useState<ClassLevel[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Create Modal
  const [openDialog, setOpenDialog] = React.useState(false);
  const [className, setClassName] = React.useState('');
  const [numericLevel, setNumericLevel] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);

  // Edit Modal
  const [editClass, setEditClass] = React.useState<ClassLevel | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editNumeric, setEditNumeric] = React.useState('');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  // Delete Modal
  const [deleteClassItem, setDeleteClassItem] = React.useState<ClassLevel | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  const loadClasses = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics/classes');
      const data = await res.json();
      if (data?.success && Array.isArray(data.classLevels)) {
        setClasses(data.classLevels);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error('Failed to load class levels from database:', err);
      toastError('Failed to load class levels from database');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Create handler
  const handleOpenCreate = () => {
    setClassName('');
    setNumericLevel('9');
    setOpenDialog(true);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !numericLevel) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/academics/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: className.trim(),
          numericLevel: parseInt(numericLevel, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save class level');
      }

      success(`Class Level ${className} saved in Supabase!`);
      setOpenDialog(false);
      loadClasses();
    } catch (err: any) {
      toastError(err.message || 'Error saving class level');
    } finally {
      setSubmitting(false);
    }
  };

  // Seed handler
  const handleSeedStandard = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/academics/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEED' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to seed classes');
      }

      success('Standard Class Levels (Class 6 - 12 & Admission) inserted into database!');
      loadClasses();
    } catch (err: any) {
      toastError(err.message || 'Error seeding class levels');
    } finally {
      setSeeding(false);
    }
  };

  // Edit handler
  const handleOpenEdit = (cl: ClassLevel) => {
    setEditClass(cl);
    setEditName(cl.name);
    setEditNumeric(cl.numericLevel.toString());
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClass || !editName.trim() || !editNumeric) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/academics/classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editClass.id,
          name: editName.trim(),
          numericLevel: parseInt(editNumeric, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update class level');
      }

      success(`Class Level ${editName} updated successfully!`);
      setEditClass(null);
      loadClasses();
    } catch (err: any) {
      toastError(err.message || 'Error updating class level');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete handler
  const handleOpenDelete = (cl: ClassLevel) => {
    setDeleteClassItem(cl);
  };

  const handleConfirmDelete = async () => {
    if (!deleteClassItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/academics/classes?id=${deleteClassItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete class level');
      }

      success(`Class Level ${deleteClassItem.name} deleted.`);
      setDeleteClassItem(null);
      loadClasses();
    } catch (err: any) {
      toastError(err.message || 'Error deleting class level');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const getCohortBadge = (cohortType: string) => {
    switch (cohortType) {
      case 'ANNUAL':
        return (
          <Chip
            label="ANNUAL SESSION"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '11px',
              bgcolor: '#F0FDF4',
              color: '#166534',
              border: '1px solid #BBF7D0',
            }}
          />
        );
      case 'SSC':
        return (
          <Chip
            label="SSC BOARD CYCLE"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '11px',
              bgcolor: '#EEF4FF',
              color: '#1748D1',
              border: '1px solid #C7D7FE',
            }}
          />
        );
      case 'HSC':
        return (
          <Chip
            label="HSC BOARD CYCLE"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '11px',
              bgcolor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          />
        );
      case 'ADMISSION':
        return (
          <Chip
            label="ADMISSION CYCLE"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '11px',
              bgcolor: '#F3E8FF',
              color: '#6B21A8',
              border: '1px solid #E9D5FF',
            }}
          />
        );
      default:
        return <Chip label={cohortType} size="small" />;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Class Levels &amp; Exam Tracks"
        subtitle={`Total Configured Levels in Database: ${classes.length}`}
        action={
          <Stack direction="row" spacing={1.5}>
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
              Add Class Level
            </Button>
          </Stack>
        }
      />

      <Alert
        icon={<InfoOutlinedIcon fontSize="small" />}
        severity="info"
        sx={{
          mb: 3,
          borderRadius: '10px',
          bgcolor: '#EEF4FF',
          color: '#061B57',
          border: '1px solid #C7D7FE',
          '& .MuiAlert-icon': { color: '#1748D1' },
        }}
      >
        <strong>Academic Cohort Rules:</strong> Class 6 to 8 follows annual sessions (Jan 1 to Dec 31). Class 9 &amp; 10 are designated by their target SSC year (e.g. Class 9 in 2026 is SSC 2028). Class 11 &amp; 12 are designated by their target HSC year (e.g. Class 11 in 2026 is HSC 2028).
      </Alert>

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
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Class Level</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Numeric Index</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Cohort Track</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Target Examination Mapping</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {classes.map((cl) => (
              <TableRow key={cl.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '15px', color: '#061B57' }}>
                  {cl.name}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#061B57' }}>
                  Level {cl.numericLevel}
                </TableCell>
                <TableCell>{getCohortBadge(cl.cohortType)}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1748D1', fontSize: '13.5px' }}>
                  {cl.targetExamLabel}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit Class Level">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(cl)}
                        sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Class Level">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDelete(cl)}
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
                    Loading class levels from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 440, mx: 'auto', textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: '#EEF4FF',
                        color: '#1748D1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <ClassRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Class Levels in Database Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px', lineHeight: 1.6 }}>
                      There are currently no class levels recorded in Supabase. You can create custom class levels or populate the standard national tracks (Class 6 - 8 Annual, Class 9 - 10 SSC, Class 11 - 12 HSC, and Admission).
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        startIcon={<AutoFixHighRoundedIcon />}
                        onClick={handleSeedStandard}
                        disabled={seeding}
                        sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                      >
                        {seeding ? 'Populating...' : 'Populate Standard Tracks (Class 6 - 12)'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AddRoundedIcon />}
                        onClick={handleOpenCreate}
                        sx={{ fontWeight: 700 }}
                      >
                        Add Single Level
                      </Button>
                    </Stack>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Class Level Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateClass}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Add Class Level
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Class Level Name"
                placeholder="e.g. Class 9, Class 10, Class 11, Admission"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Numeric Level Index"
                placeholder="e.g. 6 to 13"
                value={numericLevel}
                onChange={(e) => setNumericLevel(e.target.value)}
                helperText="Index: 6-8 (Annual), 9-10 (SSC Track), 11-12 (HSC Track), 13 (Admission)"
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
              {submitting ? 'Saving...' : 'Save Class Level'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Class Level Modal */}
      <Dialog open={Boolean(editClass)} onClose={() => setEditClass(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Class Level
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Class Level Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Numeric Level Index"
                value={editNumeric}
                onChange={(e) => setEditNumeric(e.target.value)}
                helperText="Index: 6-8 (Annual), 9-10 (SSC Track), 11-12 (HSC Track), 13 (Admission)"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditClass(null)} disabled={submittingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingEdit ? 'Updating...' : 'Update Class Level'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Class Level Confirmation Modal */}
      <Dialog open={Boolean(deleteClassItem)} onClose={() => setDeleteClassItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete Class Level
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteClassItem && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to permanently delete <strong>{deleteClassItem.name}</strong> from database?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This will remove the level from academic programs and student registration options.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteClassItem(null)} disabled={submittingDelete}>
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
