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
      const itemsSummary = order.items?.map((i) => `${i.name} x${i.quantity}`).join(', ') || '';
      setNotifications((prev) => [
        {
          id: `order-${order._id}-${Date.now()}`,
          message: msg,
          time: new Date().toISOString(),
          type: 'order',
          order,
          orderId: order._id,
          itemsSummary: itemsSummary.slice(0, 80) + (itemsSummary.length > 80 ? '...' : ''),
          totalPrice: order.totalPrice,
          tableNumber: order.tableNumber,
        },
        ...prev,
      ]);
      toast.info(msg, { autoClose: 5000 });
    };

    const handleNewBulkOrder = (order) => {
      const name = order.userId?.name || 'Customer';
      const msg = `New bulk order from ${name}`;
      const itemsSummary = order.items?.map((i) => `${i.name} x${i.quantity}`).join(', ') || '';
      setNotifications((prev) => [
        {
          id: `bulk-${order._id}-${Date.now()}`,
          message: msg,
          time: new Date().toISOString(),
          type: 'bulk',
          order,
          orderId: order._id,
          itemsSummary: itemsSummary.slice(0, 80) + (itemsSummary.length > 80 ? '...' : ''),
          totalPrice: order.totalPrice,
          customerName: name,
        },
        ...prev,
      ]);
      toast.info(msg, { autoClose: 5000 });
    };

    const handleNewSubscription = (sub) => {
      const planName = sub.plan?.name || 'Plan';
      const userName = sub.user?.name || 'Customer';
      const msg = `New subscription: ${userName} → ${planName}`;
      setNotifications((prev) => [
        {
          id: `sub-${sub._id}-${Date.now()}`,
          message: msg,
          time: new Date().toISOString(),
          type: 'subscription',
          subscription: sub,
        },
        ...prev,
      ]);
      toast.info(msg, { autoClose: 5000 });
    };

    socket.on('new_order', handleNewOrder);
    if (user?.role === 'superadmin') {
      socket.on('new_bulk_order', handleNewBulkOrder);
      socket.on('new_subscription', handleNewSubscription);
    }

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('new_bulk_order', handleNewBulkOrder);
      socket.off('new_subscription', handleNewSubscription);
    };
  }, [socket, isAdmin, user?.role]);

  const clearNotifications = () => setNotifications([]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.length;

  return (
    <AdminNotificationsContext.Provider value={{ notifications, clearNotifications, markAsRead, unreadCount }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationsContext);
  return ctx || { notifications: [], clearNotifications: () => {}, markAsRead: () => {}, unreadCount: 0 };
}
