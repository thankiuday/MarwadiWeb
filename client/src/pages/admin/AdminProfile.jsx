import { useNavigate } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlineEnvelope, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!user) return null;

  const roleLabel = user.role === 'superadmin' ? 'Super Admin' : 'Admin';

  return (
    <AdminLayout>
      <AdminHeader title="Profile" />
      <div className="min-h-screen bg-slate-50/80 pb-8 sm:pb-10">
        <div className="p-4 sm:p-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-800 to-gray-900 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user.name}</h3>
                  <p className="text-sm text-orange-400 font-medium">{roleLabel}</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="flex items-center gap-4 px-6 sm:px-8 py-4">
                <HiOutlineUserCircle className="w-6 h-6 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Name</p>
                  <p className="font-medium text-slate-900">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 sm:px-8 py-4">
                <HiOutlineEnvelope className="w-6 h-6 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="font-medium text-slate-900">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:px-8 pb-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all touch-manipulation"
              >
                <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
