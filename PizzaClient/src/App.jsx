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
  Divider,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Link,
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

const drawerWidth = 240;

// Default branding configuration
const defaultBranding = {
  logo: <PizzaIcon sx={{ fontSize: 36 }} />,
  title: "Pizza Admin",
  appTitle: "Pizza Store",
  homeUrl: "/",
  logoWidth: 64,
  logoHeight: 64,
};

function App({ branding = {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Merge default branding with custom branding props
  const brandingConfig = { ...defaultBranding, ...branding };

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const handleListItemClick = (index) => {
    setSelectedIndex(index);
    if (isMobile) setMobileOpen(false);
  };

  // Navigation items for the sidebar
  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, index: 0 },
    { text: "Pizza Menu", icon: <PizzaIcon />, index: 1 },
    { text: "Topping Manager", icon: <ToppingIcon />, index: 2 },
    { text: "Orders", icon: <OrdersIcon />, index: 3 },
    { text: "Customers", icon: <CustomersIcon />, index: 4 },
  ];
  const settingsItem = { text: "Settings", icon: <SettingsIcon />, index: 5 };

  // M3 Inspired selected styles
  const selectedItemStyles = {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.secondary.dark
        : theme.palette.secondary.light,
    borderRadius: theme.shape.borderRadius * 5,
    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
      color:
        theme.palette.secondary.contrastText ||
        theme.palette.getContrastText(theme.palette.secondary.light),
      fontWeight: 500,
    },
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.secondary.dark
          : theme.palette.secondary.light,
      opacity: 0.9,
    },
  };

  const unselectedItemStyles = {
    borderRadius: theme.shape.borderRadius * 5,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  };

  // Drawer JSX
  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        pt: 0,
      }}
    >
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
        <Link href={brandingConfig.homeUrl} underline="none">
          <Avatar
            sx={{
              width: brandingConfig.logoWidth,
              height: brandingConfig.logoHeight,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              mb: 1.5,
            }}
          >
            {brandingConfig.logo}
          </Avatar>
        </Link>
        <Typography variant="h6" noWrap component="div" fontWeight="600">
          {brandingConfig.title}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "divider", mx: 2, my: 1 }} />
      <List sx={{ px: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={selectedIndex === item.index}
              onClick={() => handleListItemClick(item.index)}
              sx={
                selectedIndex === item.index
                  ? selectedItemStyles
                  : unselectedItemStyles
              }
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: selectedIndex === item.index ? 500 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: "divider", mx: 2, my: 1 }} />
      <List sx={{ px: 2, mt: "auto" }}>
        <ListItem key={settingsItem.index} disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            selected={selectedIndex === settingsItem.index}
            onClick={() => handleListItemClick(settingsItem.index)}
            sx={
              selectedIndex === settingsItem.index
                ? selectedItemStyles
                : unselectedItemStyles
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
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: "0 0 24px 24px",
          boxShadow: theme.shadows[2],
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, borderRadius: "50%" }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {brandingConfig.appTitle}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer: responsive */}
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="sidebar navigation"
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={isMobile ? handleDrawerToggle : undefined}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: "block", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "none",
              backgroundColor: "background.paper",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: "56px", sm: "64px" }, // AppBar offset
          minHeight: "calc(100vh - 64px)",
          transition: "margin .3s",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          {selectedIndex === 0 && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Welcome to the Pizza Store Admin Dashboard
              </Typography>
            </>
          )}
          {selectedIndex === 1 && <Pizza />}
          {selectedIndex === 2 && <ToppingManager />}
          {selectedIndex === 3 && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Orders
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Order management coming soon
              </Typography>
            </>
          )}
          {selectedIndex === 4 && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Customers
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Customer management coming soon
              </Typography>
            </>
          )}
          {selectedIndex === 5 && (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                Settings
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                System settings coming soon
              </Typography>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default App;