import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent, Stack, Chip, IconButton, Divider,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, InputAdornment, Tooltip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Alert, alpha, CircularProgress, useTheme, Grid, Autocomplete
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Done as DoneIcon, Close as CloseIcon,
  Refresh as RefreshIcon, Search as SearchIcon, ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

/**
 * PizzaList Component: Displays a list of pizzas and provides CRUD functionality.
 */
function PizzaList({ name, data, loading, onCreate, onUpdate, onDelete, onRefresh }) {
  const theme = useTheme();

  // State
  const [formData, setFormData] = useState({
    id: '', name: '', description: '', baseId: 1, toppings: [], price: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bases, setBases] = useState([]);
  const [basesLoading, setBasesLoading] = useState(true);
  const [basesApiError, setBasesApiError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterText, setFilterText] = useState('');

  // Fetch pizza bases
  useEffect(() => {
    const fetchBases = async () => {
      setBasesLoading(true);
      setBasesApiError(null);
      try {
        const response = await fetch('/api/bases');
        if (!response.ok) throw new Error(`Failed to fetch bases (Status: ${response.status})`);
        const basesData = await response.json();
        setBases(basesData);
      } catch (error) {
        setBasesApiError(error.message || 'Could not load pizza bases.');
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

  // Topping suggestions
  const toppingSuggestions = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        'Mozzarella', 'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions', 'Sausage', 'Bacon', 'Ham',
        'Pineapple', 'Olives', 'Basil', 'Tomatoes', 'Spinach', 'Garlic', 'Chicken', 'Ground Beef'
      ];
    }
    const allToppings = data.flatMap(pizza => pizza.toppings || []);
    const uniqueToppings = [...new Set(allToppings)];
    const commonToppings = [
      'Mozzarella', 'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions', 'Sausage', 'Bacon', 'Ham',
      'Pineapple', 'Olives', 'Basil', 'Tomatoes', 'Spinach', 'Garlic', 'Chicken', 'Ground Beef'
    ];
    return [...uniqueToppings, ...commonToppings.filter(t => !uniqueToppings.includes(t))];
  }, [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!data) return [];
    const lowerCaseFilter = filterText.toLowerCase();
    return data.filter(item =>
      item.name.toLowerCase().includes(lowerCaseFilter) ||
      (item.description && item.description.toLowerCase().includes(lowerCaseFilter))
    );
  }, [data, filterText]);

  // Validation
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Pizza name is required';
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0)
      errors.price = 'Valid price required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.name, formData.price]);

  // Handlers
  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setFormErrors(prev => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (!validateForm()) return;
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
      const { id, ...createData } = submissionData;
      onCreate(createData);
      setAddDialogOpen(false);
    }
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
    setFormErrors({});
  }, [editingId, formData, onUpdate, onCreate, validateForm]);

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

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
    setFormErrors({});
  }, []);

  const handleDeleteConfirm = useCallback((id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingId) {
      onDelete(deletingId);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  }, [deletingId, onDelete]);

  const handleToppingsChange = useCallback((event, newValue) => {
    setFormData(prev => ({
      ...prev,
      toppings: newValue.map(t => String(t).trim()).filter(Boolean)
    }));
  }, []);

  const handleBaseChange = useCallback((event) => {
    const baseId = parseInt(event.target.value, 10);
    setFormData(prev => ({
      ...prev,
      baseId: isNaN(baseId) ? '' : baseId
    }));
  }, []);

  const handleOrder = (pizza) => {
    alert(`Order placed for: ${pizza.name} (${pizza.price ? pizza.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : 'N/A'})`);
  };

  const handleAddDialogToggle = useCallback((open) => {
    setAddDialogOpen(open);
    if (!open) {
      setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
      setFormErrors({});
    }
  }, []);

  // --- Layout ---
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Pizza Form */}
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight="medium">
              {editingId ? `Edit ${name}` : `Add New ${name}`}
            </Typography>
            {editingId && (
              <Alert severity="info" variant="outlined" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }} icon={<EditIcon fontSize="inherit" />}>
                Editing: <strong>{formData.name}</strong>
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth label="Name" name="name" value={formData.name}
                  onChange={handleFormChange} error={!!formErrors.name}
                  helperText={formErrors.name} required variant="outlined" size="small"
                />
                <TextField
                  fullWidth label="Description" name="description" value={formData.description}
                  onChange={handleFormChange} multiline rows={3} variant="outlined" size="small"
                  placeholder="Describe this pizza..."
                />
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel id="base-select-label">Pizza Base</InputLabel>
                  <Select
                    labelId="base-select-label" name="baseId"
                    value={bases.some(base => base.id === formData.baseId) ? formData.baseId : ''}
                    label="Pizza Base" onChange={handleBaseChange}
                    displayEmpty={basesLoading}
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
                    multiple id="toppings-autocomplete" size="small"
                    options={toppingSuggestions}
                    value={formData.toppings}
                    onChange={handleToppingsChange}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option} size="small" variant="outlined" color="secondary"
                          {...getTagProps({ index })}
                          sx={{ borderRadius: theme.shape.borderRadius / 2 }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params} variant="outlined"
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
                  fullWidth label="Price" name="price" value={formData.price}
                  onChange={handleFormChange} error={!!formErrors.price}
                  helperText={formErrors.price || 'Set the pizza price (USD)'}
                  required variant="outlined" size="small" type="number"
                  slotProps={{
                    input: { min: 0, step: 0.01 }
                  }}
                />
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ pt: 1, width: '100%' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    startIcon={editingId ? <DoneIcon /> : <AddIcon />}
                    disabled={loading}
                    sx={{
                      borderRadius: 5,
                      minWidth: 120,
                      background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                      color: theme.palette.primary.contrastText,
                      boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.10)',
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      transition: 'transform 0.16s, box-shadow 0.16s',
                      '&:hover': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        transform: 'scale(1.03)',
                        boxShadow: '0 4px 16px 0 rgba(33, 150, 243, 0.15)'
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${theme.palette.primary.dark}`,
                        outlineOffset: 2
                      }
                    }}
                  >
                    {editingId ? 'Update Pizza' : 'Add Pizza'}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleCancelEdit}
                      startIcon={<CloseIcon />}
                      disabled={loading}
                      sx={{
                        borderRadius: 5,
                        minWidth: 120,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        borderWidth: 2,
                        borderColor: theme.palette.primary.main,
                        background: 'white',
                        color: theme.palette.primary.main,
                        transition: 'transform 0.16s, box-shadow 0.16s',
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.08),
                          borderColor: theme.palette.primary.dark,
                          color: theme.palette.primary.dark,
                          transform: 'scale(1.03)',
                          boxShadow: '0 4px 16px 0 rgba(33, 150, 243, 0.08)'
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${theme.palette.primary.dark}`,
                          outlineOffset: 2
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>
        {/* Pizza List */}
        <Grid item xs={12} sm={8}>
          <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderColor: 'divider' }}>
            <Box sx={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
              alignItems: 'center', gap: 2, mb: 2
            }}>
              <Typography variant="h6" color="text.primary" fontWeight="medium" sx={{ mb: 0 }}>
                {name} Menu ({filteredData.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Search pizzas..." value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  size="small" variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: filterText && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setFilterText('')} edge="end" aria-label="clear search">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: '200px' },
                    '& .MuiOutlinedInput-root': { borderRadius: theme.shape.borderRadius * 5 }
                  }}
                />
                <Tooltip title="Refresh pizza list">
                  <span>
                    <IconButton
                      onClick={onRefresh} size="medium" color="primary" disabled={loading}
                      aria-label="refresh pizza list"
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderColor: 'divider' }}>
              <Table aria-label="pizza menu table" size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.text.primary, 0.04) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Name</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Description</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Base</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Toppings</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, color: 'text.secondary', borderBottomColor: 'divider' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, border: 0 }}>
                        <CircularProgress size={24} />
                      </TableCell>
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
                              variant="containedTonal" color="primary"
                              onClick={() => document.querySelector('input[name="name"]')?.focus()}
                              size="small" sx={{ mt: 1 }}
                            >
                              Add First Pizza
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id} hover sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '& td, & th': { borderBottomColor: 'divider' }
                      }}>
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
                            {bases.find(base => base.id === item.baseId)?.name || 'Regular'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.toppings && item.toppings.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.toppings.slice(0, 3).map((topping, idx) => (
                                <Chip
                                  key={idx} label={topping} size="small" variant="outlined" color="secondary"
                                  sx={{ borderRadius: theme.shape.borderRadius / 2 }}
                                />
                              ))}
                              {item.toppings.length > 3 && (
                                <Tooltip title={item.toppings.slice(3).join(', ')}>
                                  <Chip
                                    label={`+${item.toppings.length - 3}`}
                                    size="small" variant="outlined"
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
                              : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 160, px: 1 }}>
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap">
                            <Tooltip title="Order pizza">
                              <span>
                                <IconButton
                                  color="success"
                                  onClick={() => handleOrder(item)}
                                  size="small"
                                  aria-label="order pizza"
                                  sx={{
                                    borderRadius: 2.5,
                                    background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                                    color: theme.palette.success.contrastText,
                                    boxShadow: '0 2px 8px 0 rgba(76, 175, 80, 0.10)',
                                    transition: 'transform 0.16s, box-shadow 0.16s',
                                    '&:hover': {
                                      background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 16px 0 rgba(76, 175, 80, 0.15)'
                                    },
                                    '&:focus-visible': {
                                      outline: `2px solid ${theme.palette.success.dark}`,
                                      outlineOffset: 2
                                    },
                                    p: 1.1,
                                    minWidth: 40,
                                    minHeight: 40
                                  }}
                                >
                                  <ShoppingCartIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Edit pizza details">
                              <span>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEdit(item)}
                                  size="small"
                                  aria-label="edit pizza details"
                                  disabled={loading}
                                  sx={{
                                    borderRadius: 2.5,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                    color: theme.palette.primary.contrastText,
                                    boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.10)',
                                    transition: 'transform 0.16s, box-shadow 0.16s',
                                    '&:hover': {
                                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 16px 0 rgba(33, 150, 243, 0.15)'
                                    },
                                    '&:focus-visible': {
                                      outline: `2px solid ${theme.palette.primary.dark}`,
                                      outlineOffset: 2
                                    },
                                    p: 1.1,
                                    minWidth: 40,
                                    minHeight: 40
                                  }}
                                >
                                  <EditIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Delete pizza">
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteConfirm(item.id)}
                                  size="small"
                                  aria-label="delete pizza"
                                  disabled={loading}
                                  sx={{
                                    borderRadius: 2.5,
                                    background: `linear-gradient(90deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                                    color: theme.palette.error.contrastText,
                                    boxShadow: '0 2px 8px 0 rgba(244, 67, 54, 0.10)',
                                    transition: 'transform 0.16s, box-shadow 0.16s',
                                    '&:hover': {
                                      background: `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 16px 0 rgba(244, 67, 54, 0.15)'
                                    },
                                    '&:focus-visible': {
                                      outline: `2px solid ${theme.palette.error.dark}`,
                                      outlineOffset: 2
                                    },
                                    p: 1.1,
                                    minWidth: 40,
                                    minHeight: 40
                                  }}
                                >
                                  <DeleteIcon fontSize="inherit" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
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
        slotProps={{ paper: { sx: { borderRadius: theme.shape.borderRadius * 2.5 } } }}
      >
        <DialogTitle id="delete-pizza-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-pizza-dialog-description">
            Are you sure you want to remove the pizza "<strong>{data.find(item => item.id === deletingId)?.name || 'this pizza'}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="text" sx={{ borderRadius: theme.shape.borderRadius * 5 }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disableElevation
            autoFocus
            sx={{
              borderRadius: 5,
              background: `linear-gradient(90deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
              color: theme.palette.error.contrastText,
              boxShadow: '0 2px 8px 0 rgba(244, 67, 54, 0.10)',
              fontWeight: 600,
              letterSpacing: 0.5,
              transition: 'transform 0.16s, box-shadow 0.16s',
              '&:hover': {
                background: `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                transform: 'scale(1.03)',
                boxShadow: '0 4px 16px 0 rgba(244, 67, 54, 0.15)'
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.error.dark}`,
                outlineOffset: 2
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PizzaList;