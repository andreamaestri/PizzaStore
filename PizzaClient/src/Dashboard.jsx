import { useState, useEffect } from "react";
import {
  styled, // Import styled
  useTheme,
} from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer, // Rename Drawer to avoid conflict with styled Drawer
  AppBar as MuiAppBar, // Rename AppBar
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  Container,
  Tooltip,
  Paper,
  Breadcrumbs,
  Link, // Import Link for Breadcrumbs
  Collapse, // Import Collapse for nested items
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LocalPizza as PizzaIcon,
  Receipt as OrdersIcon,
  People as CustomersIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon, // Import Breadcrumb icon
  Home as HomeIcon, // Import Breadcrumb icon
  ExpandLess, // Import Expand icons
  ExpandMore,
} from "@mui/icons-material";
import Pizza from "./Pizza"; // Assuming Pizza component exists

const drawerWidth = 240;

// --- Styled Components for Smooth Transitions (MUI Docs Pattern) ---

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // Apply M3 AppBar styles from theme
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "none", // Often flat in M3
  borderBottom: `1px solid ${theme.palette.divider}`,
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative", // Changed from fixed/absolute if AppBar pushes content
    whiteSpace: "nowrap",
    width: drawerWidth,
    borderRight: "none", // M3 drawers often don't have a border
    backgroundColor: theme.palette.background.paper, // Use surface color
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9), // Standard collapsed width
      },
    }),
  },
}));

