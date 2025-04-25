import React, { useState, useCallback, memo, useMemo } from 'react';
import {
  Toolbar,
  Typography,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Box,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  LocalFireDepartment as PopularIcon,
  AccessTime as RecentIcon,
  Add as AddIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { SortType } from '../../../constants/toppingConstants';

/**
 * Toolbar component for topping management actions
 */
const ToppingToolbar = ({
  numSelected,
  filterText,
  onFilterTextChange,
  onClearFilter,
  sortType,
  onSortChange,
  loading,
  onDeleteSelected,
  onAddTopping,
  onRefresh
}) => {
  const theme = useTheme();
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  const handleSortMenuClose = useCallback(() => {
    setSortMenuAnchor(null);
  }, []);

  const handleSortMenuItemClick = useCallback((newSortType) => {
    onSortChange(newSortType);
    handleSortMenuClose();
  }, [onSortChange, handleSortMenuClose]);

  // Memoized callbacks passed down to child components or used in event handlers.
  const handleClearFilterCallback = useCallback(() => {
    onClearFilter();
  }, [onClearFilter]);

  const handleDeleteSelectedCallback = useCallback(() => {
    onDeleteSelected();
  }, [onDeleteSelected]);

  const handleFilterTextChange = useCallback((e) => {
    onFilterTextChange(e.target.value);
  }, [onFilterTextChange]);

  const handleSortButtonClick = useCallback((e) => {
    setSortMenuAnchor(e.currentTarget);
  }, []);

  // Memoize the array of sort options for the sort menu.
  const sortOptions = useMemo(() => [
    { type: SortType.ALPHA_ASC, label: 'Alphabetical (A-Z)', icon: <ArrowUpIcon /> },
    { type: SortType.ALPHA_DESC, label: 'Alphabetical (Z-A)', icon: <ArrowDownIcon /> },
    { type: SortType.MOST_USED, label: 'Most Used', icon: <PopularIcon /> },
    { type: SortType.RECENT, label: 'Recently Added', icon: <RecentIcon /> },
  ], []);

  // Memoize style objects to prevent recreation on every render.
  const boxStyles = useMemo(() => ({
    mb: 3,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 1,
    position: 'relative',
  }), []);

  const innerBoxStyles = useMemo(() => ({
    p: { xs: 2.5, sm: 4 },
    position: 'relative',
    zIndex: 2,
  }), []);

  const contentBoxStyles = useMemo(() => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: 2, 
    ml: { xs: 0, md: 'auto' },
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    width: { xs: '100%', md: 'auto' },
  }), []);

  const buttonsBoxStyles = useMemo(() => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: 2, 
    ml: { xs: 0, md: 'auto' },
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    width: { xs: '100%', md: 'auto' },
  }), []);

  const typographyStyles = useMemo(() => ({
    fontWeight: 700,
    color: 'text.primary',
    letterSpacing: '-0.01em',
    position: 'relative',
    display: 'inline-block',
    mb: 0.5,
    fontFamily: 'Inter, Roboto, Arial',
    lineHeight: 1.18,
  }), []);

  const bodyTypographyStyles = useMemo(() => ({
    color: 'text.secondary',
    maxWidth: 520,
    fontWeight: 400,
    fontSize: { xs: '1.04rem', sm: '1.10rem' },
    mt: 0.5,
    fontFamily: 'Inter, Roboto, Arial',
  }), []);

  const inputAdornmentStyles = useMemo(() => ({
    color: 'text.secondary'
  }), []);

  const inputProps = useMemo(() => ({
    startAdornment: <InputAdornment position="start"><SearchIcon sx={inputAdornmentStyles} /></InputAdornment>,
    endAdornment: filterText && (
      <InputAdornment position="end">
        <IconButton 
          size="small" 
          onClick={handleClearFilterCallback} 
          edge="end" 
          aria-label="clear search"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </InputAdornment>
    )
  }), [filterText, handleClearFilterCallback, inputAdornmentStyles]);

  const refreshButton = useMemo(() => (
    <IconButton 
      onClick={onRefresh}
      aria-label="refresh list"
      sx={{
        backgroundColor: 'action.selected',
        color: 'primary.main',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.15),
        },
        width: '40px',
        height: '40px'
      }}
    >
      <RefreshIcon />
    </IconButton>
  ), [onRefresh, theme]);

  const sortButton = useMemo(() => (
    <Button
      variant="outlined"
      size="medium"
      startIcon={<SortIcon />}
      onClick={handleSortButtonClick}
      sx={{ 
        textTransform: 'none',
        borderColor: 'divider',
        color: 'text.primary',
        '&:hover': {
          backgroundColor: 'action.hover',
          borderColor: 'primary.main'
        }
      }}
    >
      Sort
    </Button>
  ), [handleSortButtonClick]);

  const addButton = useMemo(() => (
    <Button
      variant="contained"
      color="primary"
      size="medium"
      sx={{
        textTransform: 'none',
        transition: 'all 0.2s ease-in-out',
        color: 'primary.contrastText'
      }}
      onClick={onAddTopping}
      startIcon={<AddIcon />}
    >
      Add
    </Button>
  ), [onAddTopping]);

  // Memoize the sx styles for TextField
  const textFieldSx = useMemo(() => ({ 
    '& .MuiInputBase-root': { 
      backgroundColor: 'background.default',
      color: 'text.primary',
      height: '40px',
      minWidth: '200px'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
    },
    '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'action.active',
    },
    '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    }
  }), []);

  // Memoize MenuListProps, anchorOrigin, and transformOrigin
  const menuListProps = useMemo(() => ({ 'aria-labelledby': 'sort-button' }), []);
  const anchorOriginProps = useMemo(() => ({ vertical: 'bottom', horizontal: 'right' }), []);
  const transformOriginProps = useMemo(() => ({ vertical: 'top', horizontal: 'right' }), []);

  // Memoize MenuItem onClick handler factory
  const createMenuItemClickHandler = useCallback((type) => () => handleSortMenuItemClick(type), [handleSortMenuItemClick]);

  // Memoize Box components
  const headerBox = useMemo(() => (
    <Box sx={boxStyles}>
      <Box sx={innerBoxStyles}>
        <Box sx={contentBoxStyles}>
          <Box>
            <Typography
              variant="h4"
              component="h2"
              sx={typographyStyles}
            >
              Toppings Menu
            </Typography>
            <Typography
              variant="body1"
              sx={bodyTypographyStyles}
            >
              Manage your toppings with ease. Add, edit, or remove items as needed.
            </Typography>
          </Box>
          <Box sx={buttonsBoxStyles}>
            {/* Search Input */}
            <TextField
              placeholder="Search toppings..."
              size="small"
              value={filterText}
              onChange={handleFilterTextChange}
              InputProps={inputProps}
              sx={textFieldSx}
            />
            {/* Add Button */}
            {addButton}
            {/* Sort Button */}
            {sortButton}
            {/* Refresh Button */}
            <Tooltip title="Refresh List">
              {refreshButton}
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  ), [boxStyles, innerBoxStyles, contentBoxStyles, typographyStyles, bodyTypographyStyles, buttonsBoxStyles, filterText, handleFilterTextChange, inputProps, addButton, sortButton, refreshButton, textFieldSx]);

  return (
    <>
      {/* Header section with title, description, and primary actions. */}
      {headerBox}

      {/* Toolbar that appears when items are selected. */}
      {numSelected > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            bgcolor: theme => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            borderRadius: 1,
          }}
        >
          <Typography 
            sx={{ flex: '1 1 auto' }} 
            color="inherit" 
            variant="subtitle1" 
            component="div"
          >
            {numSelected} selected
          </Typography>
          <Tooltip title="Delete selected toppings">
            <IconButton 
              onClick={handleDeleteSelectedCallback} 
              color="error" 
              disabled={loading}
              aria-label="delete selected toppings"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}

      {/* Pop-up menu for selecting the sort order. */}
      <Menu
        id="sort-menu"
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortMenuClose}
        MenuListProps={menuListProps}
        anchorOrigin={anchorOriginProps}
        transformOrigin={transformOriginProps}
      >
        {sortOptions.map(({ type, label, icon }) => (
          <MenuItem
            key={type}
            onClick={createMenuItemClickHandler(type)}
            selected={sortType === type}
            dense
          >
            <ListItemIcon>
              {icon}
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default React.memo(ToppingToolbar);
