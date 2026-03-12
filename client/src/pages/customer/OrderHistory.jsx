import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../api/orders';
import { getMyBulkOrders } from '../../api/bulkOrders';
import { useSocket } from '../../hooks/useSocket';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import Footer from '../../components/layout/Footer';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'status', label: 'By status' },
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { socket } = useSocket();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ordRes, bulkRes] = await Promise.all([
          getMyOrders(),
          getMyBulkOrders(),
        ]);
        setOrders(ordRes.data?.data || []);
        setBulkOrders(bulkRes.data?.data || []);
      } catch {
        setOrders([]);
        setBulkOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    };
    socket.on('order_status_updated', handler);
    return () => socket.off('order_status_updated', handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ orderId, status, order }) => {
      setBulkOrders((prev) => {
        const existing = prev.find((o) => o._id === orderId);
        if (existing) {
          return prev.map((o) =>
            o._id === orderId ? { ...o, status, ...(order || {}) } : o
          );
        }
        return prev;
      });
    };
    socket.on('bulk_order_status_updated', handler);
    return () => socket.off('bulk_order_status_updated', handler);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Orders</h2>
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

        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 sm:p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : combined.length === 0 ? (
          <div className="text-center py-16 sm:py-20 animate-fade-in">
            <span className="text-5xl sm:text-6xl block mb-3">📋</span>
            <p className="text-gray-500 text-base sm:text-lg mb-4">No orders yet</p>
            <Link
              to="/menu"
              className="px-6 py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 active:scale-[0.98] transition-all inline-block touch-manipulation"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            {combined.map((item) => (
              <Link
                key={`${item.type}-${item._id}`}
                to={item.type === 'bulk' ? `/bulk-order/${item._id}` : `/order/${item._id}`}
                className="block bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 font-mono text-sm sm:text-base">
                      #{item._id.slice(-6).toUpperCase()}
                    </span>
                    {item.type === 'bulk' && (
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-semibold">
                        Bulk
                      </span>
                    )}
                  </div>
                  <OrderStatusBadge status={item.status} />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  {item.type === 'order'
                    ? `Table ${item.tableNumber}`
                    : `Pickup: ${new Date(item.pickupDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}`}{' '}
                  &bull;{' '}
                  {new Date(item.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {item.items?.map((i) => i.name).join(', ')}
                </p>
                <p className="text-base sm:text-lg font-bold text-orange-600 mt-2">
                  ₹{item.totalPrice?.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
