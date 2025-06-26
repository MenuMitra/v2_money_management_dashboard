import axios from './axios';

export const dashboardApi = {
  getStats: async () => {
    const response = await axios.get('/dashboard/stats');
    return response.data;
  },
  
  getRevenueChart: async (period = 'week') => {
    const response = await axios.get('/dashboard/revenue', { params: { period } });
    return response.data;
  },
  
  getTopSellingItems: async () => {
    const response = await axios.get('/dashboard/top-items');
    return response.data;
  },
  
  getOutletStatus: async () => {
    const response = await axios.get('/dashboard/outlet-status');
    return response.data;
  },
  
  updateOutletStatus: async (isOpen) => {
    const response = await axios.patch('/dashboard/outlet-status', { isOpen });
    return response.data;
  },
  
  getRecentOrders: async (limit = 5) => {
    const response = await axios.get('/dashboard/recent-orders', { params: { limit } });
    return response.data;
  },
}; 