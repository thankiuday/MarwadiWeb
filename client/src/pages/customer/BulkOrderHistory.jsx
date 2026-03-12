import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBulkOrders } from '../../api/bulkOrders';
import { useSocket } from '../../hooks/useSocket';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import Footer from '../../components/layout/Footer';

export default function BulkOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyBulkOrders();
        setOrders(data.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ orderId, status, order }) => {
      setOrders((prev) => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">
          Bulk Orders
        </h2>

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
        ) : orders.length === 0 ? (
          <div className="text-center py-16 sm:py-20 animate-fade-in">
            <span className="text-5xl sm:text-6xl block mb-3">📦</span>
            <p className="text-gray-500 text-base sm:text-lg mb-4">No bulk orders yet</p>
            <Link
              to="/bulk-order"
              className="px-6 py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 active:scale-[0.98] transition-all inline-block touch-manipulation"
            >
              Place Bulk Order
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 animate-fade-in">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/bulk-order/${order._id}`}
                className="block bg-white rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="font-bold text-gray-900 font-mono text-sm sm:text-base">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Pickup: {new Date(order.pickupDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  &bull;{' '}
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {order.items?.map((i) => i.name).join(', ')}
                </p>
                <p className="text-base sm:text-lg font-bold text-orange-600 mt-2">
                  ₹{order.totalPrice?.toFixed(2)}
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
