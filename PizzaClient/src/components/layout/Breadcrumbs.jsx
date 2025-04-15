import React from 'react';
import { 
  Breadcrumbs as MuiBreadcrumbs, 
  Link, 
  Typography, 
  Box, 
  useTheme 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrumbs = ({ items = [] }) => {
  const theme = useTheme();

  // Don't render if there are no items or only one item
  if (items.length <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        mt: 1,
        px: 1,
        py: 0.75,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <MuiBreadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return isLast ? (
            <Typography 
              key={`breadcrumb-${index}`}
              color="text.primary"
              fontWeight="500"
            >
              {item.text}
            </Typography>
          ) : (
            <Link
              key={`breadcrumb-${index}`}
              component={RouterLink}
              to={item.href}
              underline="hover"
              color="text.secondary"
              sx={{ 
                '&:hover': { color: theme.palette.primary.main },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {item.icon && <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>}
              {item.text}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
