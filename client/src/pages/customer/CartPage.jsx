import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApiError } from '../../utils/getApiError';
import { useCart } from '../../hooks/useCart';
import { placeOrder } from '../../api/orders';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import { HiTrash, HiPlus, HiMinus } from 'react-icons/hi2';
import Footer from '../../components/layout/Footer';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const tableNumber = parseInt(localStorage.getItem('tableNumber') || '1');

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        menuItem: i.menuItem,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      }));
      const { data } = await placeOrder({ tableNumber, items: orderItems });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${data.data._id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 md:pb-0 overflow-x-hidden">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-5 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Review Order</h2>
        <p className="text-gray-500 mb-5 sm:mb-6">Table {tableNumber}</p>

        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-20 animate-fade-in">
            <span className="text-6xl block mb-4">🛒</span>
            <p className="text-gray-500 text-base sm:text-lg mb-4">Your cart is empty</p>
            <Link
              to="/menu"
              className="inline-block px-6 py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 active:scale-[0.98] transition-all touch-manipulation"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {items.map((item) => (
              <div
                key={item.menuItem}
                className="bg-white rounded-xl p-3 sm:p-4 shadow-sm"
              >
                <div className="flex gap-3 sm:gap-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-100 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                      🍽️
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">₹{item.price} each</p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                      className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all touch-manipulation"
                      aria-label="Decrease quantity"
                    >
                      <HiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm min-w-[2rem]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                      className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all touch-manipulation"
                      aria-label="Increase quantity"
                    >
                      <HiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.menuItem)}
                    className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
                    aria-label="Remove item"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm mt-4">
              <div className="flex justify-between items-center text-lg sm:text-xl font-bold mb-4 sm:mb-5">
                <span>Total</span>
                <span className="text-orange-600">₹{totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 sm:py-3.5 bg-orange-500 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-orange-600 disabled:opacity-50 active:scale-[0.98] transition-all touch-manipulation min-h-[48px]"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
