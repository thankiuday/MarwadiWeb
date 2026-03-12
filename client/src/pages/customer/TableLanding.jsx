import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function TableLanding() {
  const { tableNumber } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const num = parseInt(tableNumber);
    if (num >= 1 && num <= 3) {
      localStorage.setItem('tableNumber', num);
    }

    if (loading) return;

    if (user) {
      navigate('/menu', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [tableNumber, user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600 font-medium">Setting up Table {tableNumber}...</p>
      </div>
    </div>
  );
}
