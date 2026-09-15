'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const STORAGE_KEY = 'bfl-theme-mode';

const palettes = {
  light: {
    mode: 'light',
    primary: { main: '#1E1450' },
    secondary: { main: '#5154B6' },
    success: { main: '#198754' },
    error: { main: '#dc3545' },
    background: { default: '#f5f6fa', paper: '#ffffff' },
    text: { primary: '#111111', secondary: '#667085' },
  },
  dark: {
    mode: 'dark',
    primary: { main: '#8b8ff0' },
    secondary: { main: '#7376d6' },
    success: { main: '#2fbf78' },
    error: { main: '#ef5350' },
    background: { default: '#14161a', paper: '#1c1f26' },
    text: { primary: '#e8e9ee', secondary: '#a4a8b3' },
  },
};

function buildTheme(mode) {
  return createTheme({
    palette: palettes[mode],

    typography: {
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    shape: {
      borderRadius: 8,
    },

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 7,
            minHeight: 40,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },

      MuiFormControl: {
        defaultProps: {
          size: 'small',
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 7,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
    },
  });
}

const ThemeModeContext = createContext({
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export default function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () =>
        setMode((previous) => (previous === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
