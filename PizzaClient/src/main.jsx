import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';
import Dashboard from './Dashboard.jsx';
import { AppProvider } from '@toolpad/core/AppProvider';



// --- MUI Custom Theme for Typography --- //
const theme = createTheme({
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

// --- Application Root Rendering --- //
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  </StrictMode>
);