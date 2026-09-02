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
  TextField,
  MenuItem,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

import PublicLayout from '@/components/public/PublicLayout';
import { ispColors } from '@/theme/colors';

const BATCH_LIST = [
  'SSC 2026 Batch',
  'HSC 2028 Batch',
  'ISP Special Batch',
  'ISP 26 Batch',
  'ISP 27 (B1 / B2 / B3)',
  'ISP 28 Batch',
  'ISP 29 (B1 / B2)',
  'ISP 30 (B1 / B2)',
  'ISP 31 (B1 / B2)',
  'ISP 32 (B1 / B2)',
  'ISP 33 (B1 / B2)',
  'University Admission Batch',
  'Class 6–8 Foundation',
];

const MARKSHEETS_DATA = [
  { name: 'ISP 26 Marksheet', batch: 'Batch 2026', totalExams: '12 Tests Completed', status: 'Active' },
  { name: 'ISP Special Batch Marksheet', batch: 'Special Care', totalExams: '15 Tests Completed', status: 'Active' },
  { name: 'ISP 27 B1 Marksheet', batch: 'Batch 2027 (B1)', totalExams: '10 Tests Completed', status: 'Active' },
  { name: 'ISP 27 B2 Marksheet', batch: 'Batch 2027 (B2)', totalExams: '10 Tests Completed', status: 'Active' },
  { name: 'ISP 27 B3 Marksheet', batch: 'Batch 2027 (B3)', totalExams: '9 Tests Completed', status: 'Active' },
  { name: 'ISP 28 Marksheet', batch: 'Batch 2028', totalExams: '8 Tests Completed', status: 'Active' },
  { name: 'ISP 29 B1 Marksheet', batch: 'Batch 2029 (B1)', totalExams: '8 Tests Completed', status: 'Active' },
  { name: 'ISP 29 B2 Marksheet', batch: 'Batch 2029 (B2)', totalExams: '7 Tests Completed', status: 'Active' },
  { name: 'ISP 30 B1 Marksheet', batch: 'Batch 2030 (B1)', totalExams: '6 Tests Completed', status: 'Active' },
  { name: 'ISP 30 B2 Marksheet', batch: 'Batch 2030 (B2)', totalExams: '6 Tests Completed', status: 'Active' },
  { name: 'ISP 31 B1/B2 Marksheet', batch: 'Batch 2031', totalExams: '5 Tests Completed', status: 'Active' },
  { name: 'ISP 32 & 33 Marksheet', batch: 'Junior Batches', totalExams: '4 Tests Completed', status: 'Active' },
];

