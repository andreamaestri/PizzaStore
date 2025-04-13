import { useState, useEffect } from 'react';
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
  MoreVert as MoreVertIcon,
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
  const [toppingSuggestions, setToppingSuggestions] = useState([]);
  
  // Fetch pizza bases from API
  useEffect(() => {
    const fetchBases = async () => {
      try {
        // Assuming the bases API endpoint follows RESTful conventions
        const response = await fetch('/api/bases');
        if (!response.ok) {
          throw new Error('Failed to fetch bases');
        }
        const basesData = await response.json();
        setBases(basesData);
      } catch (error) {
        console.error('Error fetching pizza bases:', error);
        // Fallback to default bases if API fails
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
  
  // Extract unique toppings from existing pizzas for suggestions
  useEffect(() => {
    if (data && data.length > 0) {
      // Collect all toppings from existing pizzas
      const allToppings = data
        .flatMap(pizza => pizza.toppings || [])
        .filter(topping => topping); // Filter out any null/undefined values
      
      // Create a Set to get unique toppings and convert back to array
      const uniqueToppings = [...new Set(allToppings)];
      
      // Add some common toppings if the list is small
      const commonToppings = [
        'Mozzarella', 'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions', 
        'Sausage', 'Bacon', 'Ham', 'Pineapple', 'Olives', 'Basil', 
        'Tomatoes', 'Spinach', 'Garlic', 'Chicken', 'Ground Beef'
      ];
      
      // Combine unique toppings from existing pizzas with common ones
      // but prioritize the ones from the database
      setToppingSuggestions([
        ...uniqueToppings,
        ...commonToppings.filter(t => !uniqueToppings.includes(t))
      ]);
    }
  }, [data]);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterText, setFilterText] = useState('');
  
  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(filterText.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(filterText.toLowerCase()))
  );

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Pizza name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  // These functions are no longer needed since the Autocomplete component 
  // handles adding and removing toppings directly
  // But we keep handleRemoveTopping for backward compatibility if needed
  const handleRemoveTopping = (index) => {
    setFormData(prevData => ({
      ...prevData,
      toppings: prevData.toppings.filter((_, i) => i !== index)
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editingId) {
      onUpdate(formData);
      setEditingId(null);
    } else {
      onCreate(formData);
    }
    
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [] });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || '',
      baseId: item.baseId || 1,
      toppings: item.toppings || []
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [] });
    setToppingInput('');
    setFormErrors({});
  };
  
  const handleDeleteConfirm = (id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = () => {
    if (deletingId) {
      onDelete(deletingId);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };  return (
    <Box>
      <Grid container spacing={3}>
        {/* Pizza Form Section */}
        <Grid size={12} sm={4}>
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderColor: 'divider', // Use theme divider color
            }}
          >
            <Typography variant="h6" gutterBottom color="primary.main" fontWeight="medium"> {/* Use theme color */}
              {editingId ? `Edit ${name}` : `Add New ${name}`}
            </Typography>
            
            {editingId && (
              <Alert 
                severity="info" 
                variant="outlined" // Use outlined or standard based on theme preference
                sx={{ mb: 2, borderRadius: theme.shape.borderRadius / 2 }} // Slightly less rounded
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
                  variant="outlined"
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
                  variant="outlined"
                  size="small"
                  placeholder="Describe this pizza..."
                  // Theme overrides should handle border radius
                />
                  <FormControl fullWidth size="small">
                  <InputLabel id="base-select-label">Pizza Base</InputLabel>
                  <Select
                    labelId="base-select-label"
                    name="baseId"
                    value={bases.some(base => base.id === formData.baseId) ? formData.baseId : ''}
                    label="Pizza Base"
                    onChange={(e) => {
                      const baseId = parseInt(e.target.value, 10);
                      setFormData(prev => ({
                        ...prev,
                        baseId
                      }));
                    }}
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
                  </Typography>                  <Autocomplete
                    multiple
                    id="toppings-autocomplete"
                    size="small"
                    options={toppingSuggestions}
                    value={formData.toppings}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        toppings: newValue
                      }));
                    }}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          // Use theme overrides for chip styling
                          label={option}
                          size="small"
                          color="secondary" // Use secondary color for toppings
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={formData.toppings.length === 0 ? "Select or add toppings" : ""}
                        fullWidth
                        // Theme overrides should handle border radius
                      />
                    )}
                    sx={{
                      // Minimal sx, rely on theme overrides
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
                    variant="contained"
                    color="primary"
                    // disableElevation // Theme override might handle this
                    startIcon={editingId ? <DoneIcon /> : <AddIcon />}
                    disabled={loading}
                    fullWidth
                    // Theme overrides should handle border radius
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
                      // Theme overrides should handle border radius
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Grid>        {/* Pizza List Section */}
        <Grid size={12} sm={8}>
          <Paper
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: { xs: 2, sm: 3 }, // Responsive padding
               // Use theme border radius
              borderColor: 'divider', // Use theme divider color
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" color="primary.main" fontWeight="medium" sx={{ mb: 0 }}> {/* Use theme color */}
                {name} Menu ({filteredData.length})
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Search Input - Using TextField for consistency */}
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
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: '200px' }, // Responsive width
                    // Theme overrides handle radius
                  }}
                />
                    {/* MD3 Contained Icon Button with Clear Tooltip */}
                <Tooltip title="Refresh pizza list">
                  <span>
                    <IconButton 
                      onClick={onRefresh} 
                      size="small" 
                      className="contained"
                      color="primary" 
                      disabled={loading}
                      aria-label="refresh pizza list"
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.12) 
                        }
                      }}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: theme.shape.borderRadius / 2, borderColor: 'divider' }}>
              <Table aria-label="pizza menu table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Base</TableCell>
                    <TableCell>Toppings</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && data.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                         <CircularProgress size={24} />
                       </TableCell>
                     </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
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
                              onClick={() => document.getElementById('name')?.focus()} // Focus the name field
                            >
                              Add First Pizza
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="body2" color="text.secondary" noWrap title={item.description}>
                            {item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : '—'}
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
                                  color="secondary"
                                  // Theme overrides handle styling
                                />
                              ))}
                              {item.toppings.length > 3 && (
                                <Tooltip title={item.toppings.slice(3).join(', ')}>
                                  <Chip label={`+${item.toppings.length - 3}`} size="small" />
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">None</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">                          {/* MD3 Standard Icon Button for Edit with descriptive tooltip */}
                          <Tooltip title="Edit pizza details">
                            <span>
                              <IconButton 
                                className="standard"
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
                          {/* MD3 Standard Icon Button for Delete with descriptive tooltip */}
                          <Tooltip title="Delete pizza">
                            <span>
                              <IconButton 
                                className="standard"
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
      
      {/* Mobile add button - Consider removing if form is always visible */}
      {/* <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', bottom: 20, right: 20 }}>
        <Fab color="primary" aria-label="add" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <AddIcon />
        </Fab>
      </Box> */}
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-pizza-dialog-title"
        aria-describedby="delete-pizza-dialog-description"
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
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="text">Cancel</Button> {/* M3 style */}
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus> {/* M3 style */}
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PizzaList;