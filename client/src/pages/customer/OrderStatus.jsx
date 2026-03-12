import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyOrders } from '../../api/orders';
import { useSocket } from '../../hooks/useSocket';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import Footer from '../../components/layout/Footer';

const STEPS = ['pending', 'accepted', 'preparing', 'completed'];

export default function OrderStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getMyOrders();
        const found = data.data.find((o) => o._id === id);
        setOrder(found || null);
      } catch {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ orderId, status }) => {
      if (orderId === id) {
        setOrder((prev) => (prev ? { ...prev, status } : prev));
        toast.info(`Order status: ${status}`);
      }
    };

    socket.on('order_status_updated', handler);
    return () => socket.off('order_status_updated', handler);
  }, [socket, id]);

  const stepIndex = order ? STEPS.indexOf(order.status) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20 md:pb-0">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <BottomNav />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
        <CustomerNavbar onCartOpen={() => navigate('/cart')} />
        <BottomNav />
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 text-center">
          <p className="text-gray-500 text-lg">Order not found</p>
          <Link to="/orders" className="text-orange-500 font-medium mt-4 inline-block hover:underline">
            View all orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => navigate('/cart')} />
      <BottomNav />
      <div className="max-w-2xl mx-auto px-4 sm:px-5 py-4 sm:py-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Order #{order._id.slice(-6).toUpperCase()}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Table {order.tableNumber} &bull; {new Date(order.createdAt).toLocaleString()}
          </p>

          {order.status !== 'rejected' && (
            <div className="flex items-center justify-between mb-6 sm:mb-8 px-2 sm:px-4">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                        i <= stepIndex
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 capitalize truncate max-w-full">{step}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 rounded-full transition-all ${
                        i < stepIndex ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {order.status === 'rejected' && (
            <div className="text-center py-3 sm:py-4 bg-red-50 rounded-xl mb-4 sm:mb-6">
              <p className="text-red-600 font-medium text-sm sm:text-base">This order was rejected</p>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 gap-2">
                <span className="text-gray-700 text-sm sm:text-base truncate">
                  {item.name} <span className="text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-medium text-sm sm:text-base flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 text-base sm:text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-600">₹{order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link
          to="/orders"
          className="text-orange-500 font-medium hover:underline text-sm touch-manipulation inline-block"
        >
          &larr; View all orders
        </Link>
      </div>
      <Footer />
    </div>
  );
}
