import { useNavigate } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlineEnvelope, HiOutlinePhone, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import Footer from '../../components/layout/Footer';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 md:pb-0">
      <CustomerNavbar onCartOpen={() => {}} />
      <BottomNav />

      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center gap-4 px-6 sm:px-8 py-4">
              <HiOutlineUserCircle className="w-6 h-6 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 sm:px-8 py-4">
              <HiOutlineEnvelope className="w-6 h-6 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-4 px-6 sm:px-8 py-4">
                <HiOutlinePhone className="w-6 h-6 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}
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
      <Footer />
    </div>
  );
}
