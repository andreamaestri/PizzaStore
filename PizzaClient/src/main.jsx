import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme, alpha } from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './index.css'
import Dashboard from './Dashboard.jsx'

// --- Material UI Theme Configuration (M3 Inspired) --- //
// Creates a custom theme instance using MUI's `createTheme`.
// This theme aims to follow Material Design 3 (M3) principles where possible.
// Create a theme instance with Material Design 3 principles
const theme = createTheme({
// Defines the color palette for the application.
// Includes primary, secondary, error, warning, info, success colors.
// Adds M3 specific tonal palette properties like 'container' and 'onContainer'
// for better color role definition and accessibility.
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
// Background colors for the main application surface and paper elements.
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
// M3 introduces surface color roles for different elevation levels or states.
// These are approximations; MUI v5 doesn't have full M3 surface roles built-in.
    surface: {
      main: '#fffbff',
      dim: '#ddd8d9',
      bright: '#fff8f8',
      containerLow: 'rgba(0, 0, 0, 0.05)',
      containerMedium: 'rgba(0, 0, 0, 0.08)',
      containerHigh: 'rgba(0, 0, 0, 0.11)',
    },
  },
// Configures typography settings, including default font family and specific styles
// for headings (using 'Product Sans' as a preference), buttons, etc.
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
// Defines the base border radius used throughout the application components.
  shape: {
    borderRadius: 8, // Base border radius (small)
  },
// --- Component Style Overrides --- //
// Customizes the default styles and props for various MUI components
// to align with the desired M3 look and feel or application-specific requirements.
  components: {
// Overrides for MuiButton:
// - `textTransform: 'none'` prevents uppercase text.
// - Adjusts padding.
// - Removes default elevation (`boxShadow: 'none'`) for contained buttons.
// - Defines styles for different emphasis levels (contained, containedSecondary as 'filled tonal', outlined, text).
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '10px 24px',
        },
        // High emphasis - Primary actions (Filled button)
        contained: {
          boxShadow: 'none', // MD3 reduces use of shadows
          fontWeight: 500,
          // Filled buttons are for primary, final, or unblocking actions
        },
        // Medium emphasis - Important but secondary actions (Filled tonal & Outlined)
        containedSecondary: {
          // This serves as "Filled tonal" in MD3
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          color: '#d32f2f',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: 'rgba(211, 47, 47, 0.2)',
            boxShadow: 'none',
          },
        },
        // Medium emphasis - Outlined button
        outlined: {
          borderWidth: 1,
          // Use for actions that need attention but aren't primary
        },
        // Low emphasis - Text button for optional/supplementary actions
        text: {
          // Use for lowest emphasis, alternative options
        },
      },
      defaultProps: {
        disableElevation: true, // MD3 generally avoids shadows on buttons
      },
    },
// Overrides for MuiFab (Floating Action Button):
// - Defines custom box-shadow for a more pronounced M3-style elevation.
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14)',
          '&:hover': {
            boxShadow: '0px 5px 8px -3px rgba(0,0,0,0.2), 0px 8px 16px 2px rgba(0,0,0,0.14)',
          },
        },
      },
    },
// Overrides for MuiPaper:
// - Removes default box shadow.
// - Sets a larger base border radius.
// - Defines custom M3-like shadows for specific elevation levels (elevation1, elevation2).
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 12,
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
// Overrides for MuiCard: Adds default padding.
    MuiCard: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
// Overrides for MuiTableHead: Sets background color and header cell styles.
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
// Overrides for MuiTableRow: Removes bottom border on last row, adds hover effect.
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
// Overrides for MuiTableCell: Adjusts border color and padding.
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
          padding: '16px',
        },
      },
    },
