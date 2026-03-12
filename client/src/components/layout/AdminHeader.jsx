import { HiBars3 } from 'react-icons/hi2';
import { useAdminNavbar } from '../../context/AdminNavbarContext';

export default function AdminHeader({ title }) {
  const { setMobileOpen } = useAdminNavbar();

  return (
    <header className="sticky top-0 z-10 bg-white/98 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 sm:py-4 min-h-[56px] sm:min-h-[64px]">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="lg:hidden shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-gray-900 text-white touch-manipulation active:scale-95 transition-transform"
        >
          <HiBars3 className="w-6 h-6" />
        </button>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate min-w-0 flex-1">
          {title}
        </h1>
      </div>
    </header>
  );
}
