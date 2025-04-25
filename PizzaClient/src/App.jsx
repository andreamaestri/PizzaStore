import { useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AppProvider } from '@toolpad/core/AppProvider';
import { BasketProvider } from './context/BasketContext';
import { useThemeMode } from './context/ThemeModeContext';
import Dashboard from './Dashboard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import './styles/theme-variables.css';

// Main application component responsible for theme setup, context providers, and routing.
function ThemedApp() {
  const { mode } = useThemeMode();
  
  // Create the MUI theme instance based on the current mode.
  // Includes custom typography settings and font-face definitions.
  const theme = createTheme({
    palette: {
      mode,
    },
    typography: {
      fontFamily: ' Product Sans, Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
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
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Product Sans', 'Roboto Flex', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            font-weight: 600;
            letter-spacing: 0;
          }
        `,
      },
    },
  });
  // Memoize the navigation configuration for the Toolpad AppProvider.
  const navigationConfig = useMemo(() => [
    { segment: 'home', title: 'Home', icon: <DashboardIcon /> },
    { segment: 'pizzas', title: 'Pizzas', icon: <LocalPizzaIcon /> },
    { segment: 'toppings', title: 'Toppings', icon: <RestaurantIcon /> },
    { segment: 'orders', title: 'Orders', icon: <ReceiptIcon /> },
    {
      segment: 'management',
      title: 'Management',
      children: [
        { segment: 'customers', title: 'Customers', icon: <PeopleIcon /> },
        { segment: 'settings', title: 'Settings', icon: <SettingsIcon /> },
      ]
    },
  ], []);

  // Memoize the branding configuration for the Toolpad AppProvider.
const BRANDING = useMemo(() => ({
    title: 'Pizza Admin',
    logo: <LocalPizzaIcon color="primary" />,
    homeUrl: '/',
}), []);

  // Memoize the main Dashboard component instance.
  const memoizedDashboard = useMemo(() => <Dashboard />, []);

  // Memoize the Router setup, including AppProvider and Dashboard.
  const memoizedRouter = useMemo(() => (
    <BrowserRouter>
      <AppProvider navigation={navigationConfig} branding={BRANDING}>
        <CssBaseline />
        {memoizedDashboard}
      </AppProvider>
    </BrowserRouter>
  ), [navigationConfig, BRANDING, memoizedDashboard]);

  return (
    <ThemeProvider theme={theme}>
      <BasketProvider>
        {memoizedRouter}
      </BasketProvider>
    </ThemeProvider>
  );
}

export default ThemedApp;
