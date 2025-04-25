import { ThemeProvider, experimental_extendTheme } from '@mui/material';
import { useThemeMode } from './context/ThemeModeContext';

// ThemeWrapper component to access the theme mode context
export function ThemeWrapper({ children }) {
  const { mode } = useThemeMode();
  
  // Create a theme instance with CSS variables for light/dark mode support
  const theme = experimental_extendTheme({
    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#9c27b0',
          },
          background: {
            default: '#f5f5f5',
            paper: 'rgba(255,255,255,0.8)',
          },
          card: {
            background: 'rgba(255,255,255,0.7)',
            border: 'rgba(66,99,235,0.10)',
            shadow: 'rgba(66,99,235,0.10)',
            hoverShadow: 'rgba(66,99,235,0.18)',
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: '#90caf9',
          },
          secondary: {
            main: '#ce93d8',
          },
          background: {
            default: '#121212',
            paper: 'rgba(30,30,30,0.6)',
          },
          card: {
            background: 'rgba(30,40,70,0.1)',
            border: 'rgba(255,255,255,0.15)',
            shadow: 'rgba(0,0,0,0.15)',
            hoverShadow: 'rgba(0,0,0,0.25)',
          },
        },
      },
    },
    // This ensures the theme uses the current mode (light or dark)
    cssVarPrefix: 'pizza-app',
    colorSchemeMode: mode,
    typography: {
      fontFamily: 'Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
      h1: {
        fontFamily: 'Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 600,
      },
      h2: {
        fontFamily: 'Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 600,
      },
      h3: {
        fontFamily: 'Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: 'Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 600,
      },
      h5: {
        fontFamily: 'Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily: 'Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 600,
      },
      button: {
        fontFamily: 'Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 500,
      },
      body1: {
        fontFamily: 'Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
      },
      body2: {
        fontFamily: 'Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Product Sans';
            font-style: normal;
            font-weight: 400 900;
            font-display: swap;
            src: url('https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2') format('woff2');
          }
          body {
            transition: background-color 0.3s, color 0.3s;
            scrollbar-color: ${mode === 'dark' ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5'};
          }
          body::-webkit-scrollbar, body *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          body::-webkit-scrollbar-thumb, body *::-webkit-scrollbar-thumb {
            border-radius: 8px;
            background-color: ${mode === 'dark' ? '#6b6b6b' : '#959595'};
          }
          body::-webkit-scrollbar-track, body *::-webkit-scrollbar-track {
            border-radius: 8px;
            background-color: ${mode === 'dark' ? '#2b2b2b' : '#f5f5f5'};
          }
        `,
      },
      // Enhanced card appearance for dark mode
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: `var(--pizza-app-palette-card-background)`,
            borderColor: `var(--pizza-app-palette-card-border)`,
          },
        }
      },
      // Enhanced paper appearance for dark mode
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: mode === 'dark' ? 'none' : undefined,
          },
        }
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}
