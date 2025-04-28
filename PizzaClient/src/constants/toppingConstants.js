// --- API Constants ---
export const API_URL = "/api/pizzas";

// --- UI Behavior Constants ---
export const RECENT_TOPPINGS_LIMIT = 10;
const DEBOUNCE_DELAY = 300;

// --- Sorting Constants ---
export const SortType = {
	ALPHA_ASC: "alphaAsc",
	ALPHA_DESC: "alphaDesc",
	MOST_USED: "mostUsed",
	RECENT: "recent",
};

// --- Data Fetching Status Constants ---
export const FetchStatus = {
	IDLE: "idle",
	LOADING: "loading",
	SUCCEEDED: "succeeded",
	FAILED: "failed",
};

// --- Topping Table Column Definitions ---
const TABLE_HEAD_CELLS = [
	{
		id: "name",
		numeric: false,
		disablePadding: true,
		label: "Topping Name",
		sx: { pl: 1 }, // Custom padding to align with cell content.
	},
	{
		id: "usage",
		numeric: true,
		disablePadding: false,
		label: "Usage Count",
		sx: { pr: 3 }, // Custom padding to align with cell content.
	},
	{
		id: "actions",
		numeric: false,
		disablePadding: false,
		label: "Actions",
		disableSorting: true,
		sx: {
			pr: 2,
			width: 120, // Fixed width to ensure actions fit consistently.
			textAlign: "right",
		},
	},
];
