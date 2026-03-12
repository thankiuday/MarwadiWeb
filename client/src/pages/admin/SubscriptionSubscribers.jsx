import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getApiError } from '../../utils/getApiError';
import { getUserSubscriptions } from '../../api/userSubscriptions';
import { markMealDone } from '../../api/userSubscriptions';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2';

function getSubscriptionDates(sub) {
  const start = new Date(sub.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(sub.endDate);
  end.setHours(23, 59, 59, 999);
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function toDateKey(d) {
  return d.toISOString().split('T')[0];
}

export default function SubscriptionSubscribers() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const { data } = await getUserSubscriptions();
      setSubscriptions(data.data || []);
    } catch {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const getMealStatus = (sub, dateKey, meal) => {
    const log = sub.mealLog;
    if (!log) return false;
    const dayLog = typeof log.get === 'function' ? log.get(dateKey) : log[dateKey];
    return dayLog?.[meal] ?? false;
  };

  const handleToggleMeal = async (subId, dateKey, meal, current) => {
    const key = `${subId}-${dateKey}-${meal}`;
    setUpdating(key);
    try {
      await markMealDone(subId, dateKey, meal, !current);
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s._id !== subId) return s;
          const existing = s.mealLog;
          const log = typeof existing?.get === 'function' ? new Map(existing) : new Map(Object.entries(existing || {}));
          const dayLog = log.get(dateKey) || { lunch: false, dinner: false };
          dayLog[meal] = !current;
          log.set(dateKey, dayLog);
          return { ...s, mealLog: Object.fromEntries(log) };
        })
      );
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <AdminLayout>
      <AdminHeader title="Subscription Subscribers" />
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500">No subscribers yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === sub._id ? null : sub._id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <p className="font-bold text-gray-900">{sub.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{sub.plan?.name} • {sub.status}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(sub.startDate).toLocaleDateString()} – {new Date(sub.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {expandedId === sub._id ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                </button>
                {expandedId === sub._id && (() => {
                  const subscriptionDates = getSubscriptionDates(sub);
                  return (
                    <div className="border-t overflow-x-auto">
                      <table className="w-full min-w-[400px]">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">Meal</th>
                            {subscriptionDates.map((d) => (
                              <th key={d.toISOString()} className="py-2 px-2 text-center text-xs font-medium text-gray-500 whitespace-nowrap">
                                {formatDate(d)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="py-2 px-3 text-sm font-medium text-gray-700 sticky left-0 bg-white z-10">Lunch</td>
                            {subscriptionDates.map((d) => {
                              const dateKey = toDateKey(d);
                              const done = getMealStatus(sub, dateKey, 'lunch');
                              const key = `${sub._id}-${dateKey}-lunch`;
                              return (
                                <td key={dateKey} className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMeal(sub._id, dateKey, 'lunch', done)}
                                    disabled={updating === key}
                                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-colors ${
                                      done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 hover:border-orange-400'
                                    }`}
                                  >
                                    {done && <span className="text-sm">✓</span>}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                          <tr className="border-t">
                            <td className="py-2 px-3 text-sm font-medium text-gray-700 sticky left-0 bg-white z-10">Dinner</td>
                            {subscriptionDates.map((d) => {
                              const dateKey = toDateKey(d);
                              const done = getMealStatus(sub, dateKey, 'dinner');
                              const key = `${sub._id}-${dateKey}-dinner`;
                              return (
                                <td key={dateKey} className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMeal(sub._id, dateKey, 'dinner', done)}
                                    disabled={updating === key}
                                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-colors ${
                                      done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 hover:border-orange-400'
                                    }`}
                                  >
                                    {done && <span className="text-sm">✓</span>}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
