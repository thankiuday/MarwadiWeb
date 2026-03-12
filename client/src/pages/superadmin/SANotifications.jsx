import { Link } from 'react-router-dom';
import { useAdminNotifications } from '../../context/AdminNotificationsContext';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';

export default function SANotifications() {
  const { notifications, clearNotifications, markAsRead } = useAdminNotifications();

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLink = (n) => {
    if (n.type === 'order' || n.type === 'bulk') return '/superadmin/orders';
    return null;
  };

  return (
    <AdminLayout>
      <AdminHeader title="Notifications" />
      <div className="min-h-screen bg-slate-50/80 pb-8 sm:pb-10">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-700">All Notifications</h2>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-sm text-orange-500 font-medium hover:text-orange-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <span className="text-5xl block mb-4">🔔</span>
              <p className="text-slate-600 font-medium">No notifications yet</p>
              <p className="text-slate-400 text-sm mt-1">New orders and subscriptions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const link = getLink(n);
                const content = (
                  <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">
                        {n.type === 'order' && '🍽️'}
                        {n.type === 'bulk' && '📦'}
                        {n.type === 'subscription' && '💳'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{n.message}</p>
                        {n.itemsSummary && (
                          <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{n.itemsSummary}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                          <span className="text-xs text-slate-400">{formatTime(n.time)}</span>
                          {n.totalPrice != null && (
                            <span className="text-sm font-semibold text-orange-600">₹{Number(n.totalPrice).toFixed(2)}</span>
                          )}
                          {n.tableNumber != null && (
                            <span className="text-xs text-slate-500">Table {n.tableNumber}</span>
                          )}
                          {n.customerName && (
                            <span className="text-xs text-slate-500">{n.customerName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );

                if (link) {
                  return (
                    <Link
                      key={n.id}
                      to={link}
                      onClick={() => markAsRead(n.id)}
                      className="block"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={n.id} onClick={() => markAsRead(n.id)} className="cursor-pointer">
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
