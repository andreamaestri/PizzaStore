// filepath: c:\Users\andre\source\repos\PizzaStore\PizzaClient\src\App.jsx
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

// Theme configuration
function ThemedApp() {
  const { mode } = useThemeMode();
  
  // Apply data-theme attribute to html element when mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);
  
  // Create a theme instance
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
  // Memoize the navigation configuration to prevent unnecessary recreations
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

  // Add branding object for Pizza Admin
const BRANDING = useMemo(() => ({
    title: 'Pizza Admin',
    logo: <LocalPizzaIcon color="primary" />,
    homeUrl: '/',
}), []);

  // Memoize the Dashboard component to prevent unnecessary re-renders
  const memoizedDashboard = useMemo(() => <Dashboard />, []);

  // Memoize the BrowserRouter and its children to prevent unnecessary re-renders
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
