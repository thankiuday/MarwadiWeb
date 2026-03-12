import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="hidden md:block w-full bg-gray-900 text-gray-400 py-8 sm:py-10 mt-auto shrink-0">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">
              <span className="text-orange-500">King's</span> Restaurant
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/menu" className="hover:text-white transition-colors">Menu</Link>
            <Link to="/orders" className="hover:text-white transition-colors">Orders</Link>
            <Link to="/bulk-order" className="hover:text-white transition-colors">Bulk Order</Link>
            <Link to="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-xs sm:text-sm">
          © {new Date().getFullYear()} King's Restaurant. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
