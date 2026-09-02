import { createTheme } from '@mui/material/styles';
import { theme } from './index';

export const publicTheme = createTheme({
  ...theme,
  typography: {
    ...theme.typography,
    fontFamily: '"Kalpurush", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      ...theme.typography.h1,
      fontFamily: '"Bensen Handwriting", "Kalpurush", cursive, sans-serif',
    },
    h2: {
      ...theme.typography.h2,
      fontFamily: '"Bensen Handwriting", "Kalpurush", cursive, sans-serif',
    },
    h3: {
      ...theme.typography.h3,
      fontFamily: '"Bensen Handwriting", "Kalpurush", cursive, sans-serif',
    },
    h4: {
      ...theme.typography.h4,
      fontFamily: '"Bensen Handwriting", "Kalpurush", cursive, sans-serif',
    },
    h5: {
      ...theme.typography.h5,
      fontFamily: '"Bensen Handwriting", "Kalpurush", cursive, sans-serif',
    },
    h6: {
      ...theme.typography.h6,
      fontFamily: '"Bensen Handwriting", "Kalpurush", cursive, sans-serif',
    },
    body1: {
      ...theme.typography.body1,
      fontFamily: '"Kalpurush", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    body2: {
      ...theme.typography.body2,
      fontFamily: '"Kalpurush", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    button: {
      ...theme.typography.button,
      fontFamily: '"Kalpurush", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    caption: {
      ...theme.typography.caption,
      fontFamily: '"Kalpurush", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    subtitle1: {
      ...theme.typography.subtitle1,
      fontFamily: '"Kalpurush", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    subtitle2: {
      ...theme.typography.subtitle2,
      fontFamily: '"Kalpurush", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },
});

export default publicTheme;
