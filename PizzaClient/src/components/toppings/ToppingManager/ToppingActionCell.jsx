import React, { memo } from 'react';
import {
  IconButton,
  Tooltip,
  ButtonGroup,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ToppingActionCell = ({
  isEditing,
  loading,
  hasError,
  canSave,
  onEdit,
  onSave,
  onCancel,
  onDelete
}) => {
  const theme = useTheme();
  // Material 3 inspired styling for outlined icon buttons.
  const actionButtonStyle = {
    borderRadius: '100%', // MD3 uses fully circular icon buttons.
    backgroundColor: 'transparent',
    transition: theme.transitions.create(
      ['background-color', 'border-color'],
      { duration: 150 } // MD3 standard duration.
    ),
    '&:hover': {
      // MD3 uses state layers (semi-transparent background) instead of elevation.
      backgroundColor: `${alpha(theme.palette.action.active, 0.08)}`, // MD3 hover state layer opacity.
      borderColor: alpha(theme.palette.action.active, 0.3),
    },
    '&:active': {
      backgroundColor: `${alpha(theme.palette.action.active, 0.12)}`, // MD3 pressed state layer opacity.
    },
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    minWidth: theme.spacing(14),
    height: '100%',
    alignItems: 'center'
  };
  if (isEditing) {
    return (
      <Box sx={containerStyle}>
        <ButtonGroup size="small" aria-label="topping edit actions" sx={{ gap: 1 }}>
            <Tooltip title="Save changes" arrow placement="top">
              <span>
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  disabled={loading || hasError || !canSave}
                  size="small"
                  aria-label="save topping changes"
                  sx={{
                    ...actionButtonStyle,
                    color: theme.palette.primary.main,
                    '&:not(:disabled)': {
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }
                    },
                    '&.Mui-disabled': {
                      opacity: 0.6,
                    }
                  }}
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cancel editing" arrow placement="top">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                size="small"
                aria-label="cancel editing"
                disabled={loading}
                sx={{
                  ...actionButtonStyle,
                  ml: 1,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.active, 0.08),
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>          </ButtonGroup>
      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
        <ButtonGroup size="small" aria-label="topping actions" sx={{ gap: 1 }}>
          <Tooltip title="Edit topping name" arrow placement="top">
            <span>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                size="small"
                aria-label="edit topping name"
                disabled={loading}
                sx={{
                  ...actionButtonStyle,
                  color: theme.palette.primary.main,
                  borderRadius: 2.5,
                  '&:not(:disabled)': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.18),
                    }
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove topping" arrow placement="top">
            <span>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                size="small"
                aria-label="remove topping"
                disabled={loading}
                sx={{
                  ...actionButtonStyle,
                  ml: 1,
                  color: theme.palette.error.main,
                  borderRadius: 2.5,
                  '&:not(:disabled)': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.18),
                    }
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>
    </Box>
  );
};

export default memo(ToppingActionCell);
