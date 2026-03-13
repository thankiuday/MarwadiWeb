export default function StatsCard({ icon, label, labelShort, value, color = 'orange' }) {
  const colorConfig = {
    orange: {
      bg: 'bg-orange-500/10',
      iconBg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-200',
    },
    blue: {
      bg: 'bg-blue-500/10',
      iconBg: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
    },
    purple: {
      bg: 'bg-violet-500/10',
      iconBg: 'bg-violet-500',
      text: 'text-violet-600',
      border: 'border-violet-200',
    },
    red: {
      bg: 'bg-rose-500/10',
      iconBg: 'bg-rose-500',
      text: 'text-rose-600',
      border: 'border-rose-200',
    },
    teal: {
      bg: 'bg-teal-500/10',
      iconBg: 'bg-teal-500',
      text: 'text-teal-600',
      border: 'border-teal-200',
    },
    indigo: {
      bg: 'bg-indigo-500/10',
      iconBg: 'bg-indigo-500',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
    },
  };

  const config = colorConfig[color] || colorConfig.orange;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200/80 transition-all duration-200 min-w-0 overflow-hidden">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-2xl shrink-0 ${config.bg} ${config.text}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-xs sm:text-sm text-gray-500 font-medium break-words line-clamp-2">
            <span className="sm:hidden">{labelShort ?? label}</span>
            <span className="hidden sm:inline">{label}</span>
          </p>
          <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 mt-0.5 break-all">{value}</p>
        </div>
      </div>
    </div>
  );
}
