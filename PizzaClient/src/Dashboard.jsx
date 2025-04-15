import { useState, useEffect } from "react";
import {
  styled, // Import styled
  useTheme,
  alpha, // Import alpha for potential fallback if needed, though theme should provide colors
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
  Restaurant as ToppingIcon,
} from "@mui/icons-material";
import Pizza from "./Pizza"; // Assuming Pizza component exists
import ToppingManager from "./components/toppings/ToppingManager"; // Import ToppingManager component

const drawerWidth = 240;

// --- Styled Components --- //
// Using MUI's `styled` API allows for creating reusable components with encapsulated styles
// and provides a clean way to manage dynamic styles based on props (like `open`).
// --- Styled Components for Smooth Transitions (MUI Docs Pattern) ---

// Styled AppBar component that adjusts margin and width based on the drawer's open state.
// Inherits M3-like styles from the theme overrides.
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

// Styled Drawer component that handles transitions for opening and closing.
// Adjusts width and overflow based on the `open` prop.
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
// Defines the structure for navigation items, including potential dividers, headers, badges, and nested children.
// Storing this configuration centrally makes it easier to manage the sidebar layout.
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
    text: "Toppings",
    icon: <ToppingIcon />,
    component: <ToppingManager />,
  },
  {
    index: 3,
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
  },  {
    index: 4,
    text: "Customers",
    icon: <CustomersIcon />,
    component: null,
    showChildren: false, // Add state for expansion
    children: [
      { index: 40, text: "All Customers", component: null }, // Unique child indices
      { index: 41, text: "VIP Members", component: null },
    ],
  },
  {
    index: 5,
    text: "Settings",
    icon: <SettingsIcon />,
    component: null,
  },
];

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
// State to control the drawer's open/closed status. Defaults based on screen size.
  const [open, setOpen] = useState(!isMobile); // Default open on desktop, closed on mobile
// State to track the index of the currently selected navigation item.
  const [selectedIndex, setSelectedIndex] = useState(1); // Default to Pizza page (index 1)
// Holds the navigation structure, allowing dynamic updates (e.g., expanding children).
  const [navigationState, setNavigationState] = useState(initialNavigation); // Navigation in state
// State for managing the anchor element of the notifications popover/menu.
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
// State for managing the anchor element of the user profile popover/menu.
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  // NOTE: Proper dark mode requires lifting state to control ThemeProvider mode
// Local state for dark mode toggle. For a persistent theme change,
// this state and the toggle logic should be lifted to a context provider
// that wraps the `ThemeProvider` and controls its `mode`.
  const [darkMode, setDarkMode] = useState(theme.palette.mode === "dark");

  // Adjust drawer state based on screen size changes
// Effect to automatically open/close the drawer when the screen size changes
// across the mobile breakpoint (`sm`).
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

// Toggles the drawer's open/closed state.
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

// Handles clicks on main navigation items, updating the selected index.
// Closes the drawer automatically on mobile.
  const handleListItemClick = (index) => {
    setSelectedIndex(index);
    // Close drawer on mobile after selection
    if (isMobile) {
      setOpen(false);
    }
  };

  // Toggle nested item visibility
// Toggles the `showChildren` property for a specific navigation item by its index,
// controlling the visibility of nested sub-items.
  const toggleChildren = (index) => {
    setNavigationState((prevState) =>
      prevState.map((item) =>
        item.index === index
          ? { ...item, showChildren: !item.showChildren }
          : item
      )
    );
  };

// Opens the notifications menu, anchoring it to the clicked element.
  const handleNotificationsOpen = (event) =>
    setNotificationsAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);
// Opens the user profile menu, anchoring it to the clicked element.
  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  // --- Branding & Slots ---
