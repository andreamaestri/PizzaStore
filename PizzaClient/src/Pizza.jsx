import { useState, useEffect } from 'react';
import { 
  Typography, Box, Alert, Snackbar, CircularProgress, 
  Stack, Skeleton, Breadcrumbs, Link, Fade
} from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import PizzaList from './PizzaList';

const term = "Pizza";
const API_URL = '/api/pizzas';
const headers = {
  'Content-Type': 'application/json',
};

function Pizza() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPizzaData();
  }, []);

  const fetchPizzaData = () => {
    setLoading(true);
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
        showNotification('Failed to load pizza data', 'error');
      });
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleCreate = (item) => {
    setLoading(true);
    fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: item.name, 
        description: item.description,
        baseId: parseInt(item.baseId) || 1,
        toppings: item.toppings || []
      }),
    })
      .then(response => response.json())
      .then(returnedItem => {
        setData([...data, returnedItem]);
        setLoading(false);
        showNotification(`${item.name} pizza added to menu`);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
        showNotification('Failed to create pizza', 'error');
      });
  };

  const handleUpdate = (updatedItem) => {
    setLoading(true);
    fetch(`${API_URL}/${updatedItem.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        id: updatedItem.id,
        name: updatedItem.name, 
        description: updatedItem.description,
        baseId: parseInt(updatedItem.baseId) || 1,
        toppings: updatedItem.toppings || []
      }),
    })
      .then(() => {
        setData(data.map(item => item.id === updatedItem.id ? updatedItem : item));
        setLoading(false);
        showNotification(`${updatedItem.name} pizza updated`);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
        showNotification('Failed to update pizza', 'error');
      });
  };

  const handleDelete = (id) => {
    const pizzaToDelete = data.find(item => item.id === id);
    setLoading(true);
    
    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers,
    })
      .then(() => {
        setData(data.filter(item => item.id !== id));
        setLoading(false);
        showNotification(`${pizzaToDelete?.name || 'Pizza'} removed from menu`);
      })
      .catch(error => {
        console.error('Error deleting item:', error);
        setLoading(false);
        showNotification('Failed to delete pizza', 'error');
      });
  };

  return (
    <Stack spacing={3}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="#"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          Pizza Menu
        </Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" gutterBottom color="text.primary">
        Pizza Menu Management
      </Typography>
      
      {loading && data.length === 0 ? (
        <Fade in={loading}>
          <Box>
            <Stack spacing={1.5}>
              <Skeleton variant="rectangular" height={60} width="100%" />
              <Skeleton variant="rectangular" height={400} width="100%" />
            </Stack>
          </Box>
        </Fade>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress color="primary" size={32} thickness={4} />
        </Box>
      ) : null}
      
      {error && !loading && (
        <Alert 
          severity="error" 
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Error: {error.message || 'An unknown error occurred'}
        </Alert>
      )}
      
      <PizzaList
        name={term}
        data={data}
        error={error}
        loading={loading}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onRefresh={fetchPizzaData}
      />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default Pizza;