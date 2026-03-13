import { Link } from 'react-router-dom';
import { HiPlus, HiMinus } from 'react-icons/hi2';
import { useCart } from '../../hooks/useCart';

export default function FoodCard({ item }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.menuItem === item._id);
  const qty = cartItem?.quantity || 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-300 group flex flex-col h-full">
      <Link to={`/menu/${item._id}`} className="relative block aspect-square w-full flex-shrink-0 overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
            <span className="text-3xl sm:text-5xl">🍽️</span>
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-xs sm:text-sm bg-red-500 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </Link>
      <div className="flex-1 p-2.5 sm:p-4 flex flex-col justify-between min-w-0">
        <Link to={`/menu/${item._id}`} className="block min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-sm sm:text-lg truncate hover:text-orange-600 transition-colors leading-tight">
            {item.name}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-2 hidden sm:block">
            {item.description || 'Delicious dish prepared with care'}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-2 gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-base sm:text-xl font-bold text-orange-600">₹{item.price}</span>
          {item.available && (
            <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
              {qty > 0 ? (
                <div className="flex items-center gap-1 sm:gap-2 bg-orange-50 rounded-lg px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <button
                    onClick={(e) => { e.preventDefault(); updateQuantity(item._id, qty - 1); }}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-orange-600 hover:bg-orange-100 active:scale-90 transition-all touch-manipulation min-w-[28px] min-h-[28px]"
                  >
                    <HiMinus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="w-5 sm:w-6 text-center font-semibold text-gray-800 text-xs sm:text-sm">{qty}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); addItem(item); }}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-orange-600 hover:bg-orange-100 active:scale-90 transition-all touch-manipulation min-w-[28px] min-h-[28px]"
                  >
                    <HiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); addItem(item); }}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:scale-95 transition-all text-xs sm:text-sm touch-manipulation min-h-[36px]"
                >
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