// Defines branding elements (logo and title) used in the drawer header.
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
// Defines a component slot for actions displayed in the AppBar's toolbar.
// This promotes composition and allows easy customization of toolbar content.
  const CustomToolbarActions = () => (      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
// TODO: Implement the actual theme mode switching logic.
// This requires access to the function provided by the theme context
// to update the `mode` in the `ThemeProvider`.
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
// Defines a component slot for content displayed at the bottom of the sidebar.
// Useful for version info, links, etc.
  const SidebarFooter = () => (    <Box sx={{ p: 2, textAlign: "center", mt: "auto" }}>
      {/* Push footer down */}
      <Typography variant="caption" color="text.secondary">
        Pizza Admin v1.0.0
      </Typography>
    </Box>
  );

  // --- Navigation Renderer ---
// Function to render the navigation items based on the `navigationState` array.
// Handles different item types (divider, header, regular item, item with children).
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
// Click handler: Toggles children if the item has them, otherwise handles regular navigation.
              onClick={() =>
                hasChildren
                  ? toggleChildren(item.index)
                  : handleListItemClick(item.index)
              }
// `selected` prop is applied only to leaf nodes (items without children) to avoid highlighting parent toggles.
              selected={isSelected && !hasChildren} // Apply selected prop only if not a parent toggle
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
                borderRadius: 5, // M3 pill shape (theme override might also set this)
                transition: theme.transitions.create(
                  ["background-color", "color"],
                  {
                    duration: theme.transitions.duration.shorter,
                  }
                ),
// Selected styles are primarily driven by theme overrides for `MuiListItemButton`
// based on the `.Mui-selected` class, promoting consistency.
                // Selected styles are now primarily handled by theme overrides for MuiListItemButton
                // Hover style for non-selected items (theme override might handle this too)
                "&:hover": {
                   // Let theme override handle hover, or define a subtle one if needed
                   // backgroundColor: isSelected ? undefined : theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  // Color will be handled by theme override based on selected state
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
                  // Color and font weight handled by theme override based on selected state
                  "& .MuiTypography-root": {
                    // fontWeight: isSelected && !hasChildren ? 600 : 400, // Let theme handle weight
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
{/* Renders nested child items within a `Collapse` component for smooth expansion/collapse,
only when the parent is expanded (`isExpanded`) and the drawer is open (`open`). */}          {hasChildren && (
            <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: open ? 2 : 0 }}>
                {/* Indent children */}
                {item.children.map((child) => {
                  const isChildSelected = selectedIndex === child.index;

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
                          borderRadius: 5, // Match parent radius (theme override might set this)
                        }}
                      >
                        <ListItemText
                          primary={child.text}
                          primaryTypographyProps={{
                            fontSize: "0.8rem", // Slightly smaller font
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
      {/* --- Drawer --- */}
      {/* The main Drawer component, controlled by the `open` state. */}
      <Drawer variant="permanent" open={open}>
        {/* Drawer Header / Branding */}
        {/* Header section of the drawer, containing branding and the toggle button. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Space between logo/title and icon
            px: [1], // Padding left/right
            height: 64, // Match the AppBar height
            minHeight: 64, // Ensure consistent height
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
        </Box>
        <Divider />
        {/* Navigation List */}
        {/* Renders the main navigation list using the `renderNavigation` function. */}
        <List component="nav" sx={{ flexGrow: 1, pt: 1 }}>
          {renderNavigation(navigationState)}
        </List>
        {/* Sidebar Footer Slot */}
        {/* Renders the sidebar footer slot, only when the drawer is open. */}
        {open && <SidebarFooter />}
      </Drawer>
      
      {/* --- Main Content --- */}
      {/* The main content area of the dashboard. */}
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
        {/* Spacer for AppBar - using Box instead of Toolbar */}
        {/* A simple Box used as a spacer to push content below the fixed/absolute AppBar. */}
        {/* Ensures content isn't hidden behind the AppBar. */}
        <Box sx={{ height: 64 }} /> {/* Match AppBar height */}
        
        {/* Content Area with Padding */}
        <Container maxWidth="xl" sx={{ pt: 2, pb: 4, flexGrow: 1 }}>
          {/* Breadcrumbs */}
          {/* Breadcrumbs provide context about the user's current location within the application. */}
          {/* Dynamically displays the path based on the `selectedIndex`. */}
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
          
          {/* Render selected component or placeholder */}
          {/* Dynamically renders the component associated with the `selectedIndex`. */}
          {/* Finds the corresponding item in `navigationState` and renders its `component` property. */}
          {/* Shows a placeholder if the component is not defined (e.g., for 'Coming Soon' pages). */}
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
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard;
