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
  const res = await api.get('/analytics/export', {
    params: { period, format },
    responseType: 'blob',
    timeout: 60000,
    skipAuthRedirect: true,
  });
  const disposition = res.headers['content-disposition'];
  const filenameMatch = disposition?.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] || `analytics-${period}.${format}`;
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data], {
    type: format === 'csv' ? 'text/csv' : 'application/json',
  });
  if (blob.size === 0) {
    throw new Error('Export returned empty data');
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
