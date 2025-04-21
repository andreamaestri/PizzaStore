import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import FloatingPizzaClone from './components/FloatingPizzaClone';
import OrderModal from './components/pizzas/OrderModal';
import { useOrderData } from './hooks/useOrderData';
import BasketIcon from './components/BasketIcon';
import BasketDrawer from './components/BasketDrawer';
import { useBasket } from './context/BasketContext';
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
  const { items: basketItems, addToBasket, clearBasket } = useBasket();
  const [basketOpen, setBasketOpen] = useState(false);
  const [basketPop, setBasketPop] = useState(false);
  const [cloneProps, setCloneProps] = useState(null);
  const rowRefs = useRef({});
  const basketRef = useRef();
  const isAnimating = useRef(false);

  // Order modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState(null);
  const {
    createOrder,
    notification,
    closeNotification
  } = useOrderData();

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
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [topping, setTopping] = useState('');
  const [showToppingInput, setShowToppingInput] = useState(false);

  // Load base options on component mount
  useEffect(() => {
    fetchBases();
  }, []);

  // Fetch available pizza bases
  const fetchBases = async () => {
    setBasesLoading(true);
    try {
      const response = await fetch('/api/bases');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setBases(data);
      setBasesApiError(null);
    } catch (error) {
      console.error('Failed to fetch bases:', error);
      setBasesApiError(error.message);
    } finally {
      setBasesLoading(false);
    }
  };

  // Filter pizzas based on search term
  const filteredPizzas = useMemo(() => {
    if (!data) return [];
    return data.filter(pizza => {
      const matchesSearch = searchTerm === '' ||
        pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchTerm]);

  // Handle dialog toggle
  const handleAddDialogToggle = useCallback((open) => {
    setAddDialogOpen(open);
    if (!open) {
      // Reset form when closing dialog
      setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
      setFormErrors({});
    }
  }, []);

  // Handle input change in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Price validation
    if (name === 'price') {
      // Allow empty or valid price format (optional dollar sign, optional thousands separator, optional decimal)
      if (value === '' || /^\$?[0-9,]*\.?[0-9]*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error if value is valid
        if (formErrors[name]) {
          setFormErrors(prev => ({ ...prev, [name]: null }));
        }
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user inputs value
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle base selection change
  const handleBaseChange = (e) => {
    setFormData(prev => ({ ...prev, baseId: e.target.value }));
  };

  // Handle adding a topping to the form
  const handleAddTopping = () => {
    if (topping && !formData.toppings.includes(topping)) {
      setFormData(prev => ({
        ...prev,
        toppings: [...prev.toppings, topping]
      }));
      setTopping('');
    }
  };

  // Handle removing a topping from the form
  const handleRemoveTopping = (toppingToRemove) => {
    setFormData(prev => ({
      ...prev,
      toppings: prev.toppings.filter(t => t !== toppingToRemove)
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    // Price validation - empty or valid number
    if (formData.price) {
      const numericPrice = parseFloat(formData.price.replace(/[^\d.]/g, ''));
      if (isNaN(numericPrice)) errors.price = 'Price must be a valid number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the form to create/update pizza
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // Format price as a number
    let priceAsNumber = null;
    if (formData.price) {
      priceAsNumber = parseFloat(formData.price.replace(/[^\d.]/g, ''));
    }
    
    const formattedData = {
      ...formData,
      price: priceAsNumber
    };
    
    if (editingId !== null) {
      onUpdate(editingId, formattedData);
      setEditingId(null);
    } else {
      onCreate(formattedData);
    }
    
    setAddDialogOpen(false);
    setFormData({ id: '', name: '', description: '', baseId: 1, toppings: [], price: '' });
  };

  // Handle edit pizza
  const handleEdit = (pizza) => {
    // Format price for display in the form
    const displayPrice = pizza.price !== null && pizza.price !== undefined
      ? pizza.price.toString()
      : '';
    
    setFormData({
      id: pizza.id,
      name: pizza.name,
      description: pizza.description,
      baseId: pizza.baseId || 1,
      toppings: Array.isArray(pizza.toppings) ? [...pizza.toppings] : [],
      price: displayPrice
    });
    setEditingId(pizza.id);
    setAddDialogOpen(true);
  };

  // Handle delete confirmation open
  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  // Execute delete after confirmation
  const confirmDelete = () => {
    if (deleteId !== null) {
      onDelete(deleteId);
      setDeleteId(null);
    }
    setDeleteConfirmOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle basket toggle
  const toggleBasket = () => {
    setBasketOpen(prev => !prev);
  };  // Add to basket with animation using Motion
  const handleAddToBasket = useCallback((pizza) => {
    // Prevent duplicate animations
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    // Using requestAnimationFrame for proper timing with vsync
    requestAnimationFrame(() => {
      const rowEl = rowRefs.current[pizza.id];
      const basketEl = basketRef.current;
      if (rowEl && basketEl) {
        // Create a subtle highlight effect on the row before animation
        rowEl.style.transition = 'background-color 0.15s ease';
        rowEl.style.backgroundColor = 'rgba(76, 175, 80, 0.08)';
        
        // Get precise measurements
        const rowRect = rowEl.getBoundingClientRect();
        const basketRect = basketEl.getBoundingClientRect();
        
        // Calculate precise target position for basket center
        const targetX = basketRect.left + basketRect.width / 2 - (rowRect.left + rowRect.width / 2);
        const targetY = basketRect.top + basketRect.height / 2 - (rowRect.top + rowRect.height / 2);
        
        // Short delay before starting animation for better visual effect
        setTimeout(() => {
          // Reset row highlight
          rowEl.style.backgroundColor = '';
          
          // Animate from row to basket center with enhanced visuals
          setCloneProps({
            rect: {
              top: rowRect.top,
              left: rowRect.left,
              width: rowRect.width,
              height: rowRect.height,
            },
            target: {
              left: targetX,
              top: targetY,
            },
            children: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: theme.palette.background.paper,
                  borderRadius: 16,
                  width: '100%',
                  height: '100%',
                  padding: '0 12px',
                  gap: 12,
                  fontSize: 16,
                  // Enhanced visual styles
                  boxShadow: 'inset 0 0 0 1px rgba(76, 175, 80, 0.2)',
                  overflow: 'hidden',
                }}
              >
                <span style={{ flex: 2, fontWeight: 500 }}>{pizza.name}</span>
                <span style={{ flex: 3, color: theme.palette.text.secondary }}>{pizza.description}</span>
                <span style={{ flex: 2, color: theme.palette.text.disabled, fontSize: 14 }}>{pizza.toppings && pizza.toppings.length > 0 ? pizza.toppings.join(', ') : 'None'}</span>
                <span style={{ flex: 1, fontWeight: 600, color: theme.palette.success.main }}>{typeof pizza.price === 'number' ? pizza.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '\u2014'}</span>
                <span style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <ShoppingCartIcon color="success" />
                </span>
              </div>
            ),
          });
          
          // Timing coordinated with Motion animation duration
          // Wait until animation is about 60% complete before updating basket
          setTimeout(() => {
            addToBasket(pizza, 1);
            setBasketPop(true);
          }, 300);
        }, 50);
      }
    });
  }, [addToBasket]);

  // Ensure animation flag is cleared when animation ends
  const handleCloneAnimationEnd = useCallback(() => {
    setCloneProps(null);
    isAnimating.current = false;
  }, []);

  // Reset basket pop effect
  const handleBasketPopEnd = () => {
    setBasketPop(false);
  };

  // Handle opening order modal
  const handleOpenOrderModal = (pizza) => {
    setSelectedPizza(pizza);
    setOrderModalOpen(true);
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box sx={{ 
        p: 2, 
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: theme.palette.primary.contrastText,
        borderRadius: 2,
        mb: 2,
        boxShadow: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1
      }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          {name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', flexWrap: 'wrap' }}>
          {/* Search */}
          <TextField
            placeholder="Search pizzas..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              minWidth: { xs: '100%', sm: 200 },
              '.MuiOutlinedInput-root': {
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.common.white, 0.5),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.common.white,
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="inherit" />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Add new pizza button */}
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              minWidth: 120
            }}
            onClick={() => setAddDialogOpen(true)}
            startIcon={<AddIcon />}
          >
            Add Pizza
          </Button>
          
          {/* Refresh button */}
          <Tooltip title="Refresh">
            <IconButton 
              onClick={onRefresh}
              color="inherit"
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.2),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.3),
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Main content */}
      <TableContainer 
        component={Paper}
        sx={{
          flex: 1,
          overflow: 'auto',
          borderRadius: 2,
          boxShadow: 2,
          '.MuiTableCell-root': {
            borderColor: theme.palette.divider
          }
        }}
      >
        <Table stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell width="15%" sx={{ 
                backgroundColor: theme.palette.background.default,
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}>Name</TableCell>
              <TableCell width="30%" sx={{ 
                backgroundColor: theme.palette.background.default,
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}>Description</TableCell>
              <TableCell width="20%" sx={{ 
                backgroundColor: theme.palette.background.default,
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}>Toppings</TableCell>
              <TableCell width="10%" sx={{ 
                backgroundColor: theme.palette.background.default,
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}>Base</TableCell>
              <TableCell width="10%" sx={{ 
                backgroundColor: theme.palette.background.default,
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}>Price</TableCell>
              <TableCell width="15%" align="center" sx={{ 
                backgroundColor: theme.palette.background.default,
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} color="primary" />
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Loading pizzas...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredPizzas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {searchTerm ? 'No pizzas match your search' : 'No pizzas available'}
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => setAddDialogOpen(true)}
                    sx={{ mt: 1 }}
                    startIcon={<AddIcon />}
                  >
                    Add a new pizza
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredPizzas.map(item => (
                <TableRow 
                  key={item.id}
                  ref={el => rowRefs.current[item.id] = el}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.05)
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>{item.description}</TableCell>
                  <TableCell>
                    {item.toppings && item.toppings.length > 0 ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {item.toppings.map(topping => (
                          <Chip 
                            key={topping} 
                            label={topping} 
                            size="small" 
                            sx={{ 
                              my: 0.25, 
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.dark,
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }} 
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.disabled" fontStyle="italic">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.base ? (
                      <Chip 
                        label={item.base.name} 
                        size="small" 
                        sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.dark,
                          fontWeight: 500
                        }} 
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled" fontStyle="italic">
                        Unknown
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.success.dark }}>
                    {typeof item.price === 'number' 
                      ? item.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) 
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => handleEdit(item)} 
                          size="small"
                          color="primary"
                          sx={{ 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDeleteConfirm(item.id)} 
                          size="small"
                          color="error"
                          sx={{ 
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.2),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Add to basket">
                        <span>
                          <IconButton
                            color="success"
                            onClick={() => handleAddToBasket(item)}
                            size="small"
                            aria-label="add to basket"
                            sx={{
                              borderRadius: 2.5,
                              background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                              color: theme.palette.success.contrastText,
                              boxShadow: '0 2px 8px 0 rgba(76, 175, 80, 0.10)',
                              transition: 'transform 0.16s, box-shadow 0.16s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px 0 rgba(76, 175, 80, 0.20)',
                              }
                            }}
                          >
                            <ShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title="Order now">
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenOrderModal(item)}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                            }
                          }}
                        >
                          <DoneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Floating basket icon */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }} ref={basketRef}>
        <BasketIcon 
          count={basketItems.length} 
          onClick={toggleBasket} 
          isPopping={basketPop}
          onPopEnd={handleBasketPopEnd}
        />
      </Box>
      
      {/* Basket drawer */}
      <BasketDrawer
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        items={basketItems}
        onOrderAll={() => {
          setOrderModalOpen(true);
          setSelectedPizza(null);
          setBasketOpen(false);
        }}
        onClearBasket={clearBasket}
      />
      
      {/* Add/Edit Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingId !== null ? 'Edit Pizza' : 'Add New Pizza'}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Pizza Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                autoFocus
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="base-select-label">Base</InputLabel>
                <Select
                  labelId="base-select-label"
                  name="baseId"
                  value={formData.baseId}
                  onChange={handleBaseChange}
                  label="Base"
                  disabled={basesLoading}
                >
                  {bases.map((base) => (
                    <MenuItem key={base.id} value={base.id}>
                      {base.name} {base.isGlutenFree && '(Gluten Free)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price (optional)"
                fullWidth
                value={formData.price}
                onChange={handleInputChange}
                error={!!formErrors.price}
                helperText={formErrors.price || 'Leave empty for market price'}
                variant="outlined"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: formData.price ? <InputAdornment position="start">$</InputAdornment> : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {showToppingInput ? (
                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="Add Topping"
                    fullWidth
                    size="medium"
                    value={topping}
                    onChange={(e) => setTopping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTopping();
                        e.preventDefault();
                      }
                    }}
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddTopping}
                    disabled={!topping}
                    sx={{ mt: 1 }}
                  >
                    Add
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => setShowToppingInput(false)}
                    sx={{ mt: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowToppingInput(true)}
                  startIcon={<AddIcon />}
                  sx={{ mb: 2 }}
                  fullWidth
                >
                  Add Toppings
                </Button>
              )}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.toppings.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    onDelete={() => handleRemoveTopping(t)}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                {formData.toppings.length === 0 && (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No toppings added yet
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={editingId !== null ? <EditIcon /> : <AddIcon />}
          >
            {editingId !== null ? 'Save Changes' : 'Add Pizza'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this pizza? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Order Modal */}
      <OrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        pizza={selectedPizza}
        pizzaList={filteredPizzas}
        basketItems={basketItems}
        onCreateOrder={createOrder}
      />
      
      {/* Floating pizza clone for add-to-basket animation */}
      {cloneProps && (
        <FloatingPizzaClone
          rect={cloneProps.rect}
          target={cloneProps.target}
          onAnimationEnd={handleCloneAnimationEnd}
        >
          {cloneProps.children}
        </FloatingPizzaClone>
      )}
    </Box>
  );
}

export default PizzaList;
