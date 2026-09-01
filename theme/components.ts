import { Components, Theme } from '@mui/material/styles';
import { ispColors } from './colors';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: ispColors.background.default,
        color: ispColors.text.primary,
        fontSize: '16px',
        lineHeight: 1.6,
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '15px',
        padding: '9px 18px',
        minHeight: '44px',
        transition: 'all 0.15s ease-in-out',
      },
      sizeSmall: {
        minHeight: '36px',
        padding: '6px 14px',
        fontSize: '14px',
      },
      sizeLarge: {
        minHeight: '48px',
        padding: '12px 24px',
        fontSize: '16px',
      },
      contained: {
        backgroundColor: ispColors.primary[500],
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: ispColors.primary[600],
        },
        '&:active': {
          backgroundColor: ispColors.primary[700],
        },
      },
      outlined: {
        borderColor: ispColors.border.default,
        color: ispColors.text.primary,
        '&:hover': {
          borderColor: ispColors.primary[300],
          backgroundColor: ispColors.background.softBlue,
        },
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: '12px',
        border: `1px solid ${ispColors.border.default}`,
        backgroundColor: ispColors.background.paper,
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '24px',
        '&:last-child': {
          paddingBottom: '24px',
        },
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundColor: ispColors.background.paper,
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: '12px',
      },
      outlined: {
        border: `1px solid ${ispColors.border.default}`,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        fontSize: '16px',
        backgroundColor: '#FFFFFF',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: ispColors.border.default,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: ispColors.primary[300],
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: ispColors.primary[500],
          borderWidth: '1.5px',
        },
      },
      input: {
        padding: '13.5px 16px',
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: '15px',
        color: ispColors.text.secondary,
        '&.Mui-focused': {
          color: ispColors.primary[700],
        },
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: '13px',
        marginTop: '6px',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        height: '28px',
        fontSize: '13px',
        fontWeight: 500,
        borderRadius: '6px',
      },
      label: {
        paddingLeft: '10px',
        paddingRight: '10px',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px',
        border: `1px solid ${ispColors.border.default}`,
        boxShadow: '0 20px 50px rgba(16, 24, 40, 0.16)',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: ispColors.border.default,
        fontSize: '15px',
        padding: '16px 20px',
      },
      head: {
        fontWeight: 600,
        color: ispColors.text.secondary,
        backgroundColor: ispColors.background.default,
        height: '48px',
        padding: '12px 20px',
      },
    },
  },
};

