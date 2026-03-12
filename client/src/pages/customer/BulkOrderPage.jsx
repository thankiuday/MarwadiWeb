import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApiError } from '../../utils/getApiError';
import { getMenuItems } from '../../api/menu';
import { placeBulkOrder } from '../../api/bulkOrders';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import Footer from '../../components/layout/Footer';

export default function BulkOrderPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [quantities, setQuantities] = useState({});
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMenuItems({ available: 'true' });
        setItems(data.data || []);
      } catch {
        toast.error('Failed to load menu');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleQuantityChange = (itemId, value) => {
    const cleaned = String(value).replace(/^0+/, '') || '0';
    const num = Math.max(0, parseInt(cleaned, 10) || 0);
    setQuantities((prev) => ({ ...prev, [itemId]: num }));
  };

  const orderItems = items
    .filter((i) => (quantities[i._id] || 0) > 0)
    .map((i) => ({
      menuItem: i._id,
      name: i.name,
      quantity: quantities[i._id],
      price: i.price,
    }));

  const totalPrice = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pickupDate) errs.pickupDate = 'Please select a pickup date';
    if (orderItems.length === 0) errs.items = 'Please add at least one item to your order';
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the errors below');
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const { data } = await placeBulkOrder({
        pickupDate,
        items: orderItems,
        note: note.trim() || undefined,
      });
      toast.success('Bulk order placed successfully');
      navigate(`/bulk-order/${data.data._id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bulk Order</h2>
          <Link
            to="/orders"
            className="text-sm text-orange-500 font-medium hover:underline"
          >
            My Orders
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Date
            </label>
            <input
              type="date"
              id="pickup-date"
              value={pickupDate}
              onChange={(e) => {
                setPickupDate(e.target.value);
                if (errors.pickupDate) setErrors((prev) => ({ ...prev, pickupDate: null }));
              }}
              min={today}
              aria-label="Select pickup date"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 [color-scheme:light] ${
                errors.pickupDate ? 'border-red-500 bg-red-50/50' : 'border-gray-200'
              }`}
            />
            {errors.pickupDate && <p className="mt-1 text-sm text-red-600">{errors.pickupDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Items
            </label>
            {errors.items && <p className="mb-2 text-sm text-red-600">{errors.items}</p>}
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-gray-500 py-4">No items available</p>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-orange-600 font-semibold">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={quantities[item._id] || 0}
                        onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                        placeholder="0"
                        className="w-16 sm:w-20 px-2 py-2 text-center rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {orderItems.length > 0 && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-sm text-gray-600 mb-1">Items: {orderItems.length}</p>
              <p className="text-lg font-bold text-orange-600">
                Total: ₹{totalPrice.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Special instructions, dietary requirements..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || orderItems.length === 0 || !pickupDate}
            className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all touch-manipulation"
          >
            {submitting ? 'Placing Order...' : 'Place Bulk Order'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
