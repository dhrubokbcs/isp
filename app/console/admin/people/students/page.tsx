'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { StudentFullProfile } from '@/lib/db/supabaseStudents';

export default function StudentsDirectoryPage() {
  const { success, error: toastError, info } = useToast();

  const [students, setStudents] = React.useState<StudentFullProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Profile Drawer
  const [selectedStudent, setSelectedStudent] = React.useState<StudentFullProfile | null>(null);

  // Delete Modal
  const [deleteStudentItem, setDeleteStudentItem] = React.useState<StudentFullProfile | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  const loadStudents = React.useCallback(async (q?: string) => {
    try {
      setLoading(true);
      const url = q && q.trim() ? `/api/students?q=${encodeURIComponent(q.trim())}` : '/api/students';
      const res = await fetch(url);
      const data = await res.json();
      if (data?.success && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      toastError('Failed to load students from database');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents(searchTerm);
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    info(`Copied Student ID: ${id}`);
  };

  // Status toggle
  const handleToggleStatus = async (student: StudentFullProfile) => {
    const nextStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
    );

    try {
      const res = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          action: 'TOGGLE_STATUS',
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status');
      }
      info(`Student ${student.fullName} is now ${nextStatus === 'ACTIVE' ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadStudents(searchTerm);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteStudentItem) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/students?id=${deleteStudentItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete student');
      }

      success(`Student ${deleteStudentItem.fullName} deleted.`);
      setDeleteStudentItem(null);
      loadStudents(searchTerm);
    } catch (err: any) {
      toastError(err.message || 'Error deleting student');
    } finally {
      setSubmittingDelete(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Students Directory"
        subtitle={`Total Registered Students in Database: ${students.length}`}
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'People', href: '/admin/people/students' },
          { label: 'Directory' },
        ]}
        action={
          <Button
            component={Link}
            href="/admin/people/students/new"
            variant="contained"
            startIcon={<PersonAddRoundedIcon />}
            sx={{
              height: 42,
              px: 2.5,
              fontWeight: 700,
              bgcolor: '#1748D1',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Admit New Student
          </Button>
        }
      />

      {/* Search Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            placeholder="Search by student name, ID (e.g. 20280001), phone, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
              maxWidth: 540,
            }}
          />
        </form>
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
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Student Profile &amp; ID</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Batch &amp; Track</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#EEF4FF',
                          color: '#1748D1',
                          fontWeight: 700,
                          fontSize: '15px',
                        }}
                      >
                        {student.fullName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                          {student.fullName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                          <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 700 }}>
                            ID: {student.studentId}
                          </Typography>
                          <Tooltip title="Copy Student ID">
                            <IconButton
                              size="small"
                              onClick={(e) => handleCopyId(e, student.studentId)}
                              sx={{ p: 0.3, color: '#64748B' }}
                            >
                              <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#061B57' }}>
                      {student.phone || 'No phone'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {student.email || 'No email'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                      {student.batchName}
                    </Typography>
                    <Chip
                      label={`Session ${student.admissionAcademicYear}`}
                      size="small"
                      sx={{
                        mt: 0.4,
                        fontWeight: 700,
                        fontSize: '11px',
                        bgcolor: '#F1F5F9',
                        color: '#334155',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusChip status={student.status} />
                      <Tooltip title={student.status === 'ACTIVE' ? 'Pause Student Account' : 'Activate Student Account'}>
                        <Switch
                          size="small"
                          checked={student.status === 'ACTIVE'}
                          onChange={() => handleToggleStatus(student)}
                          color="primary"
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="View Complete Student Profile">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedStudent(student)}
                          sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Student Record">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteStudentItem(student)}
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
                    Loading students from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <SchoolRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Students Registered in Database
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      Admit students to generate official IDs and assign them to batches.
                    </Typography>
                    <Button
                      component={Link}
                      href="/admin/people/students/new"
                      variant="contained"
                      startIcon={<PersonAddRoundedIcon />}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Admit First Student
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Complete Student Profile Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(2px)' } } }}
        PaperProps={{ sx: { width: { xs: '100%', sm: 540 }, p: 3.5 } }}
      >
        {selectedStudent && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    bgcolor: '#EEF4FF',
                    color: '#1748D1',
                    fontWeight: 800,
                    fontSize: '22px',
                  }}
                >
                  {selectedStudent.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
                    {selectedStudent.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                    <Chip
                      label={`ID: ${selectedStudent.studentId}`}
                      size="small"
                      sx={{ fontWeight: 800, bgcolor: '#EEF4FF', color: '#1748D1' }}
                    />
                    <StatusChip status={selectedStudent.status} />
                  </Box>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedStudent(null)} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {/* 1. Academic & Batch */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                  ISP Academic Enrollment
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Batch</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedStudent.batchName}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Academic Session</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Session {selectedStudent.admissionAcademicYear}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Admission Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.admissionDate}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Admission Source</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.admissionSource}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* 2. Personal Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Gender &amp; Blood</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.gender} ({selectedStudent.bloodGroup || 'N/A'})</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Date of Birth</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.dob || 'N/A'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Religion &amp; Nationality</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.religion} &bull; {selectedStudent.nationality}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Birth Reg / NID</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.birthRegNumber || selectedStudent.nidNumber || 'Not recorded'}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* 3. Family / Guardian Information */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1' }}>
                    Family &amp; Guardian
                  </Typography>
                  <Chip
                    label={`Primary: ${selectedStudent.primaryGuardian}`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '11px',
                      bgcolor: '#EEF4FF',
                      color: '#1748D1',
                    }}
                  />
                </Box>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Father&apos;s Info</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedStudent.fatherName || 'Not recorded'} {selectedStudent.fatherPhone && `(${selectedStudent.fatherPhone})`}
                    </Typography>
                    {selectedStudent.fatherOccupation && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Occupation: {selectedStudent.fatherOccupation}
                      </Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mother&apos;s Info</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedStudent.motherName || 'Not recorded'} {selectedStudent.motherPhone && `(${selectedStudent.motherPhone})`}
                    </Typography>
                    {selectedStudent.motherOccupation && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Occupation: {selectedStudent.motherOccupation}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* 4. School Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                  School / College Background
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Institution Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedStudent.institutionName || 'Not recorded'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Class &amp; Roll</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.schoolClass} (Roll: {selectedStudent.schoolRoll || 'N/A'})</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Shift &amp; Medium</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedStudent.schoolShift} Shift &bull; {selectedStudent.medium}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* 5. Address */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                  Present Residential Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedStudent.presentAddress || 'Chittagong, Bangladesh'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {selectedStudent.presentArea}, {selectedStudent.presentUpazila}, {selectedStudent.presentDistrict} - {selectedStudent.presentPostalCode}
                </Typography>
              </Box>

              {/* 6. Emergency Contact */}
              {selectedStudent.emergencyName && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#DC2626', mb: 1 }}>
                      Emergency Contact Backup
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedStudent.emergencyName} ({selectedStudent.emergencyRelationship})
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Phone: {selectedStudent.emergencyPhone}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Delete Student Modal */}
      <Dialog open={Boolean(deleteStudentItem)} onClose={() => setDeleteStudentItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete Student Profile
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteStudentItem && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to permanently delete <strong>{deleteStudentItem.fullName}</strong> (ID: {deleteStudentItem.studentId})?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This will delete the student profile, login account, attendance records, and fee ledgers.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteStudentItem(null)} disabled={submittingDelete}>
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
