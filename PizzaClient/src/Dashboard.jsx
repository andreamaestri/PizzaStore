import { useState, useMemo, useCallback, useEffect } from "react";
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
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
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
import { useThemeMode } from "./context/ThemeModeContext"; // Import the ThemeMode context

// Import mock data for dashboard statistics
import { orders, users } from "./constants/mockData";
 
// Custom navigation action items for the toolbar
function CustomToolbarActions() {
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const { mode, toggleMode } = useThemeMode(); // Use the theme mode context
  const darkMode = mode === 'dark';
  
  const handleNotificationsOpen = (event) => setNotificationsAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);
  
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
        <IconButton
          onClick={toggleMode}
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
  const { mode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  // Removed unused location variable

  useEffect(() => {
    // Debug: log the current value of the CSS variable
    const val = getComputedStyle(document.documentElement).getPropertyValue('--card-background');
    console.log('Current --card-background:', val, 'Current mode:', mode);
  }, [mode]);

  // Map segment to route and vice versa
  const segmentToPath = (segment) =>
    segment === 'home' ? '/' : `/${segment}`;
  // Removed unused pathToSegment function

  // Sync selectedSegment with route
  // Removed unused selectedSegment state to fix ESLint error

  // Get the component based on the current segment
  const getContentComponent = (segment) => {
    switch (segment) {
      case 'home':
        // Dashboard summary using mock data
        return (
          <Box sx={{
            p: { xs: 2, sm: 4 },
            textAlign: "center",
            maxWidth: 1200,
            mx: "auto",
            animation: 'fadeIn 1s',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(30px)' },
              to: { opacity: 1, transform: 'none' },
            },
          }}>
            {/* Stats cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: 4,
                mb: 6,
              }}
            >
              {/* Orders stats card */}
              <Box
                sx={{
                  bgcolor: 'var(--card-background)',
                  borderRadius: 5,
                  boxShadow: '0 4px 24px 0 var(--card-shadow)',
                  p: 3,
                  border: '1px solid var(--card-border)',
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s cubic-bezier(.4,2,.6,1)",
                  backdropFilter: "blur(10px)",  // Add backdrop blur for glass effect
                  '&:hover': {
                    boxShadow: '0 8px 32px 0 var(--card-hover-shadow)',
                    transform: "translateY(-4px) scale(1.03)",
                  },
                }}
              >
                <Box sx={{ position: "absolute", top: 12, right: 18, opacity: (theme) => theme.palette.mode === 'dark' ? 0.2 : 0.12 }}>
                  <OrdersIcon sx={{ fontSize: 64, color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : 'inherit' }} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, letterSpacing: 1 }}>
                  TOTAL ORDERS
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : 'primary.main', mb: 1 }}>
                  {orders.length}
                </Typography>
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#81c784' : 'success.main', fontWeight: 600 }}>
                  +2 new today
                </Typography>
              </Box>
              {/* Customers stats card */}
              <Box
                sx={{
                  bgcolor: 'var(--customer-card-background)',
                  borderRadius: 5,
                  boxShadow: '0 4px 24px 0 var(--customer-card-shadow)',
                  p: 3,
                  border: '1px solid var(--customer-card-border)',
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s cubic-bezier(.4,2,.6,1)",
                  backdropFilter: "blur(10px)",  
                  '&:hover': {
                    boxShadow: '0 8px 32px 0 var(--customer-card-hover-shadow)',
                    transform: "translateY(-4px) scale(1.03)",
                  },
                }}
              >
                <Box sx={{ position: "absolute", top: 12, right: 18, opacity: (theme) => theme.palette.mode === 'dark' ? 0.2 : 0.12 }}>
                  <CustomersIcon sx={{ fontSize: 64, color: (theme) => theme.palette.mode === 'dark' ? '#ce93d8' : 'inherit' }} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, letterSpacing: 1 }}>
                  CUSTOMERS
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ce93d8' : 'secondary.main', mb: 1 }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : 'info.main', fontWeight: 600 }}>
                  +3 this week
                </Typography>
              </Box>
              {/* Revenue stats card */}
              <Box
                sx={{
                  bgcolor: 'var(--revenue-card-background)',
                  borderRadius: 5,
                  boxShadow: '0 4px 24px 0 var(--revenue-card-shadow)',
                  p: 3,
                  border: '1px solid var(--revenue-card-border)',
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s cubic-bezier(.4,2,.6,1)",
                  backdropFilter: "blur(10px)",  
                  '&:hover': {
                    boxShadow: '0 8px 32px 0 var(--revenue-card-hover-shadow)',
                    transform: "translateY(-4px) scale(1.03)",
                  },
                }}
              >
                <Box sx={{ position: "absolute", top: 12, right: 18, opacity: (theme) => theme.palette.mode === 'dark' ? 0.2 : 0.12 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: (theme) => theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32' }}>
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, letterSpacing: 1 }}>
                  REVENUE
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#81c784' : 'success.main', mb: 1 }}>
                  £{orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#81c784' : 'success.main', fontWeight: 600 }}>
                  +12% this month
                </Typography>
              </Box>
              {/* Pizza count stats card */}
              <Box
                sx={{
                  bgcolor: 'var(--pizza-card-background)',
                  borderRadius: 5,
                  boxShadow: '0 4px 24px 0 var(--pizza-card-shadow)',
                  p: 3,
                  border: '1px solid var(--pizza-card-border)',
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s cubic-bezier(.4,2,.6,1)",
                  backdropFilter: "blur(10px)",  
                  '&:hover': {
                    boxShadow: '0 8px 32px 0 var(--pizza-card-hover-shadow)',
                    transform: "translateY(-4px) scale(1.03)",
                  },
                }}
              >
                <Box sx={{ position: "absolute", top: 12, right: 18, opacity: (theme) => theme.palette.mode === 'dark' ? 0.2 : 0.12 }}>
                  <PizzaIcon sx={{ fontSize: 64, color: (theme) => theme.palette.mode === 'dark' ? '#ffb74d' : '#ff9800' }} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, letterSpacing: 1 }}>
                  PIZZAS SOLD
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffb74d' : 'warning.main', mb: 1 }}>
                  {orders.length * 2}
                </Typography>
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffb74d' : 'warning.main', fontWeight: 600 }}>
                  +5 today
                </Typography>
              </Box>
            </Box>
            {/* Recent orders section with glassmorphism and modern table */}
            <Box
              sx={{
                bgcolor: 'var(--orders-section-background)',
                borderRadius: 6,
                boxShadow: '0 8px 32px 0 var(--orders-section-shadow)',
                p: 4,
                pt: 5, // Extra top padding to accommodate the floating title
                textAlign: "left",
                overflow: "visible", // Changed from "hidden" to allow the pill to float outside
                position: "relative",
                border: '1px solid var(--orders-section-border)',
                mt: 6, // Increased margin top to make room for the floating title
                backdropFilter: "blur(12px)",  // Enhanced backdrop blur for glass effect
              }}
            >
              {/* Floating gradient pill at the top center */}
              <Box
                sx={{
                  position: "absolute",
                  top: -24, // Moved up further
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                  minWidth: 200,
                  height: 48, // Slightly taller
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 24,
                  background: "linear-gradient(90deg, #3d5afe 0%, #ba68c8 100%)",
                  boxShadow: "0 8px 24px 0 rgba(61,90,254,0.35)",
                  color: "white",
                  px: 4,
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1 }}>
                  Recent Orders
                </Typography>
              </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                {/* Last 24 hours label aligned to the right */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    py: 0.5, 
                    px: 2, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(66,99,235,0.2)' : "primary.light", 
                    color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : "primary.main", 
                    borderRadius: 5,
                    fontWeight: 500,
                  }}
                >
                  Last 24 hours
                </Typography>
              </Box>
              <Box>
                <Box component="table" sx={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 10px",
                  tableLayout: "fixed",
                }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 1, minWidth: 60, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Order #</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 1, minWidth: 90, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Customer</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 1, minWidth: 90, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Date</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 1, minWidth: 80, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 1, minWidth: 60, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .slice()
                      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                      .slice(0, 5)
                      .map((order) => (
                        <tr 
                          key={order.id} 
                          style={{ 
                            transition: "transform 0.2s, box-shadow 0.2s",
                            cursor: "pointer",
                            borderRadius: "12px",
                          }}
                          sx={{
                            backgroundColor: (theme) => theme.palette.mode === 'dark' 
                              ? 'rgba(50,60,95,0.15)'  // Much more transparent background
                              : 'rgba(255,255,255,0.95)',
                            boxShadow: (theme) => theme.palette.mode === 'dark'
                              ? '0 2px 8px rgba(0,0,0,0.08)'  // Lighter shadow
                              : '0 2px 8px rgba(66,99,235,0.06)',
                            backdropFilter: "blur(5px)",  // Add backdrop blur for glass effect
                            border: (theme) => theme.palette.mode === 'dark'
                              ? '1px solid rgba(255,255,255,0.1)'  // Subtle white border
                              : 'none',
                            '&:hover': {
                              transform: 'translateY(-2px) scale(1.01)',
                              boxShadow: (theme) => theme.palette.mode === 'dark'
                                ? '0 4px 16px rgba(0,0,0,0.15)'
                                : '0 4px 16px rgba(66,99,235,0.12)',
                            }
                          }}
                        >
                          <td style={{ padding: "12px", borderRadius: "12px 0 0 12px", wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            <Typography variant="body2" fontWeight={700}>#{order.id}</Typography>
                          </td>
                          <td style={{ padding: "12px", wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            <Typography variant="body2" fontWeight={500}>{order.customerName}</Typography>
                          </td>
                          <td style={{ padding: "12px", wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(order.orderDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </td>
                          <td style={{ padding: "12px", wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            <Box
                              sx={{
                                display: "inline-block",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 5,
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                bgcolor: (theme) => {
                                  const isDark = theme.palette.mode === 'dark';
                                  return order.status === "Delivered" 
                                    ? isDark ? "rgba(129,199,132,0.2)" : "rgba(84,214,44,0.16)" 
                                    : order.status === "Ready" 
                                    ? isDark ? "rgba(255,213,79,0.2)" : "rgba(255,193,7,0.16)" 
                                    : order.status === "InProgress" 
                                    ? isDark ? "rgba(66,165,245,0.2)" : "rgba(24,144,255,0.16)" 
                                    : order.status === "Cancelled" 
                                    ? isDark ? "rgba(239,83,80,0.2)" : "rgba(255,72,66,0.16)" 
                                    : isDark ? "rgba(189,189,189,0.2)" : "rgba(145,158,171,0.16)";
                                },
                                color: (theme) => {
                                  const isDark = theme.palette.mode === 'dark';
                                  return order.status === "Delivered"
                                    ? isDark ? "#b9f6ca" : "rgb(54,179,126)"
                                    : order.status === "Ready"
                                    ? isDark ? "#ffff8d" : "rgb(255,180,0)"
                                    : order.status === "InProgress"
                                    ? isDark ? "#82b1ff" : "rgb(24,144,255)"
                                    : order.status === "Cancelled"
                                    ? isDark ? "#ff8a80" : "rgb(255,72,66)"
                                    : isDark ? "#f5f5f5" : "rgb(145,158,171)";
                                },
                              }}
                            >
                              {order.status}
                            </Box>
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", borderRadius: "0 12px 12px 0", wordBreak: 'break-word', whiteSpace: 'normal' }}>
                            <Typography variant="body2" fontWeight={700}>£{order.totalAmount.toFixed(2)}</Typography>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>                <Box 
                  sx={{ 
                    py: 1.2, 
                    px: 3.5, 
                    bgcolor: 'var(--view-all-orders-bg)', 
                    color: "white", 
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: 1,
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 2px 8px var(--view-all-orders-shadow)',
                    transition: "all 0.2s cubic-bezier(.4,2,.6,1)",
                    '&:hover': {
                      bgcolor: 'var(--view-all-orders-hover-bg)',
                      transform: "translateY(-2px) scale(1.04)",
                      boxShadow: '0 8px 24px var(--view-all-orders-hover-shadow)',
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    View All Orders
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      case 'pizzas':
        return <Pizza />;
      case 'toppings':
        return <ToppingManager />;
      case 'orders': {
        // Use MUI Toolpad DataGrid for orders
        // Lazy-load DataGrid to avoid breaking SSR if not present
        const orderRows = orders.map((o) => ({
          id: o.id,
          customer: o.customerName,
          date: new Date(o.orderDate).toLocaleDateString(),
          status: o.status,
          total: o.totalAmount,
        }));
        const orderColumns = [
          { field: 'id', headerName: 'Order #', width: 100 },
          { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 160 },
          { field: 'date', headerName: 'Date', width: 120 },
          { field: 'status', headerName: 'Status', width: 120,
            renderCell: (params) => (
              <span style={{
                color:
                  params.value === "Delivered"
                    ? "#388e3c"
                    : params.value === "Ready"
                    ? "#fbc02d"
                    : params.value === "InProgress"
                    ? "#1976d2"
                    : params.value === "Cancelled"
                    ? "#d32f2f"
                    : "#757575",
                fontWeight: 500,
              }}>
                {params.value}
              </span>
            )
          },
          { field: 'total', headerName: 'Total (£)', width: 120, type: 'number',
            valueFormatter: ({ value }) => (typeof value === 'number' ? `£${value.toFixed(2)}` : '—') },
        ];
        return (
          <PageContainer>
            <Typography variant="h4" gutterBottom>
              Orders
            </Typography>
            <Box sx={{ height: 440, bgcolor: "background.paper", borderRadius: 3, boxShadow: 1, p: 2, mt: 2 }}>
              <DataGrid
                rows={orderRows}
                columns={orderColumns}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                disableRowSelectionOnClick
                autoHeight={false}
                sx={{
                  borderRadius: 2,
                  fontSize: 16,
                  backgroundColor: "background.paper",
                }}
              />
            </Box>
          </PageContainer>
        );
      }
      case 'customers': {
        // Use MUI Toolpad DataGrid for customers
        const userRows = users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          address: u.address,
          phone: u.phone,
        }));
        const userColumns = [
          { field: 'id', headerName: 'ID', width: 80 },
          { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
          { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
          { field: 'address', headerName: 'Address', flex: 1, minWidth: 200 },
          { field: 'phone', headerName: 'Phone', width: 140 },
        ];
        return (
          <PageContainer>
            <Typography variant="h4" gutterBottom>
              Customers
            </Typography>
            <Box sx={{ height: 440, bgcolor: "background.paper", borderRadius: 3, boxShadow: 1, p: 2, mt: 2 }}>
              <DataGrid
                rows={userRows}
                columns={userColumns}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                disableRowSelectionOnClick
                autoHeight={false}
                sx={{
                  borderRadius: 2,
                  fontSize: 16,
                  backgroundColor: "background.paper",
                }}
              />
            </Box>
          </PageContainer>
        );
      }
      case 'settings':
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
  const handleNavigationChange = useCallback((segment) => {
    navigate(segmentToPath(segment));
  }, [navigate]);

  const memoizedDashboardLayout = useMemo(() => (
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
      <Routes>
        <Route
          path="/"
          element={
            <PageContainer>
              {getContentComponent('home')}
            </PageContainer>
          }
        />
        <Route
          path="/pizzas"
          element={
            <PageContainer>
              {getContentComponent('pizzas')}
            </PageContainer>
          }
        />
        <Route
          path="/toppings"
          element={
            <PageContainer>
              {getContentComponent('toppings')}
            </PageContainer>
          }
        />
        <Route
          path="/orders"
          element={
            <PageContainer>
              {getContentComponent('orders')}
            </PageContainer>
          }
        />
        <Route
          path="/customers"
          element={
            <PageContainer>
              {getContentComponent('customers')}
            </PageContainer>
          }
        />
        <Route
          path="/settings"
          element={
            <PageContainer>
              {getContentComponent('settings')}
            </PageContainer>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  ), [isMobile, handleNavigationChange]);

  return memoizedDashboardLayout;
}

export default Dashboard;
