'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Divider,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import StatusChip from '@/components/common/StatusChip';
import { ispColors } from '@/theme/colors';

export default function CadminDashboardPage() {
  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Admin Operational Dashboard"
        subtitle="Indicator Student's Point · Academic Year 2028 · Real-time Operations"
        action={
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/admin/people/students/new"
              variant="contained"
              startIcon={<PersonAddRoundedIcon />}
            >
              Admit Student
            </Button>
            <Button
              component={Link}
              href="/admin/operations/attendance"
              variant="outlined"
              startIcon={<HowToRegRoundedIcon />}
            >
              Mark Attendance
            </Button>
            <Button
              component={Link}
              href="/admin/finance/payments"
              variant="outlined"
              startIcon={<PaymentsRoundedIcon />}
            >
              Collect Fee
            </Button>
          </Box>
        }
      />

      {/* KPI Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Active Students"
            value="1,284"
            trend={{ value: "+8.4%", isPositive: true }}
            subtitle="from last month"
            icon={<PeopleAltRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Batches"
            value="18"
            subtitle="SSC, HSC & Admission"
            icon={<SchoolRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Today's Classes"
            value="14"
            subtitle="10 Completed · 4 Scheduled"
            icon={<AccessTimeRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Today's Attendance"
            value="94.6%"
            trend={{ value: "+1.2%", isPositive: true }}
            subtitle="512 Present · 29 Absent"
            icon={<HowToRegRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
      </Grid>

      {/* Operations Content */}
      <Grid container spacing={3}>
        {/* Left Column: Today's Classes & Admissions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Today's Classes */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Today&apos;s Class Sessions
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Scheduled physical sessions at ISP coaching campus
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/admin/operations/sessions"
                  size="small"
                >
                  View All
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        time: '10:00 - 11:30',
                        batch: 'SSC 2027 Science A',
                        subject: 'Higher Mathematics',
                        teacher: 'Prof. M. Rahman',
                        room: 'Room 201',
                        status: 'COMPLETED',
                      },
                      {
                        time: '11:45 - 01:15',
                        batch: 'HSC 2028 Science',
                        subject: 'Physics',
                        teacher: 'Dr. Kamal Ahmed',
                        room: 'Science Lab 1',
                        status: 'COMPLETED',
                      },
                      {
                        time: '03:00 - 04:30',
                        batch: 'Class 9 Morning B',
                        subject: 'Bangla Literature',
                        teacher: 'Nasrin Akhter',
                        room: 'Room 102',
                        status: 'ACTIVE',
                      },
                      {
                        time: '04:45 - 06:15',
                        batch: 'Medical Admission 2028',
                        subject: 'Chemistry & Botany',
                        teacher: 'Dr. S. Hoque',
                        room: 'Auditorium',
                        status: 'UPCOMING',
                      },
                    ].map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px' }}>{row.time}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.batch}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{row.teacher}</TableCell>
                        <TableCell>{row.room}</TableCell>
                        <TableCell>
                          <StatusChip status={row.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recent Admissions */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Recent Student Admissions
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Permanent Student ID Format: <code>YYYYSSSS</code>
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/admin/people/students"
                  size="small"
                >
                  Manage Students
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Full Name</TableCell>
                      <TableCell>Admitted Batch</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { id: '20280042', name: 'Tanvir Hasan Sadi', batch: 'SSC 2027 Science A', date: '01 Sep 2028', status: 'ACTIVE' },
                      { id: '20280041', name: 'Nusrat Jahan Mim', batch: 'HSC 2028 Science', date: '31 Aug 2028', status: 'ACTIVE' },
                      { id: '20280040', name: 'Mahir Faisal', batch: 'Class 9 Morning A', date: '30 Aug 2028', status: 'ACTIVE' },
                      { id: '20280039', name: 'Sabrina Hossain', batch: 'University Admission', date: '29 Aug 2028', status: 'ACTIVE' },
                    ].map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: ispColors.primary[700] }}>
                          {student.id}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{student.name}</TableCell>
                        <TableCell>{student.batch}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>{student.date}</TableCell>
                        <TableCell>
                          <StatusChip status={student.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Upcoming Examinations */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Upcoming Exams
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  {
                    title: 'SSC Model Test 1',
                    batch: 'SSC 2027 Science',
                    date: 'Sep 05, 2028',
                    totalMarks: '100 Marks',
                  },
                  {
                    title: 'Monthly Physics Assessment',
                    batch: 'HSC 2028 Science',
                    date: 'Sep 08, 2028',
                    totalMarks: '50 Marks',
                  },
                ].map((exam, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${ispColors.border.subtle}`,
                      bgcolor: ispColors.background.default,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {exam.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: ispColors.primary[700] }}>
                        {exam.totalMarks}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {exam.batch} · {exam.date}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Monthly Finance Summary */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Financial Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Total September Collection
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: ispColors.semantic.success.dark }}>
                  ৳ 3,42,500
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Pending Fees Due</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: ispColors.semantic.warning.dark }}>৳ 48,000</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Waiver / Discounts</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>৳ 12,500</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
