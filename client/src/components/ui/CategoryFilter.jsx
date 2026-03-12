const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'starters', label: 'Starters', icon: '🥗' },
  { id: 'mains', label: 'Mains', icon: '🍛' },
  { id: 'desserts', label: 'Desserts', icon: '🍰' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
  { id: 'sides', label: 'Sides', icon: '🍟' },
];

export default function CategoryFilter({ activeCategory, onSelect }) {
  return (
    <div className="mb-4 sm:mb-6">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-0.5">Category</p>

      {/* Horizontal scroll on all screens - Swiggy-style */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                flex items-center gap-1.5 sm:gap-2 py-2.5 px-3.5 sm:px-4 rounded-full
                text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0
                hover:border-orange-200 hover:bg-orange-50/50 touch-manipulation
                active:scale-[0.98]
                ${isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 border-2 border-orange-500'
                  : 'bg-white text-gray-600 border border-gray-200'
                }
              `}
            >
              <span className="text-base sm:text-lg">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
