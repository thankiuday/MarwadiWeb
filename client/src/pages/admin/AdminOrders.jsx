import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import { useSocket } from '../../hooks/useSocket';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import OrdersTable from '../../components/orders/OrdersTable';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const { socket } = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getAllOrders();
      setOrders(data.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
      setNewOrderIds((prev) => new Set([...prev, order._id]));
    };

    const handleOrderUpdated = (order) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? order : o))
      );
      setNewOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated', handleOrderUpdated);
    };
  }, [socket]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? data.data : o))
      );
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="Orders" />
      <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 pb-8">
        <OrdersTable
          orders={orders}
          loading={loading}
          onStatusChange={handleStatusChange}
          showActions
          newOrderIds={newOrderIds}
        />
      </div>
    </AdminLayout>
  );
}
