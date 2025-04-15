import { useState, useEffect } from "react";
import {
  styled,
  useTheme,
  alpha,
} from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
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
  Container,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

const drawerWidth = 240;

// Styled components for transitions
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "none",
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
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    borderRight: "none",
    backgroundColor: theme.palette.background.paper,
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
        width: theme.spacing(9),
      },
    }),
  },
}));

const AppLayout = ({ 
  children, 
  navigationItems, 
  title = "Pizza Admin",
  selectedIndex = 0, 
  onSelectItem = () => {},
  appBarContent = null,
  logoIcon = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile);
  const [navItems, setNavItems] = useState(navigationItems || []);

  // Adjust drawer state based on screen size
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleListItemClick = (index) => {
    onSelectItem(index);
    // Close drawer on mobile after selection
    if (isMobile) {
      setOpen(false);
    }
  };

  // Toggle nested item visibility
  const toggleChildren = (index) => {
    setNavItems((prevState) =>
      prevState.map((item) =>
        item.index === index
          ? { ...item, showChildren: !item.showChildren }
          : item
      )
    );
  };

  // M3 Inspired styling for selected items
  const selectedItemStyles = {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.secondary.dark
        : theme.palette.secondary.light,
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

  const renderNavItems = () => {
    return navItems.map((item, idx) => {
      // Handle dividers
      if (item.kind === "divider") {
        return <Divider key={`divider-${idx}`} sx={{ borderColor: "divider", mx: 2, my: 1 }} />;
      }
      
      // Handle headers
      if (item.kind === "header") {
        return (
          <Typography 
            key={`header-${idx}`}
            variant="caption" 
            color="text.secondary"
            sx={{ ml: 3, mt: 2, mb: 1, display: "block" }}
          >
            {item.text}
          </Typography>
        );
      }

      // Handle regular items and nested items
      return (
        <div key={`nav-item-${item.index}`}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={selectedIndex === item.index}
              onClick={
                item.children
                  ? () => toggleChildren(item.index)
                  : () => handleListItemClick(item.index)
              }
              sx={
                selectedIndex === item.index
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
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: selectedIndex === item.index ? 500 : 400,
                }}
              />
              {item.children && (
                item.showChildren ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItemButton>
          </ListItem>
          
          {item.children && (
            <Collapse in={item.showChildren} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItem key={`child-${child.index}`} disablePadding sx={{ pl: 4 }}>
                    <ListItemButton
                      selected={selectedIndex === child.index}
                      onClick={() => handleListItemClick(child.index)}
                      sx={
                        selectedIndex === child.index
                          ? selectedItemStyles
                          : {
                              borderRadius: theme.shape.borderRadius * 5,
                              "&:hover": {
                                backgroundColor: theme.palette.action.hover,
                              },
                            }
                      }
                    >
                      <ListItemText
                        primary={child.text}
                        primaryTypographyProps={{
                          fontWeight: selectedIndex === child.index ? 500 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </div>
      );
    });
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
      <AppBar position="fixed" open={open}>        <Toolbar sx={{ pl: 2 }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              ...(open && { visibility: 'visible' }),
              marginRight: open ? 0 : 2
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {appBarContent}
        </Toolbar>
      </AppBar>
      
      <Drawer variant="permanent" open={open}>
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          {open && (
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", ml: 1 }}>
              <Avatar sx={{ mr: 2 }}>{logoIcon}</Avatar>
              <Typography variant="h6">{title}</Typography>
            </Box>
          )}
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        
        <List sx={{ px: 2, flexGrow: 1 }}>
          {renderNavItems()}
        </List>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
          mt: '64px', // Adjust for AppBar height
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
