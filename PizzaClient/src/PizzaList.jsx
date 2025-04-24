import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
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
  DialogContentText, DialogTitle, Alert, alpha, CircularProgress, useTheme, Grid, Autocomplete,
  useMediaQuery, LinearProgress
} from '@mui/material';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DoneIcon from '@mui/icons-material/Done';

// Styled section component for modal
const ModalSection = ({ title, subtitle, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="subtitle2"
      sx={{
        mb: 1,
        color: 'text.primary',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '0.75rem'
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}
      >
        {subtitle}
      </Typography>
    )}
    {children}
  </Box>
);

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
  const { createOrder } = useOrderData();

  // State
  const [formData, setFormData] = useState({
    id: '', name: '', description: '', baseId: 1, toppings: [], price: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [bases, setBases] = useState([]);
  const [basesLoading, setBasesLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce searchTerm updates
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Fetch available pizza bases
  const fetchBases = useCallback(async () => {
    setBasesLoading(true);
    try {
      const response = await fetch('/api/bases');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setBases(data);
    } catch (error) {
      console.error('Failed to fetch bases:', error);
    } finally {
      setBasesLoading(false);
    }
  }, []);

  // Load base options on component mount
  useEffect(() => {
    fetchBases();
  }, [fetchBases]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Filter pizzas based on debounced search term
  const filteredPizzas = useMemo(() => {
    if (!data) return [];
    return data.filter(pizza => {
      const matchesSearch = debouncedSearchTerm === '' ||
        pizza.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        pizza.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, debouncedSearchTerm]);

  // Memoized sx props
  const outerBoxSx = useMemo(() => ({
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }), []);

  const headerBoxSx = useMemo(() => ({
    mb: 3,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: theme.shadows[1],
    position: 'relative',
  }), [theme]);

  const headerContentSx = useMemo(() => ({
    p: { xs: 2.5, sm: 4 },
    position: 'relative',
    zIndex: 2,
  }), []);

  const titleSx = useMemo(() => ({
    fontWeight: 700,
    color: 'text.primary',
    letterSpacing: '-0.01em',
    position: 'relative',
    display: 'inline-block',
    mb: 0.5,
    fontFamily: 'Inter, Roboto, Arial',
    lineHeight: 1.18,
  }), []);

  const descriptionSx = useMemo(() => ({
    color: 'text.secondary',
    maxWidth: 520,
    fontWeight: 400,
    fontSize: { xs: '1.04rem', sm: '1.10rem' },
    mt: 0.5,
    fontFamily: 'Inter, Roboto, Arial',
  }), []);

  const headerActionsSx = useMemo(() => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: 2, 
    ml: { xs: 0, md: 'auto' },
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    width: { xs: '100%', md: 'auto' },
  }), []);

  // Memoized InputProps
  const memoizedInputProps = useMemo(() => ({
    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
  }), []);

  // Memoized PaperProps for Dialogs
  const dialogPaperProps = useMemo(() => ({
    sx: {
      borderRadius: 2,
      boxShadow: 24
    }
  }), []);

  // Enhanced PaperProps for modal centering and style
  const enhancedDialogPaperProps = useMemo(() => ({
    sx: {
      borderRadius: 4,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      background: theme => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
      backdropFilter: 'blur(8px)',
      mx: 2,
      my: { xs: 2, sm: 6 },
      p: 0,
      position: 'relative',
      minWidth: { xs: '90vw', sm: 480 },
      maxWidth: { xs: '98vw', sm: 540, md: 600 },
      width: '100%',
      overflow: 'visible'
    }
  }), []);

  // Full-screen on small screens
  const fullScreenModal = useMediaQuery(theme.breakpoints.down('sm'));

  // Form validity to disable submit button
  const isFormValid = useMemo(() => {
    const hasName = formData.name.trim();
    const hasDescription = formData.description.trim();
    const validPrice = !formData.price || !formErrors.price;
    return Boolean(hasName && hasDescription && validPrice);
  }, [formData, formErrors]);

  // Event handlers wrapped with useCallback
  const handleInputChange = useCallback((e) => {
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
  }, [formErrors]);

  const handleBaseChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, baseId: e.target.value }));
  }, []);

  const validateForm = useCallback(() => {
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
  }, [formData]);

  const handleSubmit = useCallback(() => {
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
  }, [validateForm, formData, editingId, onUpdate, onCreate]);

  const handleEdit = useCallback((pizza) => {
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
  }, []);

  const handleDeleteConfirm = useCallback((id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId !== null) {
      onDelete(deleteId);
      setDeleteId(null);
    }
    setDeleteConfirmOpen(false);
  }, [deleteId, onDelete]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const toggleBasket = useCallback(() => {
    setBasketOpen(prev => !prev);
  }, []);

  const handleBasketDrawerClose = useCallback(() => {
    setBasketOpen(false);
  }, []);

  const handleOrderModalClose = useCallback(() => {
    setOrderModalOpen(false);
    setSelectedPizza(null);
  }, []);

  const handleBasketCheckout = useCallback(() => {
    clearBasket();
    setBasketOpen(false);
  }, [clearBasket]);

  // Add to basket with animation using Motion
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
  }, [addToBasket, theme.palette.background.paper, theme.palette.text.secondary, theme.palette.text.disabled, theme.palette.success.main]);

  const handleOpenOrderModal = useCallback((pizza) => {
    setSelectedPizza(pizza);
    setOrderModalOpen(true);
  }, []);

  const handleBasketPopEnd = useCallback(() => {
    setBasketPop(false);
    isAnimating.current = false;
  }, []);

  const handleCloneAnimationEnd = useCallback(() => {
    setCloneProps(null);
  }, []);

  // Memoized Components
  const MemoizedRefreshTooltip = useMemo(() => (
    <Tooltip title="Refresh List">
      <IconButton 
        onClick={onRefresh}
        aria-label="refresh list"
        sx={{
          backgroundColor: 'action.selected',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
          }
        }}
      >
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  ), [onRefresh, theme]);

  const MemoizedTableRowHeader = useMemo(() => (
    <TableRow>
      <TableCell width="15%" sx={{ 
        fontWeight: 'bold',
        fontSize: '0.95rem'
      }}>Name</TableCell>
      <TableCell width="30%" sx={{ 
        fontWeight: 'bold',
        fontSize: '0.95rem'
      }}>Description</TableCell>
      <TableCell width="20%" sx={{ 
        fontWeight: 'bold',
        fontSize: '0.95rem'
      }}>Toppings</TableCell>
      <TableCell width="10%" sx={{ 
        fontWeight: 'bold',
        fontSize: '0.95rem'
      }}>Base</TableCell>
      <TableCell width="10%" sx={{ 
        fontWeight: 'bold',
        fontSize: '0.95rem'
      }}>Price</TableCell>
      <TableCell width="15%" align="center" sx={{ 
        fontWeight: 'bold',
        fontSize: '0.95rem'
      }}>Actions</TableCell>
    </TableRow>
  ), []);

  // Memoize filteredPizzas to ensure stability
  const stableFilteredPizzas = useMemo(() => filteredPizzas, [filteredPizzas]);

  // Memoize createOrder to ensure stability
  const stableCreateOrder = useCallback(createOrder, [createOrder]);

  // Memoized TableHead
  const MemoizedTableHead = useMemo(() => (
    <TableHead>
      {MemoizedTableRowHeader}
    </TableHead>
  ), [MemoizedTableRowHeader]);

  // Memoized TableBody
  const MemoizedTableBody = useMemo(() => (
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
      ) : stableFilteredPizzas.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {debouncedSearchTerm ? 'No pizzas match your search' : 'No pizzas available'}
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
        stableFilteredPizzas.map(item => (
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
            <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>{item.name}</TableCell>
            <TableCell sx={{ color: 'text.secondary' }}>{item.description}</TableCell>
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
                      borderRadius: 1, // MD3 default
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.14),
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
                      borderRadius: 1, // MD3 default
                        backgroundColor: alpha(theme.palette.error.main, 0.06),
                        fontWeight: 600,
                        '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.14),
                        }
                      }}
                      >
                      <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Add to basket">
                      <span>
                      <IconButton
                        onClick={() => handleAddToBasket(item)}
                        size="small"
                        aria-label="add to basket"
                        sx={{
                        borderRadius: 1, // MD3 default
                        backgroundColor: alpha(theme.palette.success.main, 0.1), // Lighter green bg
                        color: theme.palette.success.dark, // Darker green icon
                        boxShadow: '0 2px 8px 0 rgba(76, 175, 80, 0.10)',
                        fontWeight: 600,
                        transition: 'transform 0.16s, box-shadow 0.16s',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.success.main, 0.18),
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
                        borderRadius: 1, // MD3 default
                      backgroundColor: alpha(theme.palette.secondary.main, 0.06),
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.14),
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
  ), [loading, stableFilteredPizzas, debouncedSearchTerm, theme, handleEdit, handleDeleteConfirm, handleAddToBasket, handleOpenOrderModal]);

  // Memoize header Box and Typography to prevent unnecessary re-renders
  const memoizedHeaderBox = useMemo(() => (
    <Box sx={headerBoxSx}>
      <Box sx={headerContentSx}>
        <Box sx={headerActionsSx}>
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={titleSx}
            >
              {name}
            </Typography>
            <Typography
              variant="body1"
              sx={descriptionSx}
            >
              Manage your pizza menu with ease. Add, edit, or remove items as needed.
            </Typography>
          </Box>
          <Box sx={headerActionsSx}>
            {/* Search */}
            <TextField
              placeholder="Search pizzas..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={memoizedInputProps}
              sx={{ 
                '& .MuiInputBase-root': { 
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
              }}
            />
            {/* Add new pizza button */}
            <Button
              variant="contained"
              color="primary"
              size="medium"
              sx={{ 
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                color: 'primary.contrastText'  // Use theme token instead of direct reference
              }}
              onClick={() => setAddDialogOpen(true)}
              startIcon={<AddIcon />}
            >
              Add Pizza
            </Button>
            {/* Refresh button */}
            {MemoizedRefreshTooltip}
          </Box>
        </Box>
      </Box>
    </Box>
  ), [name, headerBoxSx, headerContentSx, headerActionsSx, titleSx, descriptionSx, searchTerm, handleSearchChange, memoizedInputProps, MemoizedRefreshTooltip, theme]);

  // Add dynamic toppings options
  const toppingOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.flatMap(p => p.toppings || [])));
  }, [data]);

  return (
    <Box sx={outerBoxSx}>
      {/* Enhanced Header Section */}
      {memoizedHeaderBox}
      {/* Main content */}
      <TableContainer 
        component={Paper} 
        elevation={0}
        variant="outlined"
        sx={{
          flex: 1,
          backgroundColor: 'background.paper',
          borderColor: 'divider',
          color: 'text.primary',
          '.MuiTableCell-root': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          // Hover effect
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'action.hover',
          },
          // Header cell styles
          '& .MuiTableHead-root .MuiTableCell-root': { 
            backgroundColor: 'background.default',
            color: 'text.primary',
            borderBottom: `2px solid ${theme.palette.divider}`,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
          '& .MuiTableBody-root .MuiTableCell-root': {
            color: 'text.primary',
          },
          // Paper component override
          '&.MuiPaper-root': {
            backgroundColor: 'background.paper',
          }
        }}
      >
        <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 900 }}>
          {MemoizedTableHead}
          {MemoizedTableBody}
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
      <Suspense fallback={<div>Loading Basket...</div>}>
        <BasketDrawer
          open={basketOpen}
          onClose={handleBasketDrawerClose}
          onCheckout={handleBasketCheckout}
        />
      </Suspense>
      
      {/* Add/Edit Dialog */}
      <Suspense fallback={<div>Loading...</div>}>
        <Dialog
          fullScreen={fullScreenModal}
          scroll="paper"
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={enhancedDialogPaperProps}
          aria-labelledby="pizza-modal-title"
        >
          {/* Show loading bar when bases are loading */}
          {basesLoading && <LinearProgress />}
          <DialogTitle 
            id="pizza-modal-title" 
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              background: theme => theme.palette.background.paper,
              pb: 2,
              pt: 2.5,
              px: { xs: 2.5, sm: 4 },
              borderBottom: '1px solid',
              borderColor: 'divider',
              fontWeight: 700,
              fontSize: '1.35rem',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Box>
              {editingId !== null ? 'Edit Pizza' : 'Add New Pizza'}
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 0.5,
                  color: 'text.secondary',
                  fontWeight: 'normal',
                  letterSpacing: 0 
                }}
              >
                Fill in the details below to {editingId !== null ? 'update' : 'create'} a pizza
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={() => setAddDialogOpen(false)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' }
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent 
            sx={{ 
              p: 0,
              background: theme => alpha(theme.palette.background.default, 0.6),
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '80vh'
            }}
          >
            <Box sx={{ p: { xs: 2.5, sm: 4 }, pt: { xs: 2.5, sm: 3 } }}>
              <Stack spacing={4}>
                {/* Basic Info Section */}
                <ModalSection 
                  title="Basic Information"
                  subtitle="Enter the core details about your pizza"
                >
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={7}>
                      <TextField
                        name="name"
                        label="Pizza Name"
                        required
                        fullWidth
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!formErrors.name}
                        helperText={formErrors.name || 'Give your pizza a memorable name'}
                        autoFocus
                        placeholder="e.g., Margherita Supreme"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        name="price"
                        label="Price"
                        type="number"
                        inputProps={{ 
                          min: 0, 
                          step: 0.01,
                          placeholder: '0.00'
                        }}
                        fullWidth
                        value={formData.price}
                        onChange={handleInputChange}
                        error={!!formErrors.price}
                        helperText={formErrors.price || 'Set the price or leave empty for market price'}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="description"
                        label="Description"
                        required
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        error={!!formErrors.description}
                        helperText={formErrors.description || 'Describe the taste, ingredients, and what makes this pizza special'}
                        variant="outlined"
                        placeholder="A delightful combination of fresh ingredients..."
                      />
                    </Grid>
                  </Grid>
                </ModalSection>

                {/* Customization Section */}
                <ModalSection 
                  title="Pizza Customization"
                  subtitle="Choose the base and add toppings to create your perfect pizza"
                >
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} md={5}>
                      <Autocomplete
                        fullWidth
                        options={bases}
                        getOptionLabel={opt => opt ? opt.name : ''}
                        groupBy={option => option.isGlutenFree ? 'Gluten-Free Options' : 'Standard Bases'}
                        loading={basesLoading}
                        value={bases.find(b => b.id === formData.baseId) || null}
                        onChange={(e, newVal) => handleBaseChange({ target: { name: 'baseId', value: newVal?.id || 1 } })}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderOption={(props, option) => (
                          <Box
                            component="li"
                            {...props}
                            sx={{
                              '&:hover': {
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.08)
                              }
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {option.name}
                                {option.isGlutenFree && (
                                  <Chip 
                                    label="GF" 
                                    size="small" 
                                    color="success" 
                                    sx={{ ml: 1, height: 20 }} 
                                  />
                                )}
                              </Typography>
                              {option.description && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  {option.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        )}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="Pizza Base"
                            required
                            error={!!formErrors.baseId}
                            helperText={formErrors.baseId || 'Select your preferred base type'}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {basesLoading && <CircularProgress size={20} />}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <Autocomplete
                        multiple
                        freeSolo
                        options={toppingOptions}
                        value={formData.toppings}
                        onChange={(e, newValue) => setFormData(prev => ({ ...prev, toppings: newValue }))}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={option}
                              label={option}
                              {...getTagProps({ index })}
                              sx={{
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                                '& .MuiChip-deleteIcon': {
                                  color: 'primary.main',
                                  '&:hover': {
                                    color: 'primary.dark'
                                  }
                                }
                              }}
                            />
                          ))
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            variant="outlined"
                            label="Toppings"
                            placeholder={formData.toppings.length === 0 ? "Start typing to add toppings..." : "Add more toppings"}
                            error={!!formErrors.toppings}
                            helperText={formErrors.toppings || 'Type a topping and press Enter to add it'}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </ModalSection>
              </Stack>
            </Box>
          </DialogContent>

          <DialogActions 
            sx={{ 
              px: { xs: 2.5, sm: 4 }, 
              py: 2.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              background: theme => theme.palette.background.paper,
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              gap: 2
            }}
          >
            <Button 
              onClick={() => setAddDialogOpen(false)} 
              color="inherit"
              variant="outlined"
              sx={{
                minWidth: 100,
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              startIcon={editingId !== null ? <EditIcon /> : <AddIcon />}
              disabled={!isFormValid}
              sx={{
                minWidth: 140,
                borderRadius: 2
              }}
            >
              {editingId !== null ? 'Save Changes' : 'Add Pizza'}
            </Button>
          </DialogActions>
        </Dialog>
      </Suspense>
                    
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={dialogPaperProps}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this pizza? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="secondary" variant="outlined" sx={{ minWidth: 120, fontWeight: 600, borderRadius: 2.5 }}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />} sx={{ minWidth: 140, fontWeight: 600, borderRadius: 2.5 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Order Modal */}
      <Suspense fallback={<div>Loading Order Modal...</div>}>
        <OrderModal
          open={orderModalOpen}
          onClose={handleOrderModalClose}
          pizza={selectedPizza}
          pizzaList={stableFilteredPizzas}
          onPlaceOrder={stableCreateOrder}
        />
      </Suspense>
      
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
