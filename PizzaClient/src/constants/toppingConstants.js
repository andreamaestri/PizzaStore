// API
export const API_URL = '/api/pizzas';

// UI Constants
export const RECENT_TOPPINGS_LIMIT = 10;
export const DEBOUNCE_DELAY = 300;

// Sort Types
export const SortType = {
  ALPHA_ASC: 'alphaAsc',
  ALPHA_DESC: 'alphaDesc',
  MOST_USED: 'mostUsed',
  RECENT: 'recent',
};

// Fetch Status
export const FetchStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

// Table Headers
export const TABLE_HEAD_CELLS = [
  { 
    id: 'name', 
    numeric: false, 
    disablePadding: true, 
    label: 'Topping Name',
    sx: { pl: 1 }  // Align with content padding
  },
  { 
    id: 'usage', 
    numeric: true, 
    disablePadding: false, 
    label: 'Usage Count',
    sx: { pr: 3 }  // Match content right padding
  },
  { 
    id: 'actions', 
    numeric: false, 
    disablePadding: false, 
    label: 'Actions', 
    disableSorting: true,
    sx: { 
      pr: 2,
      width: 120,  // Fixed width for actions column
      textAlign: 'right' 
    }
  },
];
