import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlus, HiMinus } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { getMenuItemById } from '../../api/menu';
import { useCart } from '../../hooks/useCart';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import Footer from '../../components/layout/Footer';

const CATEGORY_LABELS = {
  starters: 'Starters',
  mains: 'Main Course',
  desserts: 'Desserts',
  drinks: 'Drinks',
  sides: 'Sides',
};

export default function MenuItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.menuItem === id);
  const qty = cartItem?.quantity || 0;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMenuItemById(id);
        setItem(data.data);
      } catch {
        toast.error('Item not found');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
        <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
        <BottomNav />
        <div className="flex-1 max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto w-full px-4 py-6">
          <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="h-64 sm:h-80 bg-gray-200 rounded-2xl animate-pulse mb-6" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
        <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
        <BottomNav />
        <div className="flex-1 max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto w-full px-4 py-16 text-center">
          <p className="text-gray-500 text-lg mb-4">Item not found</p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-orange-500 font-medium hover:underline"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back to Menu
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex-1 w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 sm:mb-6 touch-manipulation"
        >
          <HiArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-gray-100">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                <span className="text-6xl sm:text-8xl">🍽️</span>
              </div>
            )}
            {!item.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold bg-red-500 px-4 py-2 rounded-full">
                  Unavailable
                </span>
              </div>
            )}
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-gray-700 text-xs font-semibold capitalize">
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{item.name}</h1>
            <p className="text-lg sm:text-xl font-bold text-orange-600 mb-4">₹{item.price.toFixed(2)}</p>

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {item.description || 'A delicious dish prepared with care using fresh ingredients. Perfect for any occasion.'}
              </p>
            </div>

            {item.available && (
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-600">Add to cart</span>
                {qty > 0 ? (
                  <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-2.5">
                    <button
                      onClick={() => updateQuantity(item._id, qty - 1)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white shadow-sm text-orange-600 hover:bg-orange-100 active:scale-90 transition-all touch-manipulation"
                    >
                      <HiMinus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-800">{qty}</span>
                    <button
                      onClick={() => addItem(item)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white shadow-sm text-orange-600 hover:bg-orange-100 active:scale-90 transition-all touch-manipulation"
                    >
                      <HiPlus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addItem(item)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all touch-manipulation"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
