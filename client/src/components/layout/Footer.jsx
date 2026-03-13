import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  return (
    <footer className="block w-full bg-gray-900 text-gray-400 py-6 sm:py-8 md:py-10 mt-auto shrink-0 pb-20 md:pb-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base sm:text-lg">
              <span className="text-orange-500">King's</span> Restaurant
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link to="/menu" className="hover:text-white transition-colors">Menu</Link>
            <Link to="/orders" className="hover:text-white transition-colors">Orders</Link>
            <Link to="/bulk-order" className="hover:text-white transition-colors">Bulk Order</Link>
            <Link to="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-800 text-center text-xs sm:text-sm space-y-1">
          {isProfilePage && (
            <p className="px-2">
              <a
                href="mailto:gowind.tech@gmail.com"
                className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-slate-400 hover:text-orange-500 transition-colors"
              >
                <img
                  src="/images/gowind-logo.png"
                  alt="Go Wind"
                  className="h-4 sm:h-5 md:h-6 w-auto max-w-[60px] sm:max-w-[80px] md:max-w-[100px] object-contain shrink-0"
                />
                <span className="break-words">Go Wind - Powering Your Digital Growth</span>
              </a>
            </p>
          )}
          <p>© {new Date().getFullYear()} King's Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
