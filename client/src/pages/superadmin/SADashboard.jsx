import { useState, useEffect } from 'react';
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
} from '../../components/charts/AnalyticsChart';
import { StatSkeleton } from '../../components/ui/SkeletonLoader';
import { HiArrowDownTray, HiCalendarDays, HiChartBar, HiCreditCard } from 'react-icons/hi2';

const PERIOD_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function SADashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [subSummary, setSubSummary] = useState(null);
  const [subChartData, setSubChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

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
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
          {/* Controls Section */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
              View & Export
            </h2>
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

          {/* Stats Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <HiChartBar className="w-4 h-4" />
              Overview
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              ) : (
                <>
                  <StatsCard icon="📦" label="Total Orders" value={summary?.totalOrders || 0} color="orange" />
                  <StatsCard icon="✅" label="Completed" value={summary?.completedOrders || 0} color="green" />
                  <StatsCard icon="⏳" label="Pending" value={summary?.pendingOrders || 0} color="blue" />
                  <StatsCard
                    icon="💰"
                    label="Revenue"
                    value={`₹${(summary?.totalRevenue || 0).toLocaleString()}`}
                    color="purple"
                  />
                </>
              )}
            </div>
          </section>

          {/* Order Breakdown */}
          {!loading && (summary?.totalTableOrders > 0 || summary?.totalBulkOrders > 0) && (
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <HiCalendarDays className="w-4 h-4" />
                Order Breakdown
              </h2>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-sm text-slate-600">Table orders</span>
                  <span className="text-sm font-bold text-slate-900">{summary?.totalTableOrders || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-sm text-slate-600">Bulk orders</span>
                  <span className="text-sm font-bold text-slate-900">{summary?.totalBulkOrders || 0}</span>
                </div>
              </div>
            </section>
          )}

          {/* Charts Section */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">
              Order Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SalesBarChart data={chartData} />
              <PopularItemsPie data={summary?.popularItems || []} />
            </div>
          </section>

          {/* Subscription Analytics */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <HiCreditCard className="w-4 h-4" />
              Subscription Analytics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-5">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={`sub-${i}`} />)
              ) : (
                <>
                  <StatsCard icon="📋" label="Total Plans" value={subSummary?.totalPlans || 0} color="blue" />
                  <StatsCard icon="✅" label="Active Plans" value={subSummary?.activePlans || 0} color="green" />
                  <StatsCard
                    icon="👥"
                    label="Active Subscribers"
                    value={subSummary?.totalActiveSubscribers || 0}
                    color="purple"
                  />
                  <StatsCard
                    icon="🆕"
                    label={`New (${period})`}
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
                    value={`₹${(subSummary?.newSubscriptionRevenue || 0).toLocaleString()}`}
                    color="green"
                  />
                </>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SubscriptionBarChart data={subChartData} />
              <PopularPlansPie data={subSummary?.popularPlans || []} />
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
