import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Stack, Chip, IconButton, Divider, MenuItem, Select,
  InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, InputAdornment,
  Tooltip, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Alert, InputBase, alpha, Fab, Autocomplete, CircularProgress,
  useTheme,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ErrorOutline as ErrorOutlineIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

/**
 * PizzaList Component: Displays a list of pizzas and provides CRUD functionality.
 *
 * @param {string} name - The display name for the items (e.g., "Pizza").
 * @param {Array} data - The array of pizza objects to display.
 * @param {boolean} loading - Indicates if a CRUD operation is in progress.
 * @param {Function} onCreate - Callback function to handle creating a new pizza.
 * @param {Function} onUpdate - Callback function to handle updating an existing pizza.
 * @param {Function} onDelete - Callback function to handle deleting a pizza.
 * @param {Function} onRefresh - Callback function to manually refresh the pizza list.
 */
function PizzaList({ name, data, loading, onCreate, onUpdate, onDelete, onRefresh }) {
  const theme = useTheme();
// State to manage the form data for adding or editing a pizza.
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    baseId: 1,
    toppings: [],
    price: ''
  });
// State to track the ID of the pizza currently being edited (null if adding).
  const [editingId, setEditingId] = useState(null);
// State to control the visibility of the add/edit dialog (if using a dialog approach).
  const [addDialogOpen, setAddDialogOpen] = useState(false);
// State to store the available pizza bases fetched from the API.
  const [bases, setBases] = useState([]);
// State to indicate if pizza bases are currently being fetched.
  const [basesLoading, setBasesLoading] = useState(true);
// State to store any error message encountered while fetching bases.
  const [basesApiError, setBasesApiError] = useState(null);
// Effect to fetch available pizza bases when the component mounts.
  useEffect(() => {
    const fetchBases = async () => {
      setBasesLoading(true);
      setBasesApiError(null);
      try {
        const response = await fetch('/api/bases');
        if (!response.ok) {
          throw new Error(`Failed to fetch bases (Status: ${response.status})`);
        }
        const basesData = await response.json();
        setBases(basesData);
      } catch (error) {
        console.error('Error fetching pizza bases:', error);
        setBasesApiError(error.message || 'Could not load pizza bases.');
// Use fallback data for bases if the API call fails.
        setBases([
          { id: 1, name: 'Tomato Sauce & Mozzarella' },
          { id: 2, name: 'Saffron Tomato Base' },
          { id: 3, name: 'Garlic Cream Base' },
        ]);
      } finally {
        setBasesLoading(false);
      }
    };
    fetchBases();
  }, []);
// Memoized list of topping suggestions for the Autocomplete component.
// Combines unique toppings from existing pizzas with a common default list.
  const toppingSuggestions = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        'Mozzarella', 'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions',
        'Sausage', 'Bacon', 'Ham', 'Pineapple', 'Olives', 'Basil',
        'Tomatoes', 'Spinach', 'Garlic', 'Chicken', 'Ground Beef'
      ];
    }
    const allToppings = data
      .flatMap(pizza => pizza.toppings || []);
    const uniqueToppings = [...new Set(allToppings)];
    const commonToppings = [
      'Mozzarella', 'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions',
      'Sausage', 'Bacon', 'Ham', 'Pineapple', 'Olives', 'Basil',
      'Tomatoes', 'Spinach', 'Garlic', 'Chicken', 'Ground Beef'
    ];
    return [
      ...uniqueToppings,
      ...commonToppings.filter(t => !uniqueToppings.includes(t))
    ];
  }, [data]);
// State to store validation errors for the form fields.
  const [formErrors, setFormErrors] = useState({});
// State to control the visibility of the delete confirmation dialog.
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
// State to store the ID of the pizza pending deletion confirmation.
  const [deletingId, setDeletingId] = useState(null);
// State to store the current text entered in the search/filter input.
  const [filterText, setFilterText] = useState('');
// Memoized array of pizzas filtered based on the `filterText`.
  const filteredData = useMemo(() => {
    if (!data) return [];
    const lowerCaseFilter = filterText.toLowerCase();
    return data.filter(item =>
      item.name.toLowerCase().includes(lowerCaseFilter) ||
      (item.description && item.description.toLowerCase().includes(lowerCaseFilter))
    );
  }, [data, filterText]);

  // Validate form (Memoized)
// Memoized function to validate the form data (name and price).
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Pizza name is required';
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Valid price required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.name, formData.price]);

  // Handle form changes (Memoized)
// Memoized function to handle changes in form input fields.
// Updates `formData` state and clears corresponding validation errors.
  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setFormErrors(prev => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Handle form submission (Memoized)
// Memoized function to handle form submission (add or update).
// Validates the form, prepares data, calls `onCreate` or `onUpdate`, and resets the form.
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    const submissionData = {
      ...formData,
      baseId: formData.baseId ? parseInt(formData.baseId, 10) : null,
      toppings: formData.toppings || [],
      price: Number(formData.price)
    };
    if (editingId) {
      onUpdate(submissionData);
      setEditingId(null);
    } else {
// Destructure ID before calling onCreate, as it's not needed for creation.
      const { id, ...createData } = submissionData;
      onCreate(createData);
      setAddDialogOpen(false); // Close the dialog after adding
    }
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
    setFormErrors({});
  }, [editingId, formData, onUpdate, onCreate, validateForm]);

  // Handle edit action (Memoized)
