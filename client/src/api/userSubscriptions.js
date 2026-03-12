import api from './axios';

export const getUserSubscriptions = () => api.get('/user-subscriptions');
export const getUserSubscriptionById = (id) => api.get(`/user-subscriptions/${id}`);
export const createUserSubscription = (planId) =>
  api.post('/user-subscriptions', { planId });
export const markMealDone = (id, date, meal, done) =>
  api.patch(`/user-subscriptions/${id}/meal`, { date, meal, done });
