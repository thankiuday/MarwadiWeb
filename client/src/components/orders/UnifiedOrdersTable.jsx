import OrderStatusBadge from './OrderStatusBadge';
import { TableRowSkeleton } from '../ui/SkeletonLoader';

export default function UnifiedOrdersTable({
  orders,
  loading,
  onOrderStatusChange,
  onBulkOrderStatusChange,
  showActions = false,
  newOrderIds = new Set(),
  highlightOrderId = null,
}) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPickupDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const userInfo = (order) => {
    const u = order.userId;
    if (!u) return '-';
    const parts = [u.name, u.email, u.phone].filter(Boolean);
    return parts.join(' • ');
  };

  const itemsSummary = (order) => {
    if (!order.items?.length) return '-';
    return order.items.map((i) => `${i.name} x${i.quantity}`).join(', ');
  };

  const handleStatusChange = (order, status) => {
    if (order.type === 'bulk') {
      onBulkOrderStatusChange?.(order._id, status);
    } else {
      onOrderStatusChange?.(order._id, status);
    }
  };

  return (
    <div className="space-y-4 md:space-y-0">
      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">No orders found</div>
        ) : (
          orders.map((order) => (
            <div
              key={`${order.type}-${order._id}`}
              id={highlightOrderId === order._id ? `order-${order._id}` : undefined}
              className={`bg-white rounded-xl p-4 shadow-sm relative ${
                newOrderIds.has(order._id) || highlightOrderId === order._id ? 'ring-2 ring-orange-400 ring-offset-2' : ''
              }`}
            >
              {newOrderIds.has(order._id) && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" title="New order" />
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-gray-700">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  {order.type === 'bulk' && (
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-semibold">
                      Bulk
                    </span>
                  )}
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-gray-500 mb-1">
                {order.type === 'order'
                  ? `Table ${order.tableNumber}`
                  : `${userInfo(order)} • Pickup: ${formatPickupDate(order.pickupDate)}`}{' '}
                &bull; {formatDate(order.createdAt)}
              </p>
              <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                {itemsSummary(order)}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-600">₹{order.totalPrice?.toFixed(2)}</span>
                {showActions && order.status !== 'completed' && order.status !== 'rejected' && (
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="preparing">Preparing</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Table / User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                {showActions && (
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={showActions ? 8 : 7} />
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 8 : 7} className="px-4 py-12 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={`${order.type}-${order._id}`}
                    id={highlightOrderId === order._id ? `order-${order._id}` : undefined}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      newOrderIds.has(order._id) || highlightOrderId === order._id ? 'bg-orange-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      {order.type === 'bulk' ? (
                        <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-semibold">
                          Bulk
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Table</span>
                      )}
                      {newOrderIds.has(order._id) && (
                        <span className="ml-1.5 inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="New order" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 min-w-[180px] max-w-[280px]">
                      {order.type === 'order' ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold text-sm">
                          {order.tableNumber}
                        </span>
                      ) : (
                        <span className="block break-words" title={userInfo(order)}>
                          {userInfo(order)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 min-w-[150px] max-w-[250px]">
                      <span className="block break-words" title={itemsSummary(order)}>
                        {itemsSummary(order)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ₹{order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    {showActions && (
                      <td className="px-4 py-3">
                        {order.status !== 'completed' && order.status !== 'rejected' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="preparing">Preparing</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
