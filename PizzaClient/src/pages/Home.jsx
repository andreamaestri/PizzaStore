import {
	People as CustomersIcon,
	Receipt as OrdersIcon,
	LocalPizza as PizzaIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Grid,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
// Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { orders, users } from "../constants/mockData";

const Home = () => {
	const theme = useTheme();
	const navigate = useNavigate();

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
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
										<title>Revenue Icon</title>
										<line x1="12" y1="1" x2="12" y2="23" />
										<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
									</svg>
								}
								title={
									<Typography variant="subtitle2" color="text.secondary">
										REVENUE
									</Typography>
								}
							/>
							<CardContent>
								<Typography variant="h4" color="success.main" gutterBottom>
									£
									{orders
										.reduce((total, order) => total + order.totalAmount, 0)
										.toFixed(2)}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									+12% this month
								</Typography>
							</CardContent>
						</Card>
					</Grid>
					{/* Pizzas Sold Card */}
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
								<Typography variant="h4" color="warning.main" gutterBottom>
									{orders.length * 2}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									+5 today
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
				{/* --- Dashboard Home: Recent Orders Table --- */}
				<Paper
					sx={{
						borderRadius: 2,
						mb: 4,
						display: "flex",
						flexDirection: "column",
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
					</Box>
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
									.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
									.slice(0, 5)
									.map((order) => (
										<TableRow
											key={order.id}
											hover
											onClick={() => navigate(`/orders/${order.id}`)}
											sx={{
												cursor: "pointer",
												"&:hover": {
													backgroundColor:
														theme.palette.mode === "dark"
															? "rgba(255, 255, 255, 0.08)"
															: "rgba(0, 0, 0, 0.04)",
												},
											}}
										>
											<TableCell>#{order.id}</TableCell>
											<TableCell>{order.customerName}</TableCell>
											<TableCell>
												{new Date(order.orderDate).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
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
						<Button
							variant="contained"
							color="primary"
							onClick={() => navigate("/orders")}
						>
							View All Orders
						</Button>
					</Box>
				</Paper>
			</Box>
		</PageContainer>
	);
};

export default Home;
