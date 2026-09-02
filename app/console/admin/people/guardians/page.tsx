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
  Chip,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Drawer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { GuardianRecord } from '@/lib/db/supabaseGuardians';

export default function GuardiansDirectoryPage() {
  const { success, error: toastError, info } = useToast();

  const [guardians, setGuardians] = React.useState<GuardianRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState<string>('ALL');

  // Drawer & Edit Modal States
  const [selectedGuardian, setSelectedGuardian] = React.useState<GuardianRecord | null>(null);
  const [editGuardian, setEditGuardian] = React.useState<GuardianRecord | null>(null);

  // Edit Form Fields
  const [editName, setEditName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editWhatsapp, setEditWhatsapp] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editOccupation, setEditOccupation] = React.useState('');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);

  const loadGuardians = React.useCallback(
    async (q?: string, filter?: string) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (q && q.trim()) params.set('q', q.trim());
        if (filter && filter !== 'ALL') params.set('filter', filter);

        const url = `/api/guardians${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.success && Array.isArray(data.guardians)) {
          setGuardians(data.guardians);
        } else {
          setGuardians([]);
        }
      } catch (err) {
        console.error('Failed to load guardians:', err);
        toastError('Failed to load guardians from database');
        setGuardians([]);
      } finally {
        setLoading(false);
      }
    },
    [toastError]
  );

  React.useEffect(() => {
    loadGuardians(searchTerm, selectedFilter);
  }, [loadGuardians, selectedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGuardians(searchTerm, selectedFilter);
  };

  const handleCopyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    info(`Copied phone number: ${phone}`);
  };

  // Open Edit Modal
  const handleOpenEdit = (g: GuardianRecord) => {
    setEditGuardian(g);
    setEditName(g.fullName);
    setEditPhone(g.phone);
    setEditWhatsapp(g.whatsappNumber || '');
    setEditEmail(g.email || '');
    setEditOccupation(g.occupation || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGuardian || !editName.trim() || !editPhone.trim()) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch('/api/guardians', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editGuardian.id,
          fullName: editName,
          phone: editPhone,
          whatsappNumber: editWhatsapp,
          email: editEmail,
          occupation: editOccupation,
          relationship: editGuardian.relationship,
          linkedStudentIds: editGuardian.linkedStudents.map((ls) => ls.id),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update guardian');
      }

      success(`Guardian ${editName} updated successfully!`);
      setEditGuardian(null);
      loadGuardians(searchTerm, selectedFilter);
    } catch (err: any) {
      toastError(err.message || 'Error updating guardian');
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Parents &amp; Guardians Directory"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'People', href: '/admin/people/guardians' },
          { label: 'Guardians' },
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

      {/* Filter and Search Controls */}
      <Box sx={{ mb: 3.5 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 2 }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              placeholder="Search by guardian name, phone, email, child's name, or student ID..."
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
                maxWidth: 580,
              }}
            />
          </form>
        </Box>

        {/* Segmented Filter Bar */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#061B57', mr: 1, pl: 0.5 }}>
            Filter:
          </Typography>

          {[
            { key: 'ALL', label: 'All Guardians' },
            { key: 'PRIMARY', label: 'Primary Contacts Only' },
            { key: 'FATHER', label: 'Fathers' },
            { key: 'MOTHER', label: 'Mothers' },
            { key: 'LEGAL_GUARDIAN', label: 'Other Guardians' },
          ].map((f) => {
            const isSelected = selectedFilter === f.key;
            return (
              <Chip
                key={f.key}
                clickable
                label={f.label}
                onClick={() => setSelectedFilter(f.key)}
                sx={{
                  height: 32,
                  fontWeight: isSelected ? 800 : 600,
                  bgcolor: isSelected ? '#1748D1' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  border: `1px solid ${isSelected ? '#1748D1' : '#CBD5E1'}`,
                  '&:hover': {
                    bgcolor: isSelected ? '#092B91' : '#F1F5F9',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Guardians Table (No Card background) */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          border: `1px solid ${ispColors.border.default}`,
          boxShadow: 'none',
        }}
      >
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px', py: 1.8 }}>Guardian Name &amp; Role</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Contact Information</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Occupation</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '13px' }}>Linked Student(s)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '13px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {guardians.map((g) => {
              const isMother = g.relationship === 'MOTHER';
              const isFather = g.relationship === 'FATHER';

              return (
                <TableRow key={g.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {/* Guardian Name & Role */}
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isMother ? '#FDF2F8' : isFather ? '#EEF4FF' : '#F1F5F9',
                          color: isMother ? '#BE185D' : isFather ? '#1748D1' : '#334155',
                          fontWeight: 800,
                          fontSize: '15px',
                          border: `1px solid ${isMother ? '#FBCFE8' : isFather ? '#C7D7FE' : '#E2E8F0'}`,
                        }}
                      >
                        {g.fullName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#061B57', fontSize: '14.5px' }}>
                          {g.fullName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.4 }}>
                          <Chip
                            label={g.relationshipLabel}
                            size="small"
                            sx={{
                              height: 20,
                              fontWeight: 700,
                              fontSize: '11px',
                              bgcolor: isMother ? '#FDF2F8' : '#F1F5F9',
                              color: isMother ? '#BE185D' : '#334155',
                            }}
                          />
                          {g.isPrimary && (
                            <Chip
                              label="PRIMARY"
                              size="small"
                              sx={{
                                height: 20,
                                fontWeight: 800,
                                fontSize: '10px',
                                bgcolor: '#ECFDF5',
                                color: '#065F46',
                                border: '1px solid #A7F3D0',
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Contact Details */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                        {g.phone || 'No phone'}
                      </Typography>
                      {g.phone && (
                        <Tooltip title="Copy Phone Number">
                          <IconButton
                            size="small"
                            onClick={(e) => handleCopyPhone(e, g.phone)}
                            sx={{ p: 0.3, color: '#64748B' }}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.4 }}>
                      {g.whatsappNumber && (
                        <Box
                          component="a"
                          href={`https://wa.me/${g.whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            color: '#16A34A',
                            fontSize: '12px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          <WhatsAppIcon sx={{ fontSize: 14 }} />
                          WhatsApp
                        </Box>
                      )}
                      {g.email && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {g.email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Occupation */}
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                      {g.occupation || 'Not specified'}
                    </Typography>
                  </TableCell>

                  {/* Linked Students */}
                  <TableCell>
                    <Stack spacing={0.8}>
                      {g.linkedStudents.map((child) => (
                        <Box
                          key={child.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 0.8,
                            px: 1.2,
                            borderRadius: '8px',
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            maxWidth: 260,
                          }}
                        >
                          <SchoolRoundedIcon sx={{ fontSize: 16, color: '#1748D1' }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#061B57', fontSize: '13px' }}>
                              {child.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 700, display: 'block' }}>
                              ID: {child.studentId}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                      <Tooltip title="View Guardian Profile">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedGuardian(g)}
                          sx={{ color: '#1748D1', '&:hover': { bgcolor: '#EEF4FF' } }}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Guardian Information">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(g)}
                          sx={{ color: '#061B57', '&:hover': { bgcolor: '#F1F5F9' } }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading guardians from database...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : guardians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
                    <SecurityRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#061B57', fontWeight: 800, mb: 0.5 }}>
                      No Guardians Recorded Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '13.5px' }}>
                      Parents and guardians are automatically registered when admitting students.
                    </Typography>
                    <Button
                      component={Link}
                      href="/admin/people/students/new"
                      variant="contained"
                      startIcon={<PersonAddRoundedIcon />}
                      sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
                    >
                      Admit Student &amp; Add Guardian
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ============================================================= */}
      {/* GUARDIAN PROFILE DRAWER                                       */}
      {/* ============================================================= */}
      <Drawer
        anchor="right"
        open={Boolean(selectedGuardian)}
        onClose={() => setSelectedGuardian(null)}
        slotProps={{
          backdrop: { sx: { backdropFilter: 'blur(2px)' } },
          paper: { sx: { width: { xs: '100%', sm: 540 }, p: 3.5, bgcolor: '#FFFFFF' } },
        }}
      >
        {selectedGuardian && (
          <Box>
            {/* Header */}
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
                  {selectedGuardian.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
                    {selectedGuardian.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                    <Chip
                      label={selectedGuardian.relationshipLabel}
                      size="small"
                      sx={{ fontWeight: 800, bgcolor: '#EEF4FF', color: '#1748D1' }}
                    />
                    {selectedGuardian.isPrimary && (
                      <Chip
                        label="PRIMARY CONTACT"
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: '#ECFDF5', color: '#065F46' }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedGuardian(null)} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Quick Action Buttons */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
              {selectedGuardian.phone && (
                <Button
                  component="a"
                  href={`tel:${selectedGuardian.phone}`}
                  variant="outlined"
                  fullWidth
                  startIcon={<PhoneRoundedIcon />}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
                >
                  Call Phone
                </Button>
              )}
              {selectedGuardian.whatsappNumber && (
                <Button
                  component="a"
                  href={`https://wa.me/${selectedGuardian.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  variant="contained"
                  fullWidth
                  startIcon={<WhatsAppIcon />}
                  sx={{ bgcolor: '#16A34A', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#15803D' } }}
                >
                  WhatsApp
                </Button>
              )}
            </Stack>

            <Stack spacing={3}>
              {/* Contact Details */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                  Contact Information
                </Typography>
                <Card sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                          {selectedGuardian.phone || 'No phone recorded'}
                        </Typography>
                      </Box>
                      {selectedGuardian.whatsappNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WhatsAppIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#061B57' }}>
                            {selectedGuardian.whatsappNumber} (WhatsApp)
                          </Typography>
                        </Box>
                      )}
                      {selectedGuardian.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                          <Typography variant="body2" sx={{ color: '#061B57' }}>
                            {selectedGuardian.email}
                          </Typography>
                        </Box>
                      )}
                      {selectedGuardian.occupation && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkOutlineRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                          <Typography variant="body2" sx={{ color: '#061B57', fontWeight: 600 }}>
                            Occupation: {selectedGuardian.occupation}
                          </Typography>
                        </Box>
                      )}
                      {selectedGuardian.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <HomeRoundedIcon sx={{ fontSize: 18, color: '#64748B', mt: 0.2 }} />
                          <Typography variant="body2" sx={{ color: '#061B57' }}>
                            {selectedGuardian.address}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Divider />

              {/* Linked Students */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                  Enrolled Students (Children / Wards)
                </Typography>
                <Stack spacing={1.5}>
                  {selectedGuardian.linkedStudents.map((child) => (
                    <Card
                      key={child.id}
                      sx={{
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        boxShadow: 'none',
                        p: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: '#061B57' }}>
                            {child.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 800, fontSize: '12px' }}>
                            Student ID: {child.studentId}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '13px' }}>
                            {child.batchName || 'General Batch'} &bull; Session {child.admissionAcademicYear || 2028}
                          </Typography>
                        </Box>
                        {child.isPrimaryForStudent && (
                          <Chip
                            label="PRIMARY"
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '10px', bgcolor: '#ECFDF5', color: '#065F46' }}
                          />
                        )}
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* ============================================================= */}
      {/* EDIT GUARDIAN MODAL                                           */}
      {/* ============================================================= */}
      <Dialog open={Boolean(editGuardian)} onClose={() => setEditGuardian(null)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveEdit}>
          <DialogTitle component="div" sx={{ fontWeight: 800, color: '#061B57', pb: 1 }}>
            Edit Guardian Information
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2.5 }}>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Primary Phone Number"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
              <TextField
                fullWidth
                label="WhatsApp Number"
                value={editWhatsapp}
                onChange={(e) => setEditWhatsapp(e.target.value)}
              />
              <TextField
                fullWidth
                label="Email Address"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Occupation / Profession"
                value={editOccupation}
                onChange={(e) => setEditOccupation(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setEditGuardian(null)} disabled={submittingEdit}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingEdit}
              sx={{ bgcolor: '#1748D1', fontWeight: 700 }}
            >
              {submittingEdit ? 'Saving...' : 'Update Guardian'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
