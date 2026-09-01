'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PageHeader from '@/components/common/PageHeader';
import { ispColors } from '@/theme/colors';

export default function NewStudentAdmissionPage() {
  const router = useRouter();

  // Form State
  const [admissionYear, setAdmissionYear] = React.useState('2028');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [gender, setGender] = React.useState('Male');
  const [dob, setDob] = React.useState('2011-05-14');
  const [address, setAddress] = React.useState('Chittagong, Bangladesh');

  // Academic Enrollment
  const [program, setProgram] = React.useState('SSC');
  const [batch, setBatch] = React.useState('SSC 2027 Science A');

  // Guardian Info
  const [guardianName, setGuardianName] = React.useState('');
  const [guardianPhone, setGuardianPhone] = React.useState('');
  const [relationship, setRelationship] = React.useState('FATHER');

  const [saving, setSaving] = React.useState(false);
  const [generatedId, setGeneratedId] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Simulate atomic sequence generation for 2028
    setTimeout(() => {
      const serial = Math.floor(Math.random() * 900) + 100;
      const newId = `${admissionYear}${serial.toString().padStart(4, '0')}`;
      setGeneratedId(newId);
      setSaving(false);
    }, 600);
  };

  return (
    <Box>
      <PageHeader
        title="Student Admission & Registration"
        subtitle="Admit a student to ISP, assign batch, and generate a permanent Student ID (YYYYSSSS)"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'People', href: '/admin/people/students' },
          { label: 'Admission' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.back()}
          >
            Back to Students
          </Button>
        }
      />

      {generatedId && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: '10px', fontSize: '15px' }}
          action={
            <Button color="inherit" size="small" onClick={() => router.push('/admin/people/students')}>
              View in Directory
            </Button>
          }
        >
          <strong>Admission Completed!</strong> Permanent Student ID generated: <code>{generatedId}</code>.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Section 1: Personal & Contact Information */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  1. Student Personal Information
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Official identification details for institutional records
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      label="Full Name (English)"
                      required
                      fullWidth
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tanvir Hasan Sadi"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select value={gender} label="Gender" onChange={(e) => setGender(e.target.value)}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Student Mobile Phone"
                      required
                      fullWidth
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Email Address (Optional)"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Address"
                      fullWidth
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2: Guardian Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  2. Primary Guardian Information
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Contact details for billing, attendance alerts, and academic notices
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Guardian Name"
                      required
                      fullWidth
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Farid Hasan"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Relationship</InputLabel>
                      <Select
                        value={relationship}
                        label="Relationship"
                        onChange={(e) => setRelationship(e.target.value)}
                      >
                        <MenuItem value="FATHER">Father</MenuItem>
                        <MenuItem value="MOTHER">Mother</MenuItem>
                        <MenuItem value="GUARDIAN">Legal Guardian</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Guardian Mobile Phone"
                      required
                      fullWidth
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Academic Enrollment & Student ID */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  3. Academic Placement
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Assign starting cohort and batch
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <FormControl fullWidth>
                    <InputLabel>Admission Academic Year</InputLabel>
                    <Select
                      value={admissionYear}
                      label="Admission Academic Year"
                      onChange={(e) => setAdmissionYear(e.target.value)}
                    >
                      <MenuItem value="2028">Academic Year 2028 (Active)</MenuItem>
                      <MenuItem value="2029">Academic Year 2029 (Upcoming)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Program</InputLabel>
                    <Select value={program} label="Program" onChange={(e) => setProgram(e.target.value)}>
                      <MenuItem value="SSC">SSC Special Coaching</MenuItem>
                      <MenuItem value="HSC">HSC Science Program</MenuItem>
                      <MenuItem value="ADMISSION">University &amp; Medical Admission</MenuItem>
                      <MenuItem value="ACADEMIC">School Academic (Class 6 - 10)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Initial Batch</InputLabel>
                    <Select value={batch} label="Initial Batch" onChange={(e) => setBatch(e.target.value)}>
                      <MenuItem value="SSC 2027 Science A">SSC 2027 Science A (Morning)</MenuItem>
                      <MenuItem value="SSC 2027 Science B">SSC 2027 Science B (Evening)</MenuItem>
                      <MenuItem value="HSC 2028 Science">HSC 2028 Science</MenuItem>
                      <MenuItem value="Engineering Admission">Engineering Admission</MenuItem>
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 1 }} />

                  {/* ID Format Preview */}
                  <Box sx={{ p: 2, bgcolor: ispColors.primary[50], borderRadius: '8px', border: `1px solid ${ispColors.primary[200]}` }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      STUDENT ID RULE (YYYYSSSS):
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: ispColors.primary[900], mt: 0.5 }}>
                      {admissionYear}XXXX
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Permanently assigned upon submission. Concurrency-safe atomic counter.
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    startIcon={<SaveRoundedIcon />}
                    sx={{ height: 48, fontSize: '16px', fontWeight: 600 }}
                  >
                    {saving ? 'Processing Admission...' : 'Confirm & Admit Student'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
