import { useState, useEffect } from 'react';
import { getMenuItems } from '../../api/menu';
import FoodCard from '../../components/ui/FoodCard';
import { CardSkeleton } from '../../components/ui/SkeletonLoader';
import CategoryFilter from '../../components/ui/CategoryFilter';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import CartDrawer from '../../components/ui/CartDrawer';
import Footer from '../../components/layout/Footer';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await getMenuItems({ available: true });
        setItems(data.data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const tableNumber = localStorage.getItem('tableNumber');
  const filtered = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <CustomerNavbar onCartOpen={() => setCartOpen(true)} />
      <BottomNav />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-5 py-4 sm:py-6">
        {tableNumber && (
          <div className="mb-4 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 inline-block">
            Table <span className="font-bold">{tableNumber}</span>
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Menu</h2>

        <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : filtered.map((item) => <FoodCard key={item._id} item={item} />)}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <span className="text-5xl sm:text-6xl block mb-3">🍽️</span>
            <p className="text-gray-500 text-base sm:text-lg">No items in this category</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
