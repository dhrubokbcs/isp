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
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Stack,
  Paper,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/common/ToastProvider';
import { ispColors } from '@/theme/colors';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'];
const CONTACT_METHODS = ['Phone Call', 'WhatsApp', 'SMS', 'Email'];
const MEDIUMS = ['Bangla Medium', 'English Version', 'English Medium'];
const STREAMS = ['Science', 'Commerce', 'Humanities / Arts', 'General'];
const ADMISSION_SOURCES = [
  'Direct Campus Visit',
  'Social Media (Facebook / Instagram)',
  'Friend / Relative Referral',
  'Banner / Poster / Leaflet',
  'Teacher Recommendation',
  'Alumni Referral',
];

export default function NewStudentAdmissionPage() {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  // Academic Dropdowns loaded live from Supabase
  const [academicYears, setAcademicYears] = React.useState<any[]>([]);
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [batches, setBatches] = React.useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = React.useState(true);

  // 1. Academic & ISP Info
  const [admissionAcademicYear, setAdmissionAcademicYear] = React.useState('2028');
  const [programId, setProgramId] = React.useState('');
  const [classLevelId, setClassLevelId] = React.useState('');
  const [batchId, setBatchId] = React.useState('');
  const [admissionDate, setAdmissionDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [admissionSource, setAdmissionSource] = React.useState('Direct Campus Visit');
  const [notes, setNotes] = React.useState('');

  // 2. Personal Information
  const [fullName, setFullName] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [preferredName, setPreferredName] = React.useState('');
  const [dob, setDob] = React.useState('2010-06-15');
  const [gender, setGender] = React.useState('Male');
  const [bloodGroup, setBloodGroup] = React.useState('B+');
  const [nationality, setNationality] = React.useState('Bangladeshi');
  const [religion, setReligion] = React.useState('Islam');
  const [birthRegNumber, setBirthRegNumber] = React.useState('');
  const [nidNumber, setNidNumber] = React.useState('');

  // 3. Contact Information
  const [phone, setPhone] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState('');
  const [alternativePhone, setAlternativePhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [preferredContactMethod, setPreferredContactMethod] = React.useState('Phone Call');

  // 4. School / College Information
  const [institutionName, setInstitutionName] = React.useState('');
  const [institutionType, setInstitutionType] = React.useState('School');
  const [schoolClass, setSchoolClass] = React.useState('Class 9');
  const [schoolSection, setSchoolSection] = React.useState('');
  const [schoolRoll, setSchoolRoll] = React.useState('');
  const [schoolRegNumber, setSchoolRegNumber] = React.useState('');
  const [schoolStudentId, setSchoolStudentId] = React.useState('');
  const [schoolShift, setSchoolShift] = React.useState('Morning');
  const [medium, setMedium] = React.useState('Bangla Medium');
  const [groupStream, setGroupStream] = React.useState('Science');

  // 5. Addresses
  const [presentAddress, setPresentAddress] = React.useState('Chittagong, Bangladesh');
  const [presentArea, setPresentArea] = React.useState('Chawkbazar');
  const [presentUpazila, setPresentUpazila] = React.useState('Panchlaish');
  const [presentDistrict, setPresentDistrict] = React.useState('Chattogram');
  const [presentPostalCode, setPresentPostalCode] = React.useState('4203');

  const [sameAsPresent, setSameAsPresent] = React.useState(true);
  const [permanentAddress, setPermanentAddress] = React.useState('Chittagong, Bangladesh');
  const [permanentArea, setPermanentArea] = React.useState('Chawkbazar');
  const [permanentUpazila, setPermanentUpazila] = React.useState('Panchlaish');
  const [permanentDistrict, setPermanentDistrict] = React.useState('Chattogram');
  const [permanentPostalCode, setPermanentPostalCode] = React.useState('4203');

  // 6. Family & Guardian Information
  const [primaryGuardian, setPrimaryGuardian] = React.useState<'FATHER' | 'MOTHER' | 'OTHER'>('FATHER');

  const [fatherName, setFatherName] = React.useState('');
  const [fatherPhone, setFatherPhone] = React.useState('');
  const [fatherWhatsapp, setFatherWhatsapp] = React.useState('');
  const [fatherEmail, setFatherEmail] = React.useState('');
  const [fatherOccupation, setFatherOccupation] = React.useState('');

  const [motherName, setMotherName] = React.useState('');
  const [motherPhone, setMotherPhone] = React.useState('');
  const [motherWhatsapp, setMotherWhatsapp] = React.useState('');
  const [motherEmail, setMotherEmail] = React.useState('');
  const [motherOccupation, setMotherOccupation] = React.useState('');

  const [otherGuardianName, setOtherGuardianName] = React.useState('');
  const [otherGuardianPhone, setOtherGuardianPhone] = React.useState('');
  const [otherGuardianRelationship, setOtherGuardianRelationship] = React.useState('');

  // 7. Emergency Contact
  const [emergencyName, setEmergencyName] = React.useState('');
  const [emergencyRelationship, setEmergencyRelationship] = React.useState('');
  const [emergencyPhone, setEmergencyPhone] = React.useState('');
  const [emergencyAltPhone, setEmergencyAltPhone] = React.useState('');
  const [emergencyAddress, setEmergencyAddress] = React.useState('');

  const [saving, setSaving] = React.useState(false);
  const [generatedStudent, setGeneratedStudent] = React.useState<any | null>(null);

  // Load lookup options from Supabase
  React.useEffect(() => {
    async function loadLookups() {
      try {
        setLoadingLookups(true);
        const [yRes, pRes, cRes, bRes] = await Promise.all([
          fetch('/api/academic-years'),
          fetch('/api/academics/programs'),
          fetch('/api/academics/classes'),
          fetch('/api/academics/batches'),
        ]);

        const yData = await yRes.json();
        const pData = await pRes.json();
        const cData = await cRes.json();
        const bData = await bRes.json();

        setAcademicYears(yData?.years || []);
        setPrograms(pData?.programs || []);
        setClasses(cData?.classLevels || []);
        setBatches(bData?.batches || []);

        if (yData?.years?.length > 0) {
          setAdmissionAcademicYear(yData.years[0].year.toString());
        }
        if (pData?.programs?.length > 0) {
          setProgramId(pData.programs[0].id);
        }
        if (cData?.classLevels?.length > 0) {
          setClassLevelId(cData.classLevels[0].id);
        }
        if (bData?.batches?.length > 0) {
          setBatchId(bData.batches[0].id);
        }
      } catch (err) {
        console.error('Failed to load academic options:', err);
      } finally {
        setLoadingLookups(false);
      }
    }
    loadLookups();
  }, []);

  const handleCopyId = () => {
    if (generatedStudent?.studentId) {
      navigator.clipboard.writeText(generatedStudent.studentId);
      info(`Copied Student ID: ${generatedStudent.studentId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toastError('Full Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        preferredName: preferredName.trim(),
        dob,
        gender,
        bloodGroup,
        nationality,
        religion,
        birthRegNumber,
        nidNumber,

        // Contact
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        alternativePhone: alternativePhone.trim(),
        email: email.trim(),
        preferredContactMethod,

        // School
        institutionName: institutionName.trim(),
        institutionType,
        schoolClass,
        schoolSection,
        schoolRoll,
        schoolRegNumber,
        schoolStudentId,
        schoolShift,
        medium,
        groupStream,

        // Address
        presentAddress,
        presentArea,
        presentUpazila,
        presentDistrict,
        presentPostalCode,
        sameAsPresent,
        permanentAddress: sameAsPresent ? presentAddress : permanentAddress,
        permanentArea: sameAsPresent ? presentArea : permanentArea,
        permanentUpazila: sameAsPresent ? presentUpazila : permanentUpazila,
        permanentDistrict: sameAsPresent ? presentDistrict : permanentDistrict,
        permanentPostalCode: sameAsPresent ? presentPostalCode : permanentPostalCode,

        // Family / Guardian
        primaryGuardian,
        fatherName: fatherName.trim(),
        fatherPhone: fatherPhone.trim(),
        fatherWhatsapp: fatherWhatsapp.trim(),
        fatherEmail: fatherEmail.trim(),
        fatherOccupation: fatherOccupation.trim(),
        motherName: motherName.trim(),
        motherPhone: motherPhone.trim(),
        motherWhatsapp: motherWhatsapp.trim(),
        motherEmail: motherEmail.trim(),
        motherOccupation: motherOccupation.trim(),
        otherGuardianName: otherGuardianName.trim(),
        otherGuardianPhone: otherGuardianPhone.trim(),
        otherGuardianRelationship: otherGuardianRelationship.trim(),

        // Emergency
        emergencyName: emergencyName.trim(),
        emergencyRelationship: emergencyRelationship.trim(),
        emergencyPhone: emergencyPhone.trim(),
        emergencyAltPhone: emergencyAltPhone.trim(),
        emergencyAddress: emergencyAddress.trim(),

        // ISP
        admissionAcademicYear: parseInt(admissionAcademicYear, 10) || 2028,
        admissionDate,
        programId: programId || undefined,
        classLevelId: classLevelId || undefined,
        batchId: batchId || undefined,
        admissionSource,
        notes: notes.trim(),
      };

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to admit student');
      }

      setGeneratedStudent(data.student);
      success(`Student admitted! Generated ID: ${data.student.studentId}`);
    } catch (err: any) {
      toastError(err.message || 'Error admitting student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Student Admission &amp; Registration"
        subtitle="Admit student to ISP, assign cohort &amp; batch, and generate permanent Student ID"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'People', href: '/admin/people/students' },
          { label: 'Admission' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.push('/admin/people/students')}
          >
            Back to Students
          </Button>
        }
      />

      {/* Success Notification Banner */}
      {generatedStudent && (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: '12px',
            bgcolor: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 36, color: '#16A34A' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#166534' }}>
                Admission Successfully Recorded in Supabase!
              </Typography>
              <Typography variant="body2" sx={{ color: '#14532D', mt: 0.2 }}>
                Student: <strong>{generatedStudent.fullName}</strong> &bull; Permanent ID:{' '}
                <strong style={{ fontSize: '15px', color: '#1748D1' }}>{generatedStudent.studentId}</strong>
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyId}
              sx={{ fontWeight: 700 }}
            >
              Copy ID
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => router.push('/admin/people/students')}
              sx={{ bgcolor: '#16A34A', fontWeight: 700, '&:hover': { bgcolor: '#15803D' } }}
            >
              View in Directory
            </Button>
          </Stack>
        </Paper>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3.5}>
          {/* Section 1: ISP Academic Enrollment */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                1. ISP Academic Enrollment
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Target academic session, program, and batch assignment
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Admission Academic Year</InputLabel>
                    <Select
                      value={admissionAcademicYear}
                      label="Admission Academic Year"
                      onChange={(e) => setAdmissionAcademicYear(e.target.value)}
                    >
                      {academicYears.map((y) => (
                        <MenuItem key={y.id} value={y.year.toString()}>
                          {y.name} ({y.year})
                        </MenuItem>
                      ))}
                      {academicYears.length === 0 && <MenuItem value="2028">Session 2028</MenuItem>}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Academic Program</InputLabel>
                    <Select
                      value={programId}
                      label="Academic Program"
                      onChange={(e) => setProgramId(e.target.value)}
                    >
                      <MenuItem value="">None / General</MenuItem>
                      {programs.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Class Level</InputLabel>
                    <Select
                      value={classLevelId}
                      label="Class Level"
                      onChange={(e) => setClassLevelId(e.target.value)}
                    >
                      <MenuItem value="">None / Unassigned</MenuItem>
                      {classes.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name} ({c.targetExamLabel})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned Batch</InputLabel>
                    <Select
                      value={batchId}
                      label="Assigned Batch"
                      onChange={(e) => setBatchId(e.target.value)}
                    >
                      <MenuItem value="">Unassigned (Assign Later)</MenuItem>
                      {batches.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name} ({b.shift} Shift)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Admission Date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Admission Source</InputLabel>
                    <Select
                      value={admissionSource}
                      label="Admission Source"
                      onChange={(e) => setAdmissionSource(e.target.value)}
                    >
                      {ADMISSION_SOURCES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Section 2: Personal Information */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                2. Personal Information
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Official identification details for institutional records
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name (English)"
                    placeholder="e.g. Tanvir Hasan Sadi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Nickname / Calling Name"
                    placeholder="e.g. Sadi"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Preferred Display Name"
                    placeholder="e.g. T. H. Sadi"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select value={gender} label="Gender" onChange={(e) => setGender(e.target.value)}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select value={bloodGroup} label="Blood Group" onChange={(e) => setBloodGroup(e.target.value)}>
                      {BLOOD_GROUPS.map((bg) => (
                        <MenuItem key={bg} value={bg}>
                          {bg}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Religion</InputLabel>
                    <Select value={religion} label="Religion" onChange={(e) => setReligion(e.target.value)}>
                      {RELIGIONS.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Birth Registration Number (BRN)"
                    placeholder="17-digit Birth Certificate Number"
                    value={birthRegNumber}
                    onChange={(e) => setBirthRegNumber(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="NID / Smart Card Number"
                    placeholder="National ID Number (Optional)"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Section 3: Contact Information */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                3. Student Contact Information
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Direct communication channels for institutional notices
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Student Mobile Number"
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="WhatsApp Number"
                    placeholder="017xxxxxxxx"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Alternative Phone"
                    placeholder="Optional backup phone"
                    value={alternativePhone}
                    onChange={(e) => setAlternativePhone(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    placeholder="student@example.com (or leave empty for auto-generated)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Contact Method</InputLabel>
                    <Select
                      value={preferredContactMethod}
                      label="Preferred Contact Method"
                      onChange={(e) => setPreferredContactMethod(e.target.value)}
                    >
                      {CONTACT_METHODS.map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Section 4: School / College Information */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                4. School / College Background
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Details of current institutional enrollment in school or college
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    fullWidth
                    label="School / College Name"
                    placeholder="e.g. Chittagong Collegiate School, Govt. Muslim High School"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Institution Type</InputLabel>
                    <Select
                      value={institutionType}
                      label="Institution Type"
                      onChange={(e) => setInstitutionType(e.target.value)}
                    >
                      <MenuItem value="School">Secondary School</MenuItem>
                      <MenuItem value="College">Higher Secondary College</MenuItem>
                      <MenuItem value="Madrasah">Madrasah</MenuItem>
                      <MenuItem value="English Medium">English Medium School</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="School Class"
                    placeholder="e.g. Class 9, Class 10"
                    value={schoolClass}
                    onChange={(e) => setSchoolClass(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Section"
                    placeholder="e.g. Section A, Padma"
                    value={schoolSection}
                    onChange={(e) => setSchoolSection(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Class Roll Number"
                    placeholder="e.g. 12"
                    value={schoolRoll}
                    onChange={(e) => setSchoolRoll(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="School Registration / Student ID"
                    placeholder="e.g. 10294"
                    value={schoolStudentId}
                    onChange={(e) => setSchoolStudentId(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>School Shift</InputLabel>
                    <Select value={schoolShift} label="School Shift" onChange={(e) => setSchoolShift(e.target.value)}>
                      <MenuItem value="Morning">Morning Shift</MenuItem>
                      <MenuItem value="Day">Day Shift</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Curriculum Medium</InputLabel>
                    <Select value={medium} label="Curriculum Medium" onChange={(e) => setMedium(e.target.value)}>
                      {MEDIUMS.map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Group / Stream</InputLabel>
                    <Select value={groupStream} label="Group / Stream" onChange={(e) => setGroupStream(e.target.value)}>
                      {STREAMS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Section 5: Family & Guardian Information */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                5. Family &amp; Guardian Information
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                Assign primary communication guardian between Father, Mother, or Legal Guardian
              </Typography>

              {/* Primary Guardian Selector */}
              <Box sx={{ p: 2.5, bgcolor: '#EEF4FF', borderRadius: '10px', border: '1px solid #C7D7FE', mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', mb: 1 }}>
                  Designated Primary Guardian (Receives Routine SMS, Attendance Alerts &amp; Invoices):
                </Typography>
                <RadioGroup
                  row
                  value={primaryGuardian}
                  onChange={(e) => setPrimaryGuardian(e.target.value as any)}
                >
                  <FormControlLabel
                    value="FATHER"
                    control={<Radio sx={{ color: '#1748D1', '&.Mui-checked': { color: '#1748D1' } }} />}
                    label={<strong style={{ color: '#061B57' }}>Father</strong>}
                  />
                  <FormControlLabel
                    value="MOTHER"
                    control={<Radio sx={{ color: '#1748D1', '&.Mui-checked': { color: '#1748D1' } }} />}
                    label={<strong style={{ color: '#061B57' }}>Mother</strong>}
                  />
                  <FormControlLabel
                    value="OTHER"
                    control={<Radio sx={{ color: '#1748D1', '&.Mui-checked': { color: '#1748D1' } }} />}
                    label={<strong style={{ color: '#061B57' }}>Other Legal Guardian</strong>}
                  />
                </RadioGroup>
              </Box>

              {/* Father's Details */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                Father&apos;s Information
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Father's Full Name"
                    placeholder="e.g. Abul Kalam"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Father's Mobile Number"
                    placeholder="018xxxxxxxx"
                    value={fatherPhone}
                    onChange={(e) => setFatherPhone(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Father's WhatsApp"
                    placeholder="018xxxxxxxx"
                    value={fatherWhatsapp}
                    onChange={(e) => setFatherWhatsapp(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Father's Email Address"
                    placeholder="father@example.com"
                    value={fatherEmail}
                    onChange={(e) => setFatherEmail(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Father's Occupation"
                    placeholder="e.g. Businessman, Engineer, Govt. Officer"
                    value={fatherOccupation}
                    onChange={(e) => setFatherOccupation(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Mother's Details */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                Mother&apos;s Information
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Mother's Full Name"
                    placeholder="e.g. Jahanara Begum"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Mother's Mobile Number"
                    placeholder="019xxxxxxxx"
                    value={motherPhone}
                    onChange={(e) => setMotherPhone(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Mother's WhatsApp"
                    placeholder="019xxxxxxxx"
                    value={motherWhatsapp}
                    onChange={(e) => setMotherWhatsapp(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Mother's Email Address"
                    placeholder="mother@example.com"
                    value={motherEmail}
                    onChange={(e) => setMotherEmail(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Mother's Occupation"
                    placeholder="e.g. Homemaker, Teacher, Doctor"
                    value={motherOccupation}
                    onChange={(e) => setMotherOccupation(e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Other Guardian (if applicable) */}
              {primaryGuardian === 'OTHER' && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                    Other Legal Guardian
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Guardian Name"
                        value={otherGuardianName}
                        onChange={(e) => setOtherGuardianName(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Guardian Phone"
                        value={otherGuardianPhone}
                        onChange={(e) => setOtherGuardianPhone(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Relationship to Student"
                        placeholder="e.g. Uncle, Grandfather"
                        value={otherGuardianRelationship}
                        onChange={(e) => setOtherGuardianRelationship(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 6: Address Information */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                6. Address &amp; Residence
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Residential address for official communications
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mb: 1.5 }}>
                Present Address
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Street Address / Holding"
                    placeholder="House, Road, Apartment"
                    value={presentAddress}
                    onChange={(e) => setPresentAddress(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Area / Neighborhood"
                    placeholder="e.g. Chawkbazar, GEC"
                    value={presentArea}
                    onChange={(e) => setPresentArea(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Upazila / Thana"
                    placeholder="e.g. Panchlaish"
                    value={presentUpazila}
                    onChange={(e) => setPresentUpazila(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="District"
                    value={presentDistrict}
                    onChange={(e) => setPresentDistrict(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={presentPostalCode}
                    onChange={(e) => setPresentPostalCode(e.target.value)}
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={sameAsPresent}
                    onChange={(e) => setSameAsPresent(e.target.checked)}
                    color="primary"
                  />
                }
                label="Permanent Address is same as Present Address"
                sx={{ mb: sameAsPresent ? 0 : 2 }}
              />

              {!sameAsPresent && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1', mt: 2, mb: 1.5 }}>
                    Permanent Address
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Street Address / Village"
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        label="Area / Post Office"
                        value={permanentArea}
                        onChange={(e) => setPermanentArea(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        fullWidth
                        label="Upazila / Thana"
                        value={permanentUpazila}
                        onChange={(e) => setPermanentUpazila(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="District"
                        value={permanentDistrict}
                        onChange={(e) => setPermanentDistrict(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Postal Code"
                        value={permanentPostalCode}
                        onChange={(e) => setPermanentPostalCode(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 7: Emergency Contact & Notes */}
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                7. Emergency Contact &amp; Remarks
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Emergency backup person and any institutional notes
              </Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    placeholder="e.g. Faruk Hossain"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    placeholder="e.g. Uncle / Neighbor"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Emergency Phone"
                    placeholder="01xxxxxxxx"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Institutional Notes / Special Needs"
                    placeholder="e.g. Medical notes, sibling discount, special guidance"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/admin/people/students')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveRoundedIcon />}
              disabled={saving}
              sx={{
                bgcolor: '#1748D1',
                fontWeight: 800,
                px: 4,
                '&:hover': { bgcolor: '#092B91' },
              }}
            >
              {saving ? 'Processing Admission...' : 'Complete Admission & Save'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
}
