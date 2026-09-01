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
  Chip,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import { ispColors } from '@/theme/colors';

export default function TeacherDashboardPage() {
  return (
    <Box>
      <PageHeader
        title="Teacher & Faculty Portal"
        subtitle="Indicator Student's Point · Faculty: Prof. M. Rahman (Higher Mathematics)"
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              component={Link}
              href="/cadmin/operations/attendance"
              variant="contained"
              startIcon={<HowToRegRoundedIcon />}
            >
              Take Today&apos;s Attendance
            </Button>
            <Button
              component={Link}
              href="/cadmin/examination/results"
              variant="outlined"
              startIcon={<AssignmentRoundedIcon />}
            >
              Enter Exam Marks
            </Button>
          </Box>
        }
      />

      {/* Teacher KPI Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Assigned Batches"
            value="4"
            subtitle="SSC 2027, HSC 2028"
            icon={<SchoolRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Students Taught"
            value="164"
            subtitle="Across 4 active sections"
            icon={<SchoolRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Today's Sessions"
            value="3 Classes"
            subtitle="1 Completed · 2 Remaining"
            icon={<HowToRegRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Marks Entry"
            value="1 Exam"
            subtitle="SSC Weekly Test #3"
            icon={<AssignmentRoundedIcon sx={{ color: ispColors.primary[600] }} />}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left: Today's Assigned Classes */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    My Schedule Today
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Classes scheduled for you to conduct and mark attendance
                  </Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        time: '10:00 - 11:30',
                        batch: 'SSC 2027 Science A',
                        subject: 'Higher Math (Calculus)',
                        room: 'Room 201',
                        done: true,
                      },
                      {
                        time: '02:00 - 03:30',
                        batch: 'HSC 2028 Science',
                        subject: 'Higher Math (Matrices)',
                        room: 'Room 302',
                        done: false,
                      },
                      {
                        time: '04:00 - 05:30',
                        batch: 'Engineering Admission',
                        subject: 'Coordinate Geometry',
                        room: 'Auditorium',
                        done: false,
                      },
                    ].map((row, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.time}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.batch}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>{row.room}</TableCell>
                        <TableCell>
                          {row.done ? (
                            <Chip label="Attendance Saved" size="small" sx={{ bgcolor: ispColors.semantic.success.light, color: ispColors.semantic.success.dark, fontWeight: 600 }} />
                          ) : (
                            <Button
                              component={Link}
                              href="/cadmin/operations/attendance"
                              size="small"
                              variant="contained"
                              sx={{ py: 0.5, fontSize: '13px', minHeight: 32 }}
                            >
                              Mark Attendance
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Assigned Batches */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                My Assigned Batches
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { name: 'SSC 2027 Science A', students: 42, subject: 'Higher Mathematics' },
                  { name: 'SSC 2027 Science B', students: 38, subject: 'General Mathematics' },
                  { name: 'HSC 2028 Science', students: 48, subject: 'Higher Mathematics 1st Paper' },
                  { name: 'Engineering Admission', students: 36, subject: 'Math Advanced Problem Solving' },
                ].map((b, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${ispColors.border.subtle}`,
                      bgcolor: ispColors.background.default,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {b.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {b.subject} · {b.students} Enrolled Students
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

