import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Fade,
  CircularProgress,
  Backdrop,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { FetchStatus } from '../../../constants/toppingConstants';
import { useToppingManager } from '../../../hooks/useToppingManager';
import ToppingForm from './ToppingForm';
import ToppingToolbar from './ToppingToolbar';
import ToppingTable from './ToppingTable';

/**
 * Main component for managing pizza toppings
 */
const ToppingManager = () => {
  const {
    // State
    toppings,
    recentToppings,
    filterText,
    currentSortType,
    selected,
    editMode,
    editState,
    deleteDialog,
    fetchState,
    mutationLoading,
    order,
    orderBy,

    // Setters
    setFilterText,
    setCurrentSortType,
    setSelected,
    setDeleteDialog,

    // Handlers
    handleAddTopping,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleDuplicateTopping,
    fetchToppings,
    handleRequestSort,
    handleRowClick,
    handleSelectAllClick
  } = useToppingManager();

  const isLoading = fetchState.status === FetchStatus.LOADING || mutationLoading;
  const isError = fetchState.status === FetchStatus.FAILED;
  const errorMsg = fetchState.error;

  const renderLoading = () => (
    <Fade in={true} timeout={500}>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    </Fade>
  );

  const renderError = () => (
    <Fade in={true} timeout={500}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchToppings}>
            RETRY
          </Button>
        }
        sx={{ mb: 2 }}
      >
        Failed to load data: {errorMsg || 'An unknown error occurred.'}
      </Alert>
    </Fade>
  );

  const renderEmptyState = () => (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: theme => theme.shape.borderRadius / 2,
        p: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <SearchIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="body1" color="text.secondary">
        {filterText ? 'No toppings match search' : 'No toppings added yet'}
      </Typography>
      {!filterText && toppings.length === 0 && (
        <Button
          startIcon={<AddIcon />}
          color="primary"
          variant="text"
          size="small"
          sx={{ mt: 1 }}
          onClick={() =>
            document.querySelector('input[placeholder="Enter topping name"]')?.focus()
          }
        >
          Add First Topping
        </Button>
      )}
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom color="primary.main" fontWeight="medium">
        Topping Manager
      </Typography>

      {/* Global Loading/Backdrop for Mutations */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={mutationLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          borderColor: 'divider',
          mb: 3
        }}
      >
        {/* Add Topping Form */}
        <ToppingForm
          onAdd={handleAddTopping}
          loading={isLoading}
          existingToppings={toppings.map((t) => t.name)}
        />

        <Divider sx={{ my: 2 }} />

        {/* Toolbar: Search, Sort, Actions */}
        <ToppingToolbar
          numSelected={selected.length}
          filterText={filterText}
          onFilterTextChange={setFilterText}
          onClearFilter={() => setFilterText('')}
          sortType={currentSortType}
          onSortChange={setCurrentSortType}
          loading={isLoading}
          onDeleteSelected={() =>
            setDeleteDialog({ open: true, toppingName: null, isBulk: true })
          }
          totalToppings={toppings.length}
        />

        {/* Loading State */}
        {fetchState.status === FetchStatus.LOADING && toppings.length === 0 && renderLoading()}

        {/* Error State */}
        {isError && renderError()}

        {/* Table or Empty State */}
        {fetchState.status !== FetchStatus.LOADING && !isError && (
          toppings.length === 0 ? (
            renderEmptyState()
          ) : (
            <ToppingTable
              toppingsData={toppings}
              order={order}
              orderBy={orderBy}
              selected={selected}
              onRowClick={handleRowClick}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
              onEditStart={handleStartEdit}
              onEditSave={handleSaveEdit}
              onEditCancel={handleCancelEdit}
              onDeleteRequest={(name) =>
                setDeleteDialog({ open: true, toppingName: name, isBulk: false })
              }
              editMode={editMode}
              editState={editState}
              loading={isLoading}
              recentToppings={recentToppings}
              onDuplicate={handleDuplicateTopping}
            />
          )
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, toppingName: null, isBulk: false })}
        aria-labelledby="delete-topping-dialog-title"
        aria-describedby="delete-topping-dialog-description"
      >
        <DialogTitle id="delete-topping-dialog-title">
          {deleteDialog.isBulk ? `Delete ${selected.length} Toppings?` : 'Delete Topping?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-topping-dialog-description">
            {deleteDialog.isBulk
              ? `Are you sure you want to delete ${selected.length} selected toppings? `
              : `Are you sure you want to delete "${deleteDialog.toppingName}"? `}
            This will remove the topping(s) from all pizzas that use it. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setDeleteDialog({ open: false, toppingName: null, isBulk: false })
            }
            variant="text"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const toppingsToDelete = deleteDialog.isBulk
                ? selected
                : [deleteDialog.toppingName];
              handleDelete(toppingsToDelete);
              setDeleteDialog({ open: false, toppingName: null, isBulk: false });
            }}
            color="error"
            variant="contained"
            autoFocus
            disabled={isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ToppingManager;
