import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllBulkOrders, updateBulkOrderStatus } from '../../api/bulkOrders';
import { useSocket } from '../../hooks/useSocket';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import BulkOrdersTable from '../../components/orders/BulkOrdersTable';

export default function SABulkOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getAllBulkOrders();
      setOrders(data.data || []);
    } catch {
      toast.error('Failed to load bulk orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;

    const handleNew = (order) => {
      setOrders((prev) => [order, ...prev]);
      setNotifications((prev) => [
        {
          message: `New bulk order from ${order.userId?.name || 'Customer'}`,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      toast.info(`New bulk order from ${order.userId?.name || 'Customer'}!`);
    };

    const handleUpdated = (order) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    };

    socket.on('new_bulk_order', handleNew);
    socket.on('bulk_order_updated', handleUpdated);
    return () => {
      socket.off('new_bulk_order', handleNew);
      socket.off('bulk_order_updated', handleUpdated);
    };
  }, [socket]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await updateBulkOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="Bulk Orders" />
      <div className="p-4 sm:p-6">
        <BulkOrdersTable
          orders={orders}
          loading={loading}
          onStatusChange={handleStatusChange}
          showActions
        />
      </div>
    </AdminLayout>
  );
}
