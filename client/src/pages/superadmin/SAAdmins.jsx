import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAdmins, createAdmin, deleteAdmin } from '../../api/admin';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import { HiPlus, HiTrash, HiXMark } from 'react-icons/hi2';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import { getApiError } from '../../utils/getApiError';

export default function SAAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await getAdmins();
      setAdmins(data.data);
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    if (nameErr || emailErr || passwordErr) {
      setErrors({ name: nameErr, email: emailErr, password: passwordErr });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await createAdmin(form);
      toast.success('Admin created');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'admin' });
      fetchAdmins();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin?')) return;
    try {
      await deleteAdmin(id);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast.success('Admin deleted');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="Admin Management" />
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500">{admins.length} admins</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all"
          >
            <HiPlus className="w-5 h-5" /> Add Admin
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No admins found</td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{admin.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        admin.role === 'superadmin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {admin.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDelete(admin._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <HiTrash className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowModal(false); setErrors({}); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold">Create Admin</h3>
              <button onClick={() => { setShowModal(false); setErrors({}); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Admin full name"
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="admin@restaurant.com"
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.password ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
                  }`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="admin">Admin (Cook)</option>
                  <option value="superadmin">Super Admin (Owner)</option>
                </select>
              </div>
              <button
                type="submit" disabled={saving}
                className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all"
              >
                {saving ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
