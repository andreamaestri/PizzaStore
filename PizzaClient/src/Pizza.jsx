import { useState, useEffect, useCallback } from 'react';
import {
    Typography, Box, Alert, Snackbar, CircularProgress,
    Stack, Skeleton, Breadcrumbs, Link, Fade,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button // Dialog imports
} from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon, LocalPizza as PizzaIcon } from '@mui/icons-material'; // Added PizzaIcon
import PizzaList from './PizzaList'; // Assuming PizzaList component exists and handles display/form

const term = "Pizza"; // Used for display text
const API_URL = '/api/pizzas'; // Example API endpoint
const headers = {
    'Content-Type': 'application/json',
    // Add any other required headers like Authorization if needed
};

function Pizza() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state for fetch/CUD operations
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [dialogOpen, setDialogOpen] = useState(false); // State for delete confirmation dialog
    const [itemToDeleteId, setItemToDeleteId] = useState(null); // ID of item pending deletion

    // --- Data Fetching ---
    const fetchPizzaData = useCallback(() => {
        setLoading(true);
        setError(null); // Clear previous errors on fetch
        fetch(API_URL)
            .then(response => {
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
                console.error("Fetch error:", error);
                setError(error);
                setLoading(false);
                // Show persistent error or just notification
                showNotification(`Failed to load ${term} data: ${error.message}`, 'error');
            });
    }, []); // Empty dependency array means this runs once on mount and callback doesn't change

    useEffect(() => {
        fetchPizzaData();
    }, [fetchPizzaData]); // Depend on the stable callback

    // --- Notifications ---
    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
    };

    // --- CRUD Handlers ---
    const handleCreate = (item) => {
        setLoading(true);
        setError(null);
        // TODO: Consider Optimistic Update: Add item to local state immediately

        fetch(API_URL, {
            method: 'POST',
            headers,
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

    const handleUpdate = (updatedItem) => {
        setLoading(true);
        setError(null);
        const originalData = [...data]; // Store original data for potential rollback
        // TODO: Consider Optimistic Update: Update item in local state immediately
        // setData(data.map(item => item.id === updatedItem.id ? updatedItem : item));

        fetch(`${API_URL}/${updatedItem.id}`, {
            method: 'PUT',
            headers,
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
    const handleDeleteRequest = (id) => {
        setItemToDeleteId(id);
        setDialogOpen(true); // Open confirmation dialog
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setItemToDeleteId(null);
    };

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
                            // Alternative: Pass loading state to PizzaList to disable controls
                        )}
                        <PizzaList
                            name={term}
                            data={data}
                            // Pass loading state to potentially disable controls inside PizzaList
                            loading={loading && data.length > 0}
                            onCreate={handleCreate}
                            onUpdate={handleUpdate}
                            onDelete={handleDeleteRequest} // Use the request handler to trigger dialog
                            onRefresh={fetchPizzaData} // Allow manual refresh
                        />
                    </Box>
                 </Fade>
            )}

            {/* --- Notification Snackbar --- */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000} // Slightly longer duration
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                TransitionComponent={Fade} // Use Fade transition
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled" // Filled variant for better visibility (M3 style)
                    elevation={6} // Standard elevation for Snackbar Alert
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* --- Delete Confirmation Dialog --- */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove the pizza "{data.find(item => item.id === itemToDeleteId)?.name || 'this item'}" from the menu? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    {/* M3: Cancel button is often text */}
                    <Button onClick={handleCloseDialog} variant="text">
                        Cancel
                    </Button>
                    {/* M3: Destructive action often uses error color */}
                    <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

export default Pizza;
