'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';

import PublicLayout from '@/components/public/PublicLayout';
import { ispColors } from '@/theme/colors';

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. Hero Section (Data from ispctg.live) */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          pt: { xs: 6, md: 9 },
          pb: { xs: 8, md: 11 },
          borderBottom: `1px solid ${ispColors.border.default}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative radial gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50vw',
            height: '100%',
            background: `radial-gradient(ellipse at 85% 25%, #EEF4FF 0%, rgba(255,255,255,0) 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 860, mx: 'auto', textAlign: { xs: 'left', md: 'center' } }}>
            {/* Real Ticker / Badge from ispctg.live */}
            <Chip
              icon={<StarRoundedIcon sx={{ fontSize: '18px !important', color: '#FFD21F !important' }} />}
              label="পরীক্ষা প্রস্তুতি ২০২৬ | ভর্তি চলছে"
              sx={{
                bgcolor: '#061B57',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                mb: 3,
                py: 2.2,
                px: 1.5,
                boxShadow: '0 4px 12px rgba(6, 27, 87, 0.15)',
              }}
            />

            {/* Main Headline from ispctg.live */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '32px', sm: '44px', md: '52px' },
                fontWeight: 800,
                color: '#061B57',
                lineHeight: 1.22,
                letterSpacing: '-0.025em',
                mb: 2.5,
              }}
            >
              ভবিষ্যৎ গড়ার{' '}
              <Box component="span" sx={{ color: '#1748D1' }}>
                সঠিক পদক্ষেপ
              </Box>
            </Typography>

            {/* Description from ispctg.live */}
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '16px', md: '18px' },
                color: ispColors.text.secondary,
                lineHeight: 1.75,
                maxWidth: 740,
                mx: { xs: 0, md: 'auto' },
                mb: 4,
              }}
            >
              Indicator Student&apos;s Point (ISP) হলো ৬ষ্ঠ থেকে দ্বাদশ শ্রেণির শিক্ষার্থীদের জন্য একটি প্রিমিয়াম একাডেমিক কোচিং প্ল্যাটফর্ম। নিয়মিত ক্লাস, পরীক্ষা ও অভিজ্ঞ শিক্ষকদের সঠিক দিকনির্দেশনার মাধ্যমে আমরা শিক্ষার্থীদের তাদের কাঙ্ক্ষিত লক্ষ্যে পৌঁছাতে প্রস্তুত করি।
            </Typography>

            {/* ISP Mottos pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1,
                bgcolor: '#FFF7D6',
                border: '1px solid #FFD21F',
                borderRadius: '50px',
                mb: 4.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#061B57', fontSize: '14px' }}>
                &ldquo;পড়াশোনা হোক লক্ষ্য অর্জনের সোপান &bull; শিক্ষার্থীর শক্তি, জ্ঞানই আলো&rdquo;
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                mb: 6,
                justifyContent: { xs: 'flex-start', md: 'center' },
              }}
            >
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="#programs"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  height: 52,
                  px: 3.5,
                  fontSize: '16px',
                  fontWeight: 700,
                  bgcolor: '#1748D1',
                  boxShadow: `0 4px 14px rgba(23, 72, 209, 0.3)`,
                  '&:hover': { bgcolor: '#092B91' },
                }}
              >
                আমাদের প্রোগ্রাম দেখুন (Programs)
              </Button>

              <Button
                variant="outlined"
                size="large"
                component="a"
                href="tel:01841314381"
                startIcon={<PhoneRoundedIcon />}
                sx={{
                  height: 52,
                  px: 3,
                  fontSize: '16px',
                  fontWeight: 700,
                  borderColor: '#FFD21F',
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  boxShadow: '0 4px 14px rgba(255, 210, 31, 0.35)',
                  '&:hover': {
                    bgcolor: '#FFE04D',
                    borderColor: '#FFE04D',
                  },
                }}
              >
                সরাসরি ফোন: 01841-314381
              </Button>
            </Stack>

            {/* 4 Core Level Stat Badges from ispctg.live */}
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                border: `1px solid ${ispColors.border.default}`,
                boxShadow: '0 4px 20px rgba(16, 24, 40, 0.05)',
              }}
            >
              <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
                {[
                  { tag: '৬–১২', label: 'একাডেমিক শ্রেণি', desc: 'Class 6–12 পূর্ণাঙ্গ সিলেবাস' },
                  { tag: 'SSC', label: 'বিশেষ প্রস্তুতি', desc: 'SSC ২০২৬ নিবিড় ব্যাচ' },
                  { tag: 'HSC', label: 'পূর্ণাঙ্গ প্রস্তুতি', desc: 'HSC ২০২৮ স্পেশাল ব্যাচ' },
                  { tag: 'ADMISSION', label: 'ভর্তি প্রস্তুতি', desc: 'বিশ্ববিদ্যালয় ও মেডিকেল' },
                ].map((stat, i) => (
                  <Grid size={{ xs: 6, sm: 6, md: 3 }} key={i}>
                    <Box sx={{ textAlign: 'center', py: 0.5 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          color: '#1748D1',
                          fontSize: { xs: '22px', md: '26px' },
                          mb: 0.3,
                        }}
                      >
                        {stat.tag}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: ispColors.text.primary, fontSize: '14.5px' }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ispColors.text.muted, fontSize: '12px' }}>
                        {stat.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. Special Admission Offer Banner (From ispctg.live) */}
      <Box id="offers" sx={{ py: 4, bgcolor: '#FFF7D6', borderBottom: '1px solid #FFD21F' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2.5,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: '14px',
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(255, 210, 31, 0.4)',
                }}
              >
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '18px' }}>
                  বিশেষ ভর্তি সুযোগ &bull; প্রথম ১০০ শিক্ষার্থীর জন্য
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '14.5px' }}>
                  ISP-তে সবার আগে ভর্তি হওয়া ১০০ জন শিক্ষার্থীর জন্য বিশেষ ছাড় ও সুবিধা। আসন সংখ্যা সীমিত, আজই আপনার আসন নিশ্চিত করুন!
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              component="a"
              href="tel:01841314381"
              startIcon={<PhoneRoundedIcon />}
              sx={{
                height: 46,
                px: 3,
                fontSize: '15px',
                fontWeight: 700,
                bgcolor: '#061B57',
                color: '#FFFFFF',
                flexShrink: 0,
                '&:hover': { bgcolor: '#092B91' },
              }}
            >
              আসন বুক করুন
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 3. Our Special Programs (Exact data from ispctg.live) */}
      <Box id="programs" sx={{ py: { xs: 8, md: 12 }, bgcolor: ispColors.background.default }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 680, mx: 'auto' }}>
            <Typography variant="overline" sx={{ color: '#1748D1', fontWeight: 800, letterSpacing: '0.08em' }}>
              OUR SPECIAL PROGRAMS
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#061B57', mt: 1, mb: 1.5, fontSize: { xs: '28px', md: '36px' } }}>
              লক্ষ্যে পৌঁছাতে সেরা প্রস্তুতি
            </Typography>
            <Typography variant="body1" sx={{ color: ispColors.text.secondary, fontSize: '16px', lineHeight: 1.6 }}>
              শিক্ষার্থীর প্রয়োজন অনুযায়ী একাডেমিক, বোর্ড পরীক্ষা এবং বিশ্ববিদ্যালয় ভর্তি প্রস্তুতির জন্য পরিকল্পিত ও মানসম্মত প্রোগ্রাম।
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {/* Program 1: SSC ২০২৬ */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: `1px solid ${ispColors.border.default}`,
                  boxShadow: '0 2px 12px rgba(16, 24, 40, 0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(16, 24, 40, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label="ভর্তি চলছে"
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#15965A', fontWeight: 700, fontSize: '12px' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1748D1' }}>
                      SSC ব্যাচ
                    </Typography>
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 1, fontSize: '20px' }}>
                    SSC ২০২৬ ব্যাচ প্রোগ্রাম
                  </Typography>

                  <Typography variant="body2" sx={{ color: ispColors.text.secondary, mb: 2.5, fontSize: '14.5px', lineHeight: 1.6 }}>
                    সিলেবাস ভিত্তিক সম্পূর্ণ প্রস্তুতি এবং অধ্যায়ভিত্তিক মডেল টেস্টের মাধ্যমে বোর্ড পরীক্ষায় জিপিএ-৫ নিশ্চিতকরণ।
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={1.2} sx={{ mb: 3, flexGrow: 1 }}>
                    {[
                      'সিলেবাস ভিত্তিক নিবিড় ক্লাস',
                      'অধ্যায়ভিত্তিক এক্সাম ও মডেল টেস্ট',
                      'দক্ষ ও অভিজ্ঞ শিক্ষক মণ্ডলী',
                      'নিয়মিত ফলাফল ও অগ্রগতি বিশ্লেষণ',
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#15965A' }} />
                        <Typography variant="body2" sx={{ color: ispColors.text.primary, fontSize: '14px' }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant="outlined"
                    component="a"
                    href="tel:01841314381"
                    fullWidth
                    sx={{
                      height: 44,
                      fontSize: '14.5px',
                      fontWeight: 700,
                      borderColor: '#1748D1',
                      color: '#1748D1',
                      '&:hover': { bgcolor: '#EEF4FF', borderColor: '#1748D1' },
                    }}
                  >
                    বিস্তারিত ও ভর্তি &rarr;
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Program 2: HSC ২০২৮ */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: `1px solid ${ispColors.border.default}`,
                  boxShadow: '0 2px 12px rgba(16, 24, 40, 0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(16, 24, 40, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label="নতুন ব্যাচ"
                      size="small"
                      sx={{ bgcolor: '#EFF6FF', color: '#1748D1', fontWeight: 700, fontSize: '12px' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1748D1' }}>
                      HSC ব্যাচ
                    </Typography>
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 1, fontSize: '20px' }}>
                    HSC ২০২৮ ব্যাচ প্রোগ্রাম
                  </Typography>

                  <Typography variant="body2" sx={{ color: ispColors.text.secondary, mb: 2.5, fontSize: '14.5px', lineHeight: 1.6 }}>
                    কলেজ পরীক্ষা এবং এইচএসসি বোর্ড পরীক্ষার জন্য বেসিক থেকে অ্যাডভান্সড কনসেপ্ট ক্লিয়ারিং কেয়ার।
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={1.2} sx={{ mb: 3, flexGrow: 1 }}>
                    {[
                      'বেসিক টু অ্যাডভান্সড ক্লাস',
                      'বোর্ড পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি',
                      'সৃজনশীল ও MCQ বিশেষ সেশন',
                      'অভিজ্ঞ মেন্টরশিপ সাপোর্ট',
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#15965A' }} />
                        <Typography variant="body2" sx={{ color: ispColors.text.primary, fontSize: '14px' }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant="outlined"
                    component="a"
                    href="tel:01841314381"
                    fullWidth
                    sx={{
                      height: 44,
                      fontSize: '14.5px',
                      fontWeight: 700,
                      borderColor: '#1748D1',
                      color: '#1748D1',
                      '&:hover': { bgcolor: '#EEF4FF', borderColor: '#1748D1' },
                    }}
                  >
                    বিস্তারিত ও ভর্তি &rarr;
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Program 3: অ্যাডমিশন ভর্তি প্রস্তুতি */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: `1px solid ${ispColors.border.default}`,
                  boxShadow: '0 2px 12px rgba(16, 24, 40, 0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(16, 24, 40, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label="স্পেশাল ব্যাচ"
                      size="small"
                      sx={{ bgcolor: '#FFF7D6', color: '#92400E', fontWeight: 700, fontSize: '12px' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400E' }}>
                      অ্যাডমিশন
                    </Typography>
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 1, fontSize: '20px' }}>
                    অ্যাডমিশন ভর্তি প্রস্তুতি কোর্স
                  </Typography>

                  <Typography variant="body2" sx={{ color: ispColors.text.secondary, mb: 2.5, fontSize: '14.5px', lineHeight: 1.6 }}>
                    পাবলিক বিশ্ববিদ্যালয়, প্রকৌশল (BUET/CKET), এবং মেডিকেল ভর্তি পরীক্ষায় শ্রেষ্ঠত্ব অর্জনের বিশেষ দিকনির্দেশনা।
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={1.2} sx={{ mb: 3, flexGrow: 1 }}>
                    {[
                      'বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি প্রস্তুতি',
                      'ইউনিট ভিত্তিক স্পেশালাইজড ক্লাস',
                      'স্ট্যান্ডার্ড মডেল টেস্ট ও র‍্যাংকিং',
                      'সর্বাত্মক ক্যারিয়ার গাইডলাইন',
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#15965A' }} />
                        <Typography variant="body2" sx={{ color: ispColors.text.primary, fontSize: '14px' }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant="outlined"
                    component="a"
                    href="tel:01841314381"
                    fullWidth
                    sx={{
                      height: 44,
                      fontSize: '14.5px',
                      fontWeight: 700,
                      borderColor: '#1748D1',
                      color: '#1748D1',
                      '&:hover': { bgcolor: '#EEF4FF', borderColor: '#1748D1' },
                    }}
                  >
                    বিস্তারিত ও ভর্তি &rarr;
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. Why ISP (কেন ISP বেছে নেবেন? - Authentic 5 Pillars from ispctg.live) */}
      <Box id="why-isp" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF', borderBottom: `1px solid ${ispColors.border.default}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7, maxWidth: 680, mx: 'auto' }}>
            <Typography variant="overline" sx={{ color: '#1748D1', fontWeight: 800, letterSpacing: '0.08em' }}>
              WHY ISP
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#061B57', mt: 1, mb: 1.5, fontSize: { xs: '28px', md: '36px' } }}>
              কেন ISP বেছে নেবেন?
            </Typography>
            <Typography variant="body1" sx={{ color: ispColors.text.secondary, fontSize: '16px' }}>
              শিক্ষার্থীদের সর্বোচ্চ সাফল্য নিশ্চিত করতে আমাদের প্রতিটি পদক্ষেপ সুপরিকল্পিত।
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {[
              {
                title: 'দক্ষ ও অভিজ্ঞ শিক্ষক মণ্ডলী',
                desc: 'বিষয়ভিত্তিক যত্নশীল পাঠদান ও দিকনির্দেশনার মাধ্যমে প্রতিটি শিক্ষার্থীর বেসিক দৃঢ় করা হয়।',
                icon: <SchoolRoundedIcon sx={{ fontSize: 32, color: '#1748D1' }} />,
              },
              {
                title: 'সিলেবাস ভিত্তিক সম্পূর্ণ ক্লাস',
                desc: 'পরিকল্পিত একাডেমিক প্রস্তুতি ও নির্ধারিত সময়ের মধ্যে সম্পূর্ণ সিলেবাস সফলভাবে সম্পন্ন করা হয়।',
                icon: <MenuBookRoundedIcon sx={{ fontSize: 32, color: '#1748D1' }} />,
              },
              {
                title: 'নিয়মিত এক্সাম ও মডেল টেস্ট',
                desc: 'ধারাবাহিক প্রস্তুতি যাচাই, অধ্যায়ভিত্তিক পরীক্ষা এবং বোর্ড মানের মডেল টেস্ট মূল্যায়ন।',
                icon: <AssignmentRoundedIcon sx={{ fontSize: 32, color: '#1748D1' }} />,
              },
              {
                title: 'ফলাফল বিশ্লেষণ ও পারফরম্যান্স',
                desc: 'প্রতিটি শিক্ষার্থীর অগ্রগতি ট্র্যাক করে দুর্বল বিষয়গুলো চিহ্নিত করে প্রয়োজনীয় উন্নতির পদক্ষেপ গ্রহণ।',
                icon: <TrendingUpRoundedIcon sx={{ fontSize: 32, color: '#1748D1' }} />,
              },
              {
                title: 'ব্যক্তিগত যত্ন ও সার্বক্ষণিক সাপোর্ট',
                desc: 'শিক্ষার্থীর যেকোনো একাডেমিক দুর্বলতা দূরীকরণে ও পড়াশোনায় আত্মবিশ্বাস ফেরাতে বিশেষ মনোযোগ।',
                icon: <SupportAgentRoundedIcon sx={{ fontSize: 32, color: '#1748D1' }} />,
              },
              {
                title: 'সকাল ও বিকালের সুবিধাজনক শিফট',
                desc: 'স্কুল এবং কলেজের রুটিনের সাথে সামঞ্জস্য রেখে সকাল ও বিকালের পৃথক শিফট ব্যাচে ক্লাস ব্যবস্থা।',
                icon: <AccessTimeRoundedIcon sx={{ fontSize: 32, color: '#1748D1' }} />,
              },
            ].map((pillar, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Box
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: `1px solid ${ispColors.border.default}`,
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#1748D1',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: '#EEF4FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                    }}
                  >
                    {pillar.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#061B57', mb: 1.2, fontSize: '18px' }}>
                    {pillar.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.65, fontSize: '14.5px' }}>
                    {pillar.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. Exam Center & Marksheet System (From Google Sites & Digital Platform) */}
      <Box id="exam-center" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#061B57', color: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="ISP EXAM CENTER &amp; MARKSHEET SYSTEM"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 210, 31, 0.15)',
                  color: '#FFD21F',
                  fontWeight: 700,
                  fontSize: '12px',
                  mb: 2.5,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  mb: 2.5,
                  fontSize: { xs: '28px', md: '38px' },
                  lineHeight: 1.25,
                }}
              >
                ডিজিটাল এক্সাম সেন্টার ও মার্কশিট আর্কাইভ
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#CBD5E1',
                  fontSize: '16px',
                  lineHeight: 1.75,
                  mb: 3.5,
                }}
              >
                ISP এক্সাম সেন্টারে প্রতিটি মডেল টেস্টের মূল্যায়ন, OMR মার্কিং এবং পারফরম্যান্স র‍্যাংকিং ডিজিটালি সংরক্ষিত হয়। শিক্ষার্থীরা তাদের ব্যাচ অনুযায়ী পরীক্ষার ফলাফল ও মার্কশিট সরাসরি দেখতে পারে:
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 4 }}>
                {[
                  'ISP 26 Marksheet',
                  'ISP 27 B1/B2/B3',
                  'ISP 28 Marksheet',
                  'ISP 29 B1/B2',
                  'ISP 30 B1/B2',
                  'ISP Special Batch',
                ].map((batch, bIdx) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={bIdx}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: '8px',
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#E2E8F0', fontWeight: 600, fontSize: '13px' }}>
                        {batch}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Button
                variant="contained"
                component={Link}
                href="/login"
                startIcon={<AssessmentRoundedIcon />}
                sx={{
                  height: 48,
                  px: 3,
                  fontSize: '15px',
                  fontWeight: 700,
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  '&:hover': { bgcolor: '#FFE04D' },
                }}
              >
                মার্কশিট ও রেজাল্ট দেখুন (Student Portal)
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 3.5, md: 4.5 },
                  borderRadius: '20px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
                  শিক্ষার্থী ও অভিভাবক লগইন
                </Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 3, fontSize: '14.5px', lineHeight: 1.65 }}>
                  ISP ডিজিটাল পোর্টালে গুগল অ্যাকাউন্ট দিয়ে লগইন করে ক্লাস রুটিন, সাপ্তাহিক পরীক্ষার মার্কশিট ও উপস্থিতি রিপোর্ট চেক করুন।
                </Typography>

                <Stack spacing={2} sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#FFD21F', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '14px' }}>
                      স্থায়ী শিক্ষার্থী আইডি (Permanent Student ID)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#FFD21F', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '14px' }}>
                      সরাসরি গুগল সাইন-ইন সুবিধা (Google Sign-In)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#FFD21F', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '14px' }}>
                      রিয়েল-টাইম এসএমএস ও উপস্থিতি ট্র্যাকিং
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  component={Link}
                  href="/login"
                  startIcon={<SchoolRoundedIcon />}
                  sx={{
                    height: 50,
                    fontSize: '16px',
                    fontWeight: 700,
                    bgcolor: '#1748D1',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#2874FF' },
                  }}
                >
                  স্টুডেন্ট পোর্টালে সাইন ইন করুন
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 6. Contact & Branch Information (Authentic info from both sites) */}
      <Box id="contact" sx={{ py: { xs: 8, md: 12 }, bgcolor: ispColors.background.default }}>
        <Container maxWidth="lg">
          <Card
            sx={{
              borderRadius: '24px',
              border: `1px solid ${ispColors.border.default}`,
              bgcolor: '#FFFFFF',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
              overflow: 'hidden',
            }}
          >
            <Grid container>
              {/* Left Column: Campus Visit & Info */}
              <Grid size={{ xs: 12, md: 7 }} sx={{ p: { xs: 4, md: 6 } }}>
                <Typography variant="overline" sx={{ color: '#1748D1', fontWeight: 800, letterSpacing: '0.08em' }}>
                  GET IN TOUCH
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#061B57', mt: 1, mb: 1.5, fontSize: { xs: '26px', md: '34px' } }}>
                  যোগাযোগ করুন ও ব্রাঞ্চে আসুন
                </Typography>
                <Typography variant="body1" sx={{ color: ispColors.text.secondary, mb: 4, lineHeight: 1.7, fontSize: '15.5px' }}>
                  ভর্তি, নতুন ব্যাচ, ক্লাসের সময়সূচি অথবা যেকোনো তথ্যের জন্য সরাসরি আমাদের সাথে যোগাযোগ করুন বা আমাদের ব্রাঞ্চে এসে পরামর্শ নিন।
                </Typography>

                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: '#EEF4FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1748D1',
                        flexShrink: 0,
                      }}
                    >
                      <LocationOnRoundedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ispColors.text.primary, fontSize: '16px' }}>
                        শাখা ঠিকানা (বহদ্দারহাট)
                      </Typography>
                      <Typography variant="body2" sx={{ color: ispColors.text.secondary, fontSize: '14.5px', lineHeight: 1.6 }}>
                        বহদ্দারহাট, কাশবন রেস্টুরেন্টের পাশের গলি, করিম টাওয়ার (৪র্থ তলা), চট্টগ্রাম
                      </Typography>
                      <Typography variant="caption" sx={{ color: ispColors.text.muted, fontSize: '13px' }}>
                        (Bahaddarhat, Behind Kashbon Restaurant, Karim Tower, 4th Floor, Chattogram)
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: '#EEF4FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1748D1',
                        flexShrink: 0,
                      }}
                    >
                      <PhoneRoundedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ispColors.text.primary, fontSize: '16px' }}>
                        সরাসরি ফোন ও হটলাইন
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1748D1', fontWeight: 700, fontSize: '15px' }}>
                        01841-314381 &bull; 01760-184934
                      </Typography>
                      <Typography variant="caption" sx={{ color: ispColors.text.muted, fontSize: '13px' }}>
                        বিকল্প হটলাইন: 01521-535352
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: '#EEF4FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1748D1',
                        flexShrink: 0,
                      }}
                    >
                      <EmailRoundedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ispColors.text.primary, fontSize: '16px' }}>
                        অফিসিয়াল ইমেইল
                      </Typography>
                      <Typography
                        component="a"
                        href="mailto:isp.ctg.bd@gmail.com"
                        variant="body2"
                        sx={{ color: '#1748D1', fontWeight: 600, fontSize: '14.5px', textDecoration: 'none' }}
                      >
                        isp.ctg.bd@gmail.com
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        bgcolor: '#EEF4FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1748D1',
                        flexShrink: 0,
                      }}
                    >
                      <AccessTimeRoundedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ispColors.text.primary, fontSize: '16px' }}>
                        ক্লাসের সময়সূচি ও শিফট
                      </Typography>
                      <Typography variant="body2" sx={{ color: ispColors.text.secondary, fontSize: '14.5px' }}>
                        সকাল ও বিকালের সুবিধাজনক শিফট ব্যাচ
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>

              {/* Right Column: Quick Callout Box */}
              <Grid
                size={{ xs: 12, md: 5 }}
                sx={{
                  bgcolor: '#F8FAFF',
                  p: { xs: 4, md: 6 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderLeft: { md: `1px solid ${ispColors.border.default}` },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '12px',
                    bgcolor: '#FFD21F',
                    color: '#061B57',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <EmojiEventsRoundedIcon sx={{ fontSize: 28 }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 1.5 }}>
                  আজই শুরু করুন আপনার প্রস্তুতি
                </Typography>

                <Typography variant="body2" sx={{ color: ispColors.text.secondary, mb: 3.5, lineHeight: 1.7, fontSize: '15px' }}>
                  SSC ২০২৬, HSC ২০২৮ কিংবা Class 6–12 একাডেমিক কেয়ারের যেকোনো ব্যাচে সীমিত আসনে ভর্তির সুযোগ চলছে। হটলাইনে কল করে আপনার আসন বুক করুন।
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  component="a"
                  href="tel:01841314381"
                  startIcon={<PhoneRoundedIcon />}
                  sx={{
                    height: 50,
                    fontSize: '16px',
                    fontWeight: 800,
                    bgcolor: '#061B57',
                    color: '#FFFFFF',
                    mb: 1.5,
                    '&:hover': { bgcolor: '#092B91' },
                  }}
                >
                  কল করুন: 01841-314381
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  component="a"
                  href="tel:01760184934"
                  startIcon={<PhoneRoundedIcon />}
                  sx={{
                    height: 48,
                    fontSize: '15px',
                    fontWeight: 700,
                    borderColor: '#1748D1',
                    color: '#1748D1',
                    '&:hover': { bgcolor: '#EEF4FF', borderColor: '#1748D1' },
                  }}
                >
                  বিকল্প নম্বর: 01760-184934
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>
    </PublicLayout>
  );
}
