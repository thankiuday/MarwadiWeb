import { NavLink, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineShoppingBag, HiOutlineClipboardDocumentList, HiOutlineCube, HiOutlineCreditCard } from 'react-icons/hi2';
import { useCart } from '../../hooks/useCart';

export default function BottomNav() {
  const { totalItems } = useCart();
  const { pathname } = useLocation();

  const navItems = [
    { to: '/menu', icon: HiOutlineHome, label: 'Menu', match: (p) => p === '/menu' },
    { to: '/cart', icon: HiOutlineShoppingBag, label: 'Cart', badge: totalItems, match: (p) => p === '/cart' },
    { to: '/orders', icon: HiOutlineClipboardDocumentList, label: 'Orders', match: (p) => p === '/orders' || p.startsWith('/order/') },
    { to: '/bulk-order', icon: HiOutlineCube, label: 'Bulk', match: (p) => p === '/bulk-order' || p.startsWith('/bulk-order/') },
    { to: '/subscriptions', icon: HiOutlineCreditCard, label: 'Subs', match: (p) => p === '/subscriptions' || p.startsWith('/subscriptions/') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label, badge, match }) => {
          const isActive = match ? match(pathname) : pathname === to;
          return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors touch-manipulation ${
              isActive ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <span className="relative">
              <Icon className="w-6 h-6 mx-auto" />
              {typeof badge === 'number' && badge > 0 && (
                <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        );
        })}
      </div>
    </nav>
  );
}
