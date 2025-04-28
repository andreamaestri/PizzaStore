import { Box, Typography } from "@mui/material";
import Chip from "@mui/material/Chip";
import { DataGrid } from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer";
// Orders.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { orders } from "../constants/mockData";

const Orders = () => {
	const navigate = useNavigate();

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
					pb: 1,
					borderBottom: "1px solid",
					borderColor: "divider",
					position: "sticky",
					top: 0,
					zIndex: 1100,
				}}
			>
				<Typography variant="h5">Orders</Typography>
			</Box>
			<Box sx={{ flexGrow: 1, height: "calc(100vh - 160px)", p: 3, pt: 2 }}>
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
							position: "sticky",
							top: 0,
						},
					}}
					onRowClick={(params) => navigate(`/orders/${params.id}`)}
					disableRowSelectionOnClick
				/>
			</Box>
		</PageContainer>
	);
};

export default Orders;
