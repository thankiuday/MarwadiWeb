import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'react-toastify';

export const AdminNotificationsContext = createContext(null);

export function AdminNotificationsProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (!socket || !isAdmin) return;

    const handleNewOrder = (order) => {
      const msg = `New order from Table ${order.tableNumber}`;
      setNotifications((prev) => [
        { id: `order-${order._id}-${Date.now()}`, message: msg, time: new Date().toLocaleTimeString(), type: 'order' },
        ...prev,
      ]);
      toast.info(msg, { autoClose: 5000 });
    };

    const handleNewBulkOrder = (order) => {
      const name = order.userId?.name || 'Customer';
      const msg = `New bulk order from ${name}`;
      setNotifications((prev) => [
        { id: `bulk-${order._id}-${Date.now()}`, message: msg, time: new Date().toLocaleTimeString(), type: 'bulk' },
        ...prev,
      ]);
      toast.info(msg, { autoClose: 5000 });
    };

    socket.on('new_order', handleNewOrder);
    if (user?.role === 'superadmin') {
      socket.on('new_bulk_order', handleNewBulkOrder);
    }

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('new_bulk_order', handleNewBulkOrder);
    };
  }, [socket, isAdmin, user?.role]);

  const clearNotifications = () => setNotifications([]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AdminNotificationsContext.Provider value={{ notifications, clearNotifications, markAsRead }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationsContext);
  return ctx || { notifications: [], clearNotifications: () => {}, markAsRead: () => {} };
}
