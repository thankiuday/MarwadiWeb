import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getApiError } from '../../utils/getApiError';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../../api/subscriptions';
import { getMenuItems } from '../../api/menu';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import { HiPlus, HiPencil, HiTrash, HiXMark, HiChevronDown, HiChevronUp } from 'react-icons/hi2';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

const getEmptySchedule = () =>
  DAYS.reduce((acc, day) => {
    acc[day] = { lunch: [], dinner: [] };
    return acc;
  }, {});

const EMPTY = {
  name: '',
  price: '',
  duration: 'weekly',
  weeklySchedule: getEmptySchedule(),
  active: true,
};

function formatScheduleSummary(plan) {
  const ws = plan.weeklySchedule || {};
  return DAYS.map((day) => {
    const d = ws[day];
    if (!d) return null;
    const lunchNames = (d.lunch || []).map((i) => (typeof i === 'object' ? i.name : '')).filter(Boolean);
    const dinnerNames = (d.dinner || []).map((i) => (typeof i === 'object' ? i.name : '')).filter(Boolean);
    const parts = [];
    if (lunchNames.length) parts.push(`L: ${lunchNames.join(', ')}`);
    if (dinnerNames.length) parts.push(`D: ${dinnerNames.join(', ')}`);
    return parts.length ? `${DAY_LABELS[day].slice(0, 3)}: ${parts.join(' | ')}` : null;
  }).filter(Boolean).join(' • ');
}

export default function SASubscriptions() {
  const [plans, setPlans] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  const fetchPlans = async () => {
    try {
      const { data } = await getSubscriptions();
      setPlans(data.data);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await getMenuItems({ available: 'true' });
      setMenuItems(data.data || []);
    } catch {
      toast.error('Failed to load menu');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (showModal) fetchMenuItems();
  }, [showModal]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY, weeklySchedule: getEmptySchedule() });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditId(plan._id);
    const ws = plan.weeklySchedule || {};
    setForm({
      name: plan.name,
      price: plan.price,
      duration: plan.duration || 'weekly',
      weeklySchedule: DAYS.reduce((acc, day) => {
        const d = ws[day] || {};
        acc[day] = {
          lunch: (d.lunch || []).map((i) => (typeof i === 'object' ? i._id : i)),
          dinner: (d.dinner || []).map((i) => (typeof i === 'object' ? i._id : i)),
        };
        return acc;
      }, {}),
      active: plan.active,
    });
    setShowModal(true);
  };

  const updateDayMeal = (day, meal, itemIds) => {
    setForm((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: { ...prev.weeklySchedule[day], [meal]: itemIds },
      },
    }));
  };

  const toggleItem = (day, meal, itemId) => {
    const current = form.weeklySchedule[day][meal] || [];
    const exists = current.includes(itemId);
    const next = exists ? current.filter((id) => id !== itemId) : [...current, itemId];
    updateDayMeal(day, meal, next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        duration: form.duration,
        weeklySchedule: form.weeklySchedule,
        active: form.active,
      };
      if (editId) {
        await updateSubscription(editId, payload);
        toast.success('Plan updated');
      } else {
        await createSubscription(payload);
        toast.success('Plan created');
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deleteSubscription(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      toast.success('Plan deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="Subscription Plans" />
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500">{plans.length} plans</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all"
          >
            <HiPlus className="w-5 h-5" /> Add Plan
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4 flex gap-1">
                  <button onClick={() => openEdit(plan)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                    <HiPencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(plan._id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50">
                    <HiTrash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ₹{plan.price}
                  <span className="text-sm font-normal text-gray-400">/{plan.duration}</span>
                </p>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${plan.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {plan.active ? 'Active' : 'Inactive'}
                </div>
                <p className="mt-4 text-sm text-gray-600 line-clamp-3">{formatScheduleSummary(plan)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold">{editId ? 'Edit Plan' : 'New Plan'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Weekly Lunch Plan"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Schedule (Lunch & Dinner per day)</label>
                  <div className="space-y-2">
                    {DAYS.map((day) => (
                      <div key={day} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{DAY_LABELS[day]}</span>
                          {expandedDay === day ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                        </button>
                        {expandedDay === day && (
                          <div className="p-4 space-y-4 bg-white">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-2">Lunch</label>
                              <div className="flex flex-wrap gap-2">
                                {menuItems.map((item) => {
                                  const selected = (form.weeklySchedule[day]?.lunch || []).includes(item._id);
                                  return (
                                    <button
                                      key={item._id}
                                      type="button"
                                      onClick={() => toggleItem(day, 'lunch', item._id)}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        selected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }`}
                                    >
                                      {item.name}
                                    </button>
                                  );
                                })}
                                {menuItems.length === 0 && <span className="text-sm text-gray-400">No menu items</span>}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-2">Dinner</label>
                              <div className="flex flex-wrap gap-2">
                                {menuItems.map((item) => {
                                  const selected = (form.weeklySchedule[day]?.dinner || []).includes(item._id);
                                  return (
                                    <button
                                      key={item._id}
                                      type="button"
                                      onClick={() => toggleItem(day, 'dinner', item._id)}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        selected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }`}
                                    >
                                      {item.name}
                                    </button>
                                  );
                                })}
                                {menuItems.length === 0 && <span className="text-sm text-gray-400">No menu items</span>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div className="p-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all"
                >
                  {saving ? 'Saving...' : editId ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
