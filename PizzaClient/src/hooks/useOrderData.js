import { useState, useCallback } from 'react';
import orderService from '../services/api/orderService';

export function useOrderData() {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Fetches all orders from the service.
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.fetchOrders();
      setOrders(data);
      return data;
    } catch (err) {
      setError(err);
      showNotification(`Error fetching orders: ${err.message}`, 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetches a single order by its ID.
  const fetchOrderById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await orderService.fetchOrderById(id);
      setCurrentOrder(data);
      return data;
    } catch (err) {
      setError(err);
      showNotification(`Error fetching order: ${err.message}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Creates a new order using the provided data.
  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prev => [...prev, newOrder]);
      showNotification('Order placed successfully!', 'success');
      return newOrder;
    } catch (err) {
      setError(err);
      showNotification(`Error creating order: ${err.message}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Updates the status of a specific order.
  const updateOrderStatus = useCallback(async (id, newStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      ));
      showNotification('Order status updated successfully', 'success');
      return updatedOrder;
    } catch (err) {
      setError(err);
      showNotification(`Error updating order status: ${err.message}`, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancels a specific order by ID.
  const cancelOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await orderService.cancelOrder(id);
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status: 'Cancelled' } : order
      ));
      showNotification('Order cancelled successfully', 'success');
      return true;
    } catch (err) {
      setError(err);
      showNotification(`Error cancelling order: ${err.message}`, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    currentOrder,
    loading,
    error,
    notification,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    closeNotification
  };
}
