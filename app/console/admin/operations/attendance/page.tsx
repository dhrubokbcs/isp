'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PageHeader from '@/components/common/PageHeader';
import { ispColors } from '@/theme/colors';

interface AttendanceRecord {
  studentId: string;
  fullName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export default function AttendanceMarkingPage() {
  const [selectedBatch, setSelectedBatch] = React.useState('SSC 2027 Science A');
  const [selectedSubject, setSelectedSubject] = React.useState('Higher Mathematics');
  const [sessionDate, setSessionDate] = React.useState('2028-09-01');
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const [students, setStudents] = React.useState<AttendanceRecord[]>([
    { studentId: '20280001', fullName: 'Rahim Ahmed', status: 'PRESENT' },
    { studentId: '20280002', fullName: 'Tasnim Jahan Sara', status: 'PRESENT' },
    { studentId: '20280003', fullName: 'Tanvir Hasan Sadi', status: 'PRESENT' },
    { studentId: '20280004', fullName: 'Mahir Faisal', status: 'ABSENT' },
    { studentId: '20280005', fullName: 'Sumaiya Akhter', status: 'PRESENT' },
    { studentId: '20280006', fullName: 'Fahim Montasir', status: 'LATE' },
    { studentId: '20280007', fullName: 'Anika Tabassum', status: 'PRESENT' },
  ]);

  const handleStatusChange = (studentId: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
    setSavedSuccess(false);
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    setSavedSuccess(false);
  };

  const handleSaveAttendance = () => {
    setSavedSuccess(true);
  };

  const total = students.length;
  const present = students.filter((s) => s.status === 'PRESENT').length;
  const absent = students.filter((s) => s.status === 'ABSENT').length;
  const late = students.filter((s) => s.status === 'LATE').length;
  const attendanceRate = ((present / total) * 100).toFixed(1);

  return (
    <Box>
      <PageHeader
        title="Class Session Attendance"
        subtitle="Record daily physical attendance per ClassSession. Synchronized with student profiles and guardian dashboards."
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'Operations', href: '/admin/operations/attendance' },
          { label: 'Attendance' },
        ]}
      />

      {savedSuccess && (
        <Alert
          icon={<CheckCircleRoundedIcon fontSize="inherit" />}
          severity="success"
          sx={{ mb: 3, borderRadius: '10px' }}
        >
          <strong>Attendance Saved!</strong> Records for session ({selectedBatch} - {selectedSubject}, {sessionDate}) successfully committed.
        </Alert>
      )}

      {/* Session Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Batch</InputLabel>
                <Select
                  value={selectedBatch}
                  label="Batch"
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <MenuItem value="SSC 2027 Science A">SSC 2027 Science A</MenuItem>
                  <MenuItem value="HSC 2028 Science">HSC 2028 Science</MenuItem>
                  <MenuItem value="Class 9 Morning A">Class 9 Morning A</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  label="Subject"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <MenuItem value="Higher Mathematics">Higher Mathematics</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Chemistry">Chemistry</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={() => handleMarkAll('PRESENT')}>
                  Mark All Present
                </Button>
                <Button variant="outlined" size="small" color="error" onClick={() => handleMarkAll('ABSENT')}>
                  Mark All Absent
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Summary Strip */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`Total: ${total}`} sx={{ fontWeight: 600, fontSize: '13px' }} />
        <Chip
          label={`Present: ${present}`}
          sx={{ bgcolor: ispColors.semantic.success.light, color: ispColors.semantic.success.dark, fontWeight: 700 }}
        />
        <Chip
          label={`Absent: ${absent}`}
          sx={{ bgcolor: ispColors.semantic.error.light, color: ispColors.semantic.error.dark, fontWeight: 700 }}
        />
        <Chip
          label={`Late: ${late}`}
          sx={{ bgcolor: ispColors.semantic.warning.light, color: ispColors.semantic.warning.dark, fontWeight: 700 }}
        />
        <Chip
          label={`Attendance Rate: ${attendanceRate}%`}
          sx={{ bgcolor: ispColors.primary[50], color: ispColors.primary[700], fontWeight: 700 }}
        />
      </Box>

      {/* Attendance Grid */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="center">Attendance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.studentId} hover>
                    <TableCell sx={{ fontWeight: 700, color: ispColors.primary[700] }}>
                      {student.studentId}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '15px' }}>{student.fullName}</TableCell>
                    <TableCell align="center">
                      <RadioGroup
                        row
                        value={student.status}
                        onChange={(e) =>
                          handleStatusChange(
                            student.studentId,
                            e.target.value as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
                          )
                        }
                        sx={{ justifyContent: 'center' }}
                      >
                        <FormControlLabel
                          value="PRESENT"
                          control={<Radio size="small" sx={{ color: ispColors.semantic.success.main, '&.Mui-checked': { color: ispColors.semantic.success.main } }} />}
                          label={<Typography sx={{ fontSize: '13px', fontWeight: 600, color: ispColors.semantic.success.dark }}>Present</Typography>}
                        />
                        <FormControlLabel
                          value="ABSENT"
                          control={<Radio size="small" sx={{ color: ispColors.semantic.error.main, '&.Mui-checked': { color: ispColors.semantic.error.main } }} />}
                          label={<Typography sx={{ fontSize: '13px', fontWeight: 600, color: ispColors.semantic.error.dark }}>Absent</Typography>}
                        />
                        <FormControlLabel
                          value="LATE"
                          control={<Radio size="small" sx={{ color: ispColors.semantic.warning.main, '&.Mui-checked': { color: ispColors.semantic.warning.main } }} />}
                          label={<Typography sx={{ fontSize: '13px', fontWeight: 600, color: ispColors.semantic.warning.dark }}>Late</Typography>}
                        />
                        <FormControlLabel
                          value="EXCUSED"
                          control={<Radio size="small" sx={{ color: ispColors.semantic.info.main, '&.Mui-checked': { color: ispColors.semantic.info.main } }} />}
                          label={<Typography sx={{ fontSize: '13px', fontWeight: 600, color: ispColors.semantic.info.dark }}>Excused</Typography>}
                        />
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSaveAttendance}
              sx={{ px: 4, height: 48, fontWeight: 700 }}
            >
              Save Attendance Record
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
