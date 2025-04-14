import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import DataTable from '../DataTable';

const PizzaTable = ({
  pizzas = [],
  onEdit,
  onDelete,
  loading = false,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter pizzas based on search term
  const filteredPizzas = pizzas.filter((pizza) =>
    pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    {
      id: 'name',
      label: 'Name',
      render: (row) => (
        <Typography variant="subtitle2">{row.name}</Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
    },
    {
      id: 'base',
      label: 'Base',
      render: (row) => row.base?.name,
    },
    {
      id: 'toppings',
      label: 'Toppings',
      render: (row) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {row.toppings?.map((topping) => (
            <Chip
              key={topping.id}
              label={topping.name}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      ),
    },
  ];

  const actions = {
    renderActions: (row) => (
      <>
        <Tooltip title="Edit">
          <IconButton
            aria-label="edit"
            onClick={() => onEdit(row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            aria-label="delete"
            onClick={() => onDelete(row.id)}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </>
    ),
  };

  return (
    <Paper elevation={2} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search pizzas..."
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              borderRadius: theme.shape.borderRadius * 2,
            },
          }}
        />
      </Box>
      <DataTable
        columns={columns}
        rows={filteredPizzas}
        actions={actions}
        loading={loading}
        emptyMessage={
          searchTerm
            ? 'No pizzas found. Try a different search term.'
            : 'Add a pizza to get started.'
        }
        tableProps={{ 'aria-label': 'pizza table', sx: { minWidth: 650 } }}
      />
    </Paper>
  );
};

export default PizzaTable;
