import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Fade,
  alpha,
  Chip,
  Divider,
  Menu,
  MenuItem,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  InputAdornment,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  LocalFireDepartment as PopularIcon,
  AccessTime as RecentIcon
} from '@mui/icons-material';

// API endpoint
const API_URL = '/api/pizzas';

// Sort types
const SORT_TYPES = {
  ALPHA_ASC: 'alphaAsc',
  ALPHA_DESC: 'alphaDesc',
  MOST_USED: 'mostUsed',
  RECENT: 'recent'
};

function ToppingManager() {
  const theme = useTheme();
  // State for toppings list and operations
  const [toppings, setToppings] = useState([]);
  const [toppingUsage, setToppingUsage] = useState({}); // Track usage count for each topping
  const [recentToppings, setRecentToppings] = useState([]); // Track recently added toppings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [sortType, setSortType] = useState(SORT_TYPES.ALPHA_ASC);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  
  // State for add/edit operations
  const [newTopping, setNewTopping] = useState('');
  const [editMode, setEditMode] = useState({});
  const [editText, setEditText] = useState({});
  const [duplicateError, setDuplicateError] = useState(false);
  const [editError, setEditError] = useState({}); // { toppingName: 'Error message' }
  
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [toppingToDelete, setToppingToDelete] = useState(null);

  // Fetch all pizzas to extract unique toppings
  useEffect(() => {
    fetchToppings();
  }, []);
  const fetchToppings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pizzasData = await response.json();
      
      // Extract toppings and count their usage
      const allToppings = pizzasData.flatMap(pizza => pizza.toppings || [])
        .filter(topping => topping); // Remove null/empty values
      
      // Track usage count for each topping (case insensitive)
      const usageCount = {};
      allToppings.forEach(topping => {
        const normalizedTopping = topping.trim();
        usageCount[normalizedTopping] = (usageCount[normalizedTopping] || 0) + 1;
      });
      
      // Get unique toppings with proper case
      const uniqueToppings = [...new Set(allToppings.map(t => t.trim()))];
      
      // Store usage statistics
      setToppingUsage(usageCount);
      
      // Apply initial sorting
      const sortedToppings = sortToppings(uniqueToppings, sortType, usageCount);
      
      setToppings(sortedToppings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching toppings:", error);
      setError(error);
      setLoading(false);
    }
  };

  // Sort toppings based on selected sort type
  const sortToppings = (toppingArray, sortBy, usageData = toppingUsage) => {
    let sorted = [...toppingArray];
    
    switch (sortBy) {
      case SORT_TYPES.ALPHA_ASC:
        sorted.sort((a, b) => a.localeCompare(b));
        break;
      case SORT_TYPES.ALPHA_DESC:
        sorted.sort((a, b) => b.localeCompare(a));
        break;
      case SORT_TYPES.MOST_USED:
        sorted.sort((a, b) => (usageData[b] || 0) - (usageData[a] || 0));
        break;
      case SORT_TYPES.RECENT:
        // First, get all toppings that are in recentToppings, in order
        const recentOnes = sorted.filter(t => recentToppings.includes(t))
          .sort((a, b) => recentToppings.indexOf(a) - recentToppings.indexOf(b));
        // Then add the rest in alphabetical order
        const otherOnes = sorted.filter(t => !recentToppings.includes(t)).sort();
        sorted = [...recentOnes, ...otherOnes];
        break;
      default:
        sorted.sort((a, b) => a.localeCompare(b));
    }
    
    return sorted;
  };
  
  // Handle sort changes
  const handleSortChange = (newSortType) => {
    setSortType(newSortType);
    setToppings(sortToppings(toppings, newSortType));
    setSortMenuAnchor(null); // Close menu
  };
  
  // Filter toppings based on search text
  const filteredToppings = toppings.filter(topping => 
    topping.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // Check if topping already exists (case insensitive, trimmed)
  const toppingExists = (topping) => {
    return toppings.some(t => t.toLowerCase().trim() === topping.toLowerCase().trim());
  };
  // Add a new topping to the global list
  const handleAddTopping = () => {
    const trimmedTopping = newTopping.trim();
    if (trimmedTopping === '') return;
    
    // Case insensitive, trimmed duplicate check
    if (toppingExists(trimmedTopping)) {
      setDuplicateError(true);
      setTimeout(() => {
        setDuplicateError(false);
      }, 3000);
      return;
    }
    
    // Update recent toppings list (newest at the beginning)
    const updatedRecentToppings = [trimmedTopping, ...recentToppings.slice(0, 9)];
    setRecentToppings(updatedRecentToppings);
    
    // Add to toppings list with the current sort applied
    const newToppings = [...toppings, trimmedTopping];
    setToppings(sortToppings(newToppings, sortType, toppingUsage));
    
    // Clear input
    setNewTopping('');
  };

  // Start editing a topping
  const handleStartEdit = (topping) => {
    setEditMode(prev => ({ ...prev, [topping]: true }));
    setEditText(prev => ({ ...prev, [topping]: topping }));
  };
  // Save edited topping
  const handleSaveEdit = (oldTopping) => {
    const newToppingName = editText[oldTopping]?.trim();
    setEditError(prev => ({ ...prev, [oldTopping]: null })); // Clear previous error for this topping
    
    if (!newToppingName) {
      setEditMode(prev => ({ ...prev, [oldTopping]: false }));
      return;
    }
    
    // Check if new name is same as old name (no change needed)
    if (newToppingName === oldTopping) {
      setEditMode(prev => ({ ...prev, [oldTopping]: false }));
      return;
    }
    
    // Case insensitive duplicate check (excluding the current one)
    if (toppings.some(t => 
      t !== oldTopping && 
      t.toLowerCase().trim() === newToppingName.toLowerCase().trim()
    )) {
      // Set specific edit error instead of generic error
      setEditError(prev => ({ ...prev, [oldTopping]: 'Name already exists' }));
      // Optionally clear after a timeout
      setTimeout(() => setEditError(prev => ({ ...prev, [oldTopping]: null })), 3000);
      return;
    }
    
    // Update the topping in the list and maintain sort order
    const updatedToppings = toppings.map(t => t === oldTopping ? newToppingName : t);
    setToppings(sortToppings(updatedToppings, sortType));
    
    // Update recent toppings if this was a recent one
    if (recentToppings.includes(oldTopping)) {
      setRecentToppings(prev => 
        prev.map(t => t === oldTopping ? newToppingName : t)
      );
    }
    
    // Update the topping in all pizzas
    updateToppingInPizzas(oldTopping, newToppingName);
    
    // Clear edit mode and any errors
    setEditMode(prev => ({ ...prev, [oldTopping]: false }));
    setEditError(prev => ({ ...prev, [oldTopping]: null })); // Ensure error cleared on success
  };
  // Cancel editing a topping
  const handleCancelEdit = (topping) => {
    setEditMode(prev => ({ ...prev, [topping]: false }));
    setEditError(prev => ({ ...prev, [topping]: null })); // Clear error on cancel
  };

  // Open delete confirmation dialog
  const handleDeleteRequest = (topping) => {
    setToppingToDelete(topping);
    setDeleteDialog(true);
  };
  // Confirm and delete topping
  const handleConfirmDelete = () => {
    if (!toppingToDelete) return;
    
    // Remove topping from all pizzas
    removeToppingFromPizzas(toppingToDelete);
    
    // Remove from local state
    setToppings(prev => sortToppings(prev.filter(t => t !== toppingToDelete), sortType));
    
    // Also remove from recent toppings if present
    setRecentToppings(prev => prev.filter(t => t !== toppingToDelete));
    
    // Close dialog
    setDeleteDialog(false);
    setToppingToDelete(null);
  };
  
  // Handle sort menu
  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  // Update topping name in all pizzas
  const updateToppingInPizzas = async (oldTopping, newTopping) => {
    setLoading(true);
    
    try {
      // Fetch all pizzas
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pizzasData = await response.json();
      
      // Find pizzas that contain the topping
      const pizzasToUpdate = pizzasData.filter(
        pizza => pizza.toppings && pizza.toppings.includes(oldTopping)
      );
      
      // Update each pizza
      for (const pizza of pizzasToUpdate) {
        const updatedToppings = pizza.toppings.map(t => 
          t === oldTopping ? newTopping : t
        );
        
        await updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
      }
      
    } catch (error) {
      console.error("Error updating toppings:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Remove topping from all pizzas
  const removeToppingFromPizzas = async (toppingToRemove) => {
    setLoading(true);
    
    try {
      // Fetch all pizzas
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pizzasData = await response.json();
      
      // Find pizzas that contain the topping
      const pizzasToUpdate = pizzasData.filter(
        pizza => pizza.toppings && pizza.toppings.includes(toppingToRemove)
      );
      
      // Update each pizza
      for (const pizza of pizzasToUpdate) {
        const updatedToppings = pizza.toppings.filter(t => t !== toppingToRemove);
        
        await updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
      }
      
    } catch (error) {
      console.error("Error removing toppings:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update a pizza
  const updatePizza = async (id, updatedPizza) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPizza),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update pizza ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating pizza ${id}:`, error);
      throw error;
    }
  };

  // Render loading state
  const renderLoading = () => (
    <Fade in={true} timeout={500}>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    </Fade>
  );

  // Render error state
  const renderError = () => (
    <Fade in={true} timeout={500}>
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchToppings}>
            RETRY
          </Button>
        }
      >
        Failed to load data: {error?.message || 'An unknown error occurred.'} Please try again.
      </Alert>
    </Fade>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary.main" fontWeight="medium">
        Topping Manager
      </Typography>
      
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: { xs: 2, sm: 3 },
          
          borderColor: 'divider',
          mb: 3 
        }}
      >
        {/* Add Topping Form */}        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Add New Topping
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={newTopping}
              onChange={(e) => {
                setNewTopping(e.target.value);
                if (duplicateError) setDuplicateError(false);
              }}
              placeholder="Enter topping name"
              variant="outlined"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTopping();
                }
              }}
              error={duplicateError}
              helperText={duplicateError ? 'This topping already exists' : ''}
              InputProps={{
                endAdornment: newTopping && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setNewTopping('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTopping}
              disabled={loading || !newTopping.trim()}
            >
              Add
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Search and Actions Row */}        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: 2,
            mb: 2 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={500}>
              Available Toppings 
            </Typography>
            <Chip
              label={toppings.length}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              placeholder="Search toppings..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: filterText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setFilterText('')}
                      edge="end"
                      aria-label="clear search"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                minWidth: { xs: '150px', sm: '180px' },
              }}
            />
            
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Sort toppings">
                <Button
                  startIcon={<SortIcon />}
                  onClick={handleSortMenuOpen}
                  aria-controls="sort-menu"
                  aria-haspopup="true"
                  color="primary"
                >
                  {sortType === SORT_TYPES.ALPHA_ASC && "A-Z"}
                  {sortType === SORT_TYPES.ALPHA_DESC && "Z-A"}
                  {sortType === SORT_TYPES.MOST_USED && "Popular"}
                  {sortType === SORT_TYPES.RECENT && "Recent"}
                </Button>
              </Tooltip>
              <Tooltip title="Refresh toppings">
                <span>
                  <IconButton 
                    color="primary"
                    onClick={fetchToppings}
                    disabled={loading}
                    size="small"
                    sx={{ 
                      borderLeft: 0,
                      borderTopLeftRadius: 0, 
                      borderBottomLeftRadius: 0 
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </ButtonGroup>

            <Menu
              id="sort-menu"
              anchorEl={sortMenuAnchor}
              open={Boolean(sortMenuAnchor)}
              onClose={handleSortMenuClose}
              MenuListProps={{ 'aria-labelledby': 'sort-button' }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem 
                onClick={() => handleSortChange(SORT_TYPES.ALPHA_ASC)}
                selected={sortType === SORT_TYPES.ALPHA_ASC}
                dense
              >
                <ListItemIcon>
                  <ArrowUpIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Alphabetical (A-Z)</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange(SORT_TYPES.ALPHA_DESC)}
                selected={sortType === SORT_TYPES.ALPHA_DESC}
                dense
              >
                <ListItemIcon>
                  <ArrowDownIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Alphabetical (Z-A)</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange(SORT_TYPES.MOST_USED)}
                selected={sortType === SORT_TYPES.MOST_USED}
                dense
              >
                <ListItemIcon>
                  <PopularIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Most Used</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => handleSortChange(SORT_TYPES.RECENT)}
                selected={sortType === SORT_TYPES.RECENT}
                dense
              >
                <ListItemIcon>
                  <RecentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Recently Added</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Loading State */}
        {loading && toppings.length === 0 && renderLoading()}
        
        {/* Error State */}
        {error && !loading && renderError()}

        {/* Topping List */}
        {(!loading || toppings.length > 0) && !error && (
          (filteredToppings.length === 0 ? (
            <Paper 
              elevation={0}
              variant="outlined"
              sx={{ 
                borderRadius: theme.shape.borderRadius / 2,
                p: 3, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <SearchIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                {filterText ? 'No toppings match search' : 'No toppings added yet'}
              </Typography>
              {!filterText && (
                <Button
                  startIcon={<AddIcon />}
                  color="primary"
                  variant="text"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => document.querySelector('input[placeholder="Enter topping name"]')?.focus()}
                >
                  Add First Topping
                </Button>
              )}
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: theme.shape.borderRadius / 2, borderColor: 'divider' }}>
              <Table size="small" aria-label="toppings table">
                <TableHead>
                  <TableRow>
                    <TableCell>Topping Name</TableCell>
                    <TableCell align="right">
                      {sortType === SORT_TYPES.MOST_USED && "Usage"}
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredToppings.map((topping, index) => (
                    <TableRow 
                      key={topping}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >                      <TableCell component="th" scope="row">
                        {editMode[topping] ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editText[topping] || ''}
                            onChange={(e) => {
                                setEditText(prev => ({ ...prev, [topping]: e.target.value }));
                                if (editError[topping]) {
                                    setEditError(prev => ({ ...prev, [topping]: null }));
                                }
                            }}
                            variant="outlined"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(topping);
                              }
                            }}
                            error={!!editError[topping]}
                            helperText={editError[topping] || ''}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>{topping}</Typography>
                            {sortType === SORT_TYPES.RECENT && recentToppings.includes(topping) && (
                              <Chip 
                                label="New" 
                                size="small" 
                                color="info"
                                sx={{ fontSize: '0.65rem', height: 18 }}
                              />
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {sortType === SORT_TYPES.MOST_USED && (
                          <Chip 
                            label={toppingUsage[topping] || 0} 
                            size="small"
                            color={toppingUsage[topping] > 2 ? "primary" : "default"}
                            variant={toppingUsage[topping] > 2 ? "filled" : "outlined"}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">                        {editMode[topping] ? (
                          <>
                            {/* MD3 Contained Icon Button for Save with descriptive tooltip */}
                            <Tooltip title="Save changes">
                              <span>
                                <IconButton 
                                  className="contained"
                                  color="primary" 
                                  onClick={() => handleSaveEdit(topping)}
                                  size="small"
                                  aria-label="save topping changes"
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
                                  }}
                                >
                                  <DoneIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {/* MD3 Standard Icon Button for Cancel with descriptive tooltip */}
                            <Tooltip title="Cancel editing">
                              <span>
                                <IconButton 
                                  className="standard"
                                  color="inherit" 
                                  onClick={() => handleCancelEdit(topping)}
                                  size="small"
                                  aria-label="cancel editing"
                                  sx={{ ml: 0.5 }}
                                >
                                  <CloseIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            {/* MD3 Standard Icon Button for Edit with descriptive tooltip */}
                            <Tooltip title="Edit topping name">
                              <span>
                                <IconButton 
                                  className="standard"
                                  onClick={() => handleStartEdit(topping)}
                                  size="small"
                                  color="primary"
                                  aria-label="edit topping name"
                                  disabled={loading}
                                  sx={{
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                                  }}
                                >
                                  <EditIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {/* MD3 Standard Icon Button for Delete with descriptive tooltip */}
                            <Tooltip title="Remove topping">
                              <span>
                                <IconButton 
                                  className="standard"
                                  onClick={() => handleDeleteRequest(topping)}
                                  size="small"
                                  color="error"
                                  aria-label="remove topping"
                                  sx={{ 
                                    ml: 0.5,
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
                                  }}
                                  disabled={loading}
                                >
                                  <DeleteIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ))
        )}
      
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        aria-labelledby="delete-topping-dialog-title"
        aria-describedby="delete-topping-dialog-description"
      >
        <DialogTitle id="delete-topping-dialog-title">Delete Topping?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-topping-dialog-description">
            Are you sure you want to delete "<strong>{toppingToDelete}</strong>"? This will remove the topping from all pizzas that use it. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog(false)} variant="text">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>      
        </Dialog>
      </Paper>
    </Box>
  );
}

export default ToppingManager;
