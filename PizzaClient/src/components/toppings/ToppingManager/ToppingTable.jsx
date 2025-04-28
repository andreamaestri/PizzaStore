import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useMemo, useCallback } from "react";

const ToppingTable = ({
	toppingsData,
	order,
	orderBy,
	selected,
	onRowClick,
	onRequestSort,
	onEditStart,
	onEditSave,
	onEditCancel,
	onDeleteRequest,
	editMode,
	editState,
	loading,
	recentToppings,
}) => {
	// Memoize the delete request handler passed down from the parent.
	const memoizedOnDeleteRequest = useCallback(
		(name) => {
			onDeleteRequest(name);
		},
		[onDeleteRequest],
	);

	// Memoize the function to get the unique ID for each row (using topping name).
	const getRowId = useCallback((row) => row.id, []);

	// Memoize the processed rows array for the DataGrid.
	const rows = useMemo(
		() =>
			toppingsData.map((row) => ({
				id: row.name, // Use name as the unique ID for DataGrid rows.
				name: row.name,
				usage: row.usage,
				isNew: recentToppings.includes(row.name),
				editState: editState[row.name] || { text: "", error: null },
				isEditing: !!editMode[row.name],
			})),
		[toppingsData, recentToppings, editMode, editState],
	);

	// Memoize the column definitions for the DataGrid.
	const columns = useMemo(
		() => [
			{
				field: "name",
				headerName: "Topping Name",
				flex: 1.5,
				minWidth: 180,
				renderCell: (params) => {
					const { isEditing, editState, name, isNew } = params.row;

					// Memoize sx prop for the cell container Box.
					const boxSx = useMemo(
						() => ({
							display: "flex",
							alignItems: "center",
							minHeight: 40,
						}),
						[],
					);

					if (isEditing) {
						// Memoize sx prop for the input container Box in edit mode.
						const inputBoxSx = useMemo(
							() => ({
								display: "flex",
								alignItems: "center",
								width: "100%",
							}),
							[],
						);

						return (
							<Box sx={inputBoxSx}>
								<input
									style={{
										flex: 1,
										fontSize: 16,
										padding: 4,
										borderRadius: 4,
										border: "1px solid #ccc",
									}}
									value={editState.text}
									onChange={(e) => onEditStart(name, e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") onEditSave(name, editState.text);
										if (e.key === "Escape") onEditCancel(name);
									}}
									disabled={loading}
								/>
								{editState.error && (
									<span style={{ color: "red", fontSize: 12, marginLeft: 8 }}>
										{editState.error}
									</span>
								)}
							</Box>
						);
					}
					return (
						<Box sx={boxSx}>
							{name}
							{isNew && (
								<Chip
									label="New"
									size="small"
									color="info"
									sx={{ fontSize: "0.65rem", height: 18, ml: 1 }}
								/>
							)}
						</Box>
					);
				},
				sortable: true,
			},
			{
				field: "usage",
				headerName: "Usage Count",
				align: "right",
				headerAlign: "right",
				flex: 1,
				minWidth: 120,
				renderCell: (params) => (
					<Chip
						label={params.value}
						size="small"
						color={params.value > 2 ? "primary" : "default"}
						variant={params.value > 2 ? "filled" : "outlined"}
					/>
				),
				sortable: true,
			},
			{
				field: "actions",
				headerName: "Actions",
				flex: 1,
				minWidth: 140,
				align: "right",
				headerAlign: "right",
				sortable: false,
				disableReorder: true, // Prevent the actions column from being reordered.
				renderCell: (params) => {
					const { isEditing, name, editState } = params.row;

					// Memoize sx prop for the actions container Box.
					const actionsBoxSx = useMemo(
						() => ({
							display: "flex",
							justifyContent: "flex-end",
							alignItems: "center",
							width: "100%",
							gap: 1,
						}),
						[],
					);

					if (isEditing) {
						// Memoize inline handlers for save/cancel actions.
						const handleSave = useCallback(
							() => onEditSave(name, editState.text),
							[onEditSave, name, editState.text],
						);
						const handleCancel = useCallback(
							() => onEditCancel(name),
							[onEditCancel, name],
						);

						return (
							<Box sx={actionsBoxSx}>
								<Tooltip title="Save changes">
									<span>
										<IconButton
											color="primary"
											size="small"
											onClick={handleSave}
											disabled={loading || !editState.text?.trim()}
										>
											<DoneIcon fontSize="small" />
										</IconButton>
									</span>
								</Tooltip>
								<Tooltip title="Cancel editing">
									<span>
										<IconButton
											size="small"
											onClick={handleCancel}
											disabled={loading}
										>
											<CloseIcon fontSize="small" />
										</IconButton>
									</span>
								</Tooltip>
							</Box>
						);
					}

					// Memoize inline handlers for edit/delete actions.
					const handleEdit = useCallback(
						() => onEditStart(name, name),
						[onEditStart, name],
					);
					const handleDelete = useCallback(
						() => memoizedOnDeleteRequest(name),
						[memoizedOnDeleteRequest, name],
					);

					return (
						<Box sx={actionsBoxSx}>
							<Tooltip title="Edit topping name">
								<span>
									<IconButton
										size="small"
										color="primary"
										onClick={handleEdit}
										disabled={loading}
									>
										<EditIcon fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
							<Tooltip title="Remove topping">
								<span>
									<IconButton
										size="small"
										color="error"
										onClick={handleDelete}
										disabled={loading}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</span>
							</Tooltip>
						</Box>
					);
				},
			},
		],
		[
			onEditStart,
			onEditSave,
			onEditCancel,
			loading,
			memoizedOnDeleteRequest,
			editState,
		],
	);

	// Memoize the initial sorting state for the DataGrid.
	const initialState = useMemo(
		() => ({
			sorting: {
				sortModel: [{ field: orderBy, sort: order }],
			},
		}),
		[orderBy, order],
	);

	// Memoize the handler for sort model changes from the DataGrid.
	const handleSortModelChange = useCallback(
		(model) => {
			if (model[0]) {
				onRequestSort(null, model[0].field);
			}
		},
		[onRequestSort],
	);

	// Memoize the available page size options.
	const memoizedPageSizeOptions = useMemo(() => [10, 25, 50], []);

	// Memoize the selection model based on the parent's selected state.
	const selectionModel = useMemo(() => selected, [selected]);

	// Handles selection changes from the DataGrid checkbox clicks.
	const handleSelectionModelChange = useCallback(
		(newSelection) => {
			// DataGrid provides an array of selected row IDs (topping names).
			if (onRowClick) {
				// Simulate a single row click for compatibility with the parent's selection logic.
				// Determine if a row was added or removed from the selection.
				if (newSelection.length > selected.length) {
					const added = newSelection.find((id) => !selected.includes(id));
					if (added) onRowClick({ target: {} }, added);
				} else {
					const removed = selected.find((id) => !newSelection.includes(id));
					if (removed) onRowClick({ target: {} }, removed);
				}
			}
		},
		[onRowClick, selected],
	);

	// Memoize sx prop for the outer container Box.
	const outerBoxSx = useMemo(
		() => ({
			width: "100%",
			height: "100%",
		}),
		[],
	);

	// Memoize sx prop for styling the DataGrid component itself.
	const dataGridSx = useMemo(
		() => ({
			borderRadius: 2,
			borderColor: "divider",
			"& .MuiDataGrid-cell:focus": { outline: "none" },
			height: "100%",
			// Custom scrollbar styling for a cleaner look.
			"& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
				width: "8px",
			},
			"& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
				background: "transparent",
			},
			"& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
				backgroundColor: (theme) =>
					theme.palette.mode === "light" ? "#BDBDBD" : "#666666",
				borderRadius: "4px",
			},
			"& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover": {
				backgroundColor: (theme) =>
					theme.palette.mode === "light" ? "#9E9E9E" : "#888888",
			},
		}),
		[],
	);

	return (
		<Box sx={outerBoxSx}>
			<DataGrid
				rows={rows}
				columns={columns}
				checkboxSelection
				disableRowSelectionOnClick
				selectionModel={selectionModel}
				onRowSelectionModelChange={handleSelectionModelChange}
				loading={loading}
				disableColumnMenu
				pageSizeOptions={memoizedPageSizeOptions}
				initialState={initialState}
				onSortModelChange={handleSortModelChange}
				sx={dataGridSx}
				getRowId={getRowId}
			/>
		</Box>
	);
};

export default ToppingTable;
