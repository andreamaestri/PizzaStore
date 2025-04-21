const API_URL = '/api/orders';
const headers = {
  'Content-Type': 'application/json',
};

// Fetch all orders
const fetchOrders = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Fetch a single order by ID
const fetchOrderById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Create a new order
const createOrder = async (orderData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create order (Status: ${response.status})`);
  }
  
  return await response.json();
};

// Update order status
const updateOrderStatus = async (id, newStatus) => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(newStatus),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update order status (Status: ${response.status})`);
  }
  
  return await response.json();
};

// Cancel an order
const cancelOrder = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to cancel order (Status: ${response.status})`);
  }
  
  return true;
};

const orderService = {
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
};

export default orderService;
