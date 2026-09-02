'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Avatar,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import PublicLayout from '@/components/public/PublicLayout';
import { FACULTY_MEMBERS, FacultyMember } from '@/lib/data/faculty';
import { ispColors } from '@/theme/colors';

export default function FacultyPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredMembers = React.useMemo(() => {
    return FACULTY_MEMBERS.filter((member) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Senior' && member.category === 'Senior Faculty') ||
        (selectedCategory === 'Junior' && member.category === 'Junior Faculty') ||
        (selectedCategory === 'Alumni' && member.category === 'Alumni / Previous Faculty');

      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.extra && member.extra.toLowerCase().includes(searchQuery.toLowerCase())) ||
        member.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <PublicLayout>
      {/* 1. Header Hero Banner */}
      <Box
        sx={{
          bgcolor: '#061B57', // ISP Navy
          color: '#FFFFFF',
          pt: { xs: 6, md: 9 },
          pb: { xs: 6, md: 8 },
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 820, mx: 'auto', textAlign: { xs: 'left', md: 'center' } }}>
            <Chip
              icon={<SchoolRoundedIcon sx={{ fontSize: '18px !important', color: '#FFD21F !important' }} />}
              label="ISP MENTORS &amp; EDUCATORS"
              sx={{
                bgcolor: 'rgba(255, 210, 31, 0.15)',
                color: '#FFD21F',
                fontWeight: 800,
                fontSize: '13px',
                mb: 2.5,
                px: 1,
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '30px', sm: '42px', md: '48px' },
                fontWeight: 800,
                color: '#FFFFFF',
                mb: 2,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              Faculty Members &bull; শিক্ষক মণ্ডলী
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '15px', md: '17px' },
                color: '#CBD5E1',
                lineHeight: 1.7,
                maxWidth: 700,
                mx: { xs: 0, md: 'auto' },
                mb: 4,
              }}
            >
              CUET, চট্টগ্রাম বিশ্ববিদ্যালয়, চমেক (CMC) ও শীর্ষ প্রতিষ্ঠানের দক্ষ শিক্ষক এবং মেন্টরদের সুনিপুণ পাঠদানে গড়ে উঠছে ISP-এর প্রতিটি শিক্ষার্থী।
            </Typography>

            {/* Search Input in Hero */}
            <Box sx={{ maxWidth: 480, mx: { xs: 0, md: 'auto' } }}>
              <TextField
                fullWidth
                placeholder="শিক্ষক বা বিষয়ের নাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: '#FFFFFF',
                      borderRadius: '12px',
                      height: 48,
                      fontSize: '15px',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. Main Directory Content */}
      <Box sx={{ bgcolor: ispColors.background.default, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          {/* Category Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, val) => setSelectedCategory(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontSize: '15px',
                  fontWeight: 700,
                  textTransform: 'none',
                  minHeight: 48,
                  px: 3,
                },
              }}
            >
              <Tab label={`সবাই (${FACULTY_MEMBERS.length})`} value="All" />
              <Tab
                label={`সিনিয়র শিক্ষক মণ্ডলী (${FACULTY_MEMBERS.filter((m) => m.category === 'Senior Faculty').length})`}
                value="Senior"
              />
              <Tab
                label={`জুনিয়র শিক্ষক মণ্ডলী (${FACULTY_MEMBERS.filter((m) => m.category === 'Junior Faculty').length})`}
                value="Junior"
              />
              <Tab
                label={`প্রাক্তন শিক্ষক ও মেন্টর (${FACULTY_MEMBERS.filter((m) => m.category === 'Alumni / Previous Faculty').length})`}
                value="Alumni"
              />
            </Tabs>
          </Box>

          {/* Members Grid */}
          <Grid container spacing={3.5}>
            {filteredMembers.map((member: FacultyMember) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    border: `1px solid ${ispColors.border.default}`,
                    boxShadow: '0 2px 10px rgba(16, 24, 40, 0.04)',
                    transition: 'all 0.25s ease',
                    bgcolor: '#FFFFFF',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(16, 24, 40, 0.08)',
                      borderColor: '#1748D1',
                    },
                  }}
                >
                  {/* Photo Container */}
                  <Box
                    sx={{
                      height: 220,
                      bgcolor: '#F1F5F9',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      variant="square"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        '& img': {
                          objectFit: 'cover',
                          objectPosition: 'top center',
                        },
                      }}
                    >
                      <SchoolRoundedIcon sx={{ fontSize: 64, color: '#94A3B8' }} />
                    </Avatar>

                    {/* Category Overlay Chip */}
                    <Chip
                      label={
                        member.category === 'Senior Faculty'
                          ? 'সিনিয়র শিক্ষক'
                          : member.category === 'Junior Faculty'
                          ? 'জুনিয়র শিক্ষক'
                          : 'প্রাক্তন মেন্টর'
                      }
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                        fontSize: '11px',
                        bgcolor:
                          member.category === 'Senior Faculty'
                            ? '#061B57'
                            : member.category === 'Junior Faculty'
                            ? '#1748D1'
                            : '#D97706',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Box>

                  {/* Card Body */}
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px', mb: 0.5 }}>
                      {member.name}
                    </Typography>

                    <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 700, fontSize: '13px', display: 'block', mb: 1.2 }}>
                      {member.dept}
                    </Typography>

                    {member.extra && (
                      <Typography variant="body2" sx={{ color: ispColors.text.secondary, fontSize: '13.5px', mb: 2, flexGrow: 1 }}>
                        {member.extra}
                      </Typography>
                    )}

                    {member.email && (
                      <Box
                        component="a"
                        href={`mailto:${member.email}`}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.8,
                          color: '#64748B',
                          fontSize: '12.5px',
                          textDecoration: 'none',
                          pt: 1.5,
                          borderTop: `1px solid ${ispColors.border.default}`,
                          '&:hover': { color: '#1748D1' },
                        }}
                      >
                        <EmailRoundedIcon sx={{ fontSize: 15 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.email}
                        </span>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Bottom Callout Banner */}
          <Box
            sx={{
              mt: 8,
              p: { xs: 4, md: 5 },
              borderRadius: '20px',
              bgcolor: '#061B57',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
                  শিক্ষক মণ্ডলীর সাথে সরাসরি পরামর্শ
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '14.5px' }}>
                  আপনার সন্তানের যেকোনো বিষয়ে বিশেষ কেয়ার বা ব্যাচ পরামর্শের জন্য বহদ্দারহাট ব্রাঞ্চে যোগাযোগ করুন।
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              component="a"
              href="tel:01841314381"
              startIcon={<PhoneRoundedIcon />}
              sx={{
                height: 48,
                px: 3.5,
                fontSize: '15px',
                fontWeight: 700,
                bgcolor: '#FFD21F',
                color: '#061B57',
                flexShrink: 0,
                '&:hover': { bgcolor: '#FFE04D' },
              }}
            >
              হটলাইনে কথা বলুন
            </Button>
          </Box>
        </Container>
      </Box>
    </PublicLayout>
  );
}
