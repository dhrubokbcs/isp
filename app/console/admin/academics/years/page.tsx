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
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { AcademicYearRecord } from '@/lib/db/supabaseAcademicYears';

export default function AcademicYearsPage() {
  const { success, error: toastError, info } = useToast();

  const [years, setYears] = React.useState<AcademicYearRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Create Modal
  const [openDialog, setOpenDialog] = React.useState(false);
  const [yearName, setYearName] = React.useState('');
  const [yearNumber, setYearNumber] = React.useState(new Date().getFullYear().toString());
  const [yearStatus, setYearStatus] = React.useState<'ACTIVE' | 'UPCOMING' | 'ARCHIVED'>('UPCOMING');
  const [submitting, setSubmitting] = React.useState(false);

  // Status Change Modal
  const [statusChangeYear, setStatusChangeYear] = React.useState<AcademicYearRecord | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<'ACTIVE' | 'UPCOMING' | 'ARCHIVED'>('ACTIVE');
  const [submittingStatus, setSubmittingStatus] = React.useState(false);

  const loadYears = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academic-years');
      const data = await res.json();
      if (data?.success && Array.isArray(data.years)) {
        setYears(data.years);
      } else {
        setYears([]);
      }
    } catch (err) {
      console.error('Failed to load academic years from database:', err);
      toastError('Failed to load academic cohorts from database');
      setYears([]);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadYears();
  }, [loadYears]);

  const handleOpenCreate = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = years.length > 0 ? Math.max(...years.map((y) => y.year)) + 1 : currentYear;
    setYearNumber(nextYear.toString());
    setYearName(`Academic Year ${nextYear}`);
    setYearStatus(years.length === 0 ? 'ACTIVE' : 'UPCOMING');
    setOpenDialog(true);
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName.trim() || !yearNumber) return;

    setSubmitting(true);
    try {
      const num = parseInt(yearNumber, 10);
      const res = await fetch('/api/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: yearName.trim(),
          year: num,
          startDate: `${num}-01-01`,
          endDate: `${num}-12-31`,
          status: yearStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create academic year');
      }

      success(`Academic Year ${yearName} registered in database!`);
      setOpenDialog(false);
      loadYears();
    } catch (err: any) {
      toastError(err.message || 'Failed to save academic year');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenStatusChange = (item: AcademicYearRecord) => {
    setStatusChangeYear(item);
    setSelectedStatus(item.status);
  };

  const handleSaveStatus = async () => {
    if (!statusChangeYear) return;

    setSubmittingStatus(true);
    try {
      const res = await fetch('/api/academic-years', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: statusChangeYear.id,
          status: selectedStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      info(`Status for ${statusChangeYear.name} updated to ${selectedStatus}.`);
      setStatusChangeYear(null);
      loadYears();
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
    } finally {
      setSubmittingStatus(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Academic Years"
        subtitle={`Total Cohorts: ${years.length} (Active: ${years.filter((y) => y.status === 'ACTIVE').length})`}
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
            Create Academic Year
          </Button>
        }
      />

      {/* Academic Years Table (Card wrapper removed) */}
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
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Academic Year</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Year</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Date Range</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Next Student Serial</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {years.map((row) => {
              const nextIdPreview = `${row.year}${row.nextStudentSerial.toString().padStart(4, '0')}`;

              return (
                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '14.5px', color: '#061B57' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {row.name}
                      {row.status === 'ACTIVE' && (
                        <Tooltip title="Current Active Academic Year">
                          <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#10B981' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 600, color: '#061B57' }}>
                    {row.year}
                  </TableCell>

                  <TableCell sx={{ color: 'text.secondary', fontSize: '13.5px' }}>
                    {row.startDate} &mdash; {row.endDate}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          fontSize: '12.5px',
                          color: '#1748D1',
                          bgcolor: '#EEF4FF',
                          px: 1.2,
                          py: 0.4,
                          borderRadius: '6px',
                          border: '1px solid #C7D7FE',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {nextIdPreview}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Change Cohort Status">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenStatusChange(row)}
                        sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                      >
                        <SwapHorizRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading academic cohorts from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : years.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center' }}>
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
                      <CalendarMonthRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Academic Years in Database Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px', lineHeight: 1.6 }}>
                      There are currently no academic cohorts recorded in Supabase. Set up your first academic year to establish the student sequence counter.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleOpenCreate}
                      sx={{
                        bgcolor: '#1748D1',
                        fontWeight: 700,
                        px: 3,
                        py: 1,
                        borderRadius: '8px',
                        '&:hover': { bgcolor: '#092B91' },
                      }}
                    >
                      Create First Academic Year
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Academic Year Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateYear}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Create New Academic Year
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                label="Academic Year Name"
                placeholder="e.g. Academic Year 2029"
                value={yearName}
                onChange={(e) => setYearName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Calendar Year"
                type="number"
                placeholder="2029"
                value={yearNumber}
                onChange={(e) => setYearNumber(e.target.value)}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Initial Status</InputLabel>
                <Select
                  value={yearStatus}
                  label="Initial Status"
                  onChange={(e) => setYearStatus(e.target.value as any)}
                >
                  <MenuItem value="UPCOMING">Upcoming</MenuItem>
                  <MenuItem value="ACTIVE">Active (Current Academic Session)</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Permanent Student ID sequence will automatically initialize at{' '}
                <strong style={{ color: '#1748D1' }}>{yearNumber}0001</strong> for this academic cohort.
              </Typography>
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
              {submitting ? 'Saving...' : 'Save Academic Year'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={Boolean(statusChangeYear)} onClose={() => setStatusChangeYear(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
          Update Cohort Status
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {statusChangeYear && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Select status for <strong>{statusChangeYear.name}</strong>:
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="UPCOMING">Upcoming</MenuItem>
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setStatusChangeYear(null)} disabled={submittingStatus}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveStatus}
            disabled={submittingStatus}
            sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
          >
            {submittingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
