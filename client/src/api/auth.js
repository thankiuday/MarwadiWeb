import api from './axios';

export const registerCustomer = (data) => api.post('/auth/register', data);
export const loginCustomer = (data) => api.post('/auth/login', data);
export const loginAdmin = (data) => api.post('/auth/admin/login', data);
export const getMe = () => api.get('/auth/me');
