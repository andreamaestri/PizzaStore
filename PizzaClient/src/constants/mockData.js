// Provides mock data for frontend development and testing purposes.

// Possible order statuses (should align with backend enum/values).
export const orderStatuses = [
  "Pending", "InProgress", "Ready", "Delivered", "Cancelled"
];

// Mock data representing pizza orders (structure should align with backend Order model).
export const orders = [
  {
    id: 101,
    orderDate: "2025-04-20T13:05:00Z",
    customerName: "Alice Johnson",
    address: "12 Trelawney Road, Penzance, Cornwall",
    phoneNumber: "+44 7712 345678",
    totalAmount: 18.98,
    status: "Delivered",
    items: [
      { id: 1, orderId: 101, pizzaId: 1, quantity: 1, unitPrice: 8.99 },
      { id: 2, orderId: 101, pizzaId: 3, quantity: 1, unitPrice: 9.99 }
    ]
  },
  {
    id: 102,
    orderDate: "2025-04-23T10:15:00Z",
    customerName: "Bob Smith",
    address: "8 Fore Street, St Ives, Cornwall",
    phoneNumber: "+44 7722 987654",
    totalAmount: 10.99,
    status: "InProgress",
    items: [
      { id: 3, orderId: 102, pizzaId: 2, quantity: 1, unitPrice: 10.99 }
    ]
  },
  {
    id: 103,
    orderDate: "2025-04-23T11:00:00Z",
    customerName: "Alice Johnson",
    address: "12 Trelawney Road, Penzance, Cornwall",
    phoneNumber: "+44 7712 345678",
    totalAmount: 11.49,
    status: "Ready",
    items: [
      { id: 4, orderId: 103, pizzaId: 4, quantity: 1, unitPrice: 11.49 }
    ]
  },
  {
    id: 104,
    orderDate: "2025-04-22T18:30:00Z",
    customerName: "Charlie Pascoe",
    address: "24 Cliff Road, Falmouth, Cornwall",
    phoneNumber: "+44 7733 112233",
    totalAmount: 19.48,
    status: "Cancelled",
    items: [
      { id: 5, orderId: 104, pizzaId: 5, quantity: 1, unitPrice: 10.49 },
      { id: 6, orderId: 104, pizzaId: 1, quantity: 1, unitPrice: 8.99 }
    ]
  },
  {
    id: 105,
    orderDate: "2025-04-21T20:45:00Z",
    customerName: "Bob Smith",
    address: "8 Fore Street, St Ives, Cornwall",
    phoneNumber: "+44 7722 987654",
    totalAmount: 32.47,
    status: "Delivered",
    items: [
      { id: 7, orderId: 105, pizzaId: 3, quantity: 1, unitPrice: 9.99 },
      { id: 8, orderId: 105, pizzaId: 2, quantity: 1, unitPrice: 10.99 },
      { id: 9, orderId: 105, pizzaId: 4, quantity: 1, unitPrice: 11.49 }
    ]
  }
];

// Mock data representing users (potentially for UI convenience, may not match a backend model exactly).
export const users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    address: "12 Trelawney Road, Penzance, Cornwall",
    phone: "+44 7712 345678"
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    address: "8 Fore Street, St Ives, Cornwall",
    phone: "+44 7722 987654"
  },
  {
    id: 3,
    name: "Charlie Pascoe",
    email: "charlie@example.com",
    address: "24 Cliff Road, Falmouth, Cornwall",
    phone: "+44 7733 112233"
  },
  {
    id: 4,
    name: "Daisy Trevithick",
    email: "daisy@example.com",
    address: "5 Market Place, Penzance, Cornwall",
    phone: "+44 7744 556677"
  }
];
