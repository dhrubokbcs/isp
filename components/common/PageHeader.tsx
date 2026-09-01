'use client';

import * as React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, action }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
          sx={{ mb: 1.5 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast || !item.href ? (
              <Typography key={index} variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '13px' }}>
                {item.label}
              </Typography>
            ) : (
              <MuiLink
                key={index}
                component={Link}
                href={item.href}
                underline="hover"
                sx={{ color: 'primary.main', fontWeight: 500, fontSize: '13px' }}
              >
                {item.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '26px', sm: '30px' } }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  );
}

