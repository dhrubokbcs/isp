'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  Paper,
  LinearProgress,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import { StudentSessionPayload } from '@/lib/auth/studentSession';
import { ispColors } from '@/theme/colors';

export default function StudentDashboardPage() {
  const [student, setStudent] = React.useState<StudentSessionPayload | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/auth/student/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.student) {
          setStudent(data.student);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', py: 8 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: '#64748B' }}>
          Loading your student portal...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Welcome Header Banner */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3.5,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #061B57 0%, #1748D1 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(6, 27, 87, 0.25)',
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Chip
                label="ISPIAN SCHOLAR"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 210, 31, 0.25)',
                  color: '#FFD21F',
                  fontWeight: 800,
                  fontSize: '11px',
                }}
              />
              <Chip
                label={`ID: ${student?.studentId || '20280001'}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              />
            </Stack>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
              Welcome back, {student?.fullName || 'Student'}! 👋
            </Typography>

            <Typography variant="body1" sx={{ color: '#CBD5E1', fontSize: '15px', maxWidth: 600 }}>
              You are enrolled in <strong>{student?.batchName || 'SSC 2026 Batch'}</strong>. Check your upcoming model tests, daily routine, and academic performance below.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<CalendarMonthRoundedIcon />}
                href="#routine"
                sx={{
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  fontWeight: 800,
                  fontSize: '13px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#F5C518' },
                }}
              >
                View Routine
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                Admit Card
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Key Metrics & Status Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Enrolled Batch
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mt: 0.5, fontSize: '16px' }}>
                    {student?.batchName || 'SSC 2026 Batch'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Morning Shift &bull; Room 301
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#EEF4FF', color: '#1748D1', borderRadius: '10px' }}>
                  <SchoolRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Next Model Test
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0D9488', mt: 0.5, fontSize: '16px' }}>
                    Higher Mathematics
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Sep 15, 2026 &bull; 10:00 AM
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#CCFBF1', color: '#0D9488', borderRadius: '10px' }}>
                  <AssignmentRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Attendance Rate
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#16A34A', mt: 0.5, fontSize: '16px' }}>
                    94.5%
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    28 of 30 Classes Present
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#DCFCE7', color: '#16A34A', borderRadius: '10px' }}>
                  <CheckCircleRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Billing / Fee Status
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1748D1', mt: 0.5, fontSize: '16px' }}>
                    Cleared
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    September Tuition Paid
                  </Typography>
                </Box>
                <Box sx={{ p: 1.2, bgcolor: '#EEF4FF', color: '#1748D1', borderRadius: '10px' }}>
                  <AccountBalanceWalletRoundedIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Class Routine & Schedule Preview */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Today's Classes */}
        <Grid size={{ xs: 12, lg: 7 }} id="routine">
          <Paper sx={{ p: 3, borderRadius: '14px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                <CalendarMonthRoundedIcon sx={{ color: '#1748D1' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
                  Today&apos;s Class Routine
                </Typography>
              </Stack>
              <Chip label="Morning Shift" size="small" sx={{ bgcolor: '#EEF4FF', color: '#1748D1', fontWeight: 700 }} />
            </Box>

            <Stack spacing={1.5}>
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57' }}>
                    Higher Mathematics &bull; Chapter 8 (Trigonometry)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Teacher: Prof. M. Rahman &bull; Hall A (Room 301)
                  </Typography>
                </Box>
                <Chip label="10:00 AM – 11:30 AM" size="small" sx={{ fontWeight: 700, bgcolor: '#FFFFFF', border: '1px solid #CBD5E1' }} />
              </Box>

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57' }}>
                    Physics &bull; Chapter 4 (Work, Energy &amp; Power)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Teacher: Engr. Dhrubo &bull; Room 204
                  </Typography>
                </Box>
                <Chip label="11:45 AM – 01:00 PM" size="small" sx={{ fontWeight: 700, bgcolor: '#FFFFFF', border: '1px solid #CBD5E1' }} />
              </Box>

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57' }}>
                    Chemistry &bull; Chapter 3 (Periodic Table)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Teacher: Dr. Rafiqul Islam &bull; Lab 2
                  </Typography>
                </Box>
                <Chip label="01:30 PM – 02:45 PM" size="small" sx={{ fontWeight: 700, bgcolor: '#FFFFFF', border: '1px solid #CBD5E1' }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Performance & Results Preview */}
        <Grid size={{ xs: 12, lg: 5 }} id="exams">
          <Paper sx={{ p: 3, borderRadius: '14px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                <AssignmentRoundedIcon sx={{ color: '#0D9488' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
                  Recent Marksheets
                </Typography>
              </Stack>
              <Chip label="Latest Scores" size="small" sx={{ bgcolor: '#CCFBF1', color: '#0D9488', fontWeight: 700 }} />
            </Box>

            <Stack spacing={1.5}>
              <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#061B57' }}>
                    Weekly Model Test 03
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Higher Mathematics (Paper 1)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#16A34A' }}>
                    92 / 100
                  </Typography>
                  <Chip label="GPA 5.0 (A+)" size="small" sx={{ height: 20, fontSize: '10.5px', fontWeight: 800, bgcolor: '#DCFCE7', color: '#16A34A' }} />
                </Box>
              </Box>

              <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#061B57' }}>
                    Chapter Assessment 02
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Physics (Work &amp; Energy)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#16A34A' }}>
                    46 / 50
                  </Typography>
                  <Chip label="GPA 5.0 (A+)" size="small" sx={{ height: 20, fontSize: '10.5px', fontWeight: 800, bgcolor: '#DCFCE7', color: '#16A34A' }} />
                </Box>
              </Box>

              <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#061B57' }}>
                    Term Final Mock Exam
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Chemistry (Paper 1)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1748D1' }}>
                    84 / 100
                  </Typography>
                  <Chip label="GPA 5.0 (A+)" size="small" sx={{ height: 20, fontSize: '10.5px', fontWeight: 800, bgcolor: '#EEF4FF', color: '#1748D1' }} />
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 4. Campus Notice Bulletin */}
      <Paper sx={{ p: 3, borderRadius: '14px', border: `1px solid ${ispColors.border.default}`, boxShadow: 'none' }} id="notices">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
            <CampaignRoundedIcon sx={{ color: '#D97706' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
              Campus Notice Board
            </Typography>
          </Stack>
          <Chip label="Official Bulletins" size="small" sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700 }} />
        </Box>

        <Stack spacing={2}>
          <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Chip label="IMPORTANT" size="small" sx={{ bgcolor: '#DC2626', color: '#FFFFFF', fontWeight: 800, height: 20, fontSize: '10.5px' }} />
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Published: Today, 09:00 AM
              </Typography>
            </Stack>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
              SSC Special Model Test Routine 2026 Announced
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '13.5px' }}>
              All students of SSC 2026 Batch are requested to collect their admit card and check the examination room allocation from the exam center.
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>
              Published: Yesterday &bull; ISP Academic Office
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
              Friday Extra Practice Session on Trigonometry
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '13.5px' }}>
              Special problem solving and CQ question discussion class will be held this Friday from 09:30 AM to 11:30 AM in Auditorium Hall A.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
