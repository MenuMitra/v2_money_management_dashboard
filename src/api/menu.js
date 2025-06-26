import axios from './axios';

export const menuApi = {
  getMenu: async () => {
    const response = await axios.get('/menu');
    return response.data;
  },
  
  getMenuItem: async (itemId) => {
    const response = await axios.get(`/menu/${itemId}`);
    return response.data;
  },
  
  updateMenuItem: async (itemId, itemData) => {
    const response = await axios.put(`/menu/${itemId}`, itemData);
    return response.data;
  },
  
  toggleItemAvailability: async (itemId, isAvailable) => {
    const response = await axios.patch(`/menu/${itemId}/availability`, { isAvailable });
    return response.data;
  },
  
  updateMenuCategory: async (categoryId, categoryData) => {
    const response = await axios.put(`/menu/categories/${categoryId}`, categoryData);
    return response.data;
  },
  
  bulkUpdateAvailability: async (itemIds, isAvailable) => {
    const response = await axios.patch('/menu/bulk-availability', { itemIds, isAvailable });
    return response.data;
  },
}; 