import api from '@/lib/axios';

/**
 * Order API Service
 * Handles all order-related API calls
 */

// Get orders with filters
export const getOrders = async (params = {}) => {
  const { data } = await api.get('/api/orders', { params });
  return data.data;
};

// Get single order by ID
export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/api/orders/${orderId}`);
  return data.data.order;
};

// Get order by order number
export const getOrderByNumber = async (orderNumber) => {
  const { data } = await api.get(`/api/orders/number/${orderNumber}`);
  return data.data.order;
};

// Get order by job and application IDs
export const getOrderByJobApplication = async (jobId, applicationId) => {
  const { data } = await api.get(`/api/orders/job/${jobId}/application/${applicationId}`);
  return data.data.order;
};

// Get order statistics
export const getOrderStats = async () => {
  const { data } = await api.get('/api/orders/stats');
  return data.data.stats;
};

// Deliver order
export const deliverOrder = async ({ orderId, deliveryData }) => {
  const { data } = await api.post(`/api/orders/${orderId}/deliver`, deliveryData);
  return data.data.order;
};

// Request revision
export const requestRevision = async ({ orderId, reason }) => {
  const { data } = await api.post(`/api/orders/${orderId}/revision`, { reason });
  return data.data.order;
};

// Complete order
export const completeOrder = async (orderId) => {
  const { data } = await api.post(`/api/orders/${orderId}/complete`);
  return data.data.order;
};

// Cancel order
export const cancelOrder = async ({ orderId, reason }) => {
  const { data } = await api.post(`/api/orders/${orderId}/cancel`, { reason });
  return data.data.order;
};

// Add message to timeline
export const addOrderMessage = async ({ orderId, message, attachments = [] }) => {
  const { data } = await api.post(`/api/orders/${orderId}/message`, {
    message,
    attachments
  });
  return data.data.order;
};

// Rate order
export const rateOrder = async ({ orderId, rating, review }) => {
  const { data } = await api.post(`/api/orders/${orderId}/rate`, {
    rating,
    review
  });
  return data.data.order;
};

// Extend deadline
export const extendDeadline = async ({ orderId, new_due_date, reason }) => {
  const { data } = await api.put(`/api/orders/${orderId}/deadline`, {
    new_due_date,
    reason
  });
  return data.data.order;
};

// Open dispute
export const disputeOrder = async ({ orderId, reason, evidence = [] }) => {
  const { data } = await api.post(`/api/orders/${orderId}/dispute`, {
    reason,
    evidence
  });
  return data.data.order;
};

// Helper function to format order status for display
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    active: 'Active',
    delivered: 'Delivered',
    revision: 'In Revision',
    completed: 'Completed',
    cancelled: 'Cancelled',
    disputed: 'Disputed'
  };
  return statusMap[status] || status;
};

// Helper function to get status color
export const getStatusColor = (status) => {
  const colorMap = {
    pending: 'yellow',
    active: 'blue',
    delivered: 'purple',
    revision: 'orange',
    completed: 'green',
    cancelled: 'gray',
    disputed: 'red'
  };
  return colorMap[status] || 'gray';
};

// Helper to calculate time remaining
export const calculateTimeRemaining = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;

  if (diffMs <= 0) {
    return {
      isOverdue: true,
      days: 0,
      hours: 0,
      minutes: 0,
      text: 'Overdue'
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m remaining`;
  } else {
    text = `${minutes}m remaining`;
  }

  return {
    isOverdue: false,
    days,
    hours,
    minutes,
    text
  };
};