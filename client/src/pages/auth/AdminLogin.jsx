import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginAdmin } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import { getApiError } from '../../utils/getApiError';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await loginAdmin(form);
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      if (data.user.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/admin/orders');
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            <span className="text-orange-400">King's</span> Restaurant
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl p-5 sm:p-8 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.email ? 'bg-red-900/50 border-red-500' : 'bg-gray-700 border-gray-600'
              }`}
              placeholder="admin@restaurant.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-base text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.password ? 'bg-red-900/50 border-red-500' : 'bg-gray-700 border-gray-600'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-3 bg-orange-500 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-orange-600 disabled:opacity-50 active:scale-[0.98] transition-all touch-manipulation"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
