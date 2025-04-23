import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider, Button, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useBasket } from '../context/BasketContext';

const BasketDrawer = ({ open, onClose, onCheckout }) => {
  const { items, removeFromBasket, updateQuantity, clearBasket } = useBasket();
  const total = items.reduce((sum, i) => sum + i.pizza.price * i.quantity, 0);
  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        keepMounted: true,
        BackdropProps: { sx: { zIndex: 3400 } }
      }}
      PaperProps={{ 
        sx: { 
          width: { xs: '100%', sm: 370 }, 
          height: '100%',
          zIndex: 3500,
          boxShadow: '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)'
        } 
      }}
      sx={{ zIndex: 3500 }}
    >
      <Box sx={{ 
        px: 3,
        py: 2,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'primary.light',
        color: 'primary.contrastText'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>Your Order</Typography>
        <IconButton 
          onClick={onClose} 
          aria-label="close basket"
          sx={{ 
            color: 'inherit',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 3, pt: 2, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
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