// Memoized function to populate the form when the edit button is clicked.
  const handleEdit = useCallback((item) => {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || '',
      baseId: item.baseId || 1,
      toppings: item.toppings || [],
      price: item.price !== undefined ? String(item.price) : ''
    });
    setFormErrors({});
  }, []);

  // Handle cancel edit action (Memoized)
// Memoized function to cancel the editing process and reset the form.
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
    setFormErrors({});
  }, []);

  // Handle delete confirmation dialog opening (Memoized)
// Memoized function to open the delete confirmation dialog.
  const handleDeleteConfirm = useCallback((id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  }, []);

  // Handle actual deletion (Memoized)
// Memoized function to confirm and execute the delete action.
  const confirmDelete = useCallback(() => {
    if (deletingId) {
      onDelete(deletingId);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  }, [deletingId, onDelete]);

  // Handle Autocomplete changes (Memoized) - Specific for toppings
// Memoized function to handle changes in the toppings Autocomplete component.
  const handleToppingsChange = useCallback((event, newValue) => {
    setFormData(prev => ({
      ...prev,
      toppings: newValue.map(t => String(t).trim()).filter(Boolean)
    }));
  }, []);

  // Handle Base Select changes (Memoized)
// Memoized function to handle changes in the pizza base Select component.
  const handleBaseChange = useCallback((event) => {
    const baseId = parseInt(event.target.value, 10);
    setFormData(prev => ({
      ...prev,
      baseId: isNaN(baseId) ? '' : baseId
    }));
  }, []);

  // Handle ordering (interactive ordering feature)
// Placeholder function to handle ordering a pizza. Replace with actual order logic.
  const handleOrder = (pizza) => {
    alert(`Order placed for: ${pizza.name} (${pizza.price ? pizza.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : 'N/A'})`);
    // In production, replace with order API call or dialog
  };
  
  // Handle add dialog open/close (Memoized)
// Memoized function to toggle the add/edit dialog (if used).
  const handleAddDialogToggle = useCallback((open) => {
    setAddDialogOpen(open);
    if (!open) {
      // Reset form data when closing without submitting
      setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
      setFormErrors({});
    }
  }, []);
  return (
    <Box>
      {/* Main layout using Grid for responsiveness. */}
      <Grid container spacing={3}>
        {/* Pizza Form Section */}
        {/* Grid item containing the Add/Edit Pizza form. */}
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 3,
              height: '100%',
              borderColor: 'divider',
            }}          >
            {/* Title for the form section, dynamically changes based on editing state. */}
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="medium">
              {editingId ? `Edit ${name}` : `Add New ${name}`}
            </Typography>
            {/* Alert displayed when editing an item, showing the name. */}
            {editingId && (
              <Alert
                severity="info"
                variant="outlined"
                sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}
                icon={<EditIcon fontSize="inherit" />}
              >
                Editing: <strong>{formData.name}</strong>              </Alert>
            )}
            {/* Form element wrapping the input fields. */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                  variant="outlined"
                  size="small"                  placeholder="Describe this pizza..."
                />
                {/* Pizza Base selection dropdown. */}
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel id="base-select-label">Pizza Base</InputLabel>
                  <Select
                    labelId="base-select-label"
                    name="baseId"
                    value={bases.some(base => base.id === formData.baseId) ? formData.baseId : ''}
                    label="Pizza Base"
                    onChange={handleBaseChange}                    displayEmpty={basesLoading}
                  >
                    {/* Conditional rendering for base options based on loading/error/success states. */}
                    {basesLoading ? (
                      <MenuItem disabled value="">
                        <em>Loading bases...</em>
                      </MenuItem>
                    ) : bases.length > 0 ? (
                      bases.map(base => (
                        <MenuItem key={base.id} value={base.id}>{base.name}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        <em>No bases available</em>
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Box>                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Toppings
                  </Typography>
                  {/* Autocomplete component for selecting/adding toppings. */}
                  <Autocomplete
                    multiple
                    id="toppings-autocomplete"
                    size="small"
                    options={toppingSuggestions}
                    value={formData.toppings}
                    onChange={handleToppingsChange}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          {...getTagProps({ index })}
                          sx={{ borderRadius: theme.shape.borderRadius / 2 }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={formData.toppings.length === 0 ? "Select or add toppings" : ""}
                        fullWidth
                      />
                    )}
                  />
                  {formData.toppings.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Select or type & press Enter
                    </Typography>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price || 'Set the pizza price (USD)'}
                  required
                  variant="outlined"
                  size="small"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}                />
                {/* Submit and Cancel buttons for the form. */}
                <Box sx={{ pt: 1, display: 'flex', gap: 1.5 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    startIcon={editingId ? <DoneIcon /> : <AddIcon />}
                    disabled={loading}
                    fullWidth
                    sx={{ borderRadius: theme.shape.borderRadius * 5 }}
                  >
                    {editingId ? 'Update Pizza' : 'Add Pizza'}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleCancelEdit}
                      startIcon={<CloseIcon />}
                      disabled={loading}
                      fullWidth
                      sx={{ borderRadius: theme.shape.borderRadius * 5 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>          </Paper>
        </Grid>
        {/* Pizza List Section */}
        {/* Grid item containing the list/table of pizzas. */}
        <Grid item xs={12} sm={8}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 3 },
              borderColor: 'divider',            }}
          >
            {/* Header section for the pizza list, including title, search bar, and refresh button. */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" color="text.primary" fontWeight="medium" sx={{ mb: 0 }}>
                {name} Menu ({filteredData.length})
              </Typography>              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Search input field. */}
                <TextField
                  placeholder="Search pizzas..."
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
                    minWidth: { xs: '100%', sm: '200px' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: theme.shape.borderRadius * 5,
                    },                  }}
                />
                {/* Refresh button. */}
                <Tooltip title="Refresh pizza list">
                  <span>
                    <IconButton
                      onClick={onRefresh}
                      size="medium"
                      color="primary"
                      disabled={loading}
                      aria-label="refresh pizza list"
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>            </Box>
            {/* Table container for displaying the pizza list. */}
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderColor: 'divider' }}>
              <Table aria-label="pizza menu table" size="small">
                {/* Table Head. */}
                <TableHead sx={{ bgcolor: alpha(theme.palette.text.primary, 0.04) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Name</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Description</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Base</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Toppings</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Actions</TableCell>
                  </TableRow>                </TableHead>
                {/* Table Body - Renders loading indicator, empty state, or pizza rows. */}
                <TableBody>
                  {/* Shows a loading spinner if data is loading initially. */}                  {loading && data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, border: 0 }}>
                        <CircularProgress size={24} />                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ border: 0 }}>
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <SearchIcon color="disabled" sx={{ fontSize: 40 }} />
                          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            {filterText ? 'No pizzas match search' : 'No pizzas added yet'}
                          </Typography>
                          {!filterText && (
                            <Button
                              startIcon={<AddIcon />}
                              variant="text"
                              color="primary"
                              size="small"
                              onClick={() => document.querySelector('input[name="name"]')?.focus()}
                              sx={{ mt: 1 }}
                            >
                              Add First Pizza
                            </Button>
                          )}
                        </Box>
                      </TableCell>                    </TableRow>
                  ) : (
                    /* Maps over the `filteredData` to render each pizza row. */
                    filteredData.map((item) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '& td, & th': { borderBottomColor: 'divider' }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} color="text.primary">
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="body2" color="text.secondary" noWrap title={item.description}>
                            {item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '…' : item.description) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" color="text.secondary">
                            {/* Find the base name from the fetched bases array */}
                            {bases.find(base => base.id === item.baseId)?.name || 'Regular'}
                          </Typography>
                        </TableCell>
{/* Displays pizza toppings, showing the first few and a tooltip for the rest. */}
                        <TableCell>
                          {item.toppings && item.toppings.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.toppings.slice(0, 3).map((topping, idx) => (
                                <Chip
                                  key={idx}
                                  label={topping}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                  sx={{ borderRadius: theme.shape.borderRadius / 2 }}
                                />
                              ))}
                              {item.toppings.length > 3 && (
                                <Tooltip title={item.toppings.slice(3).join(', ')}>
                                  <Chip
                                    label={`+${item.toppings.length - 3}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderRadius: theme.shape.borderRadius / 2 }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">None</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.primary" fontWeight={500}>
                            {typeof item.price === 'number'
                              ? item.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
                              : '—'}                          </Typography>
                        </TableCell>
                        {/* Action buttons cell (Order, Edit, Delete). */}
                        <TableCell align="right">
                          {/* Order button. */}
                          <Tooltip title="Order pizza">
                            <span>
                              <IconButton
                                color="success"
                                onClick={() => handleOrder(item)}
                                size="small"
                                aria-label="order pizza"
                                sx={{
                                  mr: 1,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.success.main, 0.08)
                                  }
                                }}
                              >
                                <ShoppingCartIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
// Edit button.
                          <Tooltip title="Edit pizza details">
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => handleEdit(item)}
                                size="small"
                                aria-label="edit pizza details"
                                disabled={loading}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                                  }
                                }}
                              >
                                <EditIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
// Delete button.
                          <Tooltip title="Delete pizza">
                            <span>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteConfirm(item.id)}
                                size="small"
                                aria-label="delete pizza"
                                disabled={loading}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.08)
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-pizza-dialog-title"
        aria-describedby="delete-pizza-dialog-description"
        PaperProps={{ sx: { borderRadius: theme.shape.borderRadius * 2.5 } }}
      >
        <DialogTitle id="delete-pizza-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-pizza-dialog-description">
            Are you sure you want to remove the pizza "<strong>{data.find(item => item.id === deletingId)?.name || 'this pizza'}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="text"
            sx={{ borderRadius: theme.shape.borderRadius * 5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disableElevation
            autoFocus
            sx={{ borderRadius: theme.shape.borderRadius * 5 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PizzaList;