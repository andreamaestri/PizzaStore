import { useCallback, useEffect, useState } from "react";
import {
	FetchStatus,
	RECENT_TOPPINGS_LIMIT,
	SortType,
} from "../constants/toppingConstants";
import toppingService from "../services/api/toppingService";
import {
	filterToppings,
	sortAlphabetically,
	sortByRecent,
	sortByUsage,
	toppingExists,
} from "../utils/sortUtils";

/**
 * Custom hook for managing topping data and operations
 * @returns {Object} Topping manager state and handlers
 */
export function useToppingManager() {
	// --- Core State ---
	const [toppings, setToppings] = useState([]);
	const [recentToppings, setRecentToppings] = useState([]);
	const [fetchState, setFetchState] = useState({
		status: FetchStatus.IDLE,
		error: null,
	});
	const [mutationLoading, setMutationLoading] = useState(false);

	// --- UI State ---
	const [filterText, setFilterText] = useState("");
	const [currentSortType, setCurrentSortType] = useState(SortType.ALPHA_ASC);
	const [selected, setSelected] = useState([]);
	const [editMode, setEditMode] = useState({});
	const [editState, setEditState] = useState({});
	const [deleteDialog, setDeleteDialog] = useState({
		open: false,
		toppingName: null,
		isBulk: false,
	});

	// --- Table State ---
	const [order, setOrder] = useState("asc");
	const [orderBy, setOrderBy] = useState("name");

	// Fetches toppings data by processing pizza information.
	const fetchToppings = useCallback(async () => {
		setFetchState({ status: FetchStatus.LOADING, error: null });
		setSelected([]); // Clear selection on refresh

		try {
			const pizzasData = await toppingService.fetchPizzas();
			const processedToppings = processPizzaData(pizzasData);
			setToppings(processedToppings);
			setFetchState({ status: FetchStatus.SUCCEEDED, error: null });
		} catch (error) {
			console.error("Error fetching toppings:", error);
			setFetchState({
				status: FetchStatus.FAILED,
				error: error.message || "Failed to load toppings",
			});
		}
	}, []);

	// Processes raw pizza data to extract unique toppings and their usage counts.
	const processPizzaData = useCallback((pizzasData) => {
		const allToppings = pizzasData
			.flatMap((pizza) => pizza.toppings || [])
			.map((t) => t?.trim())
			.filter(Boolean);

		const usageCount = {};
		const uniqueToppingsMap = new Map();

		allToppings.forEach((topping) => {
			const lowerCaseTopping = topping.toLowerCase();
			usageCount[lowerCaseTopping] = (usageCount[lowerCaseTopping] || 0) + 1;
			if (!uniqueToppingsMap.has(lowerCaseTopping)) {
				uniqueToppingsMap.set(lowerCaseTopping, topping);
			}
		});

		return Array.from(uniqueToppingsMap.values()).map((name) => ({
			name,
			usage: usageCount[name.toLowerCase()] || 0,
		}));
	}, []);

	// Filters and sorts the toppings based on current UI settings.
	const processedToppings = useCallback(() => {
		let processed = [...toppings];

		// Apply text filter if present.
		if (filterText) {
			processed = filterToppings(processed, filterText);
		}

		// Apply selected sorting method.
		switch (currentSortType) {
			case SortType.ALPHA_DESC:
				processed = sortAlphabetically(processed, false);
				break;
			case SortType.MOST_USED:
				processed = sortByUsage(processed);
				break;
			case SortType.RECENT:
				processed = sortByRecent(processed, recentToppings);
				break;
			default:
				processed = sortAlphabetically(processed, true);
		}

		return processed;
	}, [toppings, filterText, currentSortType, recentToppings]);

	// --- Action Handlers ---
	const handleAddTopping = useCallback(
		(newToppingName, initialUsage = 0) => {
			if (
				toppingExists(
					newToppingName,
					toppings.map((t) => t.name),
				)
			) {
				return false;
			}

			const newToppingData = { name: newToppingName, usage: initialUsage };
			setToppings((prev) => [...prev, newToppingData]);
			setRecentToppings((prev) =>
				[newToppingName, ...prev].slice(0, RECENT_TOPPINGS_LIMIT),
			);
			return true;
		},
		[toppings],
	);

	const handleDuplicateTopping = useCallback(
		(toppingName) => {
			const originalTopping = toppings.find((t) => t.name === toppingName);
			if (!originalTopping) return;

			const baseName = toppingName;
			let counter = 1;
			let newName = `${baseName} (${counter})`;

			// Find a unique name by appending a counter if necessary.
			while (
				toppingExists(
					newName,
					toppings.map((t) => t.name),
				)
			) {
				counter++;
				newName = `${baseName} (${counter})`;
			}

			handleAddTopping(newName, originalTopping.usage);
		},
		[toppings, handleAddTopping],
	);

	const handleStartEdit = useCallback((toppingName, currentText) => {
		setEditMode((prev) => ({ ...prev, [toppingName]: true }));
		setEditState((prev) => ({
			...prev,
			[toppingName]: { text: currentText, error: null },
		}));
	}, []);

	const handleCancelEdit = useCallback((toppingName) => {
		setEditMode((prev) => ({ ...prev, [toppingName]: false }));
		setEditState((prev) => {
			const newState = { ...prev };
			delete newState[toppingName];
			return newState;
		});
	}, []);

	const handleSaveEdit = useCallback(
		async (oldToppingName, newToppingText) => {
			const newNameTrimmed = newToppingText?.trim();

			// Basic validation for the new topping name.
			if (!newNameTrimmed) {
				setEditState((prev) => ({
					...prev,
					[oldToppingName]: {
						...prev[oldToppingName],
						error: "Name cannot be empty",
					},
				}));
				return false;
			}

			if (newNameTrimmed === oldToppingName) {
				handleCancelEdit(oldToppingName);
				return true;
			}

			if (
				toppingExists(
					newNameTrimmed,
					toppings.map((t) => t.name),
				)
			) {
				setEditState((prev) => ({
					...prev,
					[oldToppingName]: {
						...prev[oldToppingName],
						error: "Name already exists",
					},
				}));
				return false;
			}

			setMutationLoading(true);
			try {
				await toppingService.updateToppingInPizzas(
					oldToppingName,
					newNameTrimmed,
				);

				// Update local state optimistically (or after confirmation).
				setToppings((prev) =>
					prev.map((t) =>
						t.name === oldToppingName ? { ...t, name: newNameTrimmed } : t,
					),
				);
				setRecentToppings((prev) =>
					prev.map((t) => (t === oldToppingName ? newNameTrimmed : t)),
				);
				setSelected((prev) =>
					prev.map((t) => (t === oldToppingName ? newNameTrimmed : t)),
				);
				handleCancelEdit(oldToppingName);
				return true;
			} catch (error) {
				setEditState((prev) => ({
					...prev,
					[oldToppingName]: {
						...prev[oldToppingName],
						error: `Save failed: ${error.message}`,
					},
				}));
				return false;
			} finally {
				setMutationLoading(false);
			}
		},
		[toppings, handleCancelEdit],
	);

	const handleDelete = useCallback(async (toppingNames) => {
		if (!toppingNames.length) return false;

		setMutationLoading(true);
		try {
			if (toppingNames.length === 1) {
				await toppingService.removeToppingFromPizzas(toppingNames[0]);
			} else {
				await toppingService.removeMultipleToppingsFromPizzas(toppingNames);
			}

			const deleteSet = new Set(toppingNames);
			setToppings((prev) => prev.filter((t) => !deleteSet.has(t.name)));
			setRecentToppings((prev) => prev.filter((t) => !deleteSet.has(t)));
			setSelected((prev) => prev.filter((t) => !deleteSet.has(t)));
			return true;
		} catch (error) {
			setFetchState((prev) => ({
				...prev,
				error: `Delete failed: ${error.message}`,
			}));
			setTimeout(
				() => setFetchState((prev) => ({ ...prev, error: null })),
				5000,
			);
			return false;
		} finally {
			setMutationLoading(false);
		}
	}, []);
	// --- Effects ---
	// Initial data fetch on component mount.
	useEffect(() => {
		fetchToppings();
	}, [fetchToppings]);

	// Update DataGrid sort parameters (order, orderBy) based on the custom sort type.
	useEffect(() => {
		// Map the custom sort type to DataGrid's internal sorting state.
		switch (currentSortType) {
			case SortType.ALPHA_DESC:
				setOrderBy("name");
				setOrder("desc");
				break;
			case SortType.MOST_USED:
				setOrderBy("usage");
				setOrder("desc");
				break;
			case SortType.RECENT:
				// Recent sorting is handled manually in `processedToppings`.
				// Set default DataGrid sort state for consistency.
				setOrderBy("name");
				setOrder("asc");
				break;
			default:
				setOrderBy("name");
				setOrder("asc");
		}
	}, [currentSortType]);

	// --- Table Interaction Handlers ---
	const handleRequestSort = useCallback(
		(event, property) => {
			const isAsc = orderBy === property && order === "asc";
			setOrder(isAsc ? "desc" : "asc");
			setOrderBy(property);
		},
		[order, orderBy],
	);

	const handleSelectAllClick = useCallback(
		(event) => {
			if (event.target.checked) {
				const newSelected = processedToppings().map((t) => t.name);
				setSelected(newSelected);
				return;
			}
			setSelected([]);
		},
		[processedToppings],
	);

	const handleRowClick = useCallback(
		(event, name) => {
			const selectedIndex = selected.indexOf(name);
			let newSelected = [];

			if (selectedIndex === -1) {
				newSelected = newSelected.concat(selected, name);
			} else if (selectedIndex === 0) {
				newSelected = newSelected.concat(selected.slice(1));
			} else if (selectedIndex === selected.length - 1) {
				newSelected = newSelected.concat(selected.slice(0, -1));
			} else if (selectedIndex > 0) {
				newSelected = newSelected.concat(
					selected.slice(0, selectedIndex),
					selected.slice(selectedIndex + 1),
				);
			}
			setSelected(newSelected);
		},
		[selected],
	);

	return {
		// State
		toppings: processedToppings(),
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

		// Setters
		setFilterText,
		setCurrentSortType,
		setSelected,
		setDeleteDialog,
		setOrder, // <-- add this
		setOrderBy, // <-- add this

		// Handlers
		handleAddTopping,
		handleStartEdit,
		handleSaveEdit,
		handleCancelEdit,
		handleDelete,
		handleDuplicateTopping,
		fetchToppings,
		handleRequestSort,
		handleRowClick,
		handleSelectAllClick,
	};
}
