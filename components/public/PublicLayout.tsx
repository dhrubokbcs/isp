'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import publicTheme from '@/theme/publicTheme';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <ThemeProvider theme={publicTheme}>
      <Box
        className="public-frontend"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <PublicHeader />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
        <PublicFooter />
      </Box>
    </ThemeProvider>
  );
}
