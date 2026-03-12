import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import Footer from '../../components/layout/Footer';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => navigate('/cart')} />
      <BottomNav />

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-orange-500 font-medium hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 sm:py-20 animate-fade-in">
            <span className="text-5xl sm:text-6xl block mb-3">🔔</span>
            <p className="text-gray-500 text-base sm:text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">Order status updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            {notifications.map((n) => (
              <Link
                key={n.id}
                to={n.orderId ? `/order/${n.orderId}` : '#'}
                onClick={() => markAsRead(n.id)}
                className={`block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
                  !n.read ? 'border-l-4 border-orange-500' : ''
                }`}
              >
                <p className="text-gray-900 font-medium">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(n.time)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
