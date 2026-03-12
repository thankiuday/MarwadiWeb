import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import CustomerRoute from './CustomerRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminLogin from '../pages/auth/AdminLogin';
import TableLanding from '../pages/customer/TableLanding';
import MenuPage from '../pages/customer/MenuPage';
import MenuItemDetail from '../pages/customer/MenuItemDetail';
import CartPage from '../pages/customer/CartPage';
import OrderStatus from '../pages/customer/OrderStatus';
import OrderHistory from '../pages/customer/OrderHistory';
import BulkOrderPage from '../pages/customer/BulkOrderPage';
import BulkOrderStatus from '../pages/customer/BulkOrderStatus';
import NotificationsPage from '../pages/customer/NotificationsPage';
import ProfilePage from '../pages/customer/ProfilePage';
import SubscriptionPlans from '../pages/customer/SubscriptionPlans';
import MySubscriptions from '../pages/customer/MySubscriptions';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminProfile from '../pages/admin/AdminProfile';
import QRCodesPage from '../pages/admin/QRCodesPage';
import SubscriptionSubscribers from '../pages/admin/SubscriptionSubscribers';
import SADashboard from '../pages/superadmin/SADashboard';
import SAMenu from '../pages/superadmin/SAMenu';
import SAAdmins from '../pages/superadmin/SAAdmins';
import SASubscriptions from '../pages/superadmin/SASubscriptions';
import SAOrders from '../pages/superadmin/SAOrders';
import SANotifications from '../pages/superadmin/SANotifications';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/table/:tableNumber" element={<TableLanding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Customer - only customers can access (admins must use customer login for table orders) */}
      <Route path="/menu" element={<CustomerRoute><MenuPage /></CustomerRoute>} />
      <Route path="/menu/:id" element={<CustomerRoute><MenuItemDetail /></CustomerRoute>} />
      <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>} />
      <Route path="/order/:id" element={<CustomerRoute><OrderStatus /></CustomerRoute>} />
      <Route path="/orders" element={<CustomerRoute><OrderHistory /></CustomerRoute>} />
      <Route path="/bulk-order" element={<CustomerRoute><BulkOrderPage /></CustomerRoute>} />
      <Route path="/bulk-order/:id" element={<CustomerRoute><BulkOrderStatus /></CustomerRoute>} />
      <Route path="/notifications" element={<CustomerRoute><NotificationsPage /></CustomerRoute>} />
      <Route path="/subscriptions/my" element={<CustomerRoute><MySubscriptions /></CustomerRoute>} />
      <Route path="/subscriptions" element={<CustomerRoute><SubscriptionPlans /></CustomerRoute>} />
      <Route path="/profile" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />

      {/* Admin */}
      <Route
        path="/admin/orders"
        element={<RoleRoute roles={['admin', 'superadmin']}><AdminOrders /></RoleRoute>}
      />
      <Route
        path="/admin/subscription-subscribers"
        element={<RoleRoute roles={['admin', 'superadmin']}><SubscriptionSubscribers /></RoleRoute>}
      />
      <Route
        path="/admin/profile"
        element={<RoleRoute roles={['admin']}><AdminProfile /></RoleRoute>}
      />
      <Route
        path="/admin/qr-codes"
        element={<RoleRoute roles={['admin', 'superadmin']}><QRCodesPage /></RoleRoute>}
      />
      <Route
        path="/superadmin/subscription-subscribers"
        element={<RoleRoute roles={['superadmin']}><SubscriptionSubscribers /></RoleRoute>}
      />

      {/* Super Admin */}
      <Route
        path="/superadmin/dashboard"
        element={<RoleRoute roles={['superadmin']}><SADashboard /></RoleRoute>}
      />
      <Route
        path="/superadmin/menu"
        element={<RoleRoute roles={['superadmin']}><SAMenu /></RoleRoute>}
      />
      <Route
        path="/superadmin/admins"
        element={<RoleRoute roles={['superadmin']}><SAAdmins /></RoleRoute>}
      />
      <Route
        path="/superadmin/subscriptions"
        element={<RoleRoute roles={['superadmin']}><SASubscriptions /></RoleRoute>}
      />
      <Route
        path="/superadmin/orders"
        element={<RoleRoute roles={['superadmin']}><SAOrders /></RoleRoute>}
      />
      <Route
        path="/superadmin/notifications"
        element={<RoleRoute roles={['superadmin']}><SANotifications /></RoleRoute>}
      />
      <Route
        path="/superadmin/profile"
        element={<RoleRoute roles={['superadmin']}><AdminProfile /></RoleRoute>}
      />
      <Route
        path="/superadmin/qr-codes"
        element={<RoleRoute roles={['superadmin']}><QRCodesPage /></RoleRoute>}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
