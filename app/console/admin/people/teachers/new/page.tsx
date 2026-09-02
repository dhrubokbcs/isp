'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Stack,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';
import { generateRandomPassword } from '@/lib/db/teachers';

export default function AddTeacherPage() {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  // Form Fields
  const [fullName, setFullName] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState<'Male' | 'Female' | 'Other'>('Male');
  const [bio, setBio] = React.useState('');
  const [educationalDetails, setEducationalDetails] = React.useState('');
  const [experience, setExperience] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [sameAsMobile, setSameAsMobile] = React.useState(true);
  const [email, setEmail] = React.useState('');

  // Generated Credentials State
  const [previewId, setPreviewId] = React.useState('ISP1001');
  const [generatedPassword, setGeneratedPassword] = React.useState('');

  // Submit and feedback states
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successTeacher, setSuccessTeacher] = React.useState<any | null>(null);

  // Initialize random password and fetch next employee ID on client mount
  React.useEffect(() => {
    setGeneratedPassword(generateRandomPassword());
    fetch('/api/teachers')
      .then((res) => res.json())
      .then((data) => {
        if (data?.nextEmployeeId) {
          setPreviewId(data.nextEmployeeId);
        }
      })
      .catch(() => {});
  }, []);

  const handleMobileChange = (val: string) => {
    setMobile(val);
    if (sameAsMobile) {
      setWhatsapp(val);
    }
  };

  const handleSameAsMobileToggle = (checked: boolean) => {
    setSameAsMobile(checked);
    if (checked) {
      setWhatsapp(mobile);
    }
  };

  const handleRegeneratePassword = () => {
    setGeneratedPassword(generateRandomPassword());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please provide the teacher\'s Full Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid Email Address for login.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMessage('Please provide a Mobile Number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          nickname,
          dob,
          gender,
          bio,
          educationalDetails,
          experience,
          mobile,
          whatsapp: sameAsMobile ? mobile : whatsapp,
          email,
          initialPassword: generatedPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add teacher');
      }

      setSuccessTeacher(data.teacher);
      success(`Teacher ${data.teacher.fullName} registered successfully!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving teacher');
      toastError(err.message || 'Failed to register teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successTeacher) return;
    const text = `ISP Digital Campus — Teacher Login Credentials\nEmployee ID: ${successTeacher.employeeId}\nFull Name: ${successTeacher.fullName}\nLogin Email: ${successTeacher.email}\nPrimary Password: ${successTeacher.initialPassword}\nPortal Link: https://console.ispctg.live/login`;
    navigator.clipboard.writeText(text);
    info('Login credentials copied to clipboard!');
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <PageHeader
        title="Add New Teacher"
        subtitle="Register new educators, specify qualifications, and generate portal access credentials."
        action={
          <Button
            variant="outlined"
            component={Link}
            href="/admin/people/teachers"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              height: 40,
              color: 'text.secondary',
              borderColor: ispColors.border.default,
            }}
          >
            Back to Teachers
          </Button>
        }
      />

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Form Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              {/* Card 1: Basic Information */}
              <Card sx={{ borderRadius: '16px', border: `1px solid ${ispColors.border.default}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                    1. Basic Information
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Official name, nickname, date of birth, and gender identity.
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        required
                        label="Full Name"
                        placeholder="e.g. Irfanur Rashid Nayan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Nickname"
                        placeholder="e.g. Nayan"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        id="teacher-gender"
                        label="Gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2.5}
                        label="Short Bio &amp; Teaching Style"
                        placeholder="Brief summary of teaching philosophy and classroom approach..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Card 2: Educational Details & Experience */}
              <Card sx={{ borderRadius: '16px', border: `1px solid ${ispColors.border.default}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                    2. Academic &amp; Experience
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Degree, department, university, and previous teaching track record.
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        required
                        multiline
                        rows={3}
                        label="Educational Details"
                        placeholder="e.g. BSc in Mechanical Engineering, CUET; Lecturer at CNEC"
                        value={educationalDetails}
                        onChange={(e) => setEducationalDetails(e.target.value)}
                        helperText="Mention university, degree, and relevant specialization."
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Teaching Experience"
                        placeholder="e.g. 5+ years teaching Engineering Admission &amp; HSC Physics"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Card 3: Contact Details */}
              <Card sx={{ borderRadius: '16px', border: `1px solid ${ispColors.border.default}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                    3. Contact Information
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Phone number and official email address for portal authentication.
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        required
                        type="email"
                        label="Login Email Address"
                        placeholder="e.g. nayan.cuet@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        helperText="This email will be used as the teacher's login username."
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Mobile Number"
                        placeholder="e.g. 01841314381"
                        value={mobile}
                        onChange={(e) => handleMobileChange(e.target.value)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        disabled={sameAsMobile}
                        label="WhatsApp Number"
                        placeholder="e.g. 01841314381"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={sameAsMobile}
                            onChange={(e) => handleSameAsMobileToggle(e.target.checked)}
                            size="small"
                          />
                        }
                        label={<Typography variant="caption">Same as Mobile Number</Typography>}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Sidebar Credentials Preview & Submission */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Credentials Card */}
              <Card
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #1748D1',
                  bgcolor: '#F8FAFC',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <KeyRoundedIcon sx={{ color: '#1748D1' }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
                      Auto-Credentials
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', mb: 2.5 }}>
                    Upon registration, the teacher can immediately log in to the portal with these credentials:
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${ispColors.border.default}` }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                        ASSIGNED EMPLOYEE ID
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1748D1' }}>
                        {previewId}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${ispColors.border.default}` }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                        LOGIN USERNAME
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57', wordBreak: 'break-all' }}>
                        {email || 'teacher@domain.com'}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${ispColors.border.default}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          PRIMARY PASSWORD (8 CHARS)
                        </Typography>
                        <Tooltip title="Regenerate Password">
                          <IconButton size="small" onClick={handleRegeneratePassword}>
                            <RefreshRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#D97706', letterSpacing: '1px' }}>
                        {generatedPassword}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2.5 }} />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={<PersonAddRoundedIcon />}
                    sx={{
                      height: 48,
                      fontSize: '15px',
                      fontWeight: 700,
                      bgcolor: '#1748D1',
                      '&:hover': { bgcolor: '#092B91' },
                    }}
                  >
                    {submitting ? 'Saving...' : 'Save'}
                  </Button>
                </CardContent>
              </Card>

              {/* Policy Tip Box */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: '#FFF7D6',
                  border: '1px solid #FFD21F',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                  Teacher Access Policy
                </Typography>
                <Typography variant="caption" sx={{ color: '#334155', lineHeight: 1.5, display: 'block' }}>
                  Teachers can change their initial password upon their first login. Role is automatically assigned as <strong>TEACHER</strong>.
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </form>

      {/* Success Dialog */}
      <Dialog
        open={Boolean(successTeacher)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
      >
        {successTeacher && (
          <>
            <DialogTitle component="div" sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: '#ECFDF5',
                  color: '#15965A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 800, color: '#061B57' }}>
                Teacher Registered Successfully!
              </Typography>
              <Typography variant="body2" component="div" sx={{ color: 'text.secondary', mt: 0.5 }}>
                The login credentials below have been generated. Copy and provide them to the teacher.
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ py: 2 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #1748D1',
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Employee ID:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1748D1' }}>
                      {successTeacher.employeeId}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Full Name:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {successTeacher.fullName} {successTeacher.nickname ? `(${successTeacher.nickname})` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Login Email:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57' }}>
                      {successTeacher.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Primary Password:
                    </Typography>
                    <code style={{ background: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontWeight: 800, color: '#D97706' }}>
                      {successTeacher.initialPassword}
                    </code>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Portal URL:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1748D1' }}>
                      https://console.ispctg.live/login
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopyCredentials}
                sx={{ mt: 2, height: 42, fontWeight: 700 }}
              >
                Copy Login Credentials
              </Button>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 1 }}>
              <Button
                onClick={() => {
                  setSuccessTeacher(null);
                  setFullName('');
                  setNickname('');
                  setBio('');
                  setEducationalDetails('');
                  setExperience('');
                  setMobile('');
                  setWhatsapp('');
                  setEmail('');
                  setGeneratedPassword(generateRandomPassword());
                }}
              >
                Add Another Teacher
              </Button>

              <Button
                variant="contained"
                onClick={() => router.push('/admin/people/teachers')}
                sx={{ bgcolor: '#061B57', fontWeight: 700 }}
              >
                Go to Teachers Directory
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
