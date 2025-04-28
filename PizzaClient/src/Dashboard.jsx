import { useState, useMemo, useCallback } from "react";
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
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
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
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useThemeMode } from "./context/ThemeModeContext"; // Import the ThemeMode context

// Import mock data for dashboard statistics
import { orders, users } from "./constants/mockData";

// Component for custom actions in the DashboardLayout header (theme toggle, notifications).
function CustomToolbarActions() {
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const { mode, toggleMode } = useThemeMode(); // Access theme mode context.
  const darkMode = mode === "dark";

  const handleNotificationsOpen = (event) =>
    setNotificationsAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <IconButton onClick={toggleMode} color="inherit">
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
        <MenuItem onClick={handleNotificationsClose}>
          New order received
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          System update completed
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          2 new customers registered
        </MenuItem>
      </Menu>
    </Box>
  );
}

// Component for the user profile avatar and menu in the DashboardLayout header.
function UserMenu() {
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleProfileOpen = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);

  return (
    <>
      <Tooltip title="Account settings">
        <IconButton onClick={handleProfileOpen} size="small" sx={{ ml: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            A
          </Avatar>
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
  // Helper function to map Toolpad navigation segments to URL paths.
  const segmentToPath = useCallback((segment) => {
    return segment === "home" ? "/" : `/${segment}`;
  }, []);

  // Function to determine which component/content to render based on the navigation segment.
  // Memoized with useCallback, but dependencies need review based on actual usage.
  const getContentComponent = useCallback((segment) => {
    switch (segment) {
      case "home":
        return (
          <PageContainer
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box
              sx={{
                maxWidth: 1200,
                mx: "auto",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* --- Dashboard Home: Stats Cards --- */}
              <Grid container spacing={3} mb={4} sx={{ flexShrink: 0 }}>
                {/* Total Orders Card */}
                <Grid item xs={12} sm={6} md={3}>
                  {" "}
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "var(--total-order-card-background)",
                      borderRadius: 2,
                    }}
                  >
                    <CardHeader
                      avatar={<OrdersIcon color="primary" />}
                      title={
                        <Typography variant="subtitle2" color="text.secondary">
                          TOTAL ORDERS
                        </Typography>
                      }
                    />
                    <CardContent>
                      <Typography variant="h4" color="primary" gutterBottom>
                        {orders.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        +2 new today
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {/* Customers Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "var(--customer-card-background)",
                      borderRadius: 2,
                    }}
                  >
                    <CardHeader
                      avatar={<CustomersIcon color="secondary" />}
                      title={
                        <Typography variant="subtitle2" color="text.secondary">
                          CUSTOMERS
                        </Typography>
                      }
                    />
                    <CardContent>
                      <Typography variant="h4" color="secondary" gutterBottom>
                        {users.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        +3 this week
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {/* Revenue Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "var(--revenue-card-background)",
                      borderRadius: 2,
                    }}
                  >
                    <CardHeader
                      avatar={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "#2e7d32" }}
                        >
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      }
                      title={
                        <Typography variant="subtitle2" color="text.secondary">
                          REVENUE
                        </Typography>
                      }
                    />
                    <CardContent>
                      <Typography
                        variant="h4"
                        color="success.main"
                        gutterBottom
                      >
                        £
                        {orders
                          .reduce(
                            (total, order) => total + order.totalAmount,
                            0
                          )
                          .toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        +12% this month
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {/* Pizzas Sold Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "var(--pizza-card-background)",
                      borderRadius: 2,
                    }}
                  >
                    <CardHeader
                      avatar={<PizzaIcon color="warning" />}
                      title={
                        <Typography variant="subtitle2" color="text.secondary">
                          PIZZAS SOLD
                        </Typography>
                      }
                    />
                    <CardContent>
                      <Typography
                        variant="h4"
                        color="warning.main"
                        gutterBottom
                      >
                        {orders.length * 2}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        +5 today
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {/* --- Dashboard Home: Recent Orders Table --- */}{" "}
              <Paper
                sx={{
                  borderRadius: 2,
                  mb: 4,
                  display: "flex",                  flexDirection: "column",
                  overflow: "hidden",
                  bgcolor: "var(--mui-palette-common-background)",
                  flexGrow: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    px: 3,
                    py: 2,
                    bgcolor: "var(--orders-section-background)",
                    position: "sticky",
                    top: 0,
                    zIndex: 1100,
                  }}
                >
                  <Typography variant="h6">Recent Orders</Typography>
                  <Chip
                    label="Last 24 hours"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>{" "}
                <TableContainer
                  sx={{
                    overflow: "auto",
                    bgcolor: "var(--orders-section-background)",
                    flexGrow: 1,
                    "& .MuiTableHead-root": {
                      bgcolor: "var(--orders-table-header-background)",
                    },
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      {" "}
                      <TableRow>
                        <TableCell
                          sx={{
                            background: "var(--orders-table-header-background)",
                          }}
                        >
                          Order #
                        </TableCell>
                        <TableCell
                          sx={{
                            background: "var(--orders-table-header-background)",
                          }}
                        >
                          Customer
                        </TableCell>
                        <TableCell
                          sx={{
                            background: "var(--orders-table-header-background)",
                          }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{
                            background: "var(--orders-table-header-background)",
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            background: "var(--orders-table-header-background)",
                          }}
                        >
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.orderDate) - new Date(a.orderDate)
                        )
                        .slice(0, 5)
                        .map((order) => (
                          <TableRow key={order.id} hover>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>
                              {new Date(order.orderDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.status}
                                size="small"
                                color={
                                  order.status === "Delivered"
                                    ? "success"
                                    : order.status === "Ready"
                                      ? "warning"
                                      : order.status === "InProgress"
                                        ? "primary"
                                        : order.status === "Cancelled"
                                          ? "error"
                                          : "default"
                                }
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              £{order.totalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    p: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Button variant="contained" color="primary">
                    View All Orders
                  </Button>
                </Box>
              </Paper>
            </Box>
          </PageContainer>
        );

      case "pizzas":
        return (
          <PageContainer>
            <Pizza />
          </PageContainer>
        );

      case "toppings":
        return (
          <PageContainer>
            <ToppingManager />
          </PageContainer>
        );

      case "orders": {
        const orderRows = orders.map((o) => ({
          id: o.id,
          customer: o.customerName,
          date: new Date(o.orderDate).toLocaleDateString(),
          status: o.status,
          total: o.totalAmount,
        }));

        const orderColumns = [
          { field: "id", headerName: "Order #", width: 100 },
          { field: "customer", headerName: "Customer", flex: 1, minWidth: 160 },
          { field: "date", headerName: "Date", width: 120 },
          {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => (
              <Chip
                label={params.value}
                size="small"
                color={
                  params.value === "Delivered"
                    ? "success"
                    : params.value === "Ready"
                      ? "warning"
                      : params.value === "InProgress"
                        ? "primary"
                        : params.value === "Cancelled"
                          ? "error"
                          : "default"
                }
                variant="outlined"
              />
            ),
          },
          {
            field: "total",
            headerName: "Total (£)",
            width: 120,
            type: "number",
            valueFormatter: ({ value }) =>
              typeof value === "number" ? `£${value.toFixed(2)}` : "—",
          },
        ];

        return (
          <PageContainer
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 0,
            }}
          >
            <Box
              sx={{
                p: 3,
                pb: 0,
                borderBottom: "1px solid",
                borderColor: "divider",
                position: "sticky",
                top: 0,
                zIndex: 1100,
                bgcolor: (theme) => theme.palette.background.default,
              }}
            >
              <Typography variant="h5">Orders</Typography>
            </Box>
            <Box
              sx={{ flexGrow: 1, height: "calc(100vh - 160px)", p: 3, pt: 2 }}
            >
              <DataGrid
                rows={orderRows}
                columns={orderColumns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                autoHeight
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(30,30,30,0.95)"
                        : "rgba(255,255,255,0.95)",
                    position: "sticky",
                    top: 0,
                  },
                }}
                disableRowSelectionOnClick
              />
            </Box>
          </PageContainer>
        );
      }

      case "customers": {
        const userRows = users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          address: u.address,
          phone: u.phone,
        }));

        const userColumns = [
          { field: "id", headerName: "ID", width: 80 },
          { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
          { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
          { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
          { field: "phone", headerName: "Phone", width: 140 },
        ];

        return (
          <PageContainer
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 0,
            }}
          >
            <Box
              sx={{
                p: 3,
                pb: 0,
                borderBottom: "1px solid",
                borderColor: "divider",
                position: "sticky",
                top: 0,
                zIndex: 1100,
                bgcolor: (theme) => theme.palette.background.default,
              }}
            >
              <Typography variant="h5">Customers</Typography>
            </Box>
            <Box
              sx={{ flexGrow: 1, height: "calc(100vh - 160px)", p: 3, pt: 2 }}
            >
              <DataGrid
                rows={userRows}
                columns={userColumns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                autoHeight
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(30,30,30,0.95)"
                        : "rgba(255,255,255,0.95)",
                    position: "sticky",
                    top: 0,
                  },
                }}
                disableRowSelectionOnClick
              />
            </Box>
          </PageContainer>
        );
      }

      case "settings":
        return (
          <PageContainer>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Settings
            </Typography>
            <Typography>Settings Coming Soon</Typography>
          </PageContainer>
        );

      default:
        return (
          <PageContainer>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Content
            </Typography>
            <Typography>Content Coming Soon</Typography>{" "}
          </PageContainer>
        );
    }
  }, []); // No dependencies needed since we're using theme within the function itself

  // Callback triggered by the DashboardLayout when the user navigates via the drawer.
  const handleNavigationChange = useCallback(
    (segment) => {
      navigate(segmentToPath(segment));
    },
    [navigate, segmentToPath]
  );
  // Memoize the component instances for each route to optimize rendering.
  const homeComponent = useMemo(
    () => getContentComponent("home"),
    [getContentComponent]
  );
  const pizzasComponent = useMemo(
    () => getContentComponent("pizzas"),
    [getContentComponent]
  );
  const toppingsComponent = useMemo(
    () => getContentComponent("toppings"),
    [getContentComponent]
  );
  const ordersComponent = useMemo(
    () => getContentComponent("orders"),
    [getContentComponent]
  );
  const customersComponent = useMemo(
    () => getContentComponent("customers"),
    [getContentComponent]
  );
  const settingsComponent = useMemo(
    () => getContentComponent("settings"),
    [getContentComponent]
  );

  // Memoize the mapping between URL paths and their corresponding components.
  const routeComponents = useMemo(
    () => ({
      "/": homeComponent,
      "/pizzas": pizzasComponent,
      "/toppings": toppingsComponent,
      "/orders": ordersComponent,
      "/customers": customersComponent,
      "/settings": settingsComponent,
    }),
    [
      homeComponent,
      pizzasComponent,
      toppingsComponent,
      ordersComponent,
      customersComponent,
      settingsComponent,
    ]
  );

  // Memoize the main DashboardLayout structure and its props.
  const memoizedDashboardLayout = useMemo(
    () => (
      <DashboardLayout
        slotProps={{
          header: {
            title: "Pizza Admin",
            icon: <PizzaIcon />,
            actions: <CustomToolbarActions />,
            userMenu: <UserMenu />,
          },
          drawer: {
            width: 240,
            defaultExpanded: !isMobile,
          },
          footer: {
            children: (
              <Typography variant="caption" color="text.secondary">
                Pizza Admin v1.0.0
              </Typography>
            ),
          },
        }}
        onNavigationChange={handleNavigationChange}
      >
        <Routes>
          <Route path="/" element={routeComponents["/"]} />
          <Route path="/pizzas" element={routeComponents["/pizzas"]} />
          <Route path="/toppings" element={routeComponents["/toppings"]} />
          <Route path="/orders" element={routeComponents["/orders"]} />
          <Route path="/customers" element={routeComponents["/customers"]} />
          <Route path="/settings" element={routeComponents["/settings"]} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    ),
    [isMobile, handleNavigationChange, routeComponents]
  );

  return memoizedDashboardLayout;
}

export default Dashboard;
