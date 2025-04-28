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
import PizzaList from "./PizzaList"; // Component responsible for displaying the list and handling individual item interactions.

// --- Configuration Constants ---

// Defines the singular term used throughout the UI for this data entity.
const ENTITY_TERM = "Pizza";
// Base endpoint for the API calls related to this entity.
const API_BASE_URL = "/api/pizzas";
// Standard headers for API requests. Content-Type is essential for JSON payloads.
// Add authentication headers (e.g., 'Authorization') here if required by the API.
const API_HEADERS = {
    "Content-Type": "application/json",
    // Example: 'Authorization': `Bearer ${yourAuthToken}`
};

// --- Main Component: Pizza Data Management ---

/**
 * `Pizza` component manages the state and interactions for a collection of pizza data.
 * It handles fetching data from an API, performing CRUD operations (Create, Update, Delete),
 * displaying loading/error states, and providing user feedback via notifications and dialogs.
 *
 * This component acts as the data orchestration layer, passing data and handlers down
 * to presentational components like `PizzaList`.
 */
const Pizza = memo(function Pizza() {
    // --- Component State Management ---

    // Holds the array of pizza objects fetched from the API. Initialized as an empty array.
    const [pizzaData, setPizzaData] = useState([]);
    // Stores any error object that occurs during API interactions. Null when no error is present.
    const [apiError, setApiError] = useState(null);
    // Boolean flag indicating whether an asynchronous operation (fetching, creating, updating, deleting) is currently in progress.
    const [isLoading, setIsLoading] = useState(true);
    // State for controlling the visibility and content of the Snackbar notification.
    const [notificationState, setNotificationState] = useState({
        isOpen: false,
        message: "",
        severity: "success", // Can be 'success', 'error', 'warning', 'info'
    });
    // Boolean flag controlling the visibility of the delete confirmation dialog.
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    // Stores the unique identifier of the item currently pending deletion confirmation. Null if no item is pending deletion.
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState(null);

    // --- Utility Callbacks ---

    /**
     * Displays a Snackbar notification with a specified message and severity.
     * @param {string} message - The message text to display in the notification.
     * @param {'success' | 'error' | 'warning' | 'info'} [severity='success'] - The type of notification, affecting its appearance.
     */
    const displayNotification = useCallback((message, severity = "success") => {
        setNotificationState({ isOpen: true, message, severity });
    }, []);

    /**
     * Closes the Snackbar notification.
     * Prevents closing if the event reason is 'clickaway' to ensure messages are read.
     * @param {object} event - The event object.
     * @param {string} reason - The reason the notification is being closed ('timeout', 'clickaway', etc.).
     */
    const handleCloseNotification = useCallback(
        (event, reason) => {
            if (reason === "clickaway") {
                return;
            }
            setNotificationState({ ...notificationState, isOpen: false });
        },
        [notificationState],
    );

    /**
     * Closes the delete confirmation dialog and resets the ID of the item pending deletion.
     */
    const closeDeleteDialog = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setPendingDeleteItemId(null);
    }, []);

    // --- Data Fetching Logic ---

    /**
     * Initiates the process of fetching pizza data from the configured API endpoint.
     * Manages loading state, handles successful data retrieval, and captures/reports errors.
     * Includes a timeout mechanism to prevent indefinite loading.
     */
    const fetchPizzaData = useCallback(() => {
        setIsLoading(true);
        setApiError(null); // Clear any previous errors before attempting a new fetch.

        const abortController = new AbortController();
        // Set a timeout to automatically abort the fetch request if it takes too long.
        const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5-second timeout

        fetch(API_BASE_URL, { signal: abortController.signal })
            .then((response) => {
                clearTimeout(timeoutId); // Clear the timeout if the fetch completes within the limit.
                if (!response.ok) {
                    // Throw an error for non-2xx HTTP responses.
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // Parse the JSON response body.
            })
            .then((data) => {
                setPizzaData(data); // Update state with the fetched data.
                setIsLoading(false); // End loading state.
            })
            .catch((error) => {
                clearTimeout(timeoutId); // Ensure timeout is cleared even on error.
                let userFacingError = error;
                // Provide a more user-friendly message for timeout errors.
                if (error.name === "AbortError") {
                    userFacingError = new Error("Request timed out. Please check your connection and try again.");
                }
                console.error("Data fetch error:", userFacingError);
                setApiError(userFacingError); // Store the error object in state.
                setIsLoading(false); // End loading state.
                // Notify the user about the fetch failure.
                displayNotification(
                    `Failed to load ${ENTITY_TERM} data: ${userFacingError.message}`,
                    "error",
                );
            });

        // Cleanup function for useEffect to clear the timeout if the component unmounts.
        return () => clearTimeout(timeoutId);
    }, [displayNotification]); // Dependency on displayNotification callback.

    // Effect hook to perform the initial data fetch when the component mounts.
    // The dependency array ensures this runs only once on mount (or if fetchPizzaData changes, though it's stable).
    useEffect(() => {
        fetchPizzaData();
    }, [fetchPizzaData]);

    // --- CRUD Operation Handlers ---

    /**
     * Handles the creation of a new pizza item.
     * Sends a POST request to the API with the new item data.
     * Updates the local state upon successful creation and provides user feedback.
     * Includes basic error handling and notification.
     *
     * Note on Optimistic Updates: For improved user experience, consider implementing
     * optimistic updates. This would involve adding the new item to the local state
     * *before* the API call completes. If the API call fails, the state would then
     * be rolled back. This requires careful state management and rollback logic.
     * Current implementation waits for API confirmation before updating state.
     *
     * @param {object} newItem - The data object for the new item to be created.
     */
    const handleCreateItem = useCallback(
        (newItem) => {
            setIsLoading(true);
            setApiError(null);

            // Construct the payload for the POST request. Ensure property names and types
            // match the backend API's expected schema. Handle potential missing fields
            // or type conversions (like parsing baseId to a number).
            const payload = {
                name: newItem.name,
                description: newItem.description,
                baseId: Number.parseInt(newItem.baseId, 10) || 1, // Parse baseId as integer, default to 1 if invalid.
                toppings: newItem.toppings || [], // Ensure toppings is an array, default to empty array.
            };

            fetch(API_BASE_URL, {
                method: "POST",
                headers: API_HEADERS,
                body: JSON.stringify(payload),
            })
                .then((response) => {
                    if (!response.ok) {
                        // Attempt to read error body if available, otherwise use status text.
                        return response.json().catch(() => {
                            throw new Error(`API error: ${response.statusText}`);
                        }).then(errorData => {
                             throw new Error(`API error: ${errorData.message || response.statusText}`);
                        });
                    }
                    return response.json(); // Expect the API to return the newly created item (including its assigned ID).
                })
                .then((createdItem) => {
                    // Add the newly created item (with its server-assigned ID) to the local state.
                    setPizzaData((prevData) => [...prevData, createdItem]);
                    setIsLoading(false);
                    displayNotification(
                        `${createdItem.name || ENTITY_TERM} added successfully`,
                        "success",
                    );
                })
                .catch((error) => {
                    console.error("Create operation failed:", error);
                    setApiError(error);
                    setIsLoading(false);
                    displayNotification(
                        `Failed to add ${newItem.name || ENTITY_TERM}: ${error.message}`,
                        "error",
                    );
                    // If optimistic update was implemented, rollback the state change here.
                });
        },
        [displayNotification], // Dependency on displayNotification callback.
    );

    /**
     * Handles the update of an existing pizza item.
     * Sends a PUT request to the API for the specified item ID with the updated data.
     * Updates the local state upon successful update and provides user feedback.
     * Includes basic error handling and notification.
     *
     * Note on Optimistic Updates: Similar to creation, optimistic updates could be
     * applied here. Update the item in the local state *before* the API call, and
     * rollback if the call fails.
     *
     * @param {object} updatedItem - The data object for the item with updated values. Must include the item's ID.
     */
    const handleUpdateItem = useCallback(
        (updatedItem) => {
            setIsLoading(true);
            setApiError(null);

            // Store the original data of the item being updated for potential rollback
            // if optimistic updates were implemented.
            // const originalItem = pizzaData.find(item => item.id === updatedItem.id);

            // Construct the payload for the PUT request. Ensure all required fields
            // are included and correctly formatted, including the item's ID.
            const payload = {
                 // Ensure payload structure matches backend API requirements.
                id: updatedItem.id, // ID is crucial for identifying the item to update.
                name: updatedItem.name,
                description: updatedItem.description,
                baseId: Number.parseInt(updatedItem.baseId, 10) || 1,
                toppings: updatedItem.toppings || [],
            };

            fetch(`${API_BASE_URL}/${updatedItem.id}`, {
                method: "PUT",
                headers: API_HEADERS,
                body: JSON.stringify(payload),
            })
                .then((response) => {
                     if (!response.ok) {
                        return response.json().catch(() => {
                            throw new Error(`API error: ${response.statusText}`);
                        }).then(errorData => {
                             throw new Error(`API error: ${errorData.message || response.statusText}`);
                        });
                    }
                    // Assuming a successful PUT returns either a success status or the updated item.
                    // If it returns the updated item, you could use that instead of the local `updatedItem`.
                    // For simplicity, we'll use the local `updatedItem` here after confirming success.
                    return response.json().catch(() => ({})); // Handle cases where API returns no body on success.
                })
                .then(() => {
                    // Update the item in the local state after successful API confirmation.
                    setPizzaData((prevData) =>
                        prevData.map((item) =>
                            item.id === updatedItem.id ? updatedItem : item,
                        ),
                    );
                    setIsLoading(false);
                    displayNotification(
                        `${updatedItem.name || ENTITY_TERM} updated successfully`,
                        "success",
                    );
                })
                .catch((error) => {
                    console.error("Update operation failed:", error);
                    setApiError(error);
                    setIsLoading(false);
                    displayNotification(
                        `Failed to update ${updatedItem.name || ENTITY_TERM}: ${error.message}`,
                        "error",
                    );
                    // If optimistic update was implemented, rollback the state change here
                    // using the stored `originalItem`.
                    // setData(prevData => prevData.map(item => (item.id === originalItem.id ? originalItem : item)));
                });
        },
        [displayNotification], // Dependency on displayNotification callback.
    );

    /**
     * Initiates the deletion process for a specific item by ID.
     * Sets the ID of the item to be deleted and opens the confirmation dialog.
     * This separates the user action (clicking delete) from the API call, requiring confirmation.
     * @param {string | number} itemId - The unique identifier of the item to be deleted.
     */
    const requestDeleteItem = useCallback((itemId) => {
        setPendingDeleteItemId(itemId);
        setIsDeleteDialogOpen(true);
    }, []);

    /**
     * Executes the deletion of the item identified by `pendingDeleteItemId` after user confirmation.
     * Sends a DELETE request to the API.
     * Updates the local state by removing the deleted item upon successful API response.
     * Handles errors and provides user feedback.
     *
     * Note on Optimistic Updates: For deletion, optimistic updates are common.
     * Remove the item from the local state *before* the API call. If the call
     * fails, re-insert the item into the state.
     */
    const confirmDeleteItem = useCallback(() => {
        if (!pendingDeleteItemId) {
            // Should not happen if dialog logic is correct, but included as a safeguard.
            console.warn("Attempted to confirm delete without a pending item ID.");
            return;
        }

        // Find the item to get its name for the notification message before potential state update.
        const itemToDelete = pizzaData.find((item) => item.id === pendingDeleteItemId);
        const itemName = itemToDelete?.name || ENTITY_TERM;

        closeDeleteDialog(); // Close the dialog immediately upon confirmation.
        setIsLoading(true);
        setApiError(null);

        // Store the item data for potential rollback if optimistic updates were implemented.
        // const itemToRollback = itemToDelete;
        // const originalIndex = pizzaData.findIndex(item => item.id === pendingDeleteItemId);

        // Optimistic Update (Example - currently commented out):
        // Remove the item from the local state immediately.
        // setPizzaData(prevData => prevData.filter(item => item.id !== pendingDeleteItemId));


        fetch(`${API_BASE_URL}/${pendingDeleteItemId}`, {
            method: "DELETE",
            headers: API_HEADERS, // DELETE requests might not always need a body, but headers are often required.
        })
            .then((response) => {
                 if (!response.ok) {
                     return response.json().catch(() => {
                        throw new Error(`API error: ${response.statusText}`);
                    }).then(errorData => {
                         throw new Error(`API error: ${errorData.message || response.statusText}`);
                    });
                }
                // If the API call is successful, update the local state by filtering out the item.
                // This step is redundant if optimistic update is active, but necessary otherwise.
                setPizzaData((prevData) =>
                    prevData.filter((item) => item.id !== pendingDeleteItemId),
                );
                setIsLoading(false);
                displayNotification(`${itemName} removed successfully`, "success");
                setPendingDeleteItemId(null); // Reset pending ID after successful deletion.
            })
            .catch((error) => {
                console.error("Delete operation failed:", error);
                setApiError(error);
                setIsLoading(false);
                displayNotification(
                    `Failed to remove ${itemName}: ${error.message}`,
                    "error",
                );
                // If optimistic update was implemented, rollback the state change here.
                // Re-insert the item at its original position.
                // setPizzaData(prevData => {
                //     const newData = [...prevData];
                //     newData.splice(originalIndex, 0, itemToRollback);
                //     return newData;
                // });
                setPendingDeleteItemId(null); // Reset pending ID even on error.
            });
    }, [pendingDeleteItemId, pizzaData, displayNotification, closeDeleteDialog]); // Dependencies include state used and callbacks.

    // --- Memoized Render Elements ---

    // Memoizes the skeleton loading state UI to prevent unnecessary re-renders.
    const memoizedSkeletonLoader = useMemo(
        () => (
            <Box sx={{ p: 2 }}>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={120} />
            </Box>
        ),
        [], // Empty dependency array ensures this is created only once.
    );

    // Memoizes the main content stack, including conditional rendering logic
    // for loading, error, and data display states.
    // The dependency array includes all state variables and handlers that
    // the rendering logic or child components depend on. While potentially large,
    // this ensures the memoized output is updated when necessary.
    const memoizedContent = useMemo(
        () => (
            <Stack>
                {/* Conditional rendering: Show skeleton while initially loading and no data is present */}
                {isLoading && pizzaData.length === 0 && !apiError && memoizedSkeletonLoader}

                {/* Conditional rendering: Show error message if an API error occurred and not currently loading */}
                {apiError && !isLoading && (
                    <Fade in={true} timeout={500}>
                        <Alert
                            severity="error"
                            variant="standard"
                            action={
                                // Provide a retry button when an error occurs
                                <Button color="inherit" size="small" onClick={fetchPizzaData}>
                                    RETRY
                                </Button>
                            }
                        >
                            Failed to load data:{" "}
                            {apiError?.message || "An unknown error occurred."} Please try again.
                        </Alert>
                    </Fade>
                )}

                {/* Conditional rendering: Show data list if data is available or if loading is complete and no error */}
                {(!isLoading || pizzaData.length > 0) && !apiError && (
                    <Fade in={!isLoading || pizzaData.length > 0} timeout={500}>
                        <Box>
                            {/* Show a small loading indicator overlaying the content during CUD operations */}
                            {isLoading && pizzaData.length > 0 && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        mb: 2,
                                        position: "absolute", // Position absolutely relative to the parent Box
                                        top: 80, // Adjust positioning as needed
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        zIndex: 1, // Ensure indicator is above the list
                                    }}
                                >
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                            {/* Render the PizzaList component, passing necessary data and handlers */}
                            <PizzaList
                                entityName={ENTITY_TERM} // Pass the entity term for display in the list component
                                data={pizzaData} // Pass the fetched pizza data
                                isLoading={isLoading} // Pass loading state (useful for disabling forms/buttons in list)
                                onCreate={handleCreateItem} // Pass the create handler
                                onUpdate={handleUpdateItem} // Pass the update handler
                                onDeleteRequest={requestDeleteItem} // Pass the handler to request deletion (opens dialog)
                                onRefresh={fetchPizzaData} // Pass the fetch handler to allow refreshing from the list
                            />
                        </Box>
                    </Fade>
                )}

                {/* Snackbar component for displaying notifications */}
                <Snackbar
                    open={notificationState.isOpen}
                    autoHideDuration={4000} // Notification automatically hides after 4 seconds
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }} // Position the snackbar at the bottom center
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notificationState.severity}
                        sx={{ width: "100%" }}
                    >
                        {notificationState.message}
                    </Alert>
                </Snackbar>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                    <DialogTitle>Confirm Delete {ENTITY_TERM}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this {ENTITY_TERM.toLowerCase()}? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        {/* Cancel button closes the dialog */}
                        <Button onClick={closeDeleteDialog}>Cancel</Button>
                        {/* Delete button confirms the action and triggers the delete API call */}
                        <Button onClick={confirmDeleteItem} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        ),
        [
            isLoading, // Re-render if loading state changes
            pizzaData, // Re-render if pizza data changes (new item, update, delete)
            apiError, // Re-render if an API error occurs
            memoizedSkeletonLoader, // Dependency for the skeleton UI element
            fetchPizzaData, // Dependency for the retry button action
            handleCreateItem, // Dependency for passing to PizzaList
            handleUpdateItem, // Dependency for passing to PizzaList
            requestDeleteItem, // Dependency for passing to PizzaList
            notificationState.isOpen, // Re-render if notification visibility changes
            notificationState.severity, // Re-render if notification severity changes
            notificationState.message, // Re-render if notification message changes
            handleCloseNotification, // Dependency for passing to Snackbar/Alert
            isDeleteDialogOpen, // Re-render if dialog visibility changes
            closeDeleteDialog, // Dependency for dialog close action
            confirmDeleteItem, // Dependency for dialog confirm action
        ],
    );

    // The component renders the memoized content stack.
    return memoizedContent;
});

// Export the component for use in other parts of the application.
export default Pizza;
