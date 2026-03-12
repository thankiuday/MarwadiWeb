export default function StatsCard({ icon, label, value, color = 'orange' }) {
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
  };

  const config = colorConfig[color] || colorConfig.orange;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200/80 transition-all duration-200">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 ${config.bg} ${config.text}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}
