import api from './axios';

export const getAdmins = () => api.get('/admins');
export const createAdmin = (data) => api.post('/admins', data);
export const deleteAdmin = (id) => api.delete(`/admins/${id}`);
