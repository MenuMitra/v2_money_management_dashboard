import axios from './axios';

export const ordersApi = {
  getOrders: async (params) => {
    const response = await axios.get('/orders', { params });
    return response.data;
  },
  
  getOrderById: async (orderId) => {
    const response = await axios.get(`/orders/${orderId}`);
    return response.data;
  },
  
  updateOrderStatus: async (orderId, status) => {
    const response = await axios.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },
  
  acceptOrder: async (orderId) => {
    const response = await axios.post(`/orders/${orderId}/accept`);
    return response.data;
  },
  
  rejectOrder: async (orderId, reason) => {
    const response = await axios.post(`/orders/${orderId}/reject`, { reason });
    return response.data;
  },
  
  completeOrder: async (orderId) => {
    const response = await axios.post(`/orders/${orderId}/complete`);
    return response.data;
  },
  
  getOrderHistory: async (params) => {
    const response = await axios.get('/orders/history', { params });
    return response.data;
  },
}; 