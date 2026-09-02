'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Divider,
  useScrollTrigger,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import { ispColors } from '@/theme/colors';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Programs', href: '/#programs' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Exam Center', href: '/exam-center' },
  { label: 'Why ISP', href: '/#why-isp' },
  { label: 'Contact', href: '/#contact' },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <>
      {/* 1. Top Utility Notification & Contact Bar */}
      <Box
        sx={{
          bgcolor: ispColors.primary[900],
          color: '#FFFFFF',
          py: 0.9,
          fontSize: '13px',
          borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            {/* Admissions Banner */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CampaignRoundedIcon sx={{ fontSize: 16, color: ispColors.accent.yellow }} />
              <Typography variant="caption" sx={{ color: '#E0E7FF', fontWeight: 500, fontSize: '13px' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Admissions Open:</span> SSC 2026 &amp; HSC 2028 Batches &bull; Morning &amp; Afternoon Shifts
              </Typography>
            </Box>

            {/* Quick Contact & Staff Console Link */}
            <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5, color: '#E0E7FF' }}>
                <LocationOnRoundedIcon sx={{ fontSize: 15, color: ispColors.primary[300] }} />
                <Typography variant="caption" sx={{ fontSize: '13px' }}>
                  Bahaddarhat, Karim Tower, Chattogram
                </Typography>
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, color: '#E0E7FF' }}>
                <PhoneRoundedIcon sx={{ fontSize: 15, color: ispColors.primary[300] }} />
                <Typography
                  component="a"
                  href="tel:01841314381"
                  variant="caption"
                  sx={{ fontSize: '13px', color: 'inherit', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
                >
                  01841-314381 / 01760-184934
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.15)', height: 14, my: 'auto', display: { xs: 'none', sm: 'block' } }} />

              <Box
                component={Link}
                href="/console/login"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  color: ispColors.primary[200],
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 15 }} />
                Staff Console
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. Main Sticky Navigation Bar */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: '#FFFFFF',
          borderBottom: `1px solid ${ispColors.border.default}`,
          boxShadow: trigger ? '0 4px 20px rgba(16, 24, 40, 0.08)' : 'none',
          transition: 'box-shadow 0.25s ease-in-out',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 72,
            }}
          >
            {/* Brand Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#061B57', // ISP Navy
                  color: ispColors.accent.yellow, // Yellow ISP
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  fontSize: '22px',
                  letterSpacing: '-1px',
                  transform: 'skewX(-4deg)',
                  boxShadow: `0 3px 12px rgba(6, 27, 87, 0.25)`,
                }}
              >
                ISP
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '15px', sm: '17px' },
                    color: '#061B57',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Indicator Student&apos;s Point
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: ispColors.text.muted,
                    fontSize: '11.5px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  Bahaddarhat &bull; Chattogram
                </Typography>
              </Box>
            </Link>

            {/* Desktop Navigation Links */}
            <Stack
              direction="row"
              spacing={2.8}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
              }}
            >
              {NAV_LINKS.map((link) => (
                <Typography
                  key={link.label}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: ispColors.text.secondary,
                    fontSize: '15px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    py: 1,
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: ispColors.primary[600],
                    },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>

            {/* Desktop Action Buttons */}
            <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
              <Button
                variant="outlined"
                component={Link}
                href="/login"
                startIcon={<SchoolRoundedIcon />}
                sx={{
                  height: 42,
                  px: 2,
                  fontSize: '14px',
                  fontWeight: 600,
                  borderColor: ispColors.border.default,
                  color: ispColors.primary[700],
                  bgcolor: ispColors.primary[50],
                  '&:hover': {
                    borderColor: ispColors.primary[300],
                    bgcolor: ispColors.primary[100],
                  },
                }}
              >
                Student Portal
              </Button>

              <Button
                variant="contained"
                component="a"
                href="tel:01841314381"
                startIcon={<PhoneRoundedIcon />}
                sx={{
                  height: 42,
                  px: 2.2,
                  fontSize: '14px',
                  fontWeight: 700,
                  bgcolor: '#FFD21F',
                  color: '#061B57',
                  boxShadow: '0 3px 10px rgba(255, 210, 31, 0.35)',
                  '&:hover': {
                    bgcolor: '#FFE04D',
                  },
                }}
              >
                01841-314381
              </Button>
            </Stack>

            {/* Mobile Hamburger Button */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: ispColors.text.primary,
                border: `1px solid ${ispColors.border.default}`,
                borderRadius: '8px',
                p: 1,
              }}
              aria-label="open navigation menu"
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* 3. Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              p: 2.5,
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: '#061B57',
                color: '#FFD21F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '17px',
                fontStyle: 'italic',
              }}
            >
              ISP
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#061B57' }}>
              ISP Chattogram
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle} size="small" sx={{ border: `1px solid ${ispColors.border.default}` }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Navigation Item Links */}
        <List sx={{ py: 0, flexGrow: 1 }}>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={link.href}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: '8px',
                  py: 1.2,
                  px: 1.5,
                  '&:hover': { bgcolor: ispColors.primary[50], color: ispColors.primary[700] },
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: ispColors.text.primary }}>
                      {link.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Drawer CTAs */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            component="a"
            href="tel:01841314381"
            startIcon={<PhoneRoundedIcon />}
            sx={{
              height: 44,
              fontSize: '15px',
              fontWeight: 800,
              bgcolor: '#FFD21F',
              color: '#061B57',
              '&:hover': { bgcolor: '#FFE04D' },
            }}
          >
            Call: 01841-314381
          </Button>

          <Button
            fullWidth
            variant="outlined"
            component={Link}
            href="/login"
            startIcon={<SchoolRoundedIcon />}
            onClick={handleDrawerToggle}
            sx={{
              height: 44,
              fontSize: '14px',
              fontWeight: 600,
              bgcolor: ispColors.primary[50],
              borderColor: ispColors.primary[200],
              color: ispColors.primary[700],
            }}
          >
            Student Portal
          </Button>

          <Button
            fullWidth
            component={Link}
            href="/console/login"
            startIcon={<AdminPanelSettingsRoundedIcon />}
            onClick={handleDrawerToggle}
            sx={{
              height: 40,
              fontSize: '13px',
              color: ispColors.text.secondary,
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            Staff Console
          </Button>
        </Stack>

        {/* Quick Contact Info */}
        <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '8px', border: `1px solid ${ispColors.border.default}` }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
            Branch Address (Bahaddarhat)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '13px', color: ispColors.text.primary, lineHeight: 1.5 }}>
            Behind Kashbon Restaurant, Karim Tower (4th Floor), Chattogram
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
