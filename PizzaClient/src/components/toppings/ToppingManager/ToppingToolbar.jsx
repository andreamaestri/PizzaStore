import React, { useState, useCallback } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  LocalFireDepartment as PopularIcon,
  AccessTime as RecentIcon,
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
  totalToppings,
}) => {
  const theme = useTheme();
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  const handleSortMenuOpen = useCallback((event) => {
    setSortMenuAnchor(event.currentTarget);
  }, []);

  const handleSortMenuClose = useCallback(() => {
    setSortMenuAnchor(null);
  }, []);

  const handleSortMenuItemClick = useCallback((newSortType) => {
    onSortChange(newSortType);
    handleSortMenuClose();
  }, [onSortChange, handleSortMenuClose]);

  // Sort menu options configuration
  const sortOptions = [
    { type: SortType.ALPHA_ASC, label: 'Alphabetical (A-Z)', icon: <ArrowUpIcon /> },
    { type: SortType.ALPHA_DESC, label: 'Alphabetical (Z-A)', icon: <ArrowDownIcon /> },
    { type: SortType.MOST_USED, label: 'Most Used', icon: <PopularIcon /> },
    { type: SortType.RECENT, label: 'Recently Added', icon: <RecentIcon /> },
  ];

  return (
    <>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          ...(numSelected > 0 && {
            bgcolor: alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            borderRadius: theme.shape.borderRadius / 2,
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography 
            sx={{ flex: '1 1 auto' }} 
            color="inherit" 
            variant="subtitle1" 
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 auto' }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={500} 
              id="tableTitle" 
              component="div"
            >
              Available Toppings
            </Typography>
            <Chip
              label={totalToppings}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {numSelected === 0 && (
            <TextField
              placeholder="Search toppings..."
              value={filterText}
              onChange={(e) => onFilterTextChange(e.target.value)}
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: filterText && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={onClearFilter} 
                      edge="end" 
                      aria-label="clear search"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: { xs: '150px', sm: '180px' } }}
            />
          )}
          {numSelected > 0 && (
            <Tooltip title="Delete selected toppings">
              <IconButton 
                onClick={onDeleteSelected} 
                color="error" 
                disabled={loading}
                aria-label="delete selected toppings"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>

      {/* Sort Menu */}
      <Menu
        id="sort-menu"
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortMenuClose}
        MenuListProps={{ 'aria-labelledby': 'sort-button' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {sortOptions.map(({ type, label, icon }) => (
          <MenuItem
            key={type}
            onClick={() => handleSortMenuItemClick(type)}
            selected={sortType === type}
            dense
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ToppingToolbar;
