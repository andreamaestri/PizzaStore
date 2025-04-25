import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Checkbox, IconButton, Tooltip, Box, Typography, useTheme
} from '@mui/material';

/**
 * DataTable (MD3/Toolpad-ready)
 * - Responsive columns (hide via sx.display)
 * - MD3 surface, border, and typography
 * - Focus/hover states, accessible checkboxes
 * - Toolpad slot-ready (toolbar, pagination, etc.)
 */
const DataTable = ({
  columns,
  rows,
  selection,
  actions,
  loading,
  emptyMessage = 'No data available',
  tableProps = {},
  toolbar, // Optional slot for a toolbar component (e.g., for Toolpad).
  pagination, // Optional slot for a pagination component (e.g., for Toolpad).
  ...rest
}) => {
  const theme = useTheme();
  const allSelected = selection?.selected?.length === rows.length && rows.length > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: 'divider',
        bgcolor: theme.palette.surface?.main || theme.palette.background.paper,
        borderRadius: 3,
        boxShadow: 'none',
        ...rest.sx,
      }}
      tabIndex={0}
      aria-label="Data table"
    >
      {toolbar && (
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>{toolbar}</Box>
      )}
      <TableContainer>
        <Table size="small" {...tableProps}>
          <TableHead sx={{
            bgcolor: theme.palette.surface?.containerLow || theme.palette.action.hover,
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: theme.palette.text.secondary,
              borderBottomColor: 'divider',
              fontSize: '1rem',
              letterSpacing: 0.01,
            }
          }}>
            <TableRow>
              {selection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={allSelected}
                    indeterminate={selection.selected.length > 0 && !allSelected}
                    onChange={selection.onSelectAll}
                    inputProps={{ 'aria-label': 'select all rows' }}
                    sx={{
                      borderRadius: '50%',
                      '&:focus-visible': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: 2,
                      }
                    }}
                  />
                </TableCell>
              )}
              {columns.map(col => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    ...col.sx,
                    display: col.hideOnMobile ? { xs: 'none', sm: 'table-cell' } : undefined,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              {actions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selection ? 2 : 1)}>
                  <Typography align="center" color="text.secondary">Loading…</Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selection ? 2 : 1)}>
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">{emptyMessage}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => {
                const isSelected = selection?.selected?.includes(row.id);
                return (
                  <TableRow
                    key={row.id || idx}
                    hover
                    selected={isSelected}
                    onClick={selection?.onSelect ? (e) => selection.onSelect(e, row.id) : undefined}
                    sx={{
                      cursor: selection?.onSelect ? 'pointer' : 'default',
                      '&:focus-visible': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: 2,
                      }
                    }}
                    tabIndex={0}
                  >
                    {selection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isSelected}
                          onChange={e => selection.onSelect(e, row.id)}
                          inputProps={{ 'aria-label': `select row ${row.id}` }}
                          sx={{
                            borderRadius: '50%',
                            '&:focus-visible': {
                              outline: `2px solid ${theme.palette.primary.main}`,
                              outlineOffset: 2,
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map(col => (
                      <TableCell
                        key={col.id}
                        align={col.align || 'left'}
                        sx={{
                          ...col.sx,
                          display: col.hideOnMobile ? { xs: 'none', sm: 'table-cell' } : undefined,
                        }}
                      >
                        {col.render ? col.render(row) : row[col.id]}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="right">
                        {actions.renderActions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <Box sx={{ px: 2, py: 1 }}>{pagination}</Box>
      )}
    </Paper>
  );
};

export default DataTable;