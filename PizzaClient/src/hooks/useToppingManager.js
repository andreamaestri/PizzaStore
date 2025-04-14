import { useState, useCallback, useEffect } from 'react';
import { FetchStatus, SortType, RECENT_TOPPINGS_LIMIT } from '../constants/toppingConstants';
import toppingService from '../services/api/toppingService';
import {
  sortByRecent,
  sortByUsage,
  sortAlphabetically,
  filterToppings,
  toppingExists,
} from '../utils/sortUtils';

/**
 * Custom hook for managing topping data and operations
 * @returns {Object} Topping manager state and handlers
 */
export function useToppingManager() {
  // Core state
  const [toppings, setToppings] = useState([]);
  const [recentToppings, setRecentToppings] = useState([]);
  const [fetchState, setFetchState] = useState({ status: FetchStatus.IDLE, error: null });
  const [mutationLoading, setMutationLoading] = useState(false);

  // UI state
  const [filterText, setFilterText] = useState('');
  const [currentSortType, setCurrentSortType] = useState(SortType.ALPHA_ASC);
  const [selected, setSelected] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [editState, setEditState] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, toppingName: null, isBulk: false });

  // Table state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  // Fetch toppings data
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
        error: error.message || "Failed to load toppings"
      });
    }
  }, []);

  // Process raw pizza data into toppings list
  const processPizzaData = useCallback((pizzasData) => {
    const allToppings = pizzasData.flatMap(pizza => pizza.toppings || [])
      .map(t => t?.trim())
      .filter(Boolean);

    const usageCount = {};
    const uniqueToppingsMap = new Map();

    allToppings.forEach(topping => {
      const lowerCaseTopping = topping.toLowerCase();
      usageCount[lowerCaseTopping] = (usageCount[lowerCaseTopping] || 0) + 1;
      if (!uniqueToppingsMap.has(lowerCaseTopping)) {
        uniqueToppingsMap.set(lowerCaseTopping, topping);
      }
    });

    return Array.from(uniqueToppingsMap.values()).map(name => ({
      name,
      usage: usageCount[name.toLowerCase()] || 0
    }));
  }, []);

  // Filter and sort toppings
  const processedToppings = useCallback(() => {
    let processed = [...toppings];

    // Apply filter
    if (filterText) {
      processed = filterToppings(processed, filterText);
    }

    // Apply sort
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
      case SortType.ALPHA_ASC:
      default:
        processed = sortAlphabetically(processed, true);
    }

    return processed;
  }, [toppings, filterText, currentSortType, recentToppings]);

  // Handlers
  const handleAddTopping = useCallback((newToppingName, initialUsage = 0) => {
    if (toppingExists(newToppingName, toppings.map(t => t.name))) {
      return false;
    }

    const newToppingData = { name: newToppingName, usage: initialUsage };
    setToppings(prev => [...prev, newToppingData]);
    setRecentToppings(prev => [newToppingName, ...prev].slice(0, RECENT_TOPPINGS_LIMIT));
    return true;
  }, [toppings]);

  const handleDuplicateTopping = useCallback((toppingName) => {
    const originalTopping = toppings.find(t => t.name === toppingName);
    if (!originalTopping) return;

    let baseName = toppingName;
    let counter = 1;
    let newName = `${baseName} (${counter})`;

    // Find a unique name
    while (toppingExists(newName, toppings.map(t => t.name))) {
      counter++;
      newName = `${baseName} (${counter})`;
    }

    handleAddTopping(newName, originalTopping.usage);
  }, [toppings, handleAddTopping]);

  const handleStartEdit = useCallback((toppingName, currentText) => {
    setEditMode(prev => ({ ...prev, [toppingName]: true }));
    setEditState(prev => ({
      ...prev,
      [toppingName]: { text: currentText, error: null }
    }));
  }, []);

  const handleCancelEdit = useCallback((toppingName) => {
    setEditMode(prev => ({ ...prev, [toppingName]: false }));
    setEditState(prev => {
      const newState = {...prev};
      delete newState[toppingName];
      return newState;
    });
  }, []);

  const handleSaveEdit = useCallback(async (oldToppingName, newToppingText) => {
    const newNameTrimmed = newToppingText?.trim();

    // Validation
    if (!newNameTrimmed) {
      setEditState(prev => ({ 
        ...prev, 
        [oldToppingName]: { ...prev[oldToppingName], error: 'Name cannot be empty' }
      }));
      return false;
    }

    if (newNameTrimmed === oldToppingName) {
      handleCancelEdit(oldToppingName);
      return true;
    }

    if (toppingExists(newNameTrimmed, toppings.map(t => t.name))) {
      setEditState(prev => ({
        ...prev,
        [oldToppingName]: { ...prev[oldToppingName], error: 'Name already exists' }
      }));
      return false;
    }

    setMutationLoading(true);
    try {
      await toppingService.updateToppingInPizzas(oldToppingName, newNameTrimmed);

      // Update local state
      setToppings(prev => prev.map(t =>
        t.name === oldToppingName ? { ...t, name: newNameTrimmed } : t
      ));
      setRecentToppings(prev => prev.map(t =>
        t === oldToppingName ? newNameTrimmed : t
      ));
      setSelected(prev => prev.map(t =>
        t === oldToppingName ? newNameTrimmed : t
      ));
      handleCancelEdit(oldToppingName);
      return true;
    } catch (error) {
      setEditState(prev => ({
        ...prev,
        [oldToppingName]: { ...prev[oldToppingName], error: `Save failed: ${error.message}` }
      }));
      return false;
    } finally {
      setMutationLoading(false);
    }
  }, [toppings, handleCancelEdit]);

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
      setToppings(prev => prev.filter(t => !deleteSet.has(t.name)));
      setRecentToppings(prev => prev.filter(t => !deleteSet.has(t)));
      setSelected(prev => prev.filter(t => !deleteSet.has(t)));
      return true;
    } catch (error) {
      setFetchState(prev => ({ 
        ...prev, 
        error: `Delete failed: ${error.message}` 
      }));
      setTimeout(() => setFetchState(prev => ({ ...prev, error: null })), 5000);
      return false;
    } finally {
      setMutationLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchToppings();
  }, [fetchToppings]);

  // Table handlers
  const handleRequestSort = useCallback((event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handleSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      const newSelected = processedToppings().map((t) => t.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  }, [processedToppings]);

  const handleRowClick = useCallback((event, name) => {
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
  }, [selected]);

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
