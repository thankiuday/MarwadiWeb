import api from './axios';

export const getSalesSummary = (period = 'weekly') =>
  api.get('/analytics/summary', { params: { period } });
export const getSalesChart = (period = 'weekly') =>
  api.get('/analytics/sales', { params: { period } });

export const getSubscriptionSummary = (period = 'weekly') =>
  api.get('/analytics/subscriptions/summary', { params: { period } });
export const getSubscriptionChart = (period = 'weekly') =>
  api.get('/analytics/subscriptions/chart', { params: { period } });
export const exportAnalytics = async (period = 'weekly', format = 'json') => {
  const token = localStorage.getItem('token');
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const url = `${baseUrl.replace(/\/$/, '')}/api/analytics/export?period=${period}&format=${format}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const filenameMatch = disposition?.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] || `analytics-${period}.${format}`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};
