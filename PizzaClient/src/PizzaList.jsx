import { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, TextField, Button, Card, CardContent, 
  Stack, Chip, IconButton, Divider, MenuItem, Select,
  InputLabel, FormControl, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, InputAdornment,
  Tooltip, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Alert, InputBase, alpha, Fab, Autocomplete, CircularProgress
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
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Pizza Form Section */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom color="primary" fontWeight="medium">
              {editingId ? `Edit ${name}` : `Add New ${name}`}
            </Typography>
            
            {editingId && (
              <Alert 
                severity="info" 
                variant="outlined" 
                sx={{ mb: 2 }}
                icon={<EditIcon fontSize="inherit" />}
              >
                You are editing "{formData.name}"
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
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
                  size="small"
                  placeholder="Describe your pizza..."
                />
                
                <FormControl fullWidth size="small">
                  <InputLabel id="base-select-label">Pizza Base</InputLabel>
                  <Select
                    labelId="base-select-label"
                    name="baseId"
                    value={formData.baseId}
                    label="Pizza Base"
                    onChange={(e) => {
                      const baseId = parseInt(e.target.value, 10);
                      setFormData(prev => ({
                        ...prev,
                        baseId
                      }));
                    }}
                  >
                    {bases.map(base => (
                      <MenuItem key={base.id} value={base.id}>{base.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                  <Box>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">
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
                          variant="outlined"
                          label={option}
                          size="small"
                          color="primary"
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
                      />
                    )}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        padding: '4px 8px',
                        borderRadius: 2,
                      }
                    }}
                  />
                  {formData.toppings.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, fontSize: '0.75rem' }}>
                      Select from suggested toppings or type your own and press Enter
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ pt: 1, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    startIcon={editingId ? <DoneIcon /> : <AddIcon />}
                    disabled={loading}
                    fullWidth
                  >
                    {editingId ? 'Update' : 'Add to Menu'}
                  </Button>
                  
                  {editingId && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleCancelEdit}
                      startIcon={<CloseIcon />}
                      disabled={loading}
                      fullWidth
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
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="medium" sx={{ mb: 0 }}>
                {name} Menu Items ({filteredData.length})
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 1,
                    backgroundColor: alpha('#f5f5f5', 0.15),
                    '&:hover': {
                      backgroundColor: alpha('#f5f5f5', 0.25),
                    },
                    border: '1px solid',
                    borderColor: 'divider',
                    width: '100%',
                    [theme => theme.breakpoints.up('sm')]: {
                      width: 'auto',
                    },
                  }}
                >
                  <Box sx={{ padding: '0 12px', height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                    <SearchIcon color="action" sx={{ fontSize: 20 }} />
                  </Box>
                  <InputBase
                    placeholder="Search pizzas..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    sx={{
                      color: 'inherit',
                      padding: '8px 8px 8px 0',
                      // vertical padding + font size from searchIcon
                      paddingLeft: `calc(1em + 28px)`,
                      width: '100%',
                      [theme => theme.breakpoints.up('md')]: {
                        width: '16ch',
                        '&:focus': {
                          width: '24ch',
                        },
                      },
                    }}
                  />
                </Box>
                  
                <Tooltip title="Refresh list">
                  <IconButton onClick={onRefresh} size="small" color="primary" sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, border: '1px solid', borderColor: 'divider' }}>
              <Table aria-label="pizza menu table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Base</TableCell>
                    <TableCell>Toppings</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                            {filterText ? 'No pizzas match your search' : 'No pizza items found. Add your first pizza!'}
                          </Typography>
                          {!filterText && (
                            <Button 
                              startIcon={<AddIcon />} 
                              variant="contained" 
                              color="primary"
                              disableElevation
                              size="small"
                              onClick={() => document.getElementById('name')?.focus()}
                            >
                              Add Your First Pizza
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight={500}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.description || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {bases.find(base => base.id === item.baseId)?.name || 'Regular'}
                        </TableCell>
                        <TableCell>
                          {item.toppings && item.toppings.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.toppings.map((topping, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={topping} 
                                  size="small" 
                                  variant="outlined"
                                  color="secondary"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">No toppings</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEdit(item)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteConfirm(item.id)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
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
      
      {/* Mobile add button */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', bottom: 20, right: 20 }}>
        <Fab color="primary" aria-label="add" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <AddIcon />
        </Fab>
      </Box>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this pizza from the menu? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disableElevation autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PizzaList;