'use client';

import * as React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Switch,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';

import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { generateRandomPassword } from '@/lib/db/teachers';
import { SystemUser } from '@/lib/db/supabaseUsers';

export default function UsersManagementPage() {
  const { success, error: toastError, info, warning } = useToast();

  const [users, setUsers] = React.useState<SystemUser[]>([]);
  const [counts, setCounts] = React.useState({
    total: 0,
    superadmins: 0,
    admins: 0,
    teachers: 0,
    students: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  // Modals state
  const [openAddAdmin, setOpenAddAdmin] = React.useState(false);
  const [adminName, setAdminName] = React.useState('');
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminPhone, setAdminPhone] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [submittingAdmin, setSubmittingAdmin] = React.useState(false);

  // Password Reset Modal
  const [resetUser, setResetUser] = React.useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = React.useState('');
  const [submittingPassword, setSubmittingPassword] = React.useState(false);

  // Role Change Confirmation Modal
  const [roleChangeUser, setRoleChangeUser] = React.useState<SystemUser | null>(null);
  const [submittingRole, setSubmittingRole] = React.useState(false);

  // Delete Confirmation Modal
  const [deleteUser, setDeleteUser] = React.useState<SystemUser | null>(null);
  const [submittingDelete, setSubmittingDelete] = React.useState(false);

  // Fetch users from API
  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data?.success && Array.isArray(data.users)) {
        setUsers(data.users);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      toastError('Failed to load users from database');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filtered users
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search));

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Handle Add Admin
  const handleOpenAddAdmin = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPhone('');
    setAdminPassword(generateRandomPassword(10));
    setOpenAddAdmin(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      warning('Full Name and Email are required');
      return;
    }

    setSubmittingAdmin(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: adminName,
          email: adminEmail,
          phone: adminPhone,
          password: adminPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create admin');
      }

      success(`Admin user ${adminName} created successfully!`);
      setOpenAddAdmin(false);
      loadUsers();
    } catch (err: any) {
      toastError(err.message || 'Error creating administrator');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  // Handle Status Toggle (Active / Pause)
  const handleToggleStatus = async (user: SystemUser) => {
    if (user.role === 'SUPERADMIN') {
      warning('Superadmin account cannot be paused or deactivated');
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          action: 'TOGGLE_STATUS',
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }
      info(`Account for ${user.fullName} is now ${nextStatus.toLowerCase()}.`);
      loadUsers();
    } catch (err: any) {
      toastError(err.message || 'Error updating status');
      loadUsers();
    }
  };

  // Handle Password Reset
  const handleOpenPasswordReset = (user: SystemUser) => {
    setResetUser(user);
    setNewPassword(generateRandomPassword(10));
  };

  const handleSavePassword = async () => {
    if (!resetUser || !newPassword.trim()) return;

    setSubmittingPassword(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resetUser.id,
          action: 'RESET_PASSWORD',
          password: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      navigator.clipboard.writeText(newPassword.trim());
      success(`Password reset for ${resetUser.fullName}! New password copied to clipboard.`);
      setResetUser(null);
    } catch (err: any) {
      toastError(err.message || 'Error resetting password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Handle Role Assignment (Teacher <-> Admin)
  const handleOpenRoleChange = (user: SystemUser) => {
    if (user.role === 'SUPERADMIN') {
      warning('Superadmin privileges are permanent and cannot be modified');
      return;
    }
    setRoleChangeUser(user);
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChangeUser) return;
    const nextRole = roleChangeUser.role === 'ADMIN' ? 'TEACHER' : 'ADMIN';

    setSubmittingRole(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roleChangeUser.id,
          action: 'CHANGE_ROLE',
          role: nextRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update role');
      }

      success(`Role for ${roleChangeUser.fullName} changed to ${nextRole}!`);
      setRoleChangeUser(null);
      loadUsers();
    } catch (err: any) {
      toastError(err.message || 'Error updating role');
    } finally {
      setSubmittingRole(false);
    }
  };

  // Handle Delete
  const handleOpenDelete = (user: SystemUser) => {
    if (user.role === 'SUPERADMIN') {
      warning('Superadmin account is protected and cannot be deleted');
      return;
    }
    setDeleteUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/users?id=${deleteUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }

      success(`User account for ${deleteUser.fullName} has been deleted.`);
      setDeleteUser(null);
      loadUsers();
    } catch (err: any) {
      toastError(err.message || 'Error deleting user account');
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Role Badge Styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return (
          <Chip
            icon={<SecurityRoundedIcon sx={{ fontSize: '14px !important' }} />}
            label="SUPERADMIN"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '11px',
              bgcolor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D',
            }}
          />
        );
      case 'ADMIN':
        return (
          <Chip
            icon={<AdminPanelSettingsRoundedIcon sx={{ fontSize: '14px !important' }} />}
            label="ADMIN"
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
      case 'TEACHER':
        return (
          <Chip
            icon={<SchoolRoundedIcon sx={{ fontSize: '14px !important' }} />}
            label="TEACHER"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '11px',
              bgcolor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
            }}
          />
        );
      case 'STUDENT':
        return (
          <Chip
            label="STUDENT"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '11px',
              bgcolor: '#F3E8FF',
              color: '#6B21A8',
            }}
          />
        );
      default:
        return <Chip label={role} size="small" sx={{ fontWeight: 600, fontSize: '11px' }} />;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Users &amp; Access Management"
        subtitle="Manage system accounts, assign administrator privileges, control active statuses, and configure passwords."
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddRoundedIcon />}
            onClick={handleOpenAddAdmin}
            sx={{
              height: 42,
              px: 2.5,
              fontWeight: 700,
              bgcolor: '#1748D1',
              '&:hover': { bgcolor: '#092B91' },
            }}
          >
            Add New Admin
          </Button>
        }
      />

      {/* Metrics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              TOTAL USERS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#061B57', mt: 0.5 }}>
              {counts.total}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              All registered accounts
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              ADMINISTRATORS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1748D1', mt: 0.5 }}>
              {counts.superadmins + counts.admins}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {counts.superadmins} Superadmin &bull; {counts.admins} Admins
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              TEACHING FACULTY
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', mt: 0.5 }}>
              {counts.teachers}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Educators in database
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${ispColors.border.default}` }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              ACTIVE ACCOUNTS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
              {counts.active}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {counts.inactive} paused accounts
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Toolbar */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email address, or phone..."
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
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="SUPERADMIN">Superadmin</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="TEACHER">Teacher</MenuItem>
                <MenuItem value="STUDENT">Student</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="INACTIVE">Inactive / Paused</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Users Table */}
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
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((user) => {
              const isSuperadmin = user.role === 'SUPERADMIN';

              return (
                <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={user.avatarUrl}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isSuperadmin ? '#92400E' : user.role === 'ADMIN' ? '#1748D1' : '#061B57',
                          fontWeight: 700,
                          fontSize: '15px',
                        }}
                      >
                        {user.fullName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                            {user.fullName}
                          </Typography>
                          {isSuperadmin && (
                            <Tooltip title="Superadmin — Full permanent system access">
                              <SecurityRoundedIcon sx={{ fontSize: 16, color: '#D97706' }} />
                            </Tooltip>
                          )}
                        </Box>
                        {user.metadata?.employeeId && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '11.5px' }}>
                            EmpID: <strong style={{ color: '#1748D1' }}>{user.metadata.employeeId}</strong>
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#061B57' }}>
                      {user.email}
                    </Typography>
                    {user.phone ? (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {user.phone}
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        No phone recorded
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRoleBadge(user.role)}
                      {!isSuperadmin && (user.role === 'ADMIN' || user.role === 'TEACHER') && (
                        <Tooltip title={user.role === 'TEACHER' ? 'Assign Admin Privileges' : 'Demote to Teacher'}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRoleChange(user)}
                            sx={{ color: '#1748D1', p: 0.5, '&:hover': { bgcolor: '#EEF4FF' } }}
                          >
                            <SwapHorizRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusChip status={user.status} />
                      {isSuperadmin ? (
                        <Tooltip title="Superadmin account cannot be paused or deactivated">
                          <span>
                            <Switch size="small" checked disabled />
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title={user.status === 'ACTIVE' ? 'Click to Pause / Deactivate' : 'Click to Activate'}>
                          <Switch
                            size="small"
                            checked={user.status === 'ACTIVE'}
                            onChange={() => handleToggleStatus(user)}
                            color="primary"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Tooltip title="Change / Reset Password">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPasswordReset(user)}
                          sx={{ color: '#D97706', '&:hover': { bgcolor: '#FEF3C7' } }}
                        >
                          <KeyRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {isSuperadmin ? (
                        <Tooltip title="Superadmin cannot be deleted">
                          <span>
                            <IconButton size="small" disabled sx={{ color: 'text.disabled' }}>
                              <LockRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Delete User Account">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDelete(user)}
                            sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading system users from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <PeopleAltRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Users Found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      No registered users match your search or filter options.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearch('');
                        setRoleFilter('ALL');
                        setStatusFilter('ALL');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Admin Modal */}
      <Dialog open={openAddAdmin} onClose={() => setOpenAddAdmin(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateAdmin}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Add New Administrator
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Full Name"
                placeholder="e.g. Administrator Name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                type="email"
                label="Email Address"
                placeholder="e.g. admin@ispctg.live"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                helperText="This email will be used to log into the admin console."
              />
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="e.g. 01841000000"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
              />
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    INITIAL PASSWORD
                  </Typography>
                  <Tooltip title="Generate New Random Password">
                    <IconButton size="small" onClick={() => setAdminPassword(generateRandomPassword(10))}>
                      <RefreshRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TextField
                  required
                  fullWidth
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Copy Password">
                            <IconButton
                              size="small"
                              onClick={() => {
                                navigator.clipboard.writeText(adminPassword);
                                info('Password copied to clipboard!');
                              }}
                            >
                              <ContentCopyRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenAddAdmin(false)} disabled={submittingAdmin}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingAdmin}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingAdmin ? 'Creating Admin...' : 'Create Admin'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={Boolean(resetUser)} onClose={() => setResetUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
          Reset Password
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {resetUser && (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Resetting password for: <strong>{resetUser.fullName}</strong> ({resetUser.email})
              </Typography>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    NEW PASSWORD
                  </Typography>
                  <Tooltip title="Generate Random Password">
                    <IconButton size="small" onClick={() => setNewPassword(generateRandomPassword(10))}>
                      <RefreshRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TextField
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Box>
              <Alert severity="info" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                The user can use this password to immediately authenticate to the portal.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setResetUser(null)} disabled={submittingPassword}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePassword}
            disabled={submittingPassword}
            sx={{ bgcolor: '#D97706', fontWeight: 700 }}
          >
            {submittingPassword ? 'Saving...' : 'Copy & Save Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Confirmation Modal */}
      <Dialog open={Boolean(roleChangeUser)} onClose={() => setRoleChangeUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
          Change Account Role
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {roleChangeUser && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to change the role of <strong>{roleChangeUser.fullName}</strong> from{' '}
                <strong style={{ color: '#1748D1' }}>{roleChangeUser.role}</strong> to{' '}
                <strong style={{ color: '#10B981' }}>
                  {roleChangeUser.role === 'ADMIN' ? 'TEACHER' : 'ADMIN'}
                </strong>
                ?
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {roleChangeUser.role === 'TEACHER'
                  ? 'Assigning the Admin role grants this user administrative console access to manage students, batches, and operations.'
                  : 'Demoting to Teacher restricts access to the teacher portal and personal class schedules.'}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setRoleChangeUser(null)} disabled={submittingRole}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRoleChange}
            disabled={submittingRole}
            sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
          >
            {submittingRole ? 'Updating Role...' : 'Confirm Role Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={Boolean(deleteUser)} onClose={() => setDeleteUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle component="div" sx={{ fontWeight: 800, color: '#EF4444', pb: 1 }}>
          Delete User Account
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {deleteUser && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to permanently delete the account for{' '}
                <strong>{deleteUser.fullName}</strong> ({deleteUser.email})?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '12.5px' }}>
                This action will delete the user account and associated teacher records. This action cannot be undone.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDeleteUser(null)} disabled={submittingDelete}>
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