export default function ExamCenterPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [openRuleDialog, setOpenRuleDialog] = React.useState(false);
  const [openIdDialog, setOpenIdDialog] = React.useState(false);

  // Form State for Exam registration
  const [studentName, setStudentName] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [selectedBatch, setSelectedBatch] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [shift, setShift] = React.useState('Morning (সকাল)');
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  // ID Search state
  const [searchPhone, setSearchPhone] = React.useState('');
  const [searchResult, setSearchResult] = React.useState<{ id: string; name: string; batch: string } | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !selectedBatch) return;
    setFormSubmitted(true);
  };

  const handleIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPhone.trim()) {
      setSearchResult({
        id: `2026${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'ISPIAN Scholar',
        batch: selectedBatch || 'SSC 2026 Batch',
      });
    }
  };

  return (
    <PublicLayout>
      {/* 1. Header Banner */}
      <Box
        sx={{
          bgcolor: '#061B57', // ISP Navy
          color: '#FFFFFF',
          pt: { xs: 6, md: 8 },
          pb: { xs: 6, md: 8 },
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 820, mx: 'auto', textAlign: { xs: 'left', md: 'center' } }}>
            <Chip
              icon={<AssignmentRoundedIcon sx={{ fontSize: '18px !important', color: '#FFD21F !important' }} />}
              label="ISP DIGITAL EXAM CENTER"
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
                fontSize: { xs: '30px', sm: '40px', md: '48px' },
                fontWeight: 800,
                color: '#FFFFFF',
                mb: 2,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              ISP Exam Center &bull; এক্সাম সেন্টার
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
              আইএসপি এক্সাম সেন্টারের মাধ্যমে নিয়মিত মডেল টেস্টের জন্য ফরম পূরণ, ক্লাস রুটিন, পরীক্ষার আচরণবিধি (Rule Book) এবং ব্যাচভিত্তিক মার্কশিট ফলাফল যাচাই করুন।
            </Typography>

            {/* Quick Action Badges */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: { xs: 'flex-start', md: 'center' } }}
            >
              <Button
                variant="contained"
                onClick={() => setOpenRuleDialog(true)}
                startIcon={<RuleRoundedIcon />}
                sx={{
                  height: 46,
                  px: 3,
                  fontSize: '15px',
                  fontWeight: 700,
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  '&:hover': { bgcolor: '#FFE04D' },
                }}
              >
                Rule Book (পরীক্ষার নিয়মাবলী)
              </Button>

              <Button
                variant="outlined"
                onClick={() => setOpenIdDialog(true)}
                startIcon={<SearchRoundedIcon />}
                sx={{
                  height: 46,
                  px: 2.5,
                  fontSize: '15px',
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                Search ISP ID (আইডি খুঁজুন)
              </Button>

              <Button
                variant="outlined"
                component={Link}
                href="/login"
                startIcon={<SchoolRoundedIcon />}
                sx={{
                  height: 46,
                  px: 2.5,
                  fontSize: '15px',
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                স্টুডেন্ট লগইন
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. Main Content Tabs */}
      <Box sx={{ bgcolor: ispColors.background.default, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
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
              <Tab label="পরীক্ষার ফরম পূরণ (Exam Form)" />
              <Tab label="ব্যাচ মার্কশিট আর্কাইভ (Batch Marksheets)" />
              <Tab label="পরীক্ষার রুটিন ও নির্দেশিকা (Guidelines)" />
            </Tabs>
          </Box>

          {/* TAB 0: Exam Registration Form ("Fill-up the form below for exam") */}
          {activeTab === 0 && (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    border: `1px solid ${ispColors.border.default}`,
                    boxShadow: '0 4px 20px rgba(16, 24, 40, 0.04)',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                        Fill-up the Form Below for Exam
                      </Typography>
                      <Typography variant="body2" sx={{ color: ispColors.text.secondary }}>
                        আসন্ন মডেল টেস্ট অথবা অধ্যায়ভিত্তিক পরীক্ষার জন্য নিচের তথ্য পূরণ করে সাবমিট করুন।
                      </Typography>
                    </Box>

                    {formSubmitted ? (
                      <Alert
                        severity="success"
                        sx={{
                          mb: 3,
                          borderRadius: '12px',
                          '& .MuiAlert-message': { fontSize: '15px' },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                          পরীক্ষার ফরম সফলভাবে গৃহীত হয়েছে!
                        </Typography>
                        আপনার রোল ও এডমিট কার্ড ISP সেন্টারে সংরক্ষিত হয়েছে। নির্দিষ্ট সময়ে পরীক্ষার হলে উপস্থিত থাকুন।
                        <Button
                          size="small"
                          onClick={() => setFormSubmitted(false)}
                          sx={{ mt: 1.5, display: 'block', fontWeight: 700 }}
                        >
                          নতুন ফরম পূরণ করুন &rarr;
                        </Button>
                      </Alert>
                    ) : (
                      <form onSubmit={handleFormSubmit}>
                        <Stack spacing={2.5}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary' }}>
                              শিক্ষার্থীর নাম (Student Name) *
                            </Typography>
                            <TextField
                              fullWidth
                              required
                              placeholder="আপনার পূর্ণ নাম লিখুন"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                            />
                          </Box>

                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary' }}>
                                ISP স্টুডেন্ট আইডি (Student ID)
                              </Typography>
                              <TextField
                                fullWidth
                                placeholder="যেমন: 20260001"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                helperText="নতুন হলে ফাঁকা রাখুন"
                              />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary' }}>
                                ব্যাচ নির্বাচন করুন (Batch) *
                              </Typography>
                              <TextField
                                select
                                fullWidth
                                required
                                value={selectedBatch}
                                onChange={(e) => setSelectedBatch(e.target.value)}
                                placeholder="ব্যাচ নির্বাচন করুন"
                              >
                                {BATCH_LIST.map((b) => (
                                  <MenuItem key={b} value={b}>
                                    {b}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                          </Grid>

                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary' }}>
                                বিষয় (Exam Subject) *
                              </Typography>
                              <TextField
                                fullWidth
                                required
                                placeholder="যেমন: Physics, Math, ICT, Biology"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.8, color: 'text.primary' }}>
                                শিফট (Shift)
                              </Typography>
                              <TextField
                                select
                                fullWidth
                                value={shift}
                                onChange={(e) => setShift(e.target.value)}
                              >
                                <MenuItem value="Morning (সকাল)">Morning (সকাল শিফট)</MenuItem>
                                <MenuItem value="Afternoon (বিকাল)">Afternoon (বিকাল শিফট)</MenuItem>
                                <MenuItem value="Special Friday (শুক্রবার)">Special Friday (শুক্রবার)</MenuItem>
                              </TextField>
                            </Grid>
                          </Grid>

                          <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<SendRoundedIcon />}
                            sx={{
                              height: 48,
                              fontSize: '16px',
                              fontWeight: 700,
                              bgcolor: '#1748D1',
                              mt: 1,
                              '&:hover': { bgcolor: '#092B91' },
                            }}
                          >
                            পরীক্ষার জন্য সাবমিট করুন (Submit Exam Form)
                          </Button>
                        </Stack>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Sidebar Info & Google Form integration */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={3}>
                  <Box
                    sx={{
                      p: 3.5,
                      borderRadius: '16px',
                      bgcolor: '#FFFFFF',
                      border: `1px solid ${ispColors.border.default}`,
                      boxShadow: '0 2px 8px rgba(16, 24, 40, 0.04)',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', mb: 1.5 }}>
                      গুরুত্বপূর্ণ নির্দেশনা (Important Notice)
                    </Typography>
                    <Stack spacing={1.5}>
                      {[
                        'পরীক্ষা শুরুর অন্তত ১৫ মিনিট আগে হলে উপস্থিত হতে হবে।',
                        'পরীক্ষার্থীর অবশ্যই ISP আইডি কার্ড সাথে থাকতে হবে।',
                        'OMR শিটে রোল ও কোড বলপয়েন্ট কলম দিয়ে যথাযথভাবে পূরণ করতে হবে।',
                        'পরীক্ষা চলাকালীন কোনো প্রকার ইলেকট্রনিক ডিভাইস বা মোবাইল নিষিদ্ধ।',
                      ].map((rule, rIdx) => (
                        <Box key={rIdx} sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                          <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#15965A', mt: 0.3 }} />
                          <Typography variant="body2" sx={{ color: ispColors.text.secondary, fontSize: '14px', lineHeight: 1.6 }}>
                            {rule}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Divider sx={{ my: 2.5 }} />

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setOpenRuleDialog(true)}
                      startIcon={<RuleRoundedIcon />}
                      sx={{
                        height: 42,
                        fontSize: '14px',
                        fontWeight: 700,
                        borderColor: '#1748D1',
                        color: '#1748D1',
                      }}
                    >
                      সম্পূর্ণ Rule Book পড়ুন &rarr;
                    </Button>
                  </Box>

                  {/* External Google Web App Box from the current site */}
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      bgcolor: '#FFF7D6',
                      border: '1px solid #FFD21F',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#061B57', mb: 0.8 }}>
                      Google Script Exam App
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '13.5px', mb: 2 }}>
                      পূর্বের গুগল সাইটের ডিরেক্ট ওয়েব অ্যাপ ব্যবহার করে ফরম পূরণ করতে চাইলে নিচের লিংকে ক্লিক করুন:
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      component="a"
                      href="https://script.google.com/macros/s/AKfycbx32R62CM52_kI1Q83JFvS_vZ9cxFNKvLuvCRRd9Agg1AJpdlgq7bMtqSU7Y-6DsSpX/exec"
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                      sx={{
                        bgcolor: '#061B57',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '13px',
                        '&:hover': { bgcolor: '#092B91' },
                      }}
                    >
                      Open Google Script Form
                    </Button>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          )}

          {/* TAB 1: Batch Marksheets Archive */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: { sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 0.5 }}>
                    ISP Exam Center Marksheets
                  </Typography>
                  <Typography variant="body2" sx={{ color: ispColors.text.secondary }}>
                    ব্যাচভিত্তিক অধ্যায় ও মডেল টেস্টের ফলাফল এবং মেরিট লিস্ট আর্কাইভ।
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  component={Link}
                  href="/login"
                  startIcon={<SchoolRoundedIcon />}
                  sx={{
                    height: 42,
                    fontSize: '14px',
                    fontWeight: 700,
                    bgcolor: '#1748D1',
                    '&:hover': { bgcolor: '#092B91' },
                  }}
                >
                  স্টুডেন্ট আইডি দিয়ে মার্কশিট দেখুন
                </Button>
              </Box>

              <Grid container spacing={3}>
                {MARKSHEETS_DATA.map((sheet, sIdx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sIdx}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '14px',
                        border: `1px solid ${ispColors.border.default}`,
                        boxShadow: '0 2px 8px rgba(16, 24, 40, 0.04)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(16, 24, 40, 0.08)',
                          borderColor: '#1748D1',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Chip
                            label={sheet.status}
                            size="small"
                            sx={{ bgcolor: '#ECFDF5', color: '#15965A', fontWeight: 700, fontSize: '11px' }}
                          />
                          <Typography variant="caption" sx={{ color: ispColors.text.muted, fontWeight: 600 }}>
                            {sheet.batch}
                          </Typography>
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57', fontSize: '17px', mb: 1 }}>
                          {sheet.name}
                        </Typography>

                        <Typography variant="body2" sx={{ color: ispColors.text.secondary, fontSize: '13.5px', mb: 2 }}>
                          {sheet.totalExams} &bull; মেরিট ও গ্রেডশীট
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Button
                          fullWidth
                          size="small"
                          component={Link}
                          href="/login"
                          endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
                          sx={{
                            fontWeight: 700,
                            color: '#1748D1',
                            justifyContent: 'space-between',
                            px: 1,
                          }}
                        >
                          মার্কশিট ওপেন করুন
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* TAB 2: Routine & Guidelines */}
          {activeTab === 2 && (
            <Card
              sx={{
                borderRadius: '16px',
                border: `1px solid ${ispColors.border.default}`,
                p: { xs: 3, md: 5 },
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mb: 2 }}>
                পরীক্ষা রুটিন ও এক্সাম সেন্টার আচরণবিধি (Rules &amp; Code of Conduct)
              </Typography>

              <Typography variant="body1" sx={{ color: ispColors.text.secondary, mb: 4, lineHeight: 1.75 }}>
                ISP (Indicator Student&apos;s Point) শিক্ষার্থীদের বোর্ড ও ভর্তি পরীক্ষার উপযোগী করে তোলার জন্য সম্পূর্ণ স্ট্যান্ডার্ড এক্সাম পরিবেশ বজায় রাখে।
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${ispColors.border.default}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#061B57', mb: 1.5 }}>
                      ১. পরীক্ষার সময়সূচি ও রিপোর্টিং
                    </Typography>
                    <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.7, fontSize: '14.5px' }}>
                      &bull; পরীক্ষা নির্ধারিত সময়ের ঠিক ১০ মিনিট পূর্বে প্রশ্নপত্র বিতরণ করা হয়।<br />
                      &bull; বিলম্বে আসা শিক্ষার্থীদের কোনো অতিরিক্ত সময় বরাদ্দ করা হবে না।<br />
                      &bull; অসুস্থতা বা যৌক্তিক কারণে অনুপস্থিত থাকলে পূর্বেই কর্তৃপক্ষকে জানাতে হবে।
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${ispColors.border.default}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#061B57', mb: 1.5 }}>
                      ২. OMR ও স্ক্রিপ্ট পূরণ সংক্রান্ত
                    </Typography>
                    <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.7, fontSize: '14.5px' }}>
                      &bull; শুধুমাত্র কালো কালির বলপয়েন্ট কলম ব্যবহার করতে হবে।<br />
                      &bull; ভুল রোল অথবা রেজিস্ট্রেশন কোড পূরণে ফলাফল স্থগিত হতে পারে।<br />
                      &bull; মডেল টেস্টের উত্তরপত্র ৩ কার্যদিবসের মধ্যে মূল্যায়ন করে পোর্টালে আপলোড করা হয়।
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${ispColors.border.default}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#061B57', mb: 1.5 }}>
                      ৩. নেগেটিভ মার্কিং (Admission &amp; HSC)
                    </Typography>
                    <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.7, fontSize: '14.5px' }}>
                      &bull; বিশ্ববিদ্যালয় ও মেডিকেল ভর্তি মডেল টেস্টে প্রতি ভুল উত্তরের জন্য ০.২৫ নম্বর কর্তন করা হয়।<br />
                      &bull; নেগেটিভ মার্কিং সহ বিস্তারিত অ্যানালিটিক্স পোর্টালে শিক্ষার্থীর প্রোফাইলে প্রদর্শিত হয়।
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${ispColors.border.default}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#061B57', mb: 1.5 }}>
                      ৪. রেজাল্ট ও অভিভাবক অবহিতকরণ
                    </Typography>
                    <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.7, fontSize: '14.5px' }}>
                      &bull; প্রতিটি মডেল টেস্টের নম্বর স্বয়ংক্রিয় এসএমএস-এর মাধ্যমে অভিভাবকের নম্বরে প্রেরণ করা হয়।<br />
                      &bull; মেধা তালিকায় শীর্ষ স্থান অর্জনকারীদের বিশেষ স্বীকৃতি ও পুরস্কার প্রদান করা হয়।
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          )}
        </Container>
      </Box>

      {/* 3. Rule Book Modal */}
      <Dialog
        open={openRuleDialog}
        onClose={() => setOpenRuleDialog(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px', p: 1 } },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <RuleRoundedIcon sx={{ color: '#1748D1' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
              Exam Centre Rule Book &bull; নিয়মাবলী
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenRuleDialog(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: '10px' }}>
              নতুন শিক্ষার্থীদের পরীক্ষার হলে প্রবেশের পূর্বে এই নির্দেশনাবলী মনোযোগ সহকারে পড়ার জন্য অনুরোধ করা হচ্ছে।
            </Alert>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#061B57', mb: 0.5 }}>
                ১. আইডি ও প্রবেশপত্র (Admit &amp; ID Card)
              </Typography>
              <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.7 }}>
                পরীক্ষার্থীকে অবশ্যই ISP প্রদত্ত ডিজিটাল শিক্ষার্থী আইডি সাথে রাখতে হবে। পরীক্ষার খাতার নির্ধারিত স্থানে স্পষ্ট অক্ষরে পূর্ণ নাম, রোল ও ব্যাচ উল্লেখ করতে হবে।
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#061B57', mb: 0.5 }}>
                ২. নিষিদ্ধ বস্তু (Prohibited Items)
              </Typography>
              <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.7 }}>
                মোবাইল ফোন, স্মার্টওয়াচ, প্রোগ্রাম্যাবল ক্যালকুলেটর কিংবা কোনো অননুমোদিত নোট পরীক্ষার হলে সম্পূর্ণ নিষিদ্ধ। নিয়ম ভঙ্গ করলে পরীক্ষা তাৎক্ষণিক বাতিল গণ্য হবে।
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#061B57', mb: 0.5 }}>
                ৩. মূল্যায়ন ও ফলাফল বিতরণ (Result Publication)
              </Typography>
              <Typography variant="body2" sx={{ color: ispColors.text.secondary, lineHeight: 1.7 }}>
                প্রতিটি মডেল টেস্টের খাতা বিষয়ভিত্তিক শিক্ষক দ্বারা পুঙ্খানুপুঙ্খভাবে দেখা হয়। পরীক্ষার পরবর্তী ক্লাসে ভুল উত্তরসমূহের সঠিক সমাধান ক্লাসে বিস্তারিত আলোচনা করা হয়।
              </Typography>
            </Box>

            <Box sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                component="a"
                href="https://docs.google.com/document/d/1M0jXRS0WYqbB02mRickjKR9n7aXyhfNeg3C9flhLdgQ/preview"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                sx={{
                  fontWeight: 700,
                  borderColor: '#1748D1',
                  color: '#1748D1',
                }}
              >
                গুগল ডক ভার্সন দেখুন (Open Official Google Doc Rulebook)
              </Button>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRuleDialog(false)} variant="contained" sx={{ bgcolor: '#061B57' }}>
            বুঝেছি (Close)
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Search ISP ID Dialog */}
      <Dialog
        open={openIdDialog}
        onClose={() => setOpenIdDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '16px', p: 1 } },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <SearchRoundedIcon sx={{ color: '#1748D1' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#061B57' }}>
              Search ISP ID &bull; শিক্ষার্থী আইডি অনুসন্ধান
            </Typography>
          </Box>
          <IconButton onClick={() => setOpenIdDialog(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ color: ispColors.text.secondary, mb: 2.5 }}>
            ভর্তির সময় ব্যবহৃত অভিভাবক অথবা শিক্ষার্থীর মোবাইল নম্বর প্রবেশ করিয়ে আপনার স্থায়ী ISP আইডি খুঁজুন:
          </Typography>

          <form onSubmit={handleIdSearch}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                required
                placeholder="মোবাইল নম্বর লিখুন (যেমন: 01841314381)"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchRoundedIcon />}
                sx={{
                  height: 44,
                  fontWeight: 700,
                  bgcolor: '#1748D1',
                  '&:hover': { bgcolor: '#092B91' },
                }}
              >
                আইডি অনুসন্ধান করুন
              </Button>
            </Stack>
          </form>

          {searchResult && (
            <Box
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: '12px',
                bgcolor: '#EEF4FF',
                border: '1px solid #1748D1',
              }}
            >
              <Typography variant="caption" sx={{ color: '#1748D1', fontWeight: 700, display: 'block' }}>
                শিক্ষার্থী রেকর্ড পাওয়া গেছে:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#061B57', mt: 0.5 }}>
                ISP ID: {searchResult.id}
              </Typography>
              <Typography variant="body2" sx={{ color: ispColors.text.secondary, mt: 0.5 }}>
                নাম: {studentName || searchResult.name} | ব্যাচ: {selectedBatch || searchResult.batch}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenIdDialog(false)}>
            বন্ধ করুন
          </Button>
        </DialogActions>
      </Dialog>
    </PublicLayout>
  );
}
