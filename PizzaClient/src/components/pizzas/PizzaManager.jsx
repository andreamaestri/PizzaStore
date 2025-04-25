import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  LocalPizza as PizzaIcon
} from '@mui/icons-material';
import { usePizzaData } from '../../hooks/usePizzaData';
import PizzaForm from './PizzaForm';
import PizzaTable from './PizzaTable';

const PizzaManager = () => {
  const { 
    pizzas, 
    loading, 
    error,
    notification,
    fetchPizzas,
    createPizza,
    updatePizza,
    deletePizza,
    closeNotification
  } = usePizzaData();

  const [showForm, setShowForm] = useState(false);
  const [currentPizza, setCurrentPizza] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pizzaToDelete, setPizzaToDelete] = useState(null);

  // Fetch initial pizza data when the component mounts.
  useEffect(() => {
    fetchPizzas();
  }, [fetchPizzas]);

  const handleAddClick = () => {
    setCurrentPizza(null);
    setShowForm(true);
  };

  const handleEditClick = (pizza) => {
    setCurrentPizza(pizza);
    setShowForm(true);
  };

  const handleDeleteClick = (pizzaId) => {
    const pizza = pizzas.find(p => p.id === pizzaId);
    setPizzaToDelete(pizza);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (pizzaToDelete) {
      deletePizza(pizzaToDelete.id);
      setDeleteDialogOpen(false);
      setPizzaToDelete(null);
    }
  };

  const handleFormSubmit = (formData) => {
    if (formData.id) {
      updatePizza(formData).then(() => {
        setShowForm(false);
      });
    } else {
      createPizza(formData).then(() => {
        setShowForm(false);
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentPizza(null);
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>        <Breadcrumb 
          items={[
            { text: 'Home', href: '/', icon: <HomeIcon fontSize="inherit" /> },
            { text: 'Pizza Menu', icon: <PizzaIcon fontSize="inherit" /> }
          ]} 
          showIcons={true}
        />

        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 3 }}
        >
          <Typography variant="h4" component="h1">
            Pizza Menu
          </Typography>
          <Fab 
            color="primary" 
            aria-label="add" 
            size="medium" 
            onClick={handleAddClick}
          >
            <AddIcon />
          </Fab>
        </Stack>
      </Box>

      {/* Conditionally render the PizzaForm for adding or editing. */}
      {showForm && (
        <PizzaForm 
          pizza={currentPizza}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isEditing={!!currentPizza}
        />
      )}

      {/* Display an error message if fetching failed. */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'An error occurred while loading pizzas.'}
        </Alert>
      )}

      {/* Display the table of pizzas. */}
      <PizzaTable 
        pizzas={pizzas} 
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Confirmation dialog for deleting a pizza. */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Pizza
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{pizzaToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for displaying success/error notifications from data operations. */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PizzaManager;
