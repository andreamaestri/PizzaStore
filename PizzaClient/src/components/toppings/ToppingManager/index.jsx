import {
	Add as AddIcon,
	Close as CloseIcon,
	Search as SearchIcon,
} from "@mui/icons-material";
import {
	Alert,
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Fade,
	IconButton,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import React, { memo, useState, useCallback, useMemo } from "react";
import { FetchStatus, SortType } from "../../../constants/toppingConstants";
import { useToppingManager } from "../../../hooks/useToppingManager";
import ToppingTable from "./ToppingTable";
import ToppingToolbar from "./ToppingToolbar";

const ToppingManager = () => {
	const {
		// --- State from useToppingManager ---
		toppings,
		recentToppings,
		filterText,
		currentSortType,
		selected,
		editMode,
		editState,
		deleteDialog,
		fetchState,
		mutationLoading,
		order,
		orderBy,

		// --- Setters from useToppingManager ---
		setFilterText,
		setCurrentSortType,
		setDeleteDialog,
		setOrder,
		setOrderBy,

		// --- Handlers from useToppingManager ---
		handleAddTopping,
		handleStartEdit,
		handleSaveEdit,
		handleCancelEdit,
		handleDelete,
		fetchToppings,
		handleRequestSort,
		handleRowClick,
	} = useToppingManager();

	// Maps the custom SortType to the table's order/orderBy state.
	const handleToolbarSortChange = useCallback(
		(newSortType) => {
			setCurrentSortType(newSortType);
			switch (newSortType) {
				case SortType.ALPHA_DESC:
					setOrderBy("name");
					setOrder("desc");
					break;
				case SortType.MOST_USED:
					setOrderBy("usage");
					setOrder("desc");
					break;
				case SortType.RECENT:
					setOrderBy("name");
					setOrder("asc");
					break;
				default:
					setOrderBy("name");
					setOrder("asc");
			}
		},
		[setCurrentSortType, setOrder, setOrderBy],
	);

	// Memoize the toppings array for performance.
	const memoizedToppings = useMemo(() => toppings, [toppings]);

	// --- Local State for Add Topping Dialog ---
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [newToppingName, setNewToppingName] = useState("");
	const [toppingError, setToppingError] = useState("");

	const isLoading =
		fetchState.status === FetchStatus.LOADING || mutationLoading;
	const isError = fetchState.status === FetchStatus.FAILED;
	const errorMsg = fetchState.error;

	// --- Dialog Handlers ---
	const handleOpenAddDialog = useCallback(() => {
		setNewToppingName("");
		setToppingError("");
		setAddDialogOpen(true);
	}, []);

	const handleCloseAddDialog = useCallback(() => {
		setAddDialogOpen(false);
		setNewToppingName("");
		setToppingError("");
	}, []);

	const handleToppingNameChange = useCallback(
		(e) => {
			setNewToppingName(e.target.value);
			if (toppingError) setToppingError("");
		},
		[toppingError],
	);

	const handleSubmitNewTopping = useCallback(() => {
		const trimmedName = newToppingName.trim();

		if (!trimmedName) {
			setToppingError("Topping name cannot be empty");
			return;
		}

		// Basic validation: Check if the topping name already exists (case-insensitive).
		if (
			toppings.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())
		) {
			setToppingError("This topping already exists");
			return;
		}

		handleAddTopping(trimmedName);
		handleCloseAddDialog();
	}, [newToppingName, toppings, handleAddTopping, handleCloseAddDialog]);

	// Memoized callback for clearing the filter text.
	const handleClearFilter = useCallback(() => {
		setFilterText("");
	}, [setFilterText]);

	// Memoized callback to open the delete confirmation for a single topping.
	const handleDeleteRequest = useCallback(
		(name) => {
			setDeleteDialog({ open: true, toppingName: name, isBulk: false });
		},
		[setDeleteDialog],
	);

	// Memoized callback to open the delete confirmation for selected toppings.
	const handleDeleteSelected = useCallback(() => {
		setDeleteDialog({ open: true, toppingName: null, isBulk: true });
	}, [setDeleteDialog]);

	// --- Memoized UI Renderers ---
	const renderLoading = useMemo(
		() => (
			<Fade in={true} timeout={500}>
				<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
					<CircularProgress />
				</Box>
			</Fade>
		),
		[],
	);

	const renderError = useMemo(
		() => (
			<Fade in={true} timeout={500}>
				<Alert
					severity="error"
					action={
						<Button color="inherit" size="small" onClick={fetchToppings}>
							RETRY
						</Button>
					}
					sx={{ mb: 2 }}
				>
					Failed to load data: {errorMsg || "An unknown error occurred."}
				</Alert>
			</Fade>
		),
		[fetchToppings, errorMsg],
	);
	const renderEmptyState = useMemo(
		() => (
			<Paper
				elevation={0}
				variant="outlined"
				sx={{
					borderRadius: 2,
					p: 3,
					textAlign: "center",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<SearchIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
				<Typography variant="body1" color="text.secondary">
					{filterText ? "No toppings match search" : "No toppings added yet"}
				</Typography>
				{!filterText && toppings.length === 0 && (
					<Button
						startIcon={<AddIcon />}
						color="primary"
						variant="text"
						size="small"
						sx={{ mt: 1 }}
						onClick={handleOpenAddDialog}
					>
						Add First Topping
					</Button>
				)}
			</Paper>
		),
		[filterText, toppings.length, handleOpenAddDialog],
	);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
			{/* Global backdrop for indicating background mutation operations (save/delete). */}
			<Backdrop
				sx={{
					color: "common.white",
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={mutationLoading}
			>
				{useMemo(
					() => (
						<CircularProgress color="inherit" />
					),
					[],
				)}
			</Backdrop>

			{/* Render the non-scrollable toolbar area. */}
			<ToppingToolbar
				numSelected={selected.length}
				filterText={filterText}
				onFilterTextChange={setFilterText}
				onClearFilter={handleClearFilter}
				sortType={currentSortType}
				onSortChange={handleToolbarSortChange}
				loading={isLoading}
				onDeleteSelected={handleDeleteSelected}
				onAddTopping={handleOpenAddDialog}
				onRefresh={fetchToppings}
			/>

			{/* Render the main scrollable content area. */}
			<Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
				{/* Display loading indicator only on initial load when there's no data yet. */}
				{fetchState.status === FetchStatus.LOADING &&
					memoizedToppings.length === 0 &&
					renderLoading}

				{/* Display error message if fetching failed. */}
				{isError && renderError}

				{/* Display the table or an empty state message. */}
				{fetchState.status !== FetchStatus.LOADING &&
					!isError &&
					(memoizedToppings.length === 0 ? (
						renderEmptyState
					) : (
						<div>
							<ToppingTable
								toppingsData={memoizedToppings}
								order={order}
								orderBy={orderBy}
								selected={selected}
								onRowClick={handleRowClick}
								onRequestSort={handleRequestSort}
								onEditStart={handleStartEdit}
								onEditSave={handleSaveEdit}
								onEditCancel={handleCancelEdit}
								onDeleteRequest={handleDeleteRequest}
								editMode={editMode}
								editState={editState}
								loading={isLoading}
								recentToppings={recentToppings}
							/>
						</div>
					))}
			</Box>

			{/* --- Dialogs --- */}
			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialog.open}
				onClose={() =>
					setDeleteDialog({ open: false, toppingName: null, isBulk: false })
				}
				aria-labelledby="delete-topping-dialog-title"
				aria-describedby="delete-topping-dialog-description"
			>
				<DialogTitle id="delete-topping-dialog-title">
					{deleteDialog.isBulk
						? `Delete ${selected.length} Toppings?`
						: "Delete Topping?"}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-topping-dialog-description">
						{deleteDialog.isBulk
							? `Are you sure you want to delete ${selected.length} selected toppings? `
							: `Are you sure you want to delete "${deleteDialog.toppingName}"? `}
						This will remove the topping(s) from all pizzas that use it. This
						action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						onClick={() =>
							setDeleteDialog({ open: false, toppingName: null, isBulk: false })
						}
						variant="text"
					>
						Cancel
					</Button>
					<Button
						onClick={() => {
							const toppingsToDelete = deleteDialog.isBulk
								? selected
								: [deleteDialog.toppingName];
							handleDelete(toppingsToDelete);
							setDeleteDialog({
								open: false,
								toppingName: null,
								isBulk: false,
							});
						}}
						color="error"
						variant="contained"
						autoFocus
						disabled={isLoading}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={addDialogOpen}
				onClose={handleCloseAddDialog}
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle>
					Add New Topping{" "}
					<IconButton
						aria-label="close"
						onClick={handleCloseAddDialog}
						sx={{
							position: "absolute",
							right: 8,
							top: 8,
							color: "text.secondary", // Use theme token for dark mode compatibility
						}}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						label="Topping Name"
						fullWidth
						variant="outlined"
						value={newToppingName}
						onChange={handleToppingNameChange}
						error={!!toppingError}
						helperText={toppingError}
						placeholder="Enter topping name"
						sx={{ mt: 1 }}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								handleSubmitNewTopping();
							}
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button onClick={handleCloseAddDialog} variant="text">
						Cancel
					</Button>
					<Button
						onClick={handleSubmitNewTopping}
						variant="contained"
						color="primary"
						disabled={!newToppingName.trim() || !!toppingError}
					>
						Add Topping
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default memo(ToppingManager);
