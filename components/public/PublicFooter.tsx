'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { ispColors } from '@/theme/colors';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#061B57', // ISP Deep Navy from ispctg.live
        color: '#F8FAFC',
        pt: { xs: 7, md: 9 },
        pb: 4,
        borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 5 }}>
          {/* Column 1: Brand & Overview */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '22px',
                  fontStyle: 'italic',
                  transform: 'skewX(-4deg)',
                }}
              >
                ISP
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15 }}>
                  Indicator Student&apos;s Point
                </Typography>
                <Typography variant="caption" sx={{ color: '#FFD21F', fontWeight: 600 }}>
                  পড়াশোনা হোক লক্ষ্য অর্জনের সোপান
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: '#CBD5E1',
                mb: 3,
                lineHeight: 1.7,
                fontSize: '14.5px',
                maxWidth: 360,
              }}
            >
              শিক্ষার্থীর শক্তি, জ্ঞানই আলো। Indicator Student&apos;s Point (ISP) হলো ৬ষ্ঠ থেকে দ্বাদশ শ্রেণির শিক্ষার্থীদের জন্য চট্টগ্রাম বহদ্দারহাটে অবস্থিত একটি নির্ভরযোগ্য প্রিমিয়াম একাডেমিক কোচিং প্ল্যাটফর্ম।
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Typography variant="caption" sx={{ color: '#FFD21F', fontWeight: 700, display: 'block', mb: 0.5 }}>
                শিফট সময়সূচি (BATCH TIMINGS)
              </Typography>
              <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '13.5px' }}>
                সকাল ও বিকালের সুবিধাজনক শিফট ব্যাচ &bull; নিয়মিত ক্লাস ও পরীক্ষা
              </Typography>
            </Box>
          </Grid>

          {/* Column 2: Academic Programs */}
          <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 2.5,
                letterSpacing: '-0.01em',
              }}
            >
              প্রোগ্রাম সমূহ (Programs)
            </Typography>
            <Stack spacing={1.5}>
              {[
                { label: 'SSC ২০২৬ ব্যাচ প্রোগ্রাম', href: '/#programs' },
                { label: 'HSC ২০২৮ ব্যাচ প্রোগ্রাম', href: '/#programs' },
                { label: 'অ্যাডমিশন ভর্তি প্রস্তুতি', href: '/#programs' },
                { label: 'Class 6–12 একাডেমিক শ্রেণি', href: '/#programs' },
                { label: 'অধ্যায়ভিত্তিক এক্সাম সেন্টার', href: '/exam-center' },
                { label: 'মডেল টেস্ট ও মার্কশিট', href: '/exam-center' },
              ].map((item) => (
                <Typography
                  key={item.label}
                  component={Link}
                  href={item.href}
                  variant="body2"
                  sx={{
                    color: '#94A3B8',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                    '&:hover': { color: '#FFD21F' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: Portals & Resources */}
          <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 2.5,
                letterSpacing: '-0.01em',
              }}
            >
              পোর্টাল ও রিসোর্স
            </Typography>
            <Stack spacing={1.5}>
              <Box
                component={Link}
                href="/login"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.8,
                  color: '#FFD21F',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                <SchoolRoundedIcon sx={{ fontSize: 16 }} />
                Student Portal (Google)
              </Box>

              <Box
                component={Link}
                href="/console/login"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.8,
                  color: '#94A3B8',
                  textDecoration: 'none',
                  fontSize: '14px',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 16 }} />
                Staff &amp; Teacher Console
              </Box>

              {[
                { label: 'শিক্ষক মণ্ডলী (Faculty Directory)', href: '/faculty' },
                { label: 'HSC ক্লাস রুটিন', href: '/exam-center' },
                { label: 'অনলাইন মার্কশিট আর্কাইভ', href: '/exam-center' },
                { label: 'কেন ISP বেছে নেবেন?', href: '/#why-isp' },
                { label: 'প্রথম ১০০ শিক্ষার্থীর সুবিধা', href: '/#offers' },
              ].map((item) => (
                <Typography
                  key={item.label}
                  component={Link}
                  href={item.href}
                  variant="body2"
                  sx={{
                    color: '#94A3B8',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s',
                    '&:hover': { color: '#FFD21F' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Column 4: Campus & Contact */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 2.5,
                letterSpacing: '-0.01em',
              }}
            >
              যোগাযোগ ও শাখা
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                <LocationOnRoundedIcon sx={{ color: '#FFD21F', fontSize: 18, mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px' }}>
                    শাখা ঠিকানা (বহদ্দারহাট)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '13px', display: 'block', lineHeight: 1.5 }}>
                    বহদ্দারহাট, কাশবন রেস্টুরেন্টের পাশের গলি, করিম টাওয়ার (৪র্থ তলা), চট্টগ্রাম
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                <PhoneRoundedIcon sx={{ color: '#FFD21F', fontSize: 18, mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px' }}>
                    হটলাইন নম্বর
                  </Typography>
                  <Typography
                    component="a"
                    href="tel:01841314381"
                    variant="caption"
                    sx={{ color: '#CBD5E1', fontSize: '13px', display: 'block', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
                  >
                    01841-314381 / 01760-184934
                  </Typography>
                  <Typography
                    component="a"
                    href="tel:01521535352"
                    variant="caption"
                    sx={{ color: '#94A3B8', fontSize: '12px', display: 'block', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
                  >
                    বিকল্প: 01521-535352
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                <EmailRoundedIcon sx={{ color: '#FFD21F', fontSize: 18, mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px' }}>
                    অফিসিয়াল ইমেইল
                  </Typography>
                  <Typography
                    component="a"
                    href="mailto:isp.ctg.bd@gmail.com"
                    variant="caption"
                    sx={{ color: '#CBD5E1', fontSize: '13px', display: 'block', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
                  >
                    isp.ctg.bd@gmail.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                <AccessTimeRoundedIcon sx={{ color: '#FFD21F', fontSize: 18, mt: 0.3 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '14px' }}>
                    ক্লাস শিফট
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', fontSize: '13px', display: 'block' }}>
                    সকাল ও বিকালের সুবিধাজনক শিফট ব্যাচ
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '13px' }}>
            &copy; {currentYear} Indicator Student&apos;s Point (ISP). All rights reserved. &bull; Built for Student Success.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Typography
              component={Link}
              href="/console/login"
              variant="caption"
              sx={{ color: '#94A3B8', textDecoration: 'none', fontSize: '13px', '&:hover': { color: '#FFFFFF' } }}
            >
              Staff Console
            </Typography>
            <Typography
              component="span"
              variant="caption"
              sx={{ color: '#64748B', fontSize: '13px' }}
            >
              বহদ্দারহাট, চট্টগ্রাম
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