// Overrides for MuiChip: Sets border radius and outlined border color.
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
// Overrides for MuiTextField (specifically OutlinedInput): Adjusts border radius and border colors.
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
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
// Overrides for MuiListItem: Sets a larger border radius and defines selected state styles.
// NOTE: MuiListItemButton overrides below are likely more effective for M3 styling.
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
// Overrides for MuiListItemButton:
// - Sets a large border radius for a pill shape.
// - Defines hover styles.
// - Defines selected state styles using theme palette container/onContainer colors.
// - Styles the icon and text within the selected button.
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 28, // MD3 uses more rounded corners (pill shape)
          '&:hover': {
            backgroundColor: theme.palette.action.hover, // Standard hover
          },
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.container,
            color: theme.palette.primary.onContainer,
            '&:hover': {
              // Slightly darken or adjust the container color on hover when selected
              backgroundColor: alpha(theme.palette.primary.container, 0.9),
            },
            // Target Icon and Text within the selected Button
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.onContainer, // Use onContainer color for icon
            },
            '& .MuiListItemText-primary': {
              fontWeight: 500, // Make text slightly bolder when selected
            },
          },
        }),
      },
    },
// Overrides for MuiListItemIcon: Sets default color and minimum width.
    MuiListItemIcon: {
        styleOverrides: {
            root: ({ theme }) => ({
                // Default icon color (can be adjusted if needed)
                color: theme.palette.action.active,
                minWidth: 40, // Ensure consistent spacing
            }),
        },
    },
// Overrides for MuiListItemText: Sets default primary text color.
    MuiListItemText: {
        styleOverrides: {
            primary: ({ theme }) => ({
                // Default text color
                color: theme.palette.text.primary,
            }),
        },
    },
// Overrides for MuiAppBar: Removes default shadow, sets default color to 'default' (surface color).
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
// Overrides for MuiDrawer: Adjusts paper border and background color.
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: theme => theme.palette.background.paper,
        },
      },
    },
// Overrides for MuiDivider: Adjusts border color for subtlety.
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
// Overrides for MuiAvatar: Removes default shadow.
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // MD3 reduces use of shadows
        },
      },
    },
// Overrides for MuiIconButton: Ensures circular shape, adjusts padding,
// defines styles for different states (standard, contained, selected) using alpha transparency.
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '50%', // Ensure perfect circles for standard icon buttons
          padding: 8,
          // Support for both outlined and filled states
          '&.standard': {
            // Standard icon button (default)
            color: 'rgba(0, 0, 0, 0.54)', // Default icon color
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light hover effect
            },
          },
          '&.contained': {
            // Contained icon button (with background)
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
            },
          },
          '&.selected': {
            // Selected state (can apply to either standard or contained)
            color: theme => theme.palette.primary.main,
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.18),
            },
          },
          '&.selected.contained': {
            // Selected and contained
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.15),
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.25),
            },
          },
        },
        sizeMedium: {
          // Default medium size for better touch targets
          padding: 8,
        },
        sizeSmall: {
          // Smaller size with proper padding
          padding: 6,
        },
      },
    },
// Overrides for MuiChip (redefined, potentially overrides previous): Sets border radius, height,
// and styles for filled/outlined variants using theme container/onContainer colors.
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          height: 32, // MD3 chips are slightly taller
        }),
        filled: ({ theme }) => ({
          backgroundColor: theme.palette.primary.container,
          color: theme.palette.primary.onContainer,
          '&.MuiChip-colorPrimary': {
            backgroundColor: theme.palette.primary.container,
            color: theme.palette.primary.onContainer,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: theme.palette.secondary.container,
            color: theme.palette.secondary.onContainer,
          },
          // Add overrides for other colors if needed (error, warning, etc.)
        }),
        outlined: ({ theme }) => ({
           borderColor: theme.palette.outline, // Use theme outline color if defined, else fallback
           // Add specific color overrides if needed
        }),
      },
    },
  },
});

// --- Application Root Rendering --- //
// Gets the root DOM element.
createRoot(document.getElementById('root')).render(
// Renders the application using React 18's `createRoot` API.
// - `StrictMode`: Helps identify potential problems in the app during development.
// - `ThemeProvider`: Applies the custom `theme` to the entire component tree.
// - `CssBaseline`: Provides baseline CSS normalization (like normalize.css).
// - `Dashboard`: The main application component.
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS */}
      <Dashboard />
    </ThemeProvider>
  </StrictMode>,
)
