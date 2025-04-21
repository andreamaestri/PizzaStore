import React, { forwardRef } from 'react';
import { Badge, IconButton, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useBasket } from '../context/BasketContext';
import { motion } from 'motion/react';

const BasketIcon = forwardRef(({ onClick, isPopping, onPopEnd }, ref) => {
  const { items } = useBasket();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  
  return (
    <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 3000, pointerEvents: 'auto' }}>
      <motion.div 
        initial={{ scale: 1, rotate: 0 }}
        animate={isPopping ? {
          scale: [1, 1.3, 0.92, 1.08, 0.98, 1.02, 1], // More natural spring physics
          rotate: [0, 5, -3, 2, -1, 0], // Add slight rotation for playfulness
          filter: [
            'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
            'drop-shadow(0 8px 16px rgba(156, 39, 176, 0.25))',
            'drop-shadow(0 6px 14px rgba(156, 39, 176, 0.2))',
            'drop-shadow(0 4px 10px rgba(156, 39, 176, 0.15))',
            'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
          ]
        } : { 
          scale: 1,
          rotate: 0,
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
        }}
        transition={{
          duration: 0.5, // Slightly longer for more pronounced effect
          ease: [0.34, 1.56, 0.64, 1], // Spring-like elastic motion
          times: [0, 0.25, 0.45, 0.65, 0.85, 0.95, 1]
        }}
        onAnimationComplete={() => {
          if (isPopping) {
            onPopEnd && onPopEnd();
          }
        }}
      >
        <IconButton
          color="primary"
          size="large"
          onClick={onClick}
          sx={{
            background: 'white',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
              transform: 'translateY(-2px)' // Subtle lift effect on hover
            },
            '&:active': {
              transform: 'translateY(1px)' // Subtle press effect
            }
          }}
          ref={ref}
        >
          <Badge 
            badgeContent={count} 
            color="secondary" 
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.9rem',
                fontWeight: 600,
                minWidth: '22px',
                height: '22px',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ShoppingCartIcon fontSize="large" />
          </Badge>
        </IconButton>
      </motion.div>
    </Box>
  );
});

export default BasketIcon;
