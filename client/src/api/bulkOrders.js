import api from './axios';

export const placeBulkOrder = (data) => api.post('/bulk-orders', data);
export const getMyBulkOrders = () => api.get('/bulk-orders/my');
export const getAllBulkOrders = (params) => api.get('/bulk-orders', { params });
export const updateBulkOrderStatus = (id, status) =>
  api.put(`/bulk-orders/${id}/status`, { status });
