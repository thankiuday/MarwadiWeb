import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  getSalesSummary,
  getSalesChart,
  getSubscriptionSummary,
  getSubscriptionChart,
  exportAnalytics,
} from '../../api/analytics';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminHeader from '../../components/layout/AdminHeader';
import StatsCard from '../../components/ui/StatsCard';
import {
  SalesBarChart,
  PopularItemsPie,
  SubscriptionBarChart,
  PopularPlansPie,
  OrdersByTableBar,
} from '../../components/charts/AnalyticsChart';
import { StatSkeleton } from '../../components/ui/SkeletonLoader';
import { HiArrowDownTray, HiCalendarDays, HiChartBar, HiCreditCard } from 'react-icons/hi2';
import { useSocket } from '../../hooks/useSocket';

const PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function SADashboard() {
  const { socket } = useSocket();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [subSummary, setSubSummary] = useState(null);
  const [subChartData, setSubChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeoutRef = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);
    try {
      const [sumRes, chartRes, subSumRes, subChartRes] = await Promise.all([
        getSalesSummary(period),
        getSalesChart(period),
        getSubscriptionSummary(period),
        getSubscriptionChart(period),
      ]);
      setSummary(sumRes.data.data);
      setChartData(chartRes.data.data);
      setSubSummary(subSumRes.data.data);
      setSubChartData(subChartRes.data.data);
    } catch {
      if (!silent) toast.error('Failed to load analytics');
    } finally {
      if (!silent) setLoading(false);
      if (silent) setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    const handlers = ['new_order', 'order_updated', 'new_bulk_order', 'bulk_order_updated', 'new_subscription'];
    const onLiveUpdate = () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTimeoutRef.current = null;
        fetchData(true);
      }, 500);
    };
    handlers.forEach((ev) => socket.on(ev, onLiveUpdate));
    return () => {
      handlers.forEach((ev) => socket.off(ev, onLiveUpdate));
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [socket, fetchData]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await exportAnalytics(period, format);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="Dashboard" />
      <div className="min-h-screen bg-slate-50/80 pb-8 sm:pb-10">
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
          {/* Controls Section */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 sm:mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                View & Export
              </h2>
              {socket?.connected && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {refreshing ? 'Updating…' : 'Live'}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-slate-700">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 active:scale-[0.98] transition-all touch-manipulation min-h-[44px]"
                >
                  <HiArrowDownTray className="w-4 h-4 shrink-0" />
                  JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98] transition-all touch-manipulation min-h-[44px]"
                >
                  <HiArrowDownTray className="w-4 h-4 shrink-0" />
                  CSV
                </button>
              </div>
            </div>
          </section>

          {/* Stats Section - Order Overview */}
          <section className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <HiChartBar className="w-4 h-4 shrink-0" />
              Order Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 min-w-0">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)
              ) : (
                <>
                  <StatsCard icon="📦" label="Total Orders" labelShort="Orders" value={summary?.totalOrders || 0} color="orange" />
                  <StatsCard icon="✅" label="Completed" value={summary?.completedOrders || 0} color="green" />
                  <StatsCard icon="⏳" label="Pending" value={summary?.pendingOrders || 0} color="blue" />
                  <StatsCard icon="❌" label="Rejected" value={summary?.rejectedOrders || 0} color="red" />
                  <StatsCard
                    icon="💰"
                    label="Revenue"
                    value={`₹${(summary?.totalRevenue || 0).toLocaleString()}`}
                    color="purple"
                  />
                  <StatsCard
                    icon="📊"
                    label="Avg Order Value"
                    labelShort="AOV"
                    value={`₹${Math.round(summary?.averageOrderValue || 0).toLocaleString()}`}
                    color="blue"
                  />
                  <StatsCard
                    icon="👥"
                    label="Unique Customers"
                    labelShort="Customers"
                    value={summary?.totalUniqueCustomers || 0}
                    color="teal"
                  />
                  <StatsCard
                    icon="🔄"
                    label="Repeat Customers"
                    labelShort="Repeat"
                    value={summary?.repeatCustomers || 0}
                    color="indigo"
                  />
                  <StatsCard
                    icon="📈"
                    label="Repeat Rate"
                    value={`${(summary?.repeatOrderRate || 0).toFixed(1)}%`}
                    color="emerald"
                  />
                </>
              )}
            </div>
          </section>

          {/* Order Breakdown & Status */}
          {!loading && (summary?.totalTableOrders > 0 || summary?.totalBulkOrders > 0) && (
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 min-w-0 overflow-hidden">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HiCalendarDays className="w-4 h-4 shrink-0" />
                Order Breakdown
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-3 sm:gap-6">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-sm text-slate-600 whitespace-nowrap">Table orders</span>
                  <span className="text-sm font-bold text-slate-900">{summary?.totalTableOrders || 0}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                  <span className="text-sm text-slate-600 whitespace-nowrap">Bulk orders</span>
                  <span className="text-sm font-bold text-slate-900">{summary?.totalBulkOrders || 0}</span>
                </div>
                {(summary?.acceptedOrders > 0 || summary?.preparingOrders > 0) && (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-sm text-slate-600 whitespace-nowrap">Accepted</span>
                      <span className="text-sm font-bold text-slate-900">{summary?.acceptedOrders || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      <span className="text-sm text-slate-600 whitespace-nowrap">Preparing</span>
                      <span className="text-sm font-bold text-slate-900">{summary?.preparingOrders || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Regular Customers */}
          {!loading && (summary?.regularCustomers?.length ?? 0) > 0 && (
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 min-w-0 overflow-hidden">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                Regular Customers (by order count)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2.5 px-3 font-semibold text-slate-600">#</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-600">Customer Name</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-600 hidden sm:table-cell">Email</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Orders</th>
                      <th className="py-2.5 px-3 font-semibold text-slate-600 text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.regularCustomers.map((c, i) => (
                      <tr key={`${c.email}-${i}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-500">{i + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{c.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 hidden sm:table-cell truncate max-w-[180px]" title={c.email}>{c.email}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-orange-600">{c.orderCount}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">₹{Number(c.totalSpent).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Charts Section */}
          <section className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
              Order Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 min-w-0">
              <div className="min-w-0">
                <SalesBarChart data={chartData} />
              </div>
              <div className="min-w-0">
                <PopularItemsPie data={summary?.popularItems || []} />
              </div>
              <div className="min-w-0 lg:col-span-2 xl:col-span-1">
                <OrdersByTableBar data={summary?.ordersByTable || []} />
              </div>
            </div>
          </section>

          {/* Subscription Analytics */}
          <section className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <HiCreditCard className="w-4 h-4 shrink-0" />
              Subscription Analytics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-5 min-w-0 overflow-hidden">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={`sub-${i}`} />)
              ) : (
                <>
                  <StatsCard icon="📋" label="Total Plans" value={subSummary?.totalPlans || 0} color="blue" />
                  <StatsCard icon="✅" label="Active Plans" value={subSummary?.activePlans || 0} color="green" />
                  <StatsCard
                    icon="👥"
                    label="Active Subscribers"
                    labelShort="Subscribers"
                    value={subSummary?.totalActiveSubscribers || 0}
                    color="purple"
                  />
                  <StatsCard
                    icon="🆕"
                    label={`New (${period})`}
                    labelShort={`New (${period})`}
                    value={subSummary?.newSubscribersInPeriod || 0}
                    color="orange"
                  />
                  <StatsCard
                    icon="💰"
                    label="MRR"
                    value={`₹${(subSummary?.activeSubscriptionRevenue || 0).toLocaleString()}`}
                    color="purple"
                  />
                  <StatsCard
                    icon="📈"
                    label={`New Rev (${period})`}
                    labelShort="New Rev"
                    value={`₹${(subSummary?.newSubscriptionRevenue || 0).toLocaleString()}`}
                    color="green"
                  />
                </>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
              <div className="min-w-0">
                <SubscriptionBarChart data={subChartData} />
              </div>
              <div className="min-w-0">
                <PopularPlansPie data={subSummary?.popularPlans || []} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
