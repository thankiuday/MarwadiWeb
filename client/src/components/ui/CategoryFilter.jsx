import { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'starters', label: 'Starters', icon: '🥗' },
  { id: 'mains', label: 'Mains', icon: '🍛' },
  { id: 'desserts', label: 'Desserts', icon: '🍰' },
  { id: 'drinks', label: 'Drinks', icon: '🥤' },
  { id: 'sides', label: 'Sides', icon: '🍟' },
];

export default function CategoryFilter({ activeCategory, onSelect }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="mb-5 sm:mb-6" ref={dropdownRef}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-0.5">Filter by category</p>

      {/* Mobile: Dropdown */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between min-h-[52px] px-4 bg-white border border-gray-200 rounded-xl text-left font-semibold text-gray-900 shadow-sm touch-manipulation active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">{activeCat.icon}</span>
            {activeCat.label}
          </span>
          <HiChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30 animate-fade-in">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelect(cat.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left font-medium transition-colors touch-manipulation ${
                    isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  {cat.label}
                  {isActive && <span className="ml-auto text-orange-500 text-sm">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: Pill buttons */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full
                text-sm font-semibold transition-all duration-200
                hover:border-orange-200 hover:bg-orange-50/50
                active:scale-[0.98]
                ${isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white text-gray-600 border border-gray-200'
                }
              `}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
