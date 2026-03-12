import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function TableLanding() {
  const { tableNumber } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { logout } = useAuth();

  useEffect(() => {
    const num = parseInt(tableNumber);
    const validTable = num >= 1 && num <= 3;

    if (loading) return;

    if (user?.role === 'customer') {
      if (validTable) localStorage.setItem('tableNumber', num);
      navigate('/menu', { replace: true });
    } else {
      if (user) {
        logout();
        if (validTable) localStorage.setItem('tableNumber', num);
      } else if (validTable) {
        localStorage.setItem('tableNumber', num);
      }
      navigate('/login', { replace: true });
    }
  }, [tableNumber, user, loading, navigate, logout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600 font-medium">Setting up Table {tableNumber}...</p>
      </div>
    </div>
  );
}
