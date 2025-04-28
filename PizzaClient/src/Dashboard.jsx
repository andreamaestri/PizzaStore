import {
	Brightness4 as DarkModeIcon,
	Brightness7 as LightModeIcon,
	Notifications as NotificationsIcon,
	LocalPizza as PizzaIcon,
} from "@mui/icons-material";
import {
	Avatar,
	Badge,
	Box,
	IconButton,
	Menu,
	MenuItem,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import React, { Suspense, lazy, useState, useMemo, useCallback } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useThemeMode } from "./context/ThemeModeContext";

// Lazy load page components
const Home = lazy(() => import("./pages/Home"));
const Pizzas = lazy(() => import("./pages/Pizzas"));
const Toppings = lazy(() => import("./pages/Toppings"));
const Orders = lazy(() => import("./pages/Orders"));
const Customers = lazy(() => import("./pages/Customers"));
const Settings = lazy(() => import("./pages/Settings"));
const OrderDetails = lazy(() => import("./components/orders/OrderDetails"));

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
	// Updated to properly handle the "home" segment consistently
	const segmentToPath = useCallback((segment) => {
		if (segment === "home" || segment === "") {
			return "/";
		}
		return `/${segment}`;
	}, []);

	// Callback triggered by the DashboardLayout when the user navigates via the drawer.
	const handleNavigationChange = useCallback(
		(segment) => {
			const path = segmentToPath(segment);
			navigate(path);
		},
		[navigate, segmentToPath],
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
				<Suspense
					fallback={
						<Box sx={{ p: 3, textAlign: "center" }}>
							<Typography>Loading page...</Typography>
						</Box>
					}
				>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/pizzas" element={<Pizzas />} />
						<Route path="/toppings" element={<Toppings />} />
						<Route path="/orders" element={<Orders />} />
						<Route path="/orders/:id" element={<OrderDetails />} />
						<Route path="/customers" element={<Customers />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</Suspense>
			</DashboardLayout>
		),
		[isMobile, handleNavigationChange],
	);

	return memoizedDashboardLayout;
}

export default Dashboard;
