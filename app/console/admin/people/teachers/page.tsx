'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
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
  CircularProgress,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { Teacher } from '@/lib/db/teachers';

export default function TeachersPage() {
  const { success, error: toastError, info } = useToast();
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [genderFilter, setGenderFilter] = React.useState('ALL');

  // Modal view for a specific teacher
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);

  // Edit Teacher Modal State
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null);
  const [editFullName, setEditFullName] = React.useState('');
  const [editNickname, setEditNickname] = React.useState('');
  const [editDesignation, setEditDesignation] = React.useState('');
  const [editEducationalDetails, setEditEducationalDetails] = React.useState('');
  const [editExperience, setEditExperience] = React.useState('');
  const [editDob, setEditDob] = React.useState('');
  const [editMobile, setEditMobile] = React.useState('');
  const [editWhatsapp, setEditWhatsapp] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editBio, setEditBio] = React.useState('');
  const [editGender, setEditGender] = React.useState<'Male' | 'Female' | 'Other'>('Male');
  const [editStatus, setEditStatus] = React.useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [savingEdit, setSavingEdit] = React.useState(false);

  // Fetch live teachers from API
  const loadTeachers = React.useCallback(() => {
    setLoading(true);
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

  React.useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.fullName.toLowerCase().includes(search.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        t.mobile.includes(search) ||
        (t.educationalDetails && t.educationalDetails.toLowerCase().includes(search.toLowerCase())) ||
        (t.experience && t.experience.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchGender = genderFilter === 'ALL' || t.gender === genderFilter;

      return matchSearch && matchStatus && matchGender;
    });
  }, [teachers, search, statusFilter, genderFilter]);

  // Open Edit Modal
  const handleOpenEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFullName(teacher.fullName);
    setEditNickname(teacher.nickname || '');
    setEditDesignation(teacher.designation || '');
    setEditEducationalDetails(teacher.educationalDetails || '');
    setEditExperience(teacher.experience || '');
    setEditDob(teacher.dob || '');
    setEditMobile(teacher.mobile);
    setEditWhatsapp(teacher.whatsapp || teacher.mobile);
    setEditEmail(teacher.email);
    setEditBio(teacher.bio || '');
    setEditGender(teacher.gender || 'Male');
    setEditStatus(teacher.status);
  };

  // Save Edit
  const handleSaveEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setSavingEdit(true);
    try {
      const res = await fetch('/api/teachers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: editingTeacher.employeeId,
          fullName: editFullName.trim(),
          nickname: editNickname.trim(),
          designation: editDesignation.trim(),
          educationalDetails: editEducationalDetails.trim(),
          experience: editExperience.trim(),
          dob: editDob || undefined,
          mobile: editMobile.trim(),
          whatsapp: editWhatsapp.trim(),
          email: editEmail.trim(),
          bio: editBio.trim(),
          gender: editGender,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update teacher');
      }

      success(`Teacher profile for ${editFullName} updated successfully!`);
      setEditingTeacher(null);
      loadTeachers();
    } catch (err: any) {
      toastError(err.message || 'Error updating teacher profile');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Teachers Directory"
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
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
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
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
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
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              SENIOR MENTORS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1748D1', mt: 0.5 }}>
              {teachers.filter((t) => (t.educationalDetails || '').includes('CUET') || (t.educationalDetails || '').includes('MBBS') || (t.designation || '').toLowerCase().includes('senior')).length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Senior educators &amp; scholars
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              JUNIOR MENTORS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
              {teachers.filter((t) => (t.designation || '').toLowerCase().includes('junior') || (t.designation || '').toLowerCase().includes('lecturer') || (t.designation || '').toLowerCase().includes('associate')).length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Associate educators
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
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Teachers Table Container */}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '11px' }}>
                          EmpID: <strong style={{ color: '#061B57' }}>{teacher.employeeId}</strong>
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
                            <ContentCopyRoundedIcon sx={{ fontSize: 12 }} />
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
                      <Tooltip title={`WhatsApp: ${teacher.whatsapp}`}>
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

                    <Tooltip title="View Complete Profile">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedTeacher(teacher)}
                        sx={{ color: '#64748B', '&:hover': { color: '#1748D1', bgcolor: '#EEF4FF' } }}
                      >
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit Teacher Profile">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditTeacher(teacher)}
                        sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                      >
                        <EditRoundedIcon fontSize="small" />
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

      {/* Edit Teacher Modal */}
      <Dialog
        open={Boolean(editingTeacher)}
        onClose={() => !savingEdit && setEditingTeacher(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
      >
        <form onSubmit={handleSaveEditTeacher}>
          <DialogTitle sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Teacher Profile
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              {/* 1. Basic Information */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Nickname"
                    placeholder="e.g. Nayan"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Designation / Title"
                    placeholder="e.g. Senior Faculty"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={editGender}
                      label="Gender"
                      onChange={(e) => setEditGender(e.target.value as any)}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2.5}
                    label="Short Bio &amp; Teaching Style"
                    placeholder="Brief summary of teaching philosophy and classroom approach..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* 2. Academic & Experience (Experience after Bio) */}
              <TextField
                fullWidth
                multiline
                rows={2.5}
                label="Educational Details"
                placeholder="e.g. BSc in Mechanical Engineering, CUET"
                value={editEducationalDetails}
                onChange={(e) => setEditEducationalDetails(e.target.value)}
                helperText="Mention university, degree, and relevant specialization."
              />

              <TextField
                fullWidth
                multiline
                rows={2.5}
                label="Teaching Experience"
                placeholder="e.g. 5+ years teaching Engineering Admission &amp; HSC Physics"
                value={editExperience}
                onChange={(e) => setEditExperience(e.target.value)}
              />

              {/* 3. Contact & Status */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Mobile Number"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="WhatsApp Number"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    label="Login Email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editStatus}
                      label="Status"
                      onChange={(e) => setEditStatus(e.target.value as any)}
                    >
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditingTeacher(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {savingEdit ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
                    {selectedTeacher.fullName}
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
                      onClick={() => {
                        const text = `ISP Digital Campus — Teacher Login Credentials\nEmployee ID: ${selectedTeacher.employeeId}\nName: ${selectedTeacher.fullName}\nLogin Email: ${selectedTeacher.email}\nPrimary Password: ${selectedTeacher.initialPassword || '********'}\nPortal: https://console.ispctg.live/login`;
                        navigator.clipboard.writeText(text);
                        success(`Credentials copied for ${selectedTeacher.fullName} (${selectedTeacher.employeeId})`);
                      }}
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
                      {selectedTeacher.initialPassword || 'Configured in User Account'}
                    </code>
                  </Typography>
                </Alert>

                {/* Personal & Professional Details */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      DESIGNATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                      {selectedTeacher.designation || 'Faculty Member'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      STATUS
                    </Typography>
                    <Box sx={{ mt: 0.3 }}>
                      <StatusChip status={selectedTeacher.status} />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      DATE OF BIRTH &amp; GENDER
                    </Typography>
                    <Typography variant="body2">
                      {selectedTeacher.dob ? `${selectedTeacher.dob} · ` : ''}
                      {selectedTeacher.gender || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      CONTACT CHANNELS
                    </Typography>
                    <Typography variant="body2">
                      Phone: <strong>{selectedTeacher.mobile}</strong>
                      {selectedTeacher.whatsapp && selectedTeacher.whatsapp !== selectedTeacher.mobile && (
                        <> &bull; WhatsApp: <strong>{selectedTeacher.whatsapp}</strong></>
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      EDUCATION &amp; SPECIALIZATION
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#061B57' }}>
                      {selectedTeacher.educationalDetails || 'Not specified'}
                    </Typography>
                  </Box>

                  {selectedTeacher.experience && (
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        TEACHING EXPERIENCE
                      </Typography>
                      <Typography variant="body2">{selectedTeacher.experience}</Typography>
                    </Box>
                  )}

                  {selectedTeacher.bio && (
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        BIOGRAPHY / NOTES
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {selectedTeacher.bio}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setSelectedTeacher(null)} sx={{ fontWeight: 600 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
