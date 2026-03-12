import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';

export default function NotificationToast() {
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    if (user.role === 'admin' || user.role === 'superadmin') {
      const handler = (order) => {
        toast.info(
          `New order #${order._id.slice(-6).toUpperCase()} from Table ${order.tableNumber}`,
          { autoClose: 5000 }
        );
      };
      socket.on('new_order', handler);
      return () => socket.off('new_order', handler);
    }

    if (user.role === 'customer') {
      const handler = ({ orderId, status }) => {
        const messages = {
          accepted: 'Your order has been accepted!',
          preparing: 'Your order is being prepared!',
          completed: 'Your order is ready!',
          rejected: 'Your order was rejected.',
        };
        toast.info(messages[status] || `Order status: ${status}`, { autoClose: 4000 });
      };
      socket.on('order_status_updated', handler);
      return () => socket.off('order_status_updated', handler);
    }
  }, [socket, user]);

  return null;
}