// Initial Navigation State Structure
const initialNavigation = [
  {
    index: 0, // Add index for easier state management
    text: "Dashboard",
    icon: <DashboardIcon />,
    component: null,
  },
  {
    index: 1,
    text: "Pizzas",
    icon: <PizzaIcon />,
    component: <Pizza />,
  },
  {
    index: 2,
    text: "Orders",
    icon: <OrdersIcon />,
    component: null,
    badge: 8,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    text: "Management",
  },
  {
    index: 3,
    text: "Customers",
    icon: <CustomersIcon />,
    component: null,
    showChildren: false, // Add state for expansion
    children: [
      { index: 30, text: "All Customers", component: null }, // Unique child indices
      { index: 31, text: "VIP Members", component: null },
    ],
  },
  {
    index: 4,
    text: "Settings",
    icon: <SettingsIcon />,
    component: null,
  },
];

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile); // Default open on desktop, closed on mobile
  const [selectedIndex, setSelectedIndex] = useState(1); // Default to Pizza page (index 1)
  const [navigationState, setNavigationState] = useState(initialNavigation); // Navigation in state
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // NOTE: Proper dark mode requires lifting state to control ThemeProvider mode
  const [darkMode, setDarkMode] = useState(theme.palette.mode === "dark");

  // Adjust drawer state based on screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleListItemClick = (index) => {
    setSelectedIndex(index);
    // Close drawer on mobile after selection
    if (isMobile) {
      setOpen(false);
    }
  };

  // Toggle nested item visibility
  const toggleChildren = (index) => {
    setNavigationState((prevState) =>
      prevState.map((item) =>
        item.index === index
          ? { ...item, showChildren: !item.showChildren }
          : item
      )
    );
  };

  const handleNotificationsOpen = (event) =>
    setNotificationsAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);
  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  // --- Branding & Slots ---
  const branding = {
    logo: (
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <PizzaIcon sx={{ fontSize: 18 }} />
      </Avatar>
    ),
    title: "Pizza Admin",
  };

  // Slot for Toolbar Actions
  const CustomToolbarActions = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {" "}
      {/* Use gap */}
      <Tooltip title="Search">
        <IconButton color="inherit">
          <SearchIcon />
        </IconButton>
      </Tooltip>
      <Tooltip
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <IconButton
          onClick={() => {
            setDarkMode(!darkMode);
            // TODO: Add logic here to call the function that updates the theme mode in ThemeProvider
            console.warn(
              "Dark mode toggle requires ThemeProvider context update."
            );
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
    </Box>
  );

  // Slot for Sidebar Footer
  const SidebarFooter = () => (
    <Box sx={{ p: 2, textAlign: "center", mt: "auto" }}>
      {" "}
      {/* Push footer down */}
      <Typography variant="caption" color="text.secondary">
        Pizza Admin v1.0.0
      </Typography>
    </Box>
  );

  // --- Navigation Renderer ---
  const renderNavigation = (items) => {
    return items.map((item, index) => {
      // Divider
      if (item.kind === "divider") {
        return <Divider key={`divider-${index}`} sx={{ my: 1, mx: 2 }} />;
      }

      // Header
      if (item.kind === "header") {
        return (
          <ListItem
            key={`header-${index}`}
            sx={{
              pt: 2,
              pb: 0,
              pl: open ? 3 : 2.5,
              display: open ? "block" : "none",
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {item.text}
            </Typography>
          </ListItem>
        );
      }

      // Regular Item
      const isSelected = selectedIndex === item.index;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = hasChildren && item.showChildren;

      // M3 Selected Item Style (using secondary container if available)
      const selectedSx = {
        // Use theme colors for M3 state layer
        backgroundColor:
          theme.palette.secondary?.container ||
          alpha(theme.palette.primary.main, 0.1), // Fallback to primary alpha
        color:
          theme.palette.secondary?.onContainer || theme.palette.primary.main, // Text color
        "&:hover": {
          backgroundColor:
            theme.palette.secondary?.container ||
            alpha(theme.palette.primary.main, 0.15), // Slightly darker hover
        },
        "& .MuiListItemIcon-root": {
          // Icon color when selected
          color:
            theme.palette.secondary?.onContainer || theme.palette.primary.main,
        },
      };

      return (
        <Box key={`nav-${item.index || `item-${index}`}`}>
          <ListItem
            disablePadding
            sx={{
              display: "block",
              mb: 0.5,
              px: 1.5, // Padding around the button for spacing
            }}
          >
            <ListItemButton
              onClick={() =>
                hasChildren
                  ? toggleChildren(item.index)
                  : handleListItemClick(item.index)
              }
              selected={isSelected}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
                borderRadius: 5, // M3 pill shape
                transition: theme.transitions.create(
                  ["background-color", "color"],
                  {
                    duration: theme.transitions.duration.shorter,
                  }
                ),
                // Apply selected styles
                ...(isSelected && !hasChildren && selectedSx), // Only apply if selected AND not a parent
                // Hover style for non-selected items
                "&:hover": {
                  backgroundColor: isSelected
                    ? undefined
                    : theme.palette.action.hover, // Use theme hover unless selected
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color:
                    isSelected && !hasChildren
                      ? theme.palette.secondary?.onContainer ||
                        theme.palette.primary.main
                      : "inherit", // Use selected color or default
                  transition: theme.transitions.create(["color"], {
                    duration: theme.transitions.duration.shorter,
                  }),
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: open ? 1 : 0,
                  color:
                    isSelected && !hasChildren
                      ? theme.palette.secondary?.onContainer ||
                        theme.palette.primary.main
                      : "inherit",
                  "& .MuiTypography-root": {
                    fontWeight: isSelected && !hasChildren ? 600 : 400, // Bolder when selected
                    fontSize: "0.875rem",
                  },
                }}
              />
              {/* Badge */}
              {item.badge && open && (
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  sx={{ ml: "auto", mr: 1 }}
                />
              )}
              {/* Expand/Collapse Icon */}
              {hasChildren &&
                open &&
                (isExpanded ? (
                  <ExpandLess sx={{ ml: "auto" }} />
                ) : (
                  <ExpandMore sx={{ ml: "auto" }} />
                ))}
            </ListItemButton>
          </ListItem>

          {/* Render Children */}
          {hasChildren && (
            <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: open ? 2 : 0 }}>
                {" "}
                {/* Indent children */}
                {item.children.map((child) => {
                  const isChildSelected = selectedIndex === child.index;
                  const childSelectedSx = {
                    // Style for selected child
                    backgroundColor:
                      theme.palette.secondary?.container ||
                      alpha(theme.palette.primary.main, 0.1),
                    color:
                      theme.palette.secondary?.onContainer ||
                      theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor:
                        theme.palette.secondary?.container ||
                        alpha(theme.palette.primary.main, 0.15),
                    },
                  };
                  return (
                    <ListItem
                      key={`child-${child.index}`}
                      disablePadding
                      sx={{ display: "block", mb: 0.5, px: 1.5 }}
                    >
                      <ListItemButton
                        selected={isChildSelected}
                        onClick={() => handleListItemClick(child.index)}
                        dense // Make children slightly smaller
                        sx={{
                          pl: 4, // Indent text
                          borderRadius: 5,
                          ...(isChildSelected && childSelectedSx), // Apply selected style
                        }}
                      >
                        <ListItemText
                          primary={child.text}
                          primaryTypographyProps={{
                            fontSize: "0.8rem", // Slightly smaller font
                            fontWeight: isChildSelected ? 600 : 400,
                            color: isChildSelected
                              ? theme.palette.secondary?.onContainer ||
                                theme.palette.primary.main
                              : "inherit",
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  // --- Main Return ---
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* --- App Bar --- */}
      <AppBar position="absolute" open={open && !isMobile}>
        {" "}
        {/* Pass open state */}
        <Toolbar sx={{ pr: "24px" }}>
          {" "}
          {/* Keep right padding when drawer closed */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              marginRight: "36px",
              ...(open && !isMobile && { display: "none" }), // Hide when drawer open on desktop
            }}
          >
            <MenuIcon />
          </IconButton>
          {/* App Title - Can be dynamic */}
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, fontWeight: 600 }} // Use theme font implicitly
          >
            {navigationState.find((item) => item.index === selectedIndex)
              ?.text || "Dashboard"}
          </Typography>
          {/* Toolbar Actions Slot */}
          <CustomToolbarActions />
          {/* Account Menu */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleProfileOpen} sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  fontSize: "0.875rem",
                }}
              >
                A {/* Replace with user initial */}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleProfileClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileClose}>My account</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileClose}>Logout</MenuItem>
          </Menu>
          {/* Notifications Menu */}
          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleNotificationsClose}>
              New Order #1234
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              New Customer Registered
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              Order #1230 Delivered
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              Low Inventory Alert
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* --- Drawer --- */}
      <Drawer variant="permanent" open={open}>
        {" "}
        {/* Control open state */}
        {/* Drawer Header / Branding */}
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Space between logo/title and icon
            px: [1], // Padding left/right
            ...theme.mixins.toolbar, // Necessary height
          }}
        >
          {/* Show Logo/Title when open */}
          {open && (
            <Box
              sx={{ display: "flex", alignItems: "center", pl: 1, flexGrow: 1 }}
            >
              {branding.logo}
              <Typography
                component="h1"
                variant="h6"
                noWrap
                sx={{ ml: 1.5, fontWeight: 600 }}
              >
                {branding.title}
              </Typography>
            </Box>
          )}
          {/* Toggle Button */}
          <IconButton onClick={handleDrawerToggle}>
            {/* Show ChevronLeft when open, Menu when closed (and drawer is persistent) */}
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        {/* Navigation List */}
        <List component="nav" sx={{ flexGrow: 1, pt: 1 }}>
          {" "}
          {/* Allow list to grow */}
          {renderNavigation(navigationState)}
        </List>
        {/* Sidebar Footer Slot */}
        {open && <SidebarFooter />}
      </Drawer>

      {/* --- Main Content --- */}
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100] // Lighter background in light mode
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto", // Enable scrolling for content
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Spacer for AppBar */}
        <Toolbar />
        {/* Content Area with Padding */}
        <Container maxWidth="xl" sx={{ pt: 2, pb: 4, flexGrow: 1 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link
              underline="hover"
              sx={{ display: "flex", alignItems: "center" }}
              color="inherit"
              href="#" // Replace with actual link/handler
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography
              sx={{ display: "flex", alignItems: "center" }}
              color="text.primary"
            >
              {
                navigationState.find((item) => item.index === selectedIndex)
                  ?.icon
              }
              <Box component="span" sx={{ ml: 0.5 }}>
                {navigationState.find((item) => item.index === selectedIndex)
                  ?.text || "Page"}
              </Box>
            </Typography>
          </Breadcrumbs>

          {/* Main Content Paper - Let content determine height */}
          <Paper
            elevation={0} // Flat surface
            sx={{
              p: { xs: 2, md: 3 }, // Responsive padding
              borderRadius: 3, // M3 medium radius
              // Use surface color from theme
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              // Let content define height, remove fixed height
              // height: '100%',
            }}
          >
            {/* Render selected component or placeholder */}
            {navigationState.find((item) => item.index === selectedIndex)
              ?.component || (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5" color="text.secondary">
                  {navigationState.find((item) => item.index === selectedIndex)
                    ?.text || "Content"}{" "}
                  Coming Soon
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard;
