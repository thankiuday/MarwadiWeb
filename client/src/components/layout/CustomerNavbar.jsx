import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineShoppingBag, HiOutlineClipboardDocumentList, HiOutlineCube, HiOutlineCreditCard, HiOutlineArrowRightOnRectangle, HiOutlineBell, HiOutlineUserCircle } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useNotifications } from '../../hooks/useNotifications';

export default function CustomerNavbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOrdersActive = pathname === '/orders' || pathname.startsWith('/order/');
  const isBulkOrderActive = pathname === '/bulk-order' || pathname.startsWith('/bulk-order/');
  const isSubscriptionsActive = pathname === '/subscriptions' || pathname.startsWith('/subscriptions/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = (isActive) =>
    `hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
      isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link to="/menu" className="text-lg sm:text-xl font-bold text-gray-900 touch-manipulation shrink-0">
          <span className="text-orange-500">King's</span> Restaurant
        </Link>

        {/* Desktop: Nav bar - Menu, Cart, Orders, Bulk Order, Subscriptions, Notifications, Profile */}
        {user?.role === 'customer' && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/menu" className={({ isActive }) => navLinkClass(isActive)}>
              <HiOutlineHome className="w-5 h-5" />
              Menu
            </NavLink>
            <button
              onClick={onCartOpen}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              Cart
              {totalItems > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
            <NavLink to="/orders" className={() => navLinkClass(isOrdersActive)}>
              <HiOutlineClipboardDocumentList className="w-5 h-5" />
              Orders
            </NavLink>
            <NavLink to="/bulk-order" className={() => navLinkClass(isBulkOrderActive)}>
              <HiOutlineCube className="w-5 h-5" />
              Bulk Order
            </NavLink>
            <NavLink to="/subscriptions" className={() => navLinkClass(isSubscriptionsActive)}>
              <HiOutlineCreditCard className="w-5 h-5" />
              Subscriptions
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => navLinkClass(isActive)}>
              <span className="relative">
                <HiOutlineBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              Notifications
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => navLinkClass(isActive)}>
              <HiOutlineUserCircle className="w-5 h-5" />
              Profile
            </NavLink>
          </nav>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          {user?.role === 'customer' && (
            <>
              <Link
                to="/profile"
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              >
                <HiOutlineUserCircle className="w-5 h-5 text-gray-600" />
              </Link>
              <Link
                to="/notifications"
                className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              >
                <HiOutlineBell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
