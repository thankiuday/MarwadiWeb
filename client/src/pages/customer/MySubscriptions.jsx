import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserSubscriptions } from '../../api/userSubscriptions';
import { getSubscriptions } from '../../api/subscriptions';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import Footer from '../../components/layout/Footer';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
  sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
};

function formatMealItems(items) {
  if (!items || !Array.isArray(items)) return '';
  return items.map((i) => (typeof i === 'object' ? i.name : '')).filter(Boolean).join(', ');
}

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

function getMealStatus(sub, dateKey, meal) {
  const log = sub.mealLog;
  if (!log) return false;
  const dayLog = typeof log.get === 'function' ? log.get(dateKey) : log[dateKey];
  return dayLog?.[meal] ?? false;
}

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [expandedMenuId, setExpandedMenuId] = useState(null);
  const [expandedMealsId, setExpandedMealsId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subsRes, plansRes] = await Promise.all([
          getUserSubscriptions(),
          getSubscriptions(),
        ]);
        const subs = subsRes.data?.data || [];
        const plansMap = {};
        (plansRes.data?.data || []).forEach((p) => { plansMap[p._id] = p; });
        // Merge plan details (with populated weeklySchedule) into each subscription
        const merged = subs.map((s) => ({
          ...s,
          plan: s.plan?._id ? (plansMap[s.plan._id] || s.plan) : s.plan,
        }));
        setSubscriptions(merged);
      } catch {
        toast.error('Failed to load subscriptions');
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Subscriptions</h2>
          <Link to="/subscriptions" className="text-sm text-orange-500 font-medium hover:underline">
            View Plans
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-16 sm:py-20 animate-fade-in">
            <span className="text-5xl sm:text-6xl block mb-3">📋</span>
            <p className="text-gray-500 text-base sm:text-lg mb-4">No subscriptions yet</p>
            <Link
              to="/subscriptions"
              className="px-6 py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 active:scale-[0.98] transition-all inline-block touch-manipulation"
            >
              View Plans
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {subscriptions.map((sub) => {
              const isEnded = new Date(sub.endDate) < new Date();
              const displayStatus = isEnded ? 'expired' : (sub.status || 'active');
              return (
              <div key={sub._id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{sub.plan?.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    displayStatus === 'active' ? 'bg-green-100 text-green-700' :
                    displayStatus === 'expired' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'
                  }`}>
                    {displayStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                </p>
                <p className="text-base font-bold text-orange-600 mt-1">
                  ₹{sub.plan?.price}/{sub.plan?.duration}
                </p>

                {/* Weekly menu - expandable */}
                <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedMenuId(expandedMenuId === sub._id ? null : sub._id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">Weekly menu</span>
                    {expandedMenuId === sub._id ? <HiChevronUp className="w-5 h-5 text-gray-500" /> : <HiChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  {expandedMenuId === sub._id && (
                    <div className="p-4 bg-white space-y-2 border-t border-gray-100">
                      {DAYS.map((day) => {
                        const d = sub.plan?.weeklySchedule?.[day];
                        if (!d) return null;
                        const lunch = formatMealItems(d.lunch);
                        const dinner = formatMealItems(d.dinner);
                        if (!lunch && !dinner) return (
                          <div key={day} className="text-sm text-gray-500">
                            <span className="font-medium text-gray-600">{DAY_LABELS[day]}:</span> No items
                          </div>
                        );
                        return (
                          <div key={day} className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">{DAY_LABELS[day]}:</span>{' '}
                            {lunch && <span>Lunch: {lunch}</span>}
                            {lunch && dinner && ' | '}
                            {dinner && <span>Dinner: {dinner}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Meal marking status - expandable */}
                <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedMealsId(expandedMealsId === sub._id ? null : sub._id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">Meal status (marked by admin)</span>
                    {expandedMealsId === sub._id ? <HiChevronUp className="w-5 h-5 text-gray-500" /> : <HiChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  {expandedMealsId === sub._id && (() => {
                    const subscriptionDates = getSubscriptionDates(sub);
                    const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
                    return (
                      <div className="border-t overflow-x-auto bg-white">
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
                                return (
                                  <td key={dateKey} className="py-2 px-2 text-center">
                                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto ${
                                      done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 bg-gray-50'
                                    }`}>
                                      {done && <span className="text-sm">✓</span>}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            <tr className="border-t">
                              <td className="py-2 px-3 text-sm font-medium text-gray-700 sticky left-0 bg-white z-10">Dinner</td>
                              {subscriptionDates.map((d) => {
                                const dateKey = toDateKey(d);
                                const done = getMealStatus(sub, dateKey, 'dinner');
                                return (
                                  <td key={dateKey} className="py-2 px-2 text-center">
                                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto ${
                                      done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 bg-gray-50'
                                    }`}>
                                      {done && <span className="text-sm">✓</span>}
                                    </div>
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
              </div>
            );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
