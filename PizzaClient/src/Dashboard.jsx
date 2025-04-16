import { useState } from "react";
import {
  useTheme,
  Box,
  Typography,
  Avatar,
  useMediaQuery,
  Badge,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  LocalPizza as PizzaIcon,
  Receipt as OrdersIcon,
  People as CustomersIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Restaurant as ToppingIcon,
} from "@mui/icons-material";
import Pizza from "./Pizza"; // Assuming Pizza component exists
import ToppingManager from "./components/toppings/ToppingManager"; // Import ToppingManager component
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

// Custom navigation action items for the toolbar
function CustomToolbarActions() {
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleNotificationsOpen = (event) => setNotificationsAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);
  
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
        <IconButton
          onClick={() => {
            setDarkMode(!darkMode);
            console.warn("Dark mode toggle requires ThemeProvider context update.");
          }}
          color="inherit"
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleNotificationsOpen}>
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleNotificationsClose}>New order received</MenuItem>
        <MenuItem onClick={handleNotificationsClose}>System update completed</MenuItem>
        <MenuItem onClick={handleNotificationsClose}>2 new customers registered</MenuItem>
      </Menu>
    </Box>
  );
}

// Custom user menu component for the toolbar
function UserMenu() {
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  
  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);
  
  return (
    <>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleProfileOpen}
          size="small"
          sx={{ ml: 2 }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>A</Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleProfileClose}>Profile</MenuItem>
        <MenuItem onClick={handleProfileClose}>My account</MenuItem>
        <MenuItem onClick={handleProfileClose}>Logout</MenuItem>
      </Menu>
    </>
  );
}

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedPath, setSelectedPath] = useState('/pizzas');

  // Get the component based on the selected path
  const getContentComponent = (path) => {
    switch (path) {
      case '/':
        return (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5">Dashboard Overview</Typography>
          </Box>
        );
      case '/pizzas':
        return <Pizza />;
      case '/toppings':
        return <ToppingManager />;
      case '/orders':
        return (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5">Orders Coming Soon</Typography>
          </Box>
        );
      case '/customers':
        return (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5">Customers Coming Soon</Typography>
          </Box>
        );
      case '/settings':
        return (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5">Settings Coming Soon</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5">Content Coming Soon</Typography>
          </Box>
        );
    }
  };

  // Handle navigation changes from the Toolpad DashboardLayout
  const handleNavigationChange = (path) => {
    setSelectedPath(path);
  };

  return (
    <DashboardLayout
      slotProps={{
        header: {
          title: "Pizza Admin",
          icon: <PizzaIcon />,
          actions: <CustomToolbarActions />,
          userMenu: <UserMenu />
        },
        drawer: {
          width: 240, 
          defaultExpanded: !isMobile
        },
        footer: {
          children: <Typography variant="caption" color="text.secondary">Pizza Admin v1.0.0</Typography>
        }}
      }
      onNavigationChange={handleNavigationChange}
    >
      <PageContainer 
        title={selectedPath === '/' ? 'Dashboard' : 
               selectedPath === '/pizzas' ? 'Pizzas' : 
               selectedPath === '/toppings' ? 'Toppings' : 
               selectedPath === '/orders' ? 'Orders' : 
               selectedPath === '/customers' ? 'Customers' : 
               selectedPath === '/settings' ? 'Settings' : 'Content'} 
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: selectedPath.slice(1).charAt(0).toUpperCase() + selectedPath.slice(2) },
        ]}
      >
        {getContentComponent(selectedPath)}
      </PageContainer>
    </DashboardLayout>
  );
}

export default Dashboard;
