import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'react-toastify';
import { playNewOrderSound } from '../utils/notificationSounds';
import { getAllOrders } from '../api/orders';
import { getAllBulkOrders } from '../api/bulkOrders';

export const AdminNotificationsContext = createContext(null);

function orderToNotification(order) {
  const msg = `New order from Table ${order.tableNumber}`;
  const itemsSummary = order.items?.map((i) => `${i.name} x${i.quantity}`).join(', ') || '';
  return {
    id: `order-${order._id}-${order.createdAt}`,
    message: msg,
    time: order.createdAt,
    type: 'order',
    order,
    orderId: order._id,
    itemsSummary: itemsSummary.slice(0, 80) + (itemsSummary.length > 80 ? '...' : ''),
    totalPrice: order.totalPrice,
    tableNumber: order.tableNumber,
  };
}

function bulkOrderToNotification(order) {
  const name = order.userId?.name || 'Customer';
  const msg = `New bulk order from ${name}`;
  const itemsSummary = order.items?.map((i) => `${i.name} x${i.quantity}`).join(', ') || '';
  return {
    id: `bulk-${order._id}-${order.createdAt}`,
    message: msg,
    time: order.createdAt,
    type: 'bulk',
    order,
    orderId: order._id,
    itemsSummary: itemsSummary.slice(0, 80) + (itemsSummary.length > 80 ? '...' : ''),
    totalPrice: order.totalPrice,
    customerName: name,
  };
}

export function AdminNotificationsProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const fetchPendingOrdersAsNotifications = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const notifs = [];
      const [ordersRes, bulkRes] = await Promise.all([
        getAllOrders({ status: 'pending' }),
        user?.role === 'superadmin' ? getAllBulkOrders({ status: 'pending' }) : Promise.resolve({ data: { data: [] } }),
      ]);
      const orders = ordersRes.data?.data || [];
      const bulkOrders = bulkRes.data?.data || [];
      orders.forEach((o) => notifs.push(orderToNotification(o)));
      bulkOrders.forEach((o) => notifs.push(bulkOrderToNotification(o)));
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      if (notifs.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newOnes = notifs.filter((n) => !existingIds.has(n.id));
          return [...newOnes, ...prev];
        });
      }
    } catch {
      // ignore - admin may not have loaded yet
    }
  }, [isAdmin, user?.role]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingOrdersAsNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAdmin, fetchPendingOrdersAsNotifications]);

  useEffect(() => {
    if (!socket || !isAdmin) return;

    const handleNewOrder = (order) => {
      const notif = orderToNotification({ ...order, createdAt: new Date().toISOString() });
      notif.id = `order-${order._id}-${Date.now()}`;
      setNotifications((prev) => {
        const filtered = prev.filter((n) => !(n.type === 'order' && n.orderId === order._id));
        return [notif, ...filtered];
      });
      toast.info(notif.message, { autoClose: 5000 });
      playNewOrderSound();
    };

    const handleNewBulkOrder = (order) => {
      const notif = bulkOrderToNotification({ ...order, createdAt: new Date().toISOString() });
      notif.id = `bulk-${order._id}-${Date.now()}`;
      setNotifications((prev) => {
        const filtered = prev.filter((n) => !(n.type === 'bulk' && n.orderId === order._id));
        return [notif, ...filtered];
      });
      toast.info(notif.message, { autoClose: 5000 });
      playNewOrderSound();
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
      playNewOrderSound();
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
