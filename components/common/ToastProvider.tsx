'use client';

import * as React from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export interface ToastContextType {
  showToast: (message: string, severity?: AlertColor, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState<AlertColor>('info');
  const [duration, setDuration] = React.useState(3500);

  const showToast = React.useCallback(
    (msg: string, sev: AlertColor = 'info', dur: number = 3500) => {
      setMessage(msg);
      setSeverity(sev);
      setDuration(dur);
      setOpen(true);
    },
    []
  );

  const success = React.useCallback(
    (msg: string, dur?: number) => showToast(msg, 'success', dur),
    [showToast]
  );

  const error = React.useCallback(
    (msg: string, dur?: number) => showToast(msg, 'error', dur || 4500),
    [showToast]
  );

  const info = React.useCallback(
    (msg: string, dur?: number) => showToast(msg, 'info', dur),
    [showToast]
  );

  const warning = React.useCallback(
    (msg: string, dur?: number) => showToast(msg, 'warning', dur || 4000),
    [showToast]
  );

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        slots={{ transition: Slide }}
        slotProps={{
          transition: { direction: 'left' } as any,
        }}
        sx={{
          top: { xs: 70, sm: 80 },
          right: { xs: 16, sm: 24 },
          zIndex: 2000,
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          iconMapping={{
            success: <CheckCircleRoundedIcon fontSize="inherit" />,
            error: <ErrorOutlineRoundedIcon fontSize="inherit" />,
            info: <InfoOutlinedIcon fontSize="inherit" />,
            warning: <WarningAmberRoundedIcon fontSize="inherit" />,
          }}
          action={
            <IconButton
              size="small"
              aria-label="close notification"
              color="inherit"
              onClick={handleClose}
              sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            minWidth: 280,
            maxWidth: 460,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(16, 24, 40, 0.16)',
            fontSize: '14px',
            fontWeight: 600,
            alignItems: 'center',
            py: 1,
            px: 2,
            '& .MuiAlert-message': {
              lineHeight: 1.5,
              wordBreak: 'break-word',
            },
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
