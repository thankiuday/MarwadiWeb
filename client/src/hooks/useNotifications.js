import { useContext } from 'react';
import { NotificationsContext } from '../context/NotificationsContext';

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    return {
      notifications: [],
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      unreadCount: 0,
    };
  }
  return context;
};
