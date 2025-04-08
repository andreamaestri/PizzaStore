import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './index.css'
import Dashboard from './Dashboard.jsx'

// Create a theme instance with Material Design 3 principles
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#ffffff',
      // MD3 tonal palette additions
      container: '#ffdad6', // Light container color
      onContainer: '#410002', // On container text color
    },
    secondary: {
      main: '#388e3c',
      light: '#6abf69',
      dark: '#00600f',
      contrastText: '#ffffff',
      // MD3 tonal palette additions
      container: '#b6f2af', // Light container color
      onContainer: '#002105', // On container text color
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
    error: {
      main: '#ba1a1a',
      light: '#cf4545',
      dark: '#930012',
      contrastText: '#ffffff',
      container: '#ffdad6',
      onContainer: '#410002',
    },
    warning: {
      main: '#e58b00',
      light: '#ffb951',
      dark: '#a85f00',
      contrastText: '#ffffff',
      container: '#ffddb9',
      onContainer: '#2a1800',
    },
    info: {
      main: '#0061a4',
      light: '#4585c5',
      dark: '#003b6c',
      contrastText: '#ffffff',
      container: '#d1e4ff',
      onContainer: '#001d36',
    },
    success: {
      main: '#006e2e',
      light: '#3a9a58',
      dark: '#004618',
      contrastText: '#ffffff',
      container: '#98f7b1',
      onContainer: '#00210a',
    },
    // MD3 surface tones
    surface: {
      main: '#fffbff',
      dim: '#ddd8d9',
      bright: '#fff8f8',
      containerLow: 'rgba(0, 0, 0, 0.05)',
      containerMedium: 'rgba(0, 0, 0, 0.08)',
      containerHigh: 'rgba(0, 0, 0, 0.11)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Product Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Product Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Product Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Product Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Product Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Product Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.9rem',
    },
  },
  shape: {
    borderRadius: 16, // MD3 uses more rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20, // MD3 buttons are more rounded
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none', // MD3 reduces use of shadows
        },
        outlined: {
          borderWidth: 1,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 24, // More rounded for MD3
        },
        outlined: {
          borderColor: 'rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)', // MD3 shadow
        },
        elevation2: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15), 0px 1px 2px rgba(0, 0, 0, 0.3)', // MD3 shadow
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: 8,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(211, 47, 47, 0.04)',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: 'rgba(0, 0, 0, 0.87)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
          padding: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlined: {
          borderColor: 'rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.24)',
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 28, // MD3 uses more rounded corners for list items
          '&.Mui-selected': {
            backgroundColor: 'rgba(211, 47, 47, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.12)',
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 28, // MD3 uses more rounded corners
          '&.Mui-selected': {
            backgroundColor: theme => theme.palette.primary.container || 'rgba(211, 47, 47, 0.08)',
            color: theme => theme.palette.primary.onContainer || theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme => theme.palette.primary.container || 'rgba(211, 47, 47, 0.12)',
              opacity: 0.9,
            },
            '& .MuiListItemIcon-root': {
              color: theme => theme.palette.primary.main,
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
      defaultProps: {
        color: 'default', // MD3 often uses surface colors for app bars
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: theme => theme.palette.background.paper,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // MD3 reduces use of shadows
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '50%', // Ensure perfect circles for icon buttons
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 32, // MD3 chips are slightly taller
        },
        filled: {
          backgroundColor: theme => theme.palette.primary.container,
          color: theme => theme.palette.primary.onContainer,
          '&.MuiChip-colorPrimary': {
            backgroundColor: theme => theme.palette.primary.container,
            color: theme => theme.palette.primary.onContainer,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: theme => theme.palette.secondary.container,
            color: theme => theme.palette.secondary.onContainer,
          },
        },
      },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS */}
      <Dashboard />
    </ThemeProvider>
  </StrictMode>,
)
