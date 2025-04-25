import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Stack,
  Paper,
  Typography,
  Alert
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Add as AddIcon } from '@mui/icons-material';

const initialFormState = {
  id: '',
  name: '',
  description: '',
  baseId: 1,
  toppings: []
};

const PizzaForm = ({ 
  pizza = null, 
  onSubmit, 
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({...initialFormState});
  const [bases, setBases] = useState([]);
  const [availableToppings, setAvailableToppings] = useState([]);
  const [basesLoading, setBasesLoading] = useState(true);
  const [toppingsLoading, setToppingsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to populate the form when a `pizza` prop is provided (for editing).
  useEffect(() => {
    if (pizza) {
      setFormData({
        id: pizza.id || '',
        name: pizza.name || '',
        description: pizza.description || '',
        baseId: pizza.baseId || 1,
        toppings: pizza.toppings || []
      });
    } else {
      setFormData({...initialFormState});
    }
  }, [pizza]);

  // Effect to fetch available pizza bases from the API on component mount.
  useEffect(() => {
    const fetchBases = async () => {
      setBasesLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/bases');
        if (!response.ok) {
          throw new Error(`Failed to fetch bases (Status: ${response.status})`);
        }
        const basesData = await response.json();
        setBases(basesData);
        setBasesLoading(false);
      } catch (err) {
        console.error('Error fetching pizza bases:', err);
        setError('Could not load pizza bases.');
        setBasesLoading(false);
      }
    };

    fetchBases();
  }, []);

  // Effect to fetch available toppings from the API on component mount.
  useEffect(() => {
    const fetchToppings = async () => {
      setToppingsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/toppings');
        if (!response.ok) {
          throw new Error(`Failed to fetch toppings (Status: ${response.status})`);
        }
        const toppingsData = await response.json();
        setAvailableToppings(toppingsData);
        setToppingsLoading(false);
      } catch (err) {
        console.error('Error fetching toppings:', err);
        setError('Could not load toppings.');
        setToppingsLoading(false);
      }
    };

    fetchToppings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToppingChange = (_, newValue) => {
    setFormData(prev => ({
      ...prev,
      toppings: newValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData({...initialFormState});
    if (onCancel) onCancel();
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit Pizza' : 'Create New Pizza'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          label="Pizza Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={2}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Pizza Base</InputLabel>
          <Select
            name="baseId"
            value={formData.baseId}
            onChange={handleChange}
            disabled={basesLoading}
            label="Pizza Base"
          >
            {basesLoading ? (
              <MenuItem disabled>Loading bases...</MenuItem>
            ) : (
              bases.map(base => (
                <MenuItem key={base.id} value={base.id}>
                  {base.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <Autocomplete
            multiple
            options={availableToppings}
            getOptionLabel={(option) => option.name}
            value={formData.toppings}
            onChange={handleToppingChange}
            disabled={toppingsLoading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Toppings"
                placeholder="Add toppings"
              />
            )}
          />
        </FormControl>

        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            startIcon={<CloseIcon />}
            sx={{ minWidth: 120, fontWeight: 600, borderRadius: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
            disabled={basesLoading || toppingsLoading}
            sx={{ minWidth: 140, fontWeight: 600, borderRadius: 2.5 }}
          >
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default PizzaForm;
