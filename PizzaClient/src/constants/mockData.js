// Mock data for frontend development

// Mock data for orders
export const orders = [
  {
    id: 101,
    userId: 1, // references users below
    pizzas: [1, 3], // pizza IDs from Pizza.json
    total: 18.98,
    status: "Delivered",
    createdAt: "2025-04-20T13:05:00Z"
  },
  {
    id: 102,
    userId: 2,
    pizzas: [2],
    total: 10.99,
    status: "Preparing",
    createdAt: "2025-04-23T10:15:00Z"
  },
  {
    id: 103,
    userId: 1,
    pizzas: [4],
    total: 11.49,
    status: "In Transit",
    createdAt: "2025-04-23T11:00:00Z"
  }
];
// Mock data for users
export const users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    address: "12 Trelawney Road, Penzance, Cornwall"
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    address: "8 Fore Street, St Ives, Cornwall"
  },
  {
    id: 3,
    name: "Charlie Pascoe",
    email: "charlie@example.com",
    address: "24 Cliff Road, Falmouth, Cornwall"
  }
];
