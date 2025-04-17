import { useState, useEffect, useCallback } from 'react';
import {
    Typography, Box, Alert, Snackbar, CircularProgress,
    Stack, Skeleton, Breadcrumbs, Link, Fade,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, // Dialog imports
    Card, Chip // Import Card and Chip for M3 look
} from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon, LocalPizza as PizzaIcon } from '@mui/icons-material'; // Added PizzaIcon
import PizzaList from './PizzaList'; // Assuming PizzaList component exists and handles display/form

// Constant for the item type, used in UI text (e.g., notifications, titles)
const term = "Pizza"; // Used for display text
// Base URL for the Pizza API endpoint
const API_URL = '/api/pizzas'; // Example API endpoint
// Default headers for API requests. Ensure 'Content-Type' matches API expectations
// Add 'Authorization' header if authentication is required
const headers = {
    'Content-Type': 'application/json',
    // Add any other required headers like Authorization if needed
};

function Pizza() {
    // State to hold the array of pizza data fetched from the API
    const [data, setData] = useState([]);
    // State to store any error object encountered during API calls
    const [error, setError] = useState(null);
    // State to indicate if a data fetching or CUD (Create, Update, Delete) operation is in progress
    const [loading, setLoading] = useState(true); // Loading state for fetch/CUD operations
    // State for managing the visibility, message, and severity of the notification Snackbar
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    // State to control the visibility of the delete confirmation dialog
    const [dialogOpen, setDialogOpen] = useState(false); // State for delete confirmation dialog
    // State to store the ID of the pizza item marked for deletion, pending confirmation
    const [itemToDeleteId, setItemToDeleteId] = useState(null); // ID of item pending deletion

    // --- Data Fetching ---
    // Fetches pizza data from the API using `useCallback` for memoization
    // Sets loading state, handles success, and catches errors
    // Clears previous errors on each fetch attempt
    const fetchPizzaData = useCallback(() => {
        setLoading(true);
        setError(null); // Clear previous errors on fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        fetch(API_URL, { signal: controller.signal })
            .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    error = new Error('Request timed out. Please try again.');
                }
                console.error("Fetch error:", error);
                setError(error);
                setLoading(false);
                showNotification(`Failed to load ${term} data: ${error.message}`, 'error');
            });
        return () => clearTimeout(timeoutId);
    }, []); // Empty dependency array means this runs once on mount and callback doesn't change

    // `useEffect` hook to trigger the initial data fetch when the component mounts.
    // Depends on `fetchPizzaData`, which is memoized by `useCallback`.
    useEffect(() => {
        fetchPizzaData();
    }, [fetchPizzaData]);
    
    // --- Notifications ---
    // Utility function to display a notification message via the Snackbar.
    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    // Handles closing the notification Snackbar. Prevents closing on 'clickaway'.
    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };
    
    // --- CRUD Handlers ---
    /* 
        Handles the creation of a new pizza item.
        Sends a POST request to the API.
        Updates local state on success, shows notification, handles errors.
        TODO: Consider implementing optimistic updates for a smoother UX:
        1. Add the new item to `data` state immediately.
        2. If the API call fails, remove the item from `data` and show an error.
    */
    const handleCreate = (item) => {
        setLoading(true);
        setError(null);
        // TODO: Consider Optimistic Update: Add item to local state immediately

        fetch(API_URL, {
            method: 'POST',
            headers,
            // Construct the payload for the POST request.
            // Ensure properties match the expected API schema.
            // Includes parsing for `baseId` and default for `toppings`.
            body: JSON.stringify({
                // Ensure payload matches API expectations
                name: item.name,
                description: item.description,
                baseId: parseInt(item.baseId) || 1, // Example default/parsing
                toppings: item.toppings || []
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to create item');
                return response.json();
            })
            .then(returnedItem => {
                setData(prevData => [...prevData, returnedItem]); // Update state with returned item
                setLoading(false);
                showNotification(`${item.name || term} added successfully`, 'success');
            })
            .catch(error => {
                console.error("Create error:", error);
                setError(error);
                setLoading(false);
                showNotification(`Failed to add ${item.name || term}: ${error.message}`, 'error');
                // TODO: Rollback Optimistic Update if implemented
            });
    };

    // Handles updating an existing pizza item.
    // Sends a PUT request to the API with the updated item data.
    // Updates local state on success, shows notification, handles errors.
    // Stores original data for potential rollback on error.
    // TODO: Consider implementing optimistic updates:
    // 1. Update the item in `data` state immediately.
    // 2. If the API call fails, revert the item in `data` to its original state.
    const handleUpdate = (updatedItem) => {
        setLoading(true);
        setError(null);
        const originalData = [...data]; // Store original data for potential rollback
        // TODO: Consider Optimistic Update: Update item in local state immediately
        // setData(data.map(item => item.id === updatedItem.id ? updatedItem : item));

        fetch(`${API_URL}/${updatedItem.id}`, {
            method: 'PUT',
            headers,
            // Construct the payload for the PUT request.
            // Ensure all required fields, including the ID, are present.
            body: JSON.stringify({
                // Ensure payload matches API expectations
                id: updatedItem.id,
                name: updatedItem.name,
                description: updatedItem.description,
                baseId: parseInt(updatedItem.baseId) || 1,
                toppings: updatedItem.toppings || []
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update item');
                // Assuming PUT returns the updated item or success status
                // If it returns the item, use it, otherwise update manually
                setData(prevData => prevData.map(item => item.id === updatedItem.id ? updatedItem : item)); // Update state
                setLoading(false);
                showNotification(`${updatedItem.name || term} updated successfully`, 'success');
            })
            .catch(error => {
                console.error("Update error:", error);
                setError(error);
                setLoading(false);
                showNotification(`Failed to update ${updatedItem.name || term}: ${error.message}`, 'error');
                // TODO: Rollback Optimistic Update if implemented
                // setData(originalData);
            });
    };

    // --- Delete Handling with Confirmation ---
    // Initiates the delete process by setting the item ID and opening the confirmation dialog.
    const handleDeleteRequest = (id) => {
        setItemToDeleteId(id);
        setDialogOpen(true); // Open confirmation dialog
    };

    // Closes the delete confirmation dialog and resets the item ID.
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setItemToDeleteId(null);
    };

    // Confirms and executes the deletion after user confirmation.
    // Sends a DELETE request to the API.
    // Updates local state on success by filtering out the deleted item.
    // Shows notification, handles errors.
    // Stores original data for potential rollback.
    // TODO: Consider implementing optimistic updates:
    // 1. Remove the item from `data` state immediately.
    // 2. If the API call fails, re-insert the item into `data`.
    const handleConfirmDelete = () => {
        if (!itemToDeleteId) return;

        const itemToDelete = data.find(item => item.id === itemToDeleteId);
        const itemName = itemToDelete?.name || term; // Get name for notification
        handleCloseDialog(); // Close dialog immediately
        setLoading(true);
        setError(null);
        const originalData = [...data];
        // TODO: Consider Optimistic Update: Remove item from local state immediately
        // setData(data.filter(item => item.id !== itemToDeleteId));

        fetch(`${API_URL}/${itemToDeleteId}`, {
            method: 'DELETE',
            headers,
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete item');
                // If successful, update state
                setData(prevData => prevData.filter(item => item.id !== itemToDeleteId));
                setLoading(false);
                showNotification(`${itemName} removed successfully`, 'success');
            })
            .catch(error => {
                console.error('Delete error:', error);
                setError(error);
                setLoading(false);
                showNotification(`Failed to remove ${itemName}: ${error.message}`, 'error');
                // TODO: Rollback Optimistic Update if implemented
                // setData(originalData);
            });
    };

    // --- Render Logic ---

    // More detailed Skeleton
    // Renders a skeleton loading state, providing visual feedback while data is initially loading.
    // Uses Fade transition for smoother appearance.
    const renderSkeleton = () => (
        <Fade in={true} timeout={500}>
            <Stack spacing={3}>
                {/* Skeleton for Form/Header */}
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                {/* Skeleton for Table */}
                <Stack spacing={1}>
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                </Stack>
            </Stack>
        </Fade>
    );

    return (
        <Stack>
            {/* --- Loading State (Initial) --- */}
            {loading && data.length === 0 && !error && renderSkeleton()}
            {/* --- Error State --- */}
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
                        Failed to load data: {error?.message || 'An unknown error occurred.'} Please try again.
                    </Alert>
                </Fade>
            )}
            {/* --- Content (PizzaList) --- */}
            {/* Render PizzaList only when not in initial loading state */}
            {(!loading || data.length > 0) && !error && (
                <Fade in={!loading || data.length > 0} timeout={500}>
                    <Box>
                        {/* Show subtle loading indicator during CUD operations if needed */}
                        {loading && data.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        {/* Alternative: Pass loading state to PizzaList to disable controls */}
                        {/* Renders the `PizzaList` component, passing down data, loading state, and CRUD handlers. */}
                        <PizzaList
                            name={term}
                            data={data}
                            loading={loading}
                            onCreate={handleCreate}
                            onUpdate={handleUpdate}
                            onDelete={handleDeleteRequest}
                            onRefresh={fetchPizzaData}
                        />
                    </Box>
                </Fade>
            )}
            {/* --- Notification Snackbar --- */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
            {/* --- Delete Confirmation Dialog --- */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Delete {term}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this {term.toLowerCase()}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

export default Pizza;
