import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSubscriptions } from '../../api/subscriptions';
import { createUserSubscription } from '../../api/userSubscriptions';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import Footer from '../../components/layout/Footer';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
  sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
};

function formatMealItems(items) {
  if (!items || !Array.isArray(items)) return '';
  return items.map((i) => (typeof i === 'object' ? i.name : '')).filter(Boolean).join(', ');
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [subscribingId, setSubscribingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getSubscriptions();
        setPlans((data.data || []).filter((p) => p.active));
      } catch {
        toast.error('Failed to load plans');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubscribe = async (planId) => {
    setSubscribingId(planId);
    try {
      await createUserSubscription(planId);
      toast.success('Subscribed successfully!');
      navigate('/subscriptions/my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscribe failed');
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Subscription Plans</h2>
          <Link to="/subscriptions/my" className="text-sm text-orange-500 font-medium hover:underline">
            My Subscriptions
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 sm:py-20 animate-fade-in">
            <span className="text-5xl sm:text-6xl block mb-3">📋</span>
            <p className="text-gray-500 text-base sm:text-lg mb-4">No subscription plans available</p>
            <Link
              to="/menu"
              className="px-6 py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 active:scale-[0.98] transition-all inline-block touch-manipulation"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {plans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1">
                  ₹{plan.price}
                  <span className="text-sm font-normal text-gray-400">/{plan.duration}</span>
                </p>
                <div className="mt-4 space-y-2">
                  {DAYS.map((day) => {
                    const d = plan.weeklySchedule?.[day];
                    if (!d) return null;
                    const lunch = formatMealItems(d.lunch);
                    const dinner = formatMealItems(d.dinner);
                    if (!lunch && !dinner) return null;
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
                <button
                  onClick={() => handleSubscribe(plan._id)}
                  disabled={subscribingId === plan._id}
                  className="mt-4 w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all"
                >
                  {subscribingId === plan._id ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
