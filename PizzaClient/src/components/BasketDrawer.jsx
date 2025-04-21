import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider, Button, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useBasket } from '../context/BasketContext';

const BasketDrawer = ({ open, onClose, onCheckout }) => {
  const { items, removeFromBasket, updateQuantity, clearBasket } = useBasket();
  const total = items.reduce((sum, i) => sum + i.pizza.price * i.quantity, 0);
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 370 } }}>
      <Box sx={{ p: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Your Basket</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 3, pt: 2, flex: 1, overflow: 'auto' }}>
        {items.length === 0 ? (
          <Typography color="text.secondary">Basket is empty.</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map(({ pizza, quantity }) => (
              <Box key={pizza.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={500}>{pizza.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{pizza.description}</Typography>
                  <Typography variant="caption">${pizza.price.toFixed(2)} x {quantity}</Typography>
                </Box>
                <Button size="small" onClick={() => updateQuantity(pizza.id, Math.max(1, quantity-1))} disabled={quantity<=1}>-</Button>
                <Typography>{quantity}</Typography>
                <Button size="small" onClick={() => updateQuantity(pizza.id, quantity+1)}>+</Button>
                <IconButton onClick={() => removeFromBasket(pizza.id)}><CloseIcon fontSize="small" /></IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 3, pt: 2 }}>
        <Typography fontWeight={600} sx={{ mb: 2 }}>Total: ${total.toFixed(2)}</Typography>
        <Button variant="contained" color="primary" fullWidth disabled={items.length === 0} onClick={onCheckout} sx={{ mb: 1 }}>Checkout</Button>
        <Button variant="text" color="secondary" fullWidth disabled={items.length === 0} onClick={clearBasket}>Clear Basket</Button>
      </Box>
    </Drawer>
  );
};

export default BasketDrawer;
