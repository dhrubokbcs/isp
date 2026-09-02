'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { Teacher, INITIAL_TEACHERS } from '@/lib/db/teachers';

export default function TeachersPage() {
  const { success, info } = useToast();
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [genderFilter, setGenderFilter] = React.useState('ALL');

  // Modal view for a specific teacher
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);

  // Fetch live teachers from API on mount
  React.useEffect(() => {
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.teachers)) {
          setTeachers(data.teachers);
        }
      })
      .catch((err) => console.error('Error loading teachers:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.fullName.toLowerCase().includes(search.toLowerCase()) ||
        t.nickname.toLowerCase().includes(search.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        t.mobile.includes(search) ||
        t.educationalDetails.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchGender = genderFilter === 'ALL' || t.gender === genderFilter;

      return matchSearch && matchStatus && matchGender;
    });
  }, [teachers, search, statusFilter, genderFilter]);

  const handleCopyCredentials = (teacher: Teacher) => {
    const text = `ISP Digital Campus — Teacher Login Credentials\nEmployee ID: ${teacher.employeeId}\nName: ${teacher.fullName}\nLogin Email: ${teacher.email}\nPrimary Password: ${teacher.initialPassword || '********'}\nPortal: https://console.ispctg.live/login`;
    navigator.clipboard.writeText(text);
    success(`Credentials copied for ${teacher.fullName} (${teacher.employeeId})`);
  };

  const handleToggleStatus = async (employeeId: string) => {
    let nextStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.employeeId === employeeId) {
          nextStatus = t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    if (selectedTeacher && selectedTeacher.employeeId === employeeId) {
      setSelectedTeacher((prev) =>
        prev ? { ...prev, status: nextStatus } : null
      );
    }
    info(`Status updated to ${nextStatus}.`);

    try {
      await fetch('/api/teachers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, status: nextStatus }),
      });
    } catch (e) {
      console.error('Failed to sync status to database:', e);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Teachers Directory"
        subtitle={`Total Teachers: ${teachers.length} (Active: ${teachers.filter((t) => t.status === 'ACTIVE').length})`}
        action={
          <Button
            variant="contained"
            component={Link}
            href="/admin/people/teachers/new"
            startIcon={<PersonAddRoundedIcon />}
            sx={{
              height: 42,
              px: 2.5,
              fontWeight: 700,
              bgcolor: '#1748D1',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Add New Teacher
          </Button>
        }
      />

      {/* Metrics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              TOTAL TEACHERS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#061B57', mt: 0.5 }}>
              {teachers.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#15965A', fontWeight: 600 }}>
              All registered educators
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              ACTIVE IN SERVICE
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#15965A', mt: 0.5 }}>
              {teachers.filter((t) => t.status === 'ACTIVE').length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Taking active classes
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              SENIOR MENTORS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1748D1', mt: 0.5 }}>
              {teachers.filter((t) => t.educationalDetails.includes('CUET') || t.educationalDetails.includes('MBBS')).length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              CUET &amp; Medical scholars
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              NEXT EMPLOYEE ID
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
              {`ISP${Math.max(...teachers.map((t) => parseInt(t.employeeId.replace(/\D/g, '') || '1000', 10)), 1000) + 1}`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Sequential auto-counter
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Search Toolbar */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by teacher name, Employee ID (ISP1001), mobile, email, or degree..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={genderFilter}
                label="Gender"
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Genders</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Teachers Table */}
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
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher.employeeId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={teacher.avatarUrl}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#061B57',
                        fontWeight: 700,
                        fontSize: '15px',
                      }}
                    >
                      {teacher.fullName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57', lineHeight: 1.3 }}>
                        {teacher.fullName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '11.5px' }}>
                          EmpID: <strong style={{ color: '#1748D1' }}>{teacher.employeeId}</strong>
                        </Typography>
                        <Tooltip title={`Copy Employee ID: ${teacher.employeeId}`}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(teacher.employeeId);
                              success(`Copied: ${teacher.employeeId}`);
                            }}
                            sx={{
                              p: 0.2,
                              color: 'text.secondary',
                              '&:hover': { color: '#1748D1', bgcolor: '#EEF4FF' },
                            }}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <PhoneRoundedIcon sx={{ fontSize: 14, color: '#1748D1' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {teacher.mobile}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <EmailRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {teacher.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <StatusChip status={teacher.status} />
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                    {teacher.whatsapp && (
                      <Tooltip title={`Chat on WhatsApp (${teacher.whatsapp})`}>
                        <IconButton
                          size="small"
                          component="a"
                          href={`https://wa.me/${teacher.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#25D366' }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="View Complete Profile &amp; Credentials">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedTeacher(teacher)}
                        sx={{ color: '#1748D1' }}
                      >
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Copy Login Credentials">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyCredentials(teacher)}
                        sx={{ color: '#D97706' }}
                      >
                        <KeyRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading educators from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 420, mx: 'auto', textAlign: 'center' }}>
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
                      <PersonAddRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Teachers in Database Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px', lineHeight: 1.6 }}>
                      {search || statusFilter !== 'ALL' || genderFilter !== 'ALL'
                        ? 'No teachers match your search or filter criteria. Try clearing your search.'
                        : 'There are currently no teachers recorded in the database. Click the button below to register your first educator.'}
                    </Typography>
                    {!search && statusFilter === 'ALL' && genderFilter === 'ALL' && (
                      <Button
                        variant="contained"
                        component={Link}
                        href="/admin/people/teachers/new"
                        startIcon={<PersonAddRoundedIcon />}
                        sx={{
                          bgcolor: '#1748D1',
                          fontWeight: 700,
                          px: 3,
                          py: 1,
                          '&:hover': { bgcolor: '#092B91' },
                        }}
                      >
                        Add First Teacher
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Teacher Profile & Credentials Modal */}
      <Dialog
        open={Boolean(selectedTeacher)}
        onClose={() => setSelectedTeacher(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
      >
        {selectedTeacher && (
          <>
            <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={selectedTeacher.avatarUrl}
                  sx={{ width: 44, height: 44, bgcolor: '#061B57', fontWeight: 800 }}
                >
                  {selectedTeacher.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: '#061B57' }}>
                    {selectedTeacher.fullName} {selectedTeacher.nickname ? `(${selectedTeacher.nickname})` : ''}
                  </Typography>
                  <Chip
                    label={selectedTeacher.employeeId}
                    size="small"
                    sx={{ bgcolor: '#EEF4FF', color: '#1748D1', fontWeight: 800, fontSize: '11px' }}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedTeacher(null)} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3 }}>
              <Stack spacing={3}>
                {/* Credentials Alert Box */}
                <Alert
                  severity="info"
                  icon={<KeyRoundedIcon />}
                  action={
                    <Button
                      size="small"
                      startIcon={<ContentCopyRoundedIcon />}
                      onClick={() => handleCopyCredentials(selectedTeacher)}
                      sx={{ fontWeight: 700 }}
                    >
                      Copy
                    </Button>
                  }
                  sx={{ borderRadius: '12px' }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Portal Login Credentials
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '13.5px' }}>
                    <strong>Username:</strong> {selectedTeacher.email} &bull; <strong>Password:</strong>{' '}
                    <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {selectedTeacher.initialPassword || '********'}
                    </code>
                  </Typography>
                </Alert>

                {/* Information Grid */}
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      GENDER &bull; BIRTHDAY
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedTeacher.gender} &bull; {selectedTeacher.dob || 'Not specified'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      ACCOUNT STATUS
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <StatusChip status={selectedTeacher.status} />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      MOBILE PHONE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedTeacher.mobile}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      WHATSAPP NUMBER
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedTeacher.whatsapp || selectedTeacher.mobile}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      EDUCATIONAL QUALIFICATIONS
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedTeacher.educationalDetails}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      TEACHING EXPERIENCE
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedTeacher.experience || 'Not specified'}
                    </Typography>
                  </Grid>

                  {selectedTeacher.bio && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        SHORT BIO &amp; TEACHING PHILOSOPHY
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {selectedTeacher.bio}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button
                color={selectedTeacher.status === 'ACTIVE' ? 'error' : 'success'}
                onClick={() => handleToggleStatus(selectedTeacher.employeeId)}
                sx={{ fontWeight: 700 }}
              >
                {selectedTeacher.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
              </Button>

              <Button onClick={() => setSelectedTeacher(null)} variant="contained" sx={{ bgcolor: '#061B57' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
