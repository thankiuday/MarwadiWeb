import { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';

export const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [{ ...notification, id: Date.now(), read: false }, ...prev].slice(0, 50));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!socket || !user || user.role !== 'customer') return;

    const handler = ({ orderId, status }) => {
      const messages = {
        accepted: 'Your order has been accepted!',
        preparing: 'Your order is being prepared!',
        completed: 'Your order is ready!',
        rejected: 'Your order was rejected.',
      };
      addNotification({
        type: 'order_status',
        orderId,
        status,
        message: messages[status] || `Order status: ${status}`,
        time: new Date().toISOString(),
      });
    };

    socket.on('order_status_updated', handler);
    return () => socket.off('order_status_updated', handler);
  }, [socket, user, addNotification]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, markAsRead, markAllAsRead, unreadCount }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
