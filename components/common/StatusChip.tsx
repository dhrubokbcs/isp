'use client';

import * as React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { ispColors } from '@/theme/colors';

export type CommonStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'COMPLETED'
  | 'PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'OVERDUE'
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EXCUSED'
  | 'DRAFT'
  | 'PUBLISHED';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: CommonStatus | string;
}

export default function StatusChip({ status, sx, ...props }: StatusChipProps) {
  const normalized = status.toUpperCase();

  let bgcolor = ispColors.primary[50];
  let color = ispColors.primary[700];

  switch (normalized) {
    case 'ACTIVE':
    case 'PAID':
    case 'COMPLETED':
    case 'PRESENT':
    case 'PUBLISHED':
      bgcolor = ispColors.semantic.success.light;
      color = ispColors.semantic.success.dark;
      break;

    case 'PENDING':
    case 'PARTIAL':
    case 'LATE':
    case 'UPCOMING':
      bgcolor = ispColors.semantic.warning.light;
      color = ispColors.semantic.warning.dark;
      break;

    case 'INACTIVE':
    case 'ABSENT':
    case 'OVERDUE':
    case 'CANCELLED':
    case 'FAILED':
      bgcolor = ispColors.semantic.error.light;
      color = ispColors.semantic.error.dark;
      break;

    case 'EXCUSED':
    case 'DRAFT':
    case 'INFO':
      bgcolor = ispColors.semantic.info.light;
      color = ispColors.semantic.info.dark;
      break;

    default:
      bgcolor = ispColors.primary[50];
      color = ispColors.primary[700];
      break;
  }

  return (
    <Chip
      size="small"
      label={status}
      sx={{
        height: '26px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: '6px',
        bgcolor,
        color,
        ...sx,
      }}
      {...props}
    />
  );
}

