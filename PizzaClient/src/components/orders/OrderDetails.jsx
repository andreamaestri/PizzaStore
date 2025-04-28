import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip, 
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Breadcrumbs,
  Link,
  IconButton,
  Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon 
} from '@mui/icons-material';
import { useOrderData } from '../../hooks/useOrderData';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchOrderById, loading, error, updateOrderStatus } = useOrderData();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const getOrderDetails = async () => {
      const fetchedOrder = await fetchOrderById(parseInt(id));
      setOrder(fetchedOrder);
    };
    
    getOrderDetails();
  }, [id, fetchOrderById]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered':
        return 'success';
      case 'Ready':
        return 'warning';
      case 'InProgress':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleStatusChange = async (newStatus) => {
    const updatedOrder = await updateOrderStatus(order.id, newStatus);
    if (updatedOrder) {
      setOrder(updatedOrder);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading order: {error.message}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Order not found.
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Dashboard
        </Link>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/orders');
          }}
        >
          Orders
        </Link>
        <Typography color="text.primary">Order #{order.id}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center">
          <IconButton 
            sx={{ mr: 1 }}
            onClick={() => navigate('/orders')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Order #{order.id}
          </Typography>
          <Chip 
            label={order.status} 
            color={getStatusColor(order.status)} 
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <>
              {order.status === 'InProgress' && (
                <Button 
                  variant="contained" 
                  color="warning"
                  onClick={() => handleStatusChange('Ready')}
                  sx={{ mr: 1 }}
                >
                  Mark as Ready
                </Button>
              )}
              {order.status === 'Ready' && (
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => handleStatusChange('Delivered')}
                  sx={{ mr: 1 }}
                >
                  Mark as Delivered
                </Button>
              )}
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => handleStatusChange('Cancelled')}
              >
                Cancel Order
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Order Details Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {order.customerName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Address:</strong> {order.address || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Order Date:</strong> {formatDate(order.orderDate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <Box p={2} pb={1}>
              <Typography variant="h6">
                Order Items
              </Typography>
            </Box>
            <Divider />
            <List>
              {order.items && order.items.map((item, index) => (
                <ListItem 
                  key={index}
                  secondaryAction={
                    <Typography variant="body1" fontWeight="bold">
                      £{(item.unitPrice * item.quantity).toFixed(2)}
                    </Typography>
                  }
                  divider={index < order.items.length - 1}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body1">
                          {item.pizzaName || `Pizza #${item.pizzaId}`} 
                        </Typography>
                        <Chip 
                          label={`x${item.quantity}`} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={`£${item.unitPrice.toFixed(2)} each`}
                  />
                </ListItem>
              ))}
            </List>

            <Box 
              p={2} 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{ 
                backgroundColor: theme => 
                  theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.03)'
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                £{order.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          <Box display="flex" justifyContent="flex-end">
            <Button 
              startIcon={<ReceiptIcon />}
              variant="outlined"
            >
              Print Receipt
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetails;
