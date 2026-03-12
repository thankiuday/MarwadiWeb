import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

export function SalesBarChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 overflow-hidden">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Daily Revenue</h3>
      <div className="w-full h-[240px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(v) => (v ? v.slice(5) : '')}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                padding: '12px 16px',
              }}
              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SubscriptionBarChart({ data }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 overflow-hidden">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">New Subscriptions</h3>
      <div className="w-full h-[240px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(v) => (v ? v.slice(5) : '')}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                padding: '12px 16px',
              }}
              formatter={(value, name) => [
                name === 'count' ? value : `₹${Number(value).toLocaleString()}`,
                name === 'count' ? 'New subs' : 'Revenue',
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="count" />
            <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} name="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PopularPlansPie({ data }) {
  if (!data?.length) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Popular Plans</h3>
        <div className="flex items-center justify-center h-[220px] sm:h-[280px] text-gray-400 text-sm">
          No active subscribers
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 overflow-hidden">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Popular Plans</h3>
      <div className="w-full h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              dataKey="count"
              nameKey="name"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
              formatter={(value) => [`${value} subscribers`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => <span className="text-gray-600 text-xs sm:text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PopularItemsPie({ data }) {
  if (!data?.length) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Popular Items</h3>
        <div className="flex items-center justify-center h-[220px] sm:h-[280px] text-gray-400 text-sm">
          No data for this period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 overflow-hidden">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Popular Items</h3>
      <div className="w-full h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              dataKey="totalOrdered"
              nameKey="_id"
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
              formatter={(value, name) => [`${value} ordered`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => <span className="text-gray-600 text-xs sm:text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
