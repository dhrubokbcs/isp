import { createTheme } from '@mui/material/styles';
import { ispColors } from './colors';
import { typography } from './typography';
import { components } from './components';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: ispColors.primary[500],
      light: ispColors.primary[100],
      dark: ispColors.primary[700],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: ispColors.accent.yellow,
      contrastText: ispColors.text.primary,
    },
    success: {
      main: ispColors.semantic.success.main,
      light: ispColors.semantic.success.light,
      dark: ispColors.semantic.success.dark,
    },
    warning: {
      main: ispColors.semantic.warning.main,
      light: ispColors.semantic.warning.light,
      dark: ispColors.semantic.warning.dark,
    },
    error: {
      main: ispColors.semantic.error.main,
      light: ispColors.semantic.error.light,
      dark: ispColors.semantic.error.dark,
    },
    info: {
      main: ispColors.semantic.info.main,
      light: ispColors.semantic.info.light,
      dark: ispColors.semantic.info.dark,
    },
    text: {
      primary: ispColors.text.primary,
      secondary: ispColors.text.secondary,
      disabled: ispColors.text.muted,
    },
    background: {
      default: ispColors.background.default,
      paper: ispColors.background.paper,
    },
    divider: ispColors.border.default,
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  components,
});

export * from './colors';
export default theme;

