import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const OrderModal = ({ open, onClose, pizza, onPlaceOrder }) => {
  const [quantity, setQuantity] = useState(1);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phoneNumber: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!orderForm.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    
    if (!orderForm.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\d\s()+-]+$/.test(orderForm.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    
    if (!orderForm.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;
    
    const orderData = {
      customerName: orderForm.customerName,
      phoneNumber: orderForm.phoneNumber,
      address: orderForm.address,
      items: [
        {
          pizzaId: pizza.id,
          quantity: quantity,
          unitPrice: pizza.price
        }
      ],
      totalAmount: pizza.price * quantity
    };
    
    onPlaceOrder(orderData);
  };

  if (!pizza) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Place Order</Typography>
          <IconButton size="small" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>{pizza.name}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {pizza.description}
          </Typography>
          
          <Box mt={2} mb={3}>
            <Typography variant="subtitle2" gutterBottom>Toppings:</Typography>
            <Typography variant="body2">
              {pizza.toppings && pizza.toppings.length > 0
                ? pizza.toppings.join(', ')
                : 'No toppings'}
            </Typography>
          </Box>

          <Divider />

          <Box mt={2} mb={2}>
            <Typography variant="subtitle2">Quantity</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <RemoveIcon />
              </IconButton>
              <TextField
                value={quantity}
                size="small"
                inputProps={{ min: 1, max: 10, style: { textAlign: 'center' } }}
                style={{ width: 60 }}
                disabled
              />
              <IconButton onClick={() => handleQuantityChange(1)} disabled={quantity >= 10}>
                <AddIcon />
              </IconButton>
            </Stack>
          </Box>

          <Divider />

          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  name="customerName"
                  value={orderForm.customerName}
                  onChange={handleInputChange}
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={orderForm.phoneNumber}
                  onChange={handleInputChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Delivery Address"
                  name="address"
                  value={orderForm.address}
                  onChange={handleInputChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          sx={{ minWidth: 120, fontWeight: 600, borderRadius: 2.5 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePlaceOrder}
          variant="contained"
          color="primary"
          sx={{ minWidth: 140, fontWeight: 600, borderRadius: 2.5 }}
        >
          Place Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderModal;
