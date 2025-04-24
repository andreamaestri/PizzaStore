import { useState, useMemo } from "react";
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

// Import mock data for dashboard statistics
import { orders, users } from "./constants/mockData";
 
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
  const navigate = useNavigate();
  // Removed unused location variable

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
          <Box sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Dashboard Overview
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "center",
                gap: 4,
                my: 4,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: 2,
                  p: 3,
                  minWidth: 220,
                  mx: "auto",
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h3" color="primary" fontWeight={700}>
                  {orders.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  boxShadow: 2,
                  p: 3,
                  minWidth: 220,
                  mx: "auto",
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Customers
                </Typography>
                <Typography variant="h3" color="secondary" fontWeight={700}>
                  {users.length}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                mt: 4,
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: 1,
                p: 3,
                maxWidth: 700,
                mx: "auto",
                textAlign: "left",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 8 }}>Order #</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Customer</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Date</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Status</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .slice()
                    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                    .slice(0, 5)
                    .map((order) => (
                      <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 8 }}>{order.id}</td>
                        <td style={{ padding: 8 }}>{order.customerName}</td>
                        <td style={{ padding: 8 }}>
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 8 }}>
                          <span
                            style={{
                              color:
                                order.status === "Delivered"
                                  ? "#388e3c"
                                  : order.status === "Ready"
                                  ? "#fbc02d"
                                  : order.status === "InProgress"
                                  ? "#1976d2"
                                  : order.status === "Cancelled"
                                  ? "#d32f2f"
                                  : "#757575",
                              fontWeight: 500,
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          £{order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
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
  const handleNavigationChange = (segment) => {
    navigate(segmentToPath(segment));
  };

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
