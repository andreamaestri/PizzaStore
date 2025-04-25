// filepath: c:\Users\andre\source\repos\PizzaStore\PizzaClient\src\App.jsx
import { useEffect } from 'react';
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
      fontFamily: 'Roboto Flex, Roboto, Helvetica, Arial, sans-serif',
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
  });

  return (
    <ThemeProvider theme={theme}>
      <BasketProvider>
        <BrowserRouter>
          <AppProvider
            navigation={[
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
            ]}
          >
            <CssBaseline />
            <Dashboard />
          </AppProvider>
        </BrowserRouter>
      </BasketProvider>
    </ThemeProvider>
  );
}

export default ThemedApp;
