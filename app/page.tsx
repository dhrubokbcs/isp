'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { ispColors } from '@/theme/colors';

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* Header Branding */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 6,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                bgcolor: ispColors.primary[500],
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '20px',
              }}
            >
              ISP
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Indicator Student&apos;s Point
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Digital Campus &amp; Academic Management Platform
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: '16px !important', color: `${ispColors.semantic.success.main} !important` }} />}
              label="MUI v9 + Next.js App Router Active"
              sx={{
                bgcolor: ispColors.semantic.success.light,
                color: ispColors.semantic.success.dark,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Hero Section */}
        <Card sx={{ mb: 5, p: { xs: 2, md: 3 }, bgcolor: '#FFFFFF' }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: ispColors.primary[600], fontWeight: 700 }}>
              FOUNDATION VERIFIED
            </Typography>
            <Typography variant="h2" sx={{ mt: 1, mb: 2, fontWeight: 700, color: ispColors.primary[900] }}>
              ISP Digital Campus System
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720, mb: 3 }}>
              The full Material UI ecosystem is installed and integrated into Next.js App Router with the official
              light-blue academic design system, comfortable typography scale (16px default body), and responsive layout components.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Access Dashboard
              </Button>
              <Button
                variant="outlined"
                size="large"
              >
                View Documentation
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Core Domains Grid */}
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
          Integrated Modules
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              title: 'Academic Structure',
              desc: 'Academic Years, Programs (SSC/HSC/Admission), Batches & Subjects',
              icon: <SchoolRoundedIcon sx={{ color: ispColors.primary[600], fontSize: 28 }} />,
              status: 'Ready to Configure',
            },
            {
              title: 'People & Admission',
              desc: 'Permanent Student ID (YYYYSSSS), Teacher Assignments, Guardian Links',
              icon: <PeopleAltRoundedIcon sx={{ color: ispColors.primary[600], fontSize: 28 }} />,
              status: 'Core Model Set',
            },
            {
              title: 'Daily Operations',
              desc: 'Timetable Scheduling, Class Sessions, Session Attendance Tracking',
              icon: <HowToRegRoundedIcon sx={{ color: ispColors.primary[600], fontSize: 28 }} />,
              status: 'Defined',
            },
            {
              title: 'Examinations & Marks',
              desc: 'Exams, Subject Marks, Result Generation, Configurable GPA/Grading',
              icon: <AssignmentRoundedIcon sx={{ color: ispColors.primary[600], fontSize: 28 }} />,
              status: 'Defined',
            },
            {
              title: 'Fees & Finance',
              desc: 'Fee Structures, Discounts, Payments, Printable Receipts, Dues List',
              icon: <PaymentsRoundedIcon sx={{ color: ispColors.primary[600], fontSize: 28 }} />,
              status: 'Decimal Safe',
            },
            {
              title: 'System & RBAC',
              desc: 'Superadmin, Admin, Teacher, Student, Guardian Role Separation',
              icon: <DashboardRoundedIcon sx={{ color: ispColors.primary[600], fontSize: 28 }} />,
              status: 'Secured',
            },
          ].map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      bgcolor: ispColors.primary[50],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {item.desc}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Status
                    </Typography>
                    <Chip label={item.status} size="small" sx={{ bgcolor: ispColors.primary[50], color: ispColors.primary[700] }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
