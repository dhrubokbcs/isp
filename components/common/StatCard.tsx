'use client';

import * as React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import { ispColors } from '@/theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}

export default function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '14px' }}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: ispColors.primary[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '32px', mb: 1 }}>
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {trend && (
            <Chip
              size="small"
              icon={
                trend.isPositive ? (
                  <TrendingUpRoundedIcon sx={{ fontSize: '14px !important', color: `${ispColors.semantic.success.main} !important` }} />
                ) : (
                  <TrendingDownRoundedIcon sx={{ fontSize: '14px !important', color: `${ispColors.semantic.error.main} !important` }} />
                )
              }
              label={trend.value}
              sx={{
                height: '24px',
                fontSize: '12px',
                fontWeight: 600,
                bgcolor: trend.isPositive ? ispColors.semantic.success.light : ispColors.semantic.error.light,
                color: trend.isPositive ? ispColors.semantic.success.dark : ispColors.semantic.error.dark,
              }}
            />
          )}
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '13px' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

