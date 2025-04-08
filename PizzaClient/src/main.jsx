import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './index.css'
import App from './App.jsx'

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // Pizza red
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#388e3c', // Pizza green (for olives and peppers)
      light: '#6abf69',
      dark: '#00600f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9f9f9', // Slightly off-white background
      paper: '#ffffff',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600, // Make headings a bit bolder
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
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
    borderRadius: 8, // Slightly more rounded corners for components
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Use normal case for buttons
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          // Subtle shadow as default
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(211, 47, 47, 0.08)', // Lighter primary for table headers
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
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(211, 47, 47, 0.12)',
            borderLeft: '4px solid #d32f2f',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.18)',
            },
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
      <App />
    </ThemeProvider>
  </StrictMode>,
)
