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
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PageHeader from '@/components/common/PageHeader';
import StatusChip from '@/components/common/StatusChip';
import { ispColors } from '@/theme/colors';

interface StudentRow {
  id: string;
  studentId: string;
  fullName: string;
  phone: string;
  batchName: string;
  guardianName: string;
  guardianPhone: string;
  admissionDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockStudents: StudentRow[] = [
  {
    id: 's-1',
    studentId: '20280001',
    fullName: 'Rahim Ahmed',
    phone: '01711223344',
    batchName: 'SSC 2027 Science A',
    guardianName: 'Abul Kalam (Father)',
    guardianPhone: '01811223344',
    admissionDate: '2028-01-10',
    status: 'ACTIVE',
  },
  {
    id: 's-2',
    studentId: '20280002',
    fullName: 'Tasnim Jahan Sara',
    phone: '01722334455',
    batchName: 'HSC 2028 Science',
    guardianName: 'Jahanara Begum (Mother)',
    guardianPhone: '01922334455',
    admissionDate: '2028-01-12',
    status: 'ACTIVE',
  },
  {
    id: 's-3',
    studentId: '20280003',
    fullName: 'Tanvir Hasan Sadi',
    phone: '01733445566',
    batchName: 'SSC 2027 Science A',
    guardianName: 'Farid Hasan (Father)',
    guardianPhone: '01833445566',
    admissionDate: '2028-01-15',
    status: 'ACTIVE',
  },
  {
    id: 's-4',
    studentId: '20280004',
    fullName: 'Mahir Faisal',
    phone: '01744556677',
    batchName: 'Class 9 Morning A',
    guardianName: 'Faisal Kabir (Father)',
    guardianPhone: '01644556677',
    admissionDate: '2028-01-20',
    status: 'ACTIVE',
  },
  {
    id: 's-5',
    studentId: '20280005',
    fullName: 'Sumaiya Akhter',
    phone: '01755667788',
    batchName: 'Engineering Admission',
    guardianName: 'Nasir Uddin (Father)',
    guardianPhone: '01555667788',
    admissionDate: '2028-02-01',
    status: 'ACTIVE',
  },
];

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [batchFilter, setBatchFilter] = React.useState('ALL');

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.includes(searchTerm);
    const matchesBatch = batchFilter === 'ALL' || student.batchName === batchFilter;
    return matchesSearch && matchesBatch;
  });

  return (
    <Box>
      <PageHeader
        title="Students Directory"
        subtitle="Manage admitted students, permanent student IDs, enrollments, and academic profiles"
        breadcrumbs={[
          { label: 'Console', href: '/admin/dashboard' },
          { label: 'People', href: '/admin/people/students' },
          { label: 'Students' },
        ]}
        action={
          <Button
            component={Link}
            href="/admin/people/students/new"
            variant="contained"
            startIcon={<PersonAddRoundedIcon />}
          >
            Admit New Student
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by student name or ID (e.g. 20280001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, minWidth: 280 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Batch</InputLabel>
              <Select
                value={batchFilter}
                label="Filter by Batch"
                onChange={(e) => setBatchFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Batches</MenuItem>
                <MenuItem value="SSC 2027 Science A">SSC 2027 Science A</MenuItem>
                <MenuItem value="HSC 2028 Science">HSC 2028 Science</MenuItem>
                <MenuItem value="Class 9 Morning A">Class 9 Morning A</MenuItem>
                <MenuItem value="Engineering Admission">Engineering Admission</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Enrolled Batch</TableCell>
                  <TableCell>Primary Guardian</TableCell>
                  <TableCell>Admission Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: ispColors.primary[700], fontSize: '15px' }}>
                      {student.studentId}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: ispColors.primary[50], color: ispColors.primary[700], fontWeight: 700, fontSize: '14px' }}>
                          {student.fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {student.fullName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '14px' }}>{student.phone}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{student.batchName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.guardianName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{student.guardianPhone}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '14px' }}>{student.admissionDate}</TableCell>
                    <TableCell>
                      <StatusChip status={student.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Student Profile">
                        <IconButton
                          component={Link}
                          href={`/console/people/students/${student.id}`}
                          size="small"
                          sx={{ color: ispColors.primary[600] }}
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
