import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Paper,
  IconButton,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  ListItemButton, // Import ListItemButton
} from "@mui/material";
import {
  LocalPizza as PizzaIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Receipt as OrdersIcon,
  People as CustomersIcon,
  Settings as SettingsIcon,
  Restaurant as ToppingIcon,
} from "@mui/icons-material";
import "./App.css";
import Pizza from "./Pizza";
import ToppingManager from "./components/toppings/ToppingManager";

// TODO: Consider defining drawerWidth within the theme for consistency.
const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
// Tracks the currently selected navigation item index for highlighting and content rendering.  const [selectedIndex, setSelectedIndex] = useState(0); // State to track selected item

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  {/* Handles clicks on navigation items, updating the selected index and closing the mobile drawer */}  const handleListItemClick = (index) => {
    setSelectedIndex(index);
    // Optionally close mobile drawer on selection
    if (isMobile) {
      setMobileOpen(false);
    }
    {/* Placeholder for future routing logic. Consider using React Router or a similar library */}
    // Add navigation logic here based on index
  };
  // Define navigation items
  {/* Defines the primary navigation items displayed in the drawer */}
  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, index: 0 },
    { text: "Pizza Menu", icon: <PizzaIcon />, index: 1 },
    { text: "Topping Manager", icon: <ToppingIcon />, index: 2 },
    { text: "Orders", icon: <OrdersIcon />, index: 3 },
    { text: "Customers", icon: <CustomersIcon />, index: 4 },
  ];

  const settingsItem = { text: "Settings", icon: <SettingsIcon />, index: 5 };
  // M3 Inspired Styling for selected ListItemButton
  {/* 
    Defines custom styles for the selected ListItemButton, aiming for an M3-inspired look.
    NOTE: This relies on specific theme palette properties (secondary.dark/light/contrastText).
    Ensure these are defined in your theme or adjust accordingly.
    Consider moving these styles into the theme's component overrides for better centralization (MuiListItemButton).
  */}
  const selectedItemStyles = {
    // Use a container color - approximate with secondary or primary light/alpha
    // Ideally, define theme.palette.secondary.container or theme.palette.primary.container
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.secondary.dark // Example dark mode color
        : theme.palette.secondary.light, // Example light mode color (adjust as needed)
    // M3 uses significantly rounded corners for the selection indicator
     // e.g., 4 * 5 = 20px
    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
      // Ensure icon and text color contrast well with the background
      color:
        theme.palette.secondary.contrastText ||
        theme.palette.getContrastText(theme.palette.secondary.light),
      fontWeight: 500, // Keep text slightly bolder when selected
    },
    // Hover effect slightly different when selected
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.secondary.dark // Keep same color or slightly darker/lighter
          : theme.palette.secondary.light,
      opacity: 0.9, // Slight visual feedback on hover
    },
  };

// Defines the content structure of the navigation drawer.
  const drawer = (
    <>
      {/* Drawer Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          pt: 3,
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            // Use theme colors if possible
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            mb: 1.5,
          }}
        >
          <PizzaIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Typography variant="h6" noWrap component="div" fontWeight="600">
          Pizza Admin
        </Typography>
      </Box>
      {/* Use a subtle divider */}
      <Divider sx={{ borderColor: "divider", mx: 2, my: 1 }} />

      {/* Main Navigation List */}
      <List sx={{ px: 2 }}>
        {" "}
        {/* Add horizontal padding to the list */}
// Maps over navItems to render the main navigation links.
        {navItems.map((item) => (
          <ListItem key={item.index} disablePadding sx={{ mb: 1 }}>
            {" "}
            {/* Add margin bottom */}
            <ListItemButton
              selected={selectedIndex === item.index}
              onClick={() => handleListItemClick(item.index)}
              // Apply M3 styles when selected
// Conditionally applies selectedItemStyles if the item is selected,
// otherwise applies default styles including hover effects and border radius.
              sx={
                selectedIndex === item.index
                  ? selectedItemStyles
                  : {
                      borderRadius: theme.shape.borderRadius * 5, // Apply consistent border radius on hover too
                      "&:hover": {
                        // Subtle hover for non-selected items
                        backgroundColor: theme.palette.action.hover,
                      },
                    }
              }
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {" "}
                {/* Adjust icon spacing */}
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: selectedIndex === item.index ? 500 : 400,
                }} // Adjust weight
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Divider before settings */}
      <Divider sx={{ borderColor: "divider", mx: 2, my: 1 }} />

      {/* Settings List (pushes to bottom) */}
// Renders the 'Settings' item, pushed to the bottom using `mt: 'auto'`.
      <List sx={{ px: 2, mt: "auto" }}>
        {" "}
        {/* mt: 'auto' pushes this list down */}
        <ListItem key={settingsItem.index} disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            selected={selectedIndex === settingsItem.index}
            onClick={() => handleListItemClick(settingsItem.index)}
            sx={
              selectedIndex === settingsItem.index
                ? selectedItemStyles
                : {
                    borderRadius: theme.shape.borderRadius * 5,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }
            }
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {settingsItem.icon}
            </ListItemIcon>
            <ListItemText
              primary={settingsItem.text}
              primaryTypographyProps={{
                fontWeight: selectedIndex === settingsItem.index ? 500 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default" }}>
      {" "}
      {/* Ensure main background is set */}
      {/* Navigation Drawer */}
// Main navigation container holding both mobile and desktop drawers.
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
// Temporary drawer for mobile viewports, controlled by `mobileOpen` state.
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better open performance on mobile.
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              // M3 Drawers often don't have a border, relying on elevation/scrim
              borderRight: "none",
              // Use surface color
              backgroundColor: "background.paper",
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
// Permanent drawer for larger viewports (sm and up).
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              // M3 Drawers often don't have a border
              borderRight: "none",
              // Use surface color
              backgroundColor: "background.paper",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main Content Area */}
// Main content area that displays the component corresponding to the selected navigation item.
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3, // Standard padding
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          // Ensure content starts below the AppBar
// `mt: '64px'` pushes content below the AppBar. Ensure this matches the actual AppBar height.
          mt: `64px`, // Adjust if AppBar height changes
          minHeight: "calc(100vh - 64px)", // Fill viewport height
          // Background color set by parent Box now
        }}
      >
        {/* Use Container for centering and max-width */}        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
// Conditional rendering based on `selectedIndex`. This approach works for a small number of items.
// For more complex routing, consider using a routing library like React Router
// which maps routes to components declaratively.
          {/* Render content based on selected navigation item */}
          {selectedIndex === 0 && (
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
              <Typography variant="subtitle1" color="text.secondary">
                Welcome to the Pizza Store Admin Dashboard
              </Typography>
            </Typography>
          )}
          {selectedIndex === 1 && <Pizza />}
          {selectedIndex === 2 && <ToppingManager />}
          {selectedIndex === 3 && (
            <Typography variant="h4" component="h1" gutterBottom>
              Orders
              <Typography variant="subtitle1" color="text.secondary">
                Order management coming soon
              </Typography>
            </Typography>
          )}
          {selectedIndex === 4 && (
            <Typography variant="h4" component="h1" gutterBottom>
              Customers
              <Typography variant="subtitle1" color="text.secondary">
                Customer management coming soon
              </Typography>
            </Typography>
          )}
          {selectedIndex === 5 && (
            <Typography variant="h4" component="h1" gutterBottom>
              Settings
              <Typography variant="subtitle1" color="text.secondary">
                System settings coming soon
              </Typography>
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default App;
