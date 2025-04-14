import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  Chip,
  Checkbox,
  useTheme
} from '@mui/material';
import EnhancedTableHead from './EnhancedTableHead';
import ToppingActionCell from './ToppingActionCell';
import { getComparator } from '../../../utils/sortUtils';

/**
 * Table component for displaying and managing toppings
 */
const ToppingTable = ({
  toppingsData,
  order,
  orderBy,
  selected,
  onRowClick,
  onRequestSort,
  onSelectAllClick,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDeleteRequest,
  editMode,
  editState,
  loading,
  recentToppings
}) => {
  const theme = useTheme();

  // Sort rows based on current sort settings
  const visibleRows = useMemo(() => {
    return [...toppingsData].sort(getComparator(order, orderBy));
  }, [toppingsData, order, orderBy]);

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const handleSave = (toppingName) => {
    onEditSave(toppingName, editState[toppingName]?.text);
  };

  return (
    <TableContainer 
      component={Paper} 
      variant="outlined" 
      sx={{ 
        borderRadius: theme.shape.borderRadius / 2, 
        borderColor: 'divider' 
      }}
    >
      <Table size="medium" aria-label="toppings table">
        <EnhancedTableHead
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={onSelectAllClick}
          onRequestSort={onRequestSort}
          rowCount={toppingsData.length}
        />
        <TableBody>
          {visibleRows.map((row, index) => {
            const isItemSelected = isSelected(row.name);
            const labelId = `enhanced-table-checkbox-${index}`;
            const isEditing = editMode[row.name];
            const currentEditState = editState[row.name] || { text: '', error: null };

            return (
              <TableRow
                hover
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.name}
                selected={isItemSelected}
                onClick={(event) => {
                  if (event.target.closest('button, input')) return;
                  onRowClick(event, row.name);
                }}
                sx={{
                  '& .MuiTableCell-root': {
                    py: 0.75, // Consistent vertical padding
                  }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={isItemSelected}
                    inputProps={{ 'aria-labelledby': labelId }}
                    onClick={(event) => onRowClick(event, row.name)}
                  />
                </TableCell>
                <TableCell 
                  component="th" 
                  id={labelId} 
                  scope="row" 
                  padding="none"
                  sx={{ pl: 1 }} // Add left padding when padding="none"
                >
                  {isEditing ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={currentEditState.text}
                      onChange={(e) => onEditStart(row.name, e.target.value)}
                      variant="outlined"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave(row.name);
                        } else if (e.key === 'Escape') {
                          onEditCancel(row.name);
                        }
                      }}
                      error={!!currentEditState.error}
                      helperText={currentEditState.error || ''}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ py: 0.5 }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {row.name}
                      </Typography>
                      {recentToppings.includes(row.name) && (
                        <Chip
                          label="New"
                          size="small"
                          color="info"
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{
                    paddingRight: 3 // Add more padding for better spacing
                  }}
                >
                  <Chip
                    label={row.usage}
                    size="small"
                    color={row.usage > 2 ? "primary" : "default"}
                    variant={row.usage > 2 ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    pr: 2, // Consistent padding
                    width: theme.spacing(15) // Fixed width for actions column
                  }}
                >
                  <ToppingActionCell
                    name={row.name}
                    isEditing={isEditing}
                    loading={loading}
                    hasError={!!currentEditState.error}
                    canSave={currentEditState.text?.trim() !== ''}
                    onEdit={() => onEditStart(row.name, row.name)}
                    onSave={() => handleSave(row.name)}
                    onCancel={() => onEditCancel(row.name)}
                    onDelete={() => onDeleteRequest(row.name)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ToppingTable;
