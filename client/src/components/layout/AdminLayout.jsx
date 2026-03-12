import Sidebar from './Sidebar';
import AdminFooter from './AdminFooter';
import { AdminNavbarProvider } from '../../context/AdminNavbarContext';

export default function AdminLayout({ children }) {
  return (
    <AdminNavbarProvider>
      <div className="min-h-screen bg-slate-50/80 flex flex-col">
        <Sidebar />
        <main className="lg:ml-64 flex-1 flex flex-col min-h-0 overflow-x-hidden">
        <div className="flex-1 min-h-0 overflow-x-hidden">
          {children}
        </div>
        <AdminFooter />
      </main>
    </div>
    </AdminNavbarProvider>
  );
}
