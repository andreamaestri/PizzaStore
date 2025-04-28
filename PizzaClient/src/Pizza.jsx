import { LocalPizza as PizzaIcon } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Fade,
	Skeleton,
	Snackbar,
	Stack,
	Typography,
} from "@mui/material";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import PizzaList from "./PizzaList"; // Handles display and form interactions for pizzas

// --- Constants ---
// Term used in UI text (notifications, titles, etc.).
const term = "Pizza";
// Base URL for the Pizza API.
const API_URL = "/api/pizzas";
// Default headers for API requests. Ensure 'Content-Type' matches API expectations.
// Add 'Authorization' or other headers if required by the API.
const headers = {
	"Content-Type": "application/json",
	// Add any other required headers like Authorization if needed
};

// Main component for managing Pizza data (fetching, CRUD operations, display).
const Pizza = memo(function Pizza() {
	// --- State ---
	const [data, setData] = useState([]); // Holds the array of pizza data fetched from the API.
	const [error, setError] = useState(null); // Stores any error object encountered during API calls.
	const [loading, setLoading] = useState(true); // Indicates if data fetching or CUD operation is in progress.
	const [notification, setNotification] = useState({
		// Manages Snackbar notification state.
		open: false,
		message: "",
		severity: "success",
	});
	const [dialogOpen, setDialogOpen] = useState(false); // Controls delete confirmation dialog visibility.
	const [itemToDeleteId, setItemToDeleteId] = useState(null); // ID of the item pending deletion confirmation.

	// --- Notification Handling ---
	// Callback to display a notification message via the Snackbar.
	const showNotification = useCallback((message, severity = "success") => {
		setNotification({ open: true, message, severity });
	}, []);

	// --- Data Fetching Logic ---
	// Callback to fetch pizza data from the API.
	// Sets loading state, handles success/errors, includes a 5s timeout, and clears previous errors.
	const fetchPizzaData = useCallback(() => {
		setLoading(true);
		setError(null); // Clear previous errors before fetching.
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // Abort fetch after 5 seconds.
		fetch(API_URL, { signal: controller.signal })
			.then((response) => {
				clearTimeout(timeoutId);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				setData(data);
				setLoading(false);
			})
			.catch((error) => {
				clearTimeout(timeoutId);
				if (error.name === "AbortError") {
					error = new Error("Request timed out. Please try again.");
				}
				console.error("Fetch error:", error);
				setError(error);
				setLoading(false);
				showNotification(
					`Failed to load ${term} data: ${error.message}`,
					"error",
				);
			});
		return () => clearTimeout(timeoutId);
	}, [showNotification]);

	// Effect to trigger the initial data fetch on component mount.
	useEffect(() => {
		fetchPizzaData();
	}, [fetchPizzaData]);

	// --- Memoization ---
	// Memoize the fetched data array for stability.
	const memoizedData = useMemo(() => data, [data]);

	// Callback to close the notification Snackbar. Prevents closing on 'clickaway'.
	const handleCloseNotification = useCallback(
		(event, reason) => {
			if (reason === "clickaway") {
				return;
			}
			setNotification({ ...notification, open: false });
		},
		[notification],
	);

	// Callback to close the delete confirmation dialog and reset the pending item ID.
	const handleCloseDialog = useCallback(() => {
		setDialogOpen(false);
		setItemToDeleteId(null);
	}, []);

	// --- CRUD Operation Callbacks ---

	/**
	 * Handles the creation of a new pizza item.
	 * Sends a POST request to the API.
	 * Updates local state on success, shows notification, handles errors.
	 * TODO: Consider implementing optimistic updates for a smoother UX (see comments below).
	 * 1. Add the new item to `data` state immediately.
	 * 2. If the API call fails, remove the item from `data` and show an error.
	 */
	const handleCreate = useCallback(
		(item) => {
			setLoading(true);
			setError(null);
			// TODO (Optimistic Update): Add item to local state immediately here.

			fetch(API_URL, {
				method: "POST",
				headers,
				// Construct the payload, ensuring properties match the API schema.
				// Includes parsing for `baseId` and default for `toppings`.
				body: JSON.stringify({
					// Ensure payload structure matches backend API requirements.
					name: item.name,
					description: item.description,
					baseId: Number.parseInt(item.baseId) || 1, // Default to baseId 1 if parsing fails.
					toppings: item.toppings || [],
				}),
			})
				.then((response) => {
					if (!response.ok) throw new Error("Failed to create item");
					return response.json();
				})
				.then((returnedItem) => {
					setData((prevData) => [...prevData, returnedItem]); // Add the confirmed item to state.
					setLoading(false);
					showNotification(
						`${item.name || term} added successfully`,
						"success",
					);
				})
				.catch((error) => {
					console.error("Create error:", error);
					setError(error);
					setLoading(false);
					showNotification(
						`Failed to add ${item.name || term}: ${error.message}`,
						"error",
					);
					// TODO (Optimistic Update): Rollback the state change if the API call failed.
				});
		},
		[showNotification],
	);

	/**
	 * Handles updating an existing pizza item.
	 * Sends a PUT request to the API with the updated item data.
	 * Updates local state on success, shows notification, handles errors.
	 * TODO: Consider implementing optimistic updates (see comments below).
	 * 1. Update the item in `data` state immediately.
	 * 2. If the API call fails, revert the item in `data` to its original state.
	 */
	const handleUpdate = useCallback(
		(updatedItem) => {
			setLoading(true);
			setError(null);
			// Store original data for potential rollback on error (if implementing optimistic updates).
			// const originalData = [...data]; // Store original for potential rollback.

			// TODO (Optimistic Update): Update item in local state immediately here.
			// setData(prevData => prevData.map(item => (item.id === updatedItem.id ? updatedItem : item)));

			fetch(`${API_URL}/${updatedItem.id}`, {
				method: "PUT",
				headers,
				// Construct the payload, ensuring all required fields (including ID) are present.
				body: JSON.stringify({
					// Payload structure should match the backend API requirements.
					id: updatedItem.id, // Ensure ID is included for PUT request.
					name: updatedItem.name,
					description: updatedItem.description,
					baseId: Number.parseInt(updatedItem.baseId) || 1,
					toppings: updatedItem.toppings || [],
				}),
			})
				.then((response) => {
					if (!response.ok) throw new Error("Failed to update item");
					// Assuming PUT returns success status or the updated item.
					// Update the local state manually if only status is returned.
					setData((prevData) =>
						prevData.map((item) =>
							item.id === updatedItem.id ? updatedItem : item,
						),
					); // Update the item in the local state after successful API call.
					setLoading(false);
					showNotification(
						`${updatedItem.name || term} updated successfully`,
						"success",
					);
				})
				.catch((error) => {
					console.error("Update error:", error);
					setError(error);
					setLoading(false);
					showNotification(
						`Failed to update ${updatedItem.name || term}: ${error.message}`,
						"error",
					);
					// TODO (Optimistic Update): Rollback the state change if the API call failed.
					// setData(originalData);
				});
		},
		[showNotification],
	);

	// --- Delete Operation Callbacks ---
	// Callback to initiate the delete process: sets the item ID and opens the confirmation dialog.
	const handleDeleteRequest = useCallback((id) => {
		setItemToDeleteId(id);
		setDialogOpen(true);
	}, []);

	/**
	 * Confirms and executes the deletion after user confirmation via the dialog.
	 * Sends a DELETE request to the API.
	 * Updates local state on success by filtering out the deleted item.
	 * Shows notification, handles errors.
	 * TODO: Consider implementing optimistic updates (see comments below).
	 * 1. Remove the item from `data` state immediately.
	 * 2. If the API call fails, re-insert the item into `data`.
	 */
	const handleConfirmDelete = useCallback(() => {
		if (!itemToDeleteId) return;

		const itemToDelete = data.find((item) => item.id === itemToDeleteId);
		const itemName = itemToDelete?.name || term; // Get name for notification.
		handleCloseDialog(); // Close dialog immediately.
		setLoading(true);
		setError(null);
		// Store original data for potential rollback (if implementing optimistic updates).
		// const originalData = [...data]; // Store original for potential rollback.

		// TODO (Optimistic Update): Remove item from local state immediately here.
		// setData(prevData => prevData.filter(item => item.id !== itemToDeleteId));

		fetch(`${API_URL}/${itemToDeleteId}`, {
			method: "DELETE",
			headers,
		})
			.then((response) => {
				if (!response.ok) throw new Error("Failed to delete item");
				// If the DELETE request is successful, update the local state.
				setData((prevData) =>
					prevData.filter((item) => item.id !== itemToDeleteId),
				);
				setLoading(false);
				showNotification(`${itemName} removed successfully`, "success");
			})
			.catch((error) => {
				console.error("Delete error:", error);
				setError(error);
				setLoading(false);
				showNotification(
					`Failed to remove ${itemName}: ${error.message}`,
					"error",
				);
				// TODO (Optimistic Update): Rollback the state change if the API call failed.
				// setData(originalData);
			});
	}, [itemToDeleteId, data, showNotification, handleCloseDialog]);

	// --- Memoized Render Logic ---

	// Memoized skeleton loading component.
	const memoizedSkeleton = useMemo(
		() => (
			<Box sx={{ p: 2 }}>
				<Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
				<Skeleton variant="text" height={40} sx={{ mb: 1 }} />
				<Skeleton variant="text" height={40} sx={{ mb: 1 }} />
				<Skeleton variant="rectangular" height={120} />
			</Box>
		),
		[],
	);

	// Memoized main content stack.
	// NOTE: The dependency array below is large and includes most state/handlers.
	// This ensures correctness but might be overly sensitive to changes. Consider refining if performance issues arise.
	const memoizedStack = useMemo(
		() => (
			<Stack>
				{/* Initial Loading State */}
				{loading && data.length === 0 && !error && memoizedSkeleton}

				{/* Error State */}
				{error && !loading && (
					<Fade in={true} timeout={500}>
						<Alert
							severity="error"
							variant="standard"
							action={
								<Button color="inherit" size="small" onClick={fetchPizzaData}>
									RETRY
								</Button>
							}
						>
							Failed to load data:{" "}
							{error?.message || "An unknown error occurred."} Please try again.
						</Alert>
					</Fade>
				)}
				{/* Content Display */}
				{(!loading || memoizedData.length > 0) && !error && (
					<Fade in={!loading || memoizedData.length > 0} timeout={500}>
						<Box>
							{/* CUD Loading Indicator (shown over content) */}
							{loading && memoizedData.length > 0 && (
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										mb: 2,
										position: "absolute",
										top: 80,
										left: "50%",
										transform: "translateX(-50%)",
										zIndex: 1,
									}}
								>
									<CircularProgress size={24} />
								</Box>
							)}
							{/* Render the list component, passing data and handlers */}
							<PizzaList
								name={term}
								data={memoizedData}
								loading={loading}
								onCreate={handleCreate}
								onUpdate={handleUpdate}
								onDelete={handleDeleteRequest}
								onRefresh={fetchPizzaData}
							/>
						</Box>
					</Fade>
				)}
				{/* Notification Snackbar */}
				<Snackbar
					open={notification.open}
					autoHideDuration={4000}
					onClose={handleCloseNotification}
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				>
					<Alert
						onClose={handleCloseNotification}
						severity={notification.severity}
						sx={{ width: "100%" }}
					>
						{notification.message}
					</Alert>
				</Snackbar>
				{/* Delete Confirmation Dialog */}
				<Dialog open={dialogOpen} onClose={handleCloseDialog}>
					<DialogTitle>Delete {term}</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Are you sure you want to delete this {term.toLowerCase()}?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseDialog}>Cancel</Button>
						<Button onClick={handleConfirmDelete} color="error">
							Delete
						</Button>
					</DialogActions>
				</Dialog>
			</Stack>
		),
		[
			loading,
			data.length,
			error,
			memoizedSkeleton,
			fetchPizzaData,
			memoizedData,
			handleCreate,
			handleUpdate,
			handleDeleteRequest,
			notification.open,
			notification.severity,
			notification.message,
			handleCloseNotification,
			dialogOpen,
			handleCloseDialog,
			handleConfirmDelete,
		],
	);

	return memoizedStack;
});

export default Pizza;
