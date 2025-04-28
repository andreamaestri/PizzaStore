import { Box, Typography, Paper, IconButton, InputAdornment, TextField, Tooltip, alpha } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import Chip from "@mui/material/Chip";
import { DataGrid } from "@mui/x-data-grid";
import { PageContainer } from "@toolpad/core/PageContainer"; // Assuming this is a custom layout component
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { orders as mockOrders } from "../constants/mockData"; // Renamed import to avoid conflict if 'orders' was used elsewhere

// --- Component: Orders List and Management ---

/**
 * `Orders` component provides a view for displaying and managing customer orders.
 * It utilizes a DataGrid to present order data, includes search functionality,
 * and provides basic actions like navigation to individual order details.
 * Currently uses mock data but is structured to easily integrate with an API.
 */
const Orders = () => {
    // --- Hooks ---

    // Hook for programmatic navigation, typically used with react-router-dom.
    const navigate = useNavigate();

    // --- State Management ---

    // State variable to hold the current value of the search input field.
    const [searchQuery, setSearchQuery] = useState("");
    // State variable to hold the raw order data. In a real application,
    // this would likely be fetched from an API. Using mock data for now.
    const [orderData] = useState(mockOrders); // Initialize with mock data

    // --- Data Processing ---

    /**
     * Memoized computation of filtered and formatted order data for the DataGrid.
     * Filters the raw order data based on the current search query (case-insensitive)
     * matching customer name or order ID.
     * Maps the filtered data to the structure expected by the DataGrid columns.
     * Recalculates only when `orderData` or `searchQuery` changes.
     */
    const filteredOrderRows = useMemo(() => {
        // Apply filtering based on the search query.
        const filteredData = orderData.filter((order) => {
            // If no search query, include all orders.
            if (!searchQuery) return true;

            // Convert search query and relevant fields to lowercase for case-insensitive comparison.
            const lowerSearchQuery = searchQuery.toLowerCase();
            const customerNameLower = order.customerName.toLowerCase();
            const orderIdString = order.id.toString();

            // Check if the search query is included in customer name or order ID string.
            return (
                customerNameLower.includes(lowerSearchQuery) ||
                orderIdString.includes(searchQuery) // Keep orderId as string for includes check
            );
        });

        // Map the filtered data to the row structure required by the DataGrid.
        return filteredData.map((order) => ({
            id: order.id, // DataGrid requires a unique 'id' field.
            customer: order.customerName,
            date: new Date(order.orderDate).toLocaleDateString(), // Format date for display.
            status: order.status,
            total: order.totalAmount,
        }));
    }, [orderData, searchQuery]); // Dependencies: Recalculate when orderData or searchQuery changes.

    // --- Event Handlers ---

    /**
     * Handles changes to the search input field. Updates the `searchQuery` state.
     * @param {object} event - The change event from the input field.
     */
    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []); // No dependencies, this function is stable.

    /**
     * Handles the refresh action.
     */
    const handleRefresh = useCallback(() => {
        console.log("Refresh action triggered.");
        // Example for mock data: Reset search or re-initialize data
        // setSearchQuery('');
        // setOrderData(mockOrders); // If mockOrders could change or needed a 'fresh' copy
        // In a real app: fetchOrdersFromApi();
    }, []); // No dependencies needed for this placeholder.

    /**
     * Handles row clicks in the DataGrid. Navigates to the detail page for the clicked order.
     * @param {object} params - Parameters object provided by DataGrid on row click, includes row data.
     */
    const handleRowClick = useCallback((params) => {
        // Navigate to the specific order detail page using the order's ID.
        navigate(`/orders/${params.id}`);
    }, [navigate]); // Dependency on the navigate function.

    // --- DataGrid Column Definitions ---

    /**
     * Defines the columns for the DataGrid.
     * Memoized to prevent unnecessary re-creations on every render, improving DataGrid performance.
     * Includes configuration for field mapping, headers, widths, flexibility, and custom cell rendering.
     */
    const orderColumns = useMemo(() => [
        // Column for Order ID. Fixed width.
        { field: "id", headerName: "Order #", width: 100 },
        // Column for Customer Name. Flexible width to fill available space.
        { field: "customer", headerName: "Customer", flex: 1, minWidth: 160 },
        // Column for Order Date. Fixed width.
        { field: "date", headerName: "Date", width: 120 },
        // Column for Order Status. Fixed width with custom cell rendering using a Chip component.
        {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: (params) => {
                // Determine Chip color based on status value.
                let color;
                switch (params.value) {
                    case "Delivered":
                        color = "success";
                        break;
                    case "Ready":
                        color = "warning";
                        break;
                    case "InProgress":
                        color = "primary";
                        break;
                    case "Cancelled":
                        color = "error";
                        break;
                    default:
                        color = "default";
                }
                return (
                    <Chip
                        label={params.value}
                        size="small"
                        color={color}
                        variant="outlined"
                    />
                );
            },
        },
        // Column for Total Amount. Fixed width, number type, with custom value formatting for currency.
        {
            field: "total",
            headerName: "Total (£)",
            width: 120,
            type: "number", // Helps DataGrid with sorting and filtering numbers.
            valueFormatter: ({ value }) =>
                // Format the number as currency. Handle potential non-numeric values gracefully.
                typeof value === "number" ? `£${value.toFixed(2)}` : "—",
        },
    ], []); // Empty dependency array ensures columns are defined only once.

    // --- Render Logic ---

    return (
        // PageContainer likely provides consistent padding and structure.
        <PageContainer
            sx={{ display: "flex", flexDirection: "column", p: 0 }}
        >
            {/* Header section with title, description, search, and refresh button */}
            <Paper
                elevation={1}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: 1,
                    p: { xs: 2.5, sm: 4 }, // Responsive padding
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    {/* Title and Description */}
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Orders
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 520 }}>
                            View and manage all customer orders. Use the search to filter by customer or order number.
                        </Typography>
                    </Box>
                    {/* Search and Refresh Controls */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {/* Search Input Field */}
                        <TextField
                            placeholder="Search orders..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange} // Use the dedicated handler
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "text.secondary" }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 220 }}
                        />
                        {/* Refresh Button */}
                        <Tooltip title="Refresh Orders">
                            <IconButton
                                onClick={handleRefresh} // Use the dedicated handler
                                aria-label="refresh orders"
                                sx={{
                                    backgroundColor: "action.selected",
                                    color: "primary.main",
                                    "&:hover": {
                                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15)
                                    }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Paper>

            {/* DataGrid Container */}
            {/* FlexGrow allows the DataGrid to take up remaining vertical space */}
            {/* Height calculation ensures it fits within the viewport below the header */}
            <Box sx={{ flexGrow: 1, height: "calc(100vh - 220px)", p: { xs: 2, sm: 3 }, pt: 0 }}>
                {/* Paper wrapper for the DataGrid with styling */}
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: "divider", boxShadow: 0, height: '100%' }}>
                    {/* The DataGrid component */}
                    <DataGrid
                        rows={filteredOrderRows} // Use the memoized, filtered rows
                        columns={orderColumns} // Use the memoized column definitions
                        pageSizeOptions={[5, 10, 25]} // Options for rows per page
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} // Default page size
                        // autoHeight // Removed autoHeight as it can cause issues with fixed height containers. Use height: '100%' on parent.
                        sx={{
                            // Sticky header style
                            "& .MuiDataGrid-columnHeaders": { position: "sticky", top: 0 },
                            border: "none", // Remove default border
                            borderRadius: 3, // Apply border radius
                            // boxShadow: 0, // Already on parent Paper
                            // Ensure DataGrid takes up full height of its container
                            height: '100%',
                        }}
                        onRowClick={handleRowClick} // Use the dedicated row click handler
                        disableRowSelectionOnClick // Disable row selection on click if not needed
                    />
                </Paper>
            </Box>
        </PageContainer>
    );
};

export default Orders;
