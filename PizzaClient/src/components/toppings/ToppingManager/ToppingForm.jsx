import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toppingExists } from '../../../utils/sortUtils';

/**
 * Form component for adding new toppings
 */
const ToppingForm = ({ onAdd, loading, existingToppings }) => {
  const memoizedExistingToppings = useMemo(() => existingToppings, [existingToppings]);

  const [newTopping, setNewTopping] = useState('');
  const [duplicateError, setDuplicateError] = useState(false);

  const handleAddClick = useCallback(() => {
    const trimmedTopping = newTopping.trim();
    if (!trimmedTopping) return;

    if (toppingExists(trimmedTopping, memoizedExistingToppings)) {
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 3000);
      return;
    }

    onAdd(trimmedTopping);
    setNewTopping('');
    setDuplicateError(false);
  }, [newTopping, memoizedExistingToppings, onAdd]);

  const handleInputChange = useCallback((e) => {
    setNewTopping(e.target.value);
    if (duplicateError) setDuplicateError(false);
  }, [duplicateError]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleAddClick();
    }
  }, [handleAddClick]);

  const handleClearInput = useCallback(() => {
    setNewTopping('');
    setDuplicateError(false);
  }, []);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
        Add New Topping
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={newTopping}
          onChange={handleInputChange}
          placeholder="Enter topping name"
          variant="outlined"
          onKeyPress={handleKeyPress}
          error={duplicateError}
          helperText={duplicateError ? 'This topping already exists' : ''}
          InputProps={{
            endAdornment: newTopping && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={handleClearInput}
                  edge="end"
                  aria-label="clear input"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          disabled={loading || !newTopping.trim()}
          aria-label="add topping"
          sx={{ minWidth: 120, fontWeight: 600, borderRadius: 2.5 }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

export default ToppingForm;
