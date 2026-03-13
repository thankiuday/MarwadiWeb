import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApiError } from '../../utils/getApiError';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import { getAllBulkOrders, updateBulkOrderStatus } from '../../api/bulkOrders';
import { useSocket } from '../../hooks/useSocket';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import UnifiedOrdersTable from '../../components/orders/UnifiedOrdersTable';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'status', label: 'By status' },
];

export default function SAOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [highlightOrderId, setHighlightOrderId] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    const state = location.state;
    if (state?.highlightOrderId) {
      setHighlightOrderId(state.highlightOrderId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!highlightOrderId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`order-${highlightOrderId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setHighlightOrderId(null);
    }, 300);
    return () => clearTimeout(timer);
  }, [highlightOrderId, orders, bulkOrders]);

  const fetchOrders = useCallback(async () => {
    try {
      const [ordRes, bulkRes] = await Promise.all([
        getAllOrders(),
        getAllBulkOrders(),
      ]);
      setOrders(ordRes.data?.data || []);
      setBulkOrders(bulkRes.data?.data || []);
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
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      setNewOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    };

    const handleNewBulkOrder = (order) => {
      setBulkOrders((prev) => [order, ...prev]);
      setNewOrderIds((prev) => new Set([...prev, order._id]));
    };

    const handleBulkOrderUpdated = (order) => {
      setBulkOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      setNewOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdated);
    socket.on('new_bulk_order', handleNewBulkOrder);
    socket.on('bulk_order_updated', handleBulkOrderUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated', handleOrderUpdated);
      socket.off('new_bulk_order', handleNewBulkOrder);
      socket.off('bulk_order_updated', handleBulkOrderUpdated);
    };
  }, [socket]);

  const combined = useMemo(() => {
    const items = [
      ...orders.map((o) => ({ ...o, type: 'order' })),
      ...bulkOrders.map((o) => ({ ...o, type: 'bulk' })),
    ];
    const sorted = [...items].sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      if (sortBy === 'newest') return tB - tA;
      if (sortBy === 'oldest') return tA - tB;
      if (sortBy === 'status') {
        const statusOrder = { pending: 0, accepted: 1, preparing: 2, completed: 3, rejected: 4 };
        return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
      }
      return tB - tA;
    });
    return sorted;
  }, [orders, bulkOrders, sortBy]);

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      const { data } = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleBulkOrderStatusChange = async (orderId, status) => {
    try {
      const { data } = await updateBulkOrderStatus(orderId, status);
      setBulkOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="All Orders" />
      <div className="min-h-screen bg-slate-50/80 p-4 sm:p-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <UnifiedOrdersTable
          orders={combined}
          loading={loading}
          onOrderStatusChange={handleOrderStatusChange}
          onBulkOrderStatusChange={handleBulkOrderStatusChange}
          showActions
          newOrderIds={newOrderIds}
          highlightOrderId={highlightOrderId}
        />
      </div>
    </AdminLayout>
  );
}
