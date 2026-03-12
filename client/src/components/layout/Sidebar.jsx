import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentList,
  HiOutlineQueueList,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineUserGroup,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBell,
  HiOutlineUserCircle,
  HiXMark,
  HiBell,
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import { useAdminNotifications } from '../../context/AdminNotificationsContext';
import { useAdminNavbar } from '../../context/AdminNavbarContext';

const adminLinks = [
  { to: '/admin/orders', icon: HiOutlineClipboardDocumentList, label: 'Orders' },
  { to: '/admin/subscription-subscribers', icon: HiOutlineUserGroup, label: 'Subscribers' },
  { to: '/admin/profile', icon: HiOutlineUserCircle, label: 'Profile' },
];

const superAdminLinks = [
  { to: '/superadmin/dashboard', icon: HiOutlineChartBarSquare, label: 'Dashboard' },
  { to: '/superadmin/orders', icon: HiOutlineClipboardDocumentList, label: 'Orders' },
  { to: '/superadmin/menu', icon: HiOutlineQueueList, label: 'Menu' },
  { to: '/superadmin/notifications', icon: HiOutlineBell, label: 'Notifications' },
  { to: '/superadmin/subscriptions', icon: HiOutlineCreditCard, label: 'Subscriptions' },
  { to: '/superadmin/subscription-subscribers', icon: HiOutlineUserGroup, label: 'Subscribers' },
  { to: '/superadmin/admins', icon: HiOutlineUsers, label: 'Admins' },
  { to: '/superadmin/profile', icon: HiOutlineUserCircle, label: 'Profile' },
];

export default function Sidebar() {
  const { mobileOpen, setMobileOpen } = useAdminNavbar();
  const [showNotifs, setShowNotifs] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useAdminNotifications();
  const navigate = useNavigate();

  const links = user?.role === 'superadmin' ? superAdminLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const closeMobile = () => setMobileOpen(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50 transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="relative flex items-center justify-between p-4 lg:p-6 border-b border-gray-800">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-orange-400">King's</span> Restaurant
            </h1>
            <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role} Panel</p>
          </div>
          <div className="flex items-center gap-1">
            <div ref={notifRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifs((prev) => !prev);
                }}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-800 transition-colors"
              >
                <HiBell className="w-5 h-5 text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={closeMobile}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-800"
            >
              <HiXMark className="w-6 h-6" />
            </button>
          </div>
          {showNotifs && (
            <div className="absolute left-0 right-0 top-full mt-2 w-full lg:left-auto lg:right-0 lg:w-80 xl:w-96 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 max-h-[70vh] overflow-y-auto z-[100]">
                  <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Notifications</p>
                    {notifications.length > 0 && (
                      <NavLink
                        to={user?.role === 'superadmin' ? '/superadmin/notifications' : '/admin/orders'}
                        onClick={() => { setShowNotifs(false); closeMobile(); }}
                        className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                      >
                        View all
                      </NavLink>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500 text-sm">No notifications</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-700/50 border-b border-gray-700/50 last:border-0">
                        <p className="text-sm font-medium text-gray-200">{n.message}</p>
                        {n.itemsSummary && (
                          <p className="text-xs text-gray-400 mt-1 truncate" title={n.itemsSummary}>
                            {n.itemsSummary}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {n.totalPrice != null && (
                            <span className="text-xs font-semibold text-orange-400">₹{Number(n.totalPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <NavLink
            to={user?.role === 'superadmin' ? '/superadmin/profile' : '/admin/profile'}
            onClick={closeMobile}
            className="flex items-center gap-3 px-3 mb-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
