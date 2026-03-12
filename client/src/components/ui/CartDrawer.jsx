import { HiXMark, HiPlus, HiMinus, HiTrash } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:backdrop-blur-none" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Your Cart <span className="text-orange-500">({totalItems})</span>
            </h2>
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
              <HiXMark className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 overscroll-contain">
            {items.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <span className="text-6xl sm:text-7xl block mb-4">🛒</span>
                <p className="text-gray-700 font-semibold text-lg sm:text-xl">Your cart is empty</p>
                <p className="text-gray-500 text-sm sm:text-base mt-2">Add items from the menu to get started</p>
                <Link
                  to="/menu"
                  onClick={onClose}
                  className="mt-6 inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 active:scale-[0.98] transition-all touch-manipulation text-center"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.menuItem}
                  className="flex items-center gap-3 sm:gap-4 bg-gray-50 rounded-xl p-3"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-100 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                      🍽️
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{item.name}</h4>
                    <p className="text-orange-600 font-medium text-sm">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-orange-50 active:scale-90 transition-all touch-manipulation"
                    >
                      <HiMinus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="w-7 sm:w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-orange-50 active:scale-90 transition-all touch-manipulation"
                    >
                      <HiPlus className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => removeItem(item.menuItem)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors ml-1 touch-manipulation"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-100 p-4 sm:p-5 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5 space-y-4">
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">₹{totalPrice.toFixed(2)}</span>
              </div>
              <Link
                to="/cart"
                onClick={onClose}
                className="w-full py-3.5 sm:py-3 bg-orange-500 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-orange-600 active:scale-[0.98] transition-all touch-manipulation"
              >
                Review & Place Order
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
