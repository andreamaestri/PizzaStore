import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, Typography, TextField, Button, Card, CardContent, 
  Stack, Chip, IconButton, Divider, MenuItem, Select,
  InputLabel, FormControl, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, InputAdornment,
  Tooltip, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Alert, InputBase, alpha, Fab, Autocomplete, CircularProgress,
  useTheme, // Import useTheme
  Grid // Import Grid (standard)
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ErrorOutline as ErrorOutlineIcon // Import error icon
} from '@mui/icons-material';

function PizzaList({ name, data, loading, onCreate, onUpdate, onDelete, onRefresh }) {
  const theme = useTheme(); // Get theme
  const [formData, setFormData] = useState({ 
    id: '', 
    name: '', 
    description: '', 
    baseId: 1, 
    toppings: [] 
  });
  const [editingId, setEditingId] = useState(null);
  const [bases, setBases] = useState([]);
  const [basesLoading, setBasesLoading] = useState(true);
  const [basesApiError, setBasesApiError] = useState(null); // State for API errors
    // Fetch pizza bases from API
  useEffect(() => {
    const fetchBases = async () => {
      setBasesLoading(true);
      setBasesApiError(null); // Reset error on fetch
      try {
        // Assuming the bases API endpoint follows RESTful conventions
        const response = await fetch('/api/bases');
        if (!response.ok) {
          throw new Error(`Failed to fetch bases (Status: ${response.status})`);
        }
        const basesData = await response.json();
        setBases(basesData);
      } catch (error) {
        console.error('Error fetching pizza bases:', error);
        setBasesApiError(error.message || 'Could not load pizza bases.');
        // Keep fallback bases if API fails
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
    // Generate topping suggestions (Memoized)
  const toppingSuggestions = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        'Mozzarella', 'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions',
        'Sausage', 'Bacon', 'Ham', 'Pineapple', 'Olives', 'Basil',
        'Tomatoes', 'Spinach', 'Garlic', 'Chicken', 'Ground Beef'
      ];
    }
    const allToppings = data
      .flatMap(pizza => pizza.toppings || [])
      .filter(topping => topping);
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
  }, [data]); // Recalculate only when data changes
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterText, setFilterText] = useState('');
    // Filter data (Memoized)
  const filteredData = useMemo(() => {
    if (!data) return [];
    const lowerCaseFilter = filterText.toLowerCase();
    return data.filter(item =>
      item.name.toLowerCase().includes(lowerCaseFilter) ||
      (item.description && item.description.toLowerCase().includes(lowerCaseFilter))
    );
  }, [data, filterText]); // Recalculate when data or filterText changes

  // Validate form (Memoized)
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Pizza name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.name]); // Dependency on formData.name
  // Handle form changes (Memoized)
  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when field is edited
    setFormErrors(prev => {
      if (!prev[name]) return prev; // No change if error doesn't exist
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []); // No dependencies needed as setters are stable
  
  // Removing handleRemoveTopping as it's no longer needed with Autocomplete  // Handle form submission (Memoized)
  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ensure baseId is a number if it exists
    const submissionData = {
      ...formData,
      baseId: formData.baseId ? parseInt(formData.baseId, 10) : null, // Ensure baseId is number or null
      toppings: formData.toppings || [] // Ensure toppings is an array
    };

    if (editingId) {
      onUpdate(submissionData); // Pass the validated/cleaned data
      setEditingId(null);
    } else {
      // For creation, ensure ID is not sent if it's empty or null
      const { id, ...createData } = submissionData;
      onCreate(createData);
    }

    // Reset form
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [] });
    setFormErrors({}); // Clear errors after successful submission
  }, [editingId, formData, onUpdate, onCreate, validateForm]); // Dependencies

  // Handle edit action (Memoized)
  const handleEdit = useCallback((item) => {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || '',
      baseId: item.baseId || 1, // Default to 1 if null/undefined
      toppings: item.toppings || []
    });
    setFormErrors({}); // Clear errors when starting edit
  }, []); // No dependencies needed

  // Handle cancel edit action (Memoized)
  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [] });
    setFormErrors({});
  }, []); // No dependencies needed

  // Handle delete confirmation dialog opening (Memoized)
  const handleDeleteConfirm = useCallback((id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  }, []); // No dependencies needed

  // Handle actual deletion (Memoized)
  const confirmDelete = useCallback(() => {
    if (deletingId) {
      onDelete(deletingId);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  }, [deletingId, onDelete]); // Dependencies

  // Handle Autocomplete changes (Memoized) - Specific for toppings
  const handleToppingsChange = useCallback((event, newValue) => {
    setFormData(prev => ({
      ...prev,
      // Ensure toppings are always strings and filter out empty ones if freeSolo adds them
      toppings: newValue.map(t => String(t).trim()).filter(Boolean)
    }));
  }, []); // No dependencies needed

  // Handle Base Select changes (Memoized)
  const handleBaseChange = useCallback((event) => {
    const baseId = parseInt(event.target.value, 10);
    setFormData(prev => ({
      ...prev,
      baseId: isNaN(baseId) ? '' : baseId // Handle potential NaN
    }));
  }, []); // No dependencies needed

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Pizza Form Section */}
        <Grid item xs={12} sm={4}> {/* Use item prop and xs */}
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderColor: 'divider', // Use theme divider color
            }}
          >
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="medium"> {/* Use text.primary for titles */}
              {editingId ? `Edit ${name}` : `Add New ${name}`}
            </Typography>
            
            {editingId && (
              <Alert 
                severity="info" 
                variant="outlined" // Use outlined or standard based on theme preference
                sx={{ mb: 2, borderRadius: theme.shape.borderRadius }} // Consistent border radius
                icon={<EditIcon fontSize="inherit" />}
              >
                Editing: <strong>{formData.name}</strong>
              </Alert>
            )}
            
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
                  variant="outlined" // Standard M3 text field
                  size="small"
                  // Theme overrides should handle border radius
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                  variant="outlined" // Standard M3 text field
                  size="small"
                  placeholder="Describe this pizza..."
                  // Theme overrides should handle border radius
                />
                  <FormControl fullWidth size="small" variant="outlined"> {/* Add variant */}
                  <InputLabel id="base-select-label">Pizza Base</InputLabel>
                  <Select
                    labelId="base-select-label"
                    name="baseId"
                    value={bases.some(base => base.id === formData.baseId) ? formData.baseId : ''}
                    label="Pizza Base"
                    onChange={handleBaseChange}
                    displayEmpty={basesLoading}
                    // Theme overrides should handle border radius
                  >
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
                  <Box>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Toppings
                  </Typography>
                  <Autocomplete
                    multiple
                    id="toppings-autocomplete"
                    size="small"
                    options={toppingSuggestions}
                    value={formData.toppings}
                    onChange={handleToppingsChange}
                    freeSolo // Allows adding new toppings
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          // Use theme overrides for chip styling
                          label={option}
                          size="small"
                          variant="outlined" // M3 often uses outlined chips
                          color="secondary" // Use secondary color for toppings
                          {...getTagProps({ index })}
                          sx={{ borderRadius: theme.shape.borderRadius / 2 }} // Slightly less rounded chips
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined" // Standard M3 text field
                        placeholder={formData.toppings.length === 0 ? "Select or add toppings" : ""}
                        fullWidth
                        // Theme overrides should handle border radius
                      />
                    )}
                    sx={{
                      // Minimal sx, rely on theme overrides
                      '& .MuiOutlinedInput-root': { // Style the Autocomplete input like other TextFields
                        // padding: '8.5px 14px', // Adjust if needed based on theme
                      }
                    }}
                  />
                  {formData.toppings.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Select or type & press Enter
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ pt: 1, display: 'flex', gap: 1.5 }}> {/* Adjusted gap */}
                  <Button
                    type="submit"
                    variant="contained" // M3 filled button
                    color="primary"
                    disableElevation // M3 filled buttons are flat
                    startIcon={editingId ? <DoneIcon /> : <AddIcon />}
                    disabled={loading}
                    fullWidth
                    sx={{ borderRadius: theme.shape.borderRadius * 5 }} // M3 pill shape
                  >
                    {editingId ? 'Update Pizza' : 'Add Pizza'}
                  </Button>
                  
                  {editingId && (
                    <Button
                      variant="outlined" // M3 outlined button
                      color="inherit" // Use inherit or secondary
                      onClick={handleCancelEdit}
                      startIcon={<CloseIcon />}
                      disabled={loading}
                      fullWidth
                      sx={{ borderRadius: theme.shape.borderRadius * 5 }} // M3 pill shape
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>
        {/* Pizza List Section */}
        <Grid item xs={12} sm={8}> {/* Use item prop and xs */}
          <Paper
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: { xs: 2, sm: 3 }, // Responsive padding            
              borderColor: 'divider', // Use theme divider color
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" color="text.primary" fontWeight="medium" sx={{ mb: 0 }}> {/* Use text.primary */}
                {name} Menu ({filteredData.length})
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Search Input - Using TextField for consistency */}
                <TextField
                  placeholder="Search pizzas..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  size="small"
                  variant="outlined" // Standard M3 text field
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
                          aria-label="clear search" // Add aria-label
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: '200px' }, // Responsive width
                    // Theme overrides handle radius
                    '& .MuiOutlinedInput-root': { // Ensure consistent radius with buttons
                       borderRadius: theme.shape.borderRadius * 5,
                    },
                  }}
                />
                {/* MD3 Standard Icon Button with Clear Tooltip */}
                <Tooltip title="Refresh pizza list">
                  <span> {/* Span needed for disabled button tooltip */}
                    <IconButton 
                      onClick={onRefresh} 
                      size="medium" // Standard size for icon buttons
                      color="primary" 
                      disabled={loading}
                      aria-label="refresh pizza list"
                      sx={{ 
                        // Standard icon button hover/focus styles
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.08) 
                        }
                      }}
                    >
                      <RefreshIcon /> {/* Use standard size icon */}
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            
            {/* M3 Table Styling: Use Paper variant="outlined" for container */}    
             <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderColor: 'divider' }}>
              <Table aria-label="pizza menu table" size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.text.primary, 0.04) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Name</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Description</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Base</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Toppings</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && data.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={5} align="center" sx={{ py: 4, border: 0 }}> {/* Remove border */}
                         <CircularProgress size={24} />
                       </TableCell>
                     </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ border: 0 }}> {/* Remove border */}
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <SearchIcon color="disabled" sx={{ fontSize: 40 }} />
                          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            {filterText ? 'No pizzas match search' : 'No pizzas added yet'}
                          </Typography>
                          {!filterText && (
                            <Button 
                              startIcon={<AddIcon />} 
                              variant="text" // Use text button for less emphasis
                              color="primary"
                              size="small"
                              onClick={() => document.querySelector('input[name="name"]')?.focus()} // Focus the name field
                              sx={{ mt: 1 }} // Add margin top
                            >
                              Add First Pizza
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow 
                        key={item.id} 
                        hover // Keep hover effect
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 }, // Remove border on last row
                          '& td, & th': { borderBottomColor: 'divider' } // Use divider color for borders
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} color="text.primary"> {/* Use text.primary */}
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="body2" color="text.secondary" noWrap title={item.description}>
                            {item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '…' : item.description) : '—'} {/* Use ellipsis character */}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" color="text.secondary">
                            {bases.find(base => base.id === item.baseId)?.name || 'Regular'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.toppings && item.toppings.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.toppings.slice(0, 3).map((topping, idx) => ( // Show max 3 toppings initially
                                <Chip 
                                  key={idx} 
                                  label={topping} 
                                  size="small" 
                                  variant="outlined" // M3 outlined chip
                                  color="secondary"
                                  sx={{ borderRadius: theme.shape.borderRadius / 2 }} // Slightly less rounded
                                />
                              ))}
                              {item.toppings.length > 3 && (
                                <Tooltip title={item.toppings.slice(3).join(', ')}>
                                  <Chip 
                                    label={`+${item.toppings.length - 3}`} 
                                    size="small" 
                                    variant="outlined" // Consistent chip style
                                    sx={{ borderRadius: theme.shape.borderRadius / 2 }} 
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">None</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {/* MD3 Standard Icon Button for Edit */}
                          <Tooltip title="Edit pizza details">
                            <span> {/* Span needed for disabled button tooltip */}
                              <IconButton 
                                color="primary" 
                                onClick={() => handleEdit(item)}
                                size="small" // Keep small for table density
                                aria-label="edit pizza details"
                                disabled={loading}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08) // Subtle hover
                                  }
                                }}
                              >
                                <EditIcon fontSize="inherit" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          {/* MD3 Standard Icon Button for Delete */}
                          <Tooltip title="Delete pizza">
                            <span> {/* Span needed for disabled button tooltip */}
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteConfirm(item.id)}
                                size="small" // Keep small for table density
                                aria-label="delete pizza"
                                disabled={loading}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.08) // Subtle hover
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
      
      {/* Mobile add button - Consider removing if form is always visible */}
      {/* ... (FAB code remains commented out) ... */}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-pizza-dialog-title"
        aria-describedby="delete-pizza-dialog-description"
        PaperProps={{ sx: { borderRadius: theme.shape.borderRadius * 2.5 } }} // M3 Dialog border radius
      >
        <DialogTitle id="delete-pizza-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-pizza-dialog-description">
            Are you sure you want to remove the pizza "<strong>{data.find(item => item.id === deletingId)?.name || 'this pizza'}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}> {/* Add padding */}
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            variant="text" // M3 text button
            sx={{ borderRadius: theme.shape.borderRadius * 5 }} // M3 pill shape
          >
            Cancel
          </Button> 
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" // M3 filled button
            disableElevation // M3 filled buttons are flat
            autoFocus
            sx={{ borderRadius: theme.shape.borderRadius * 5 }} // M3 pill shape
          > 
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PizzaList;