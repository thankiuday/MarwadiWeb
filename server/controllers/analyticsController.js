import Order from '../models/Order.js';
import BulkOrder from '../models/BulkOrder.js';
import ApiError from '../utils/ApiError.js';

const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  if (period === 'weekly') {
    start.setDate(start.getDate() - 7);
  } else if (period === 'monthly') {
    start.setMonth(start.getMonth() - 1);
  } else if (period === 'yearly') {
    start.setFullYear(start.getFullYear() - 1);
  } else {
    start.setDate(start.getDate() - 7);
  }
  return { start, end: now };
};

export const getSalesSummary = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const { start, end } = getDateRange(period);

    const orderMatch = { createdAt: { $gte: start, $lte: end } };
    const bulkMatch = { createdAt: { $gte: start, $lte: end } };

    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      rejectedOrders,
      acceptedOrders,
      preparingOrders,
      totalBulkOrders,
      completedBulkOrders,
      pendingBulkOrders,
      rejectedBulkOrders,
      acceptedBulkOrders,
      preparingBulkOrders,
      ordersByTable,
    ] = await Promise.all([
      Order.countDocuments(orderMatch),
      Order.countDocuments({ ...orderMatch, status: 'completed' }),
      Order.countDocuments({ ...orderMatch, status: 'pending' }),
      Order.countDocuments({ ...orderMatch, status: 'rejected' }),
      Order.countDocuments({ ...orderMatch, status: 'accepted' }),
      Order.countDocuments({ ...orderMatch, status: 'preparing' }),
      BulkOrder.countDocuments(bulkMatch),
      BulkOrder.countDocuments({ ...bulkMatch, status: 'completed' }),
      BulkOrder.countDocuments({ ...bulkMatch, status: 'pending' }),
      BulkOrder.countDocuments({ ...bulkMatch, status: 'rejected' }),
      BulkOrder.countDocuments({ ...bulkMatch, status: 'accepted' }),
      BulkOrder.countDocuments({ ...bulkMatch, status: 'preparing' }),
      Order.aggregate([
        { $match: orderMatch },
        { $group: { _id: '$tableNumber', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const [orderRevenue, bulkRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            ...orderMatch,
            status: { $in: ['completed', 'accepted', 'preparing'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      BulkOrder.aggregate([
        {
          $match: {
            ...bulkMatch,
            status: { $in: ['completed', 'accepted', 'preparing'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = (orderRevenue[0]?.total || 0) + (bulkRevenue[0]?.total || 0);
    const revenueOrderCount = (orderRevenue[0]?.count || 0) + (bulkRevenue[0]?.count || 0);
    const averageOrderValue = revenueOrderCount > 0 ? totalRevenue / revenueOrderCount : 0;

    const [orderPopular, bulkPopular, orderCustomerCounts, bulkCustomerCounts] = await Promise.all([
      Order.aggregate([
        { $match: orderMatch },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalOrdered: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalOrdered: -1 } },
      ]),
      BulkOrder.aggregate([
        { $match: bulkMatch },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalOrdered: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalOrdered: -1 } },
      ]),
      Order.aggregate([
        { $match: orderMatch },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
      BulkOrder.aggregate([
        { $match: bulkMatch },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
    ]);

    const popularMap = new Map();
    for (const p of [...orderPopular, ...bulkPopular]) {
      const existing = popularMap.get(p._id);
      if (existing) {
        existing.totalOrdered += p.totalOrdered;
        existing.revenue += p.revenue;
      } else {
        popularMap.set(p._id, { ...p });
      }
    }
    const popularItems = Array.from(popularMap.values())
      .sort((a, b) => b.totalOrdered - a.totalOrdered)
      .slice(0, 10);

    const ordersByTableFormatted = ordersByTable.map((t) => ({
      table: `Table ${t._id}`,
      count: t.count,
    }));

    const customerOrderMap = new Map();
    for (const c of orderCustomerCounts) {
      customerOrderMap.set(String(c._id), (customerOrderMap.get(String(c._id)) || 0) + c.count);
    }
    for (const c of bulkCustomerCounts) {
      customerOrderMap.set(String(c._id), (customerOrderMap.get(String(c._id)) || 0) + c.count);
    }
    const totalUniqueCustomers = customerOrderMap.size;
    const repeatCustomers = Array.from(customerOrderMap.values()).filter((n) => n >= 2).length;
    const repeatOrderRate = totalUniqueCustomers > 0 ? (repeatCustomers / totalUniqueCustomers) * 100 : 0;

    const [orderCustomersWithDetails, bulkCustomersWithDetails] = await Promise.all([
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' },
          },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$user.name', 'Guest'] },
            email: { $ifNull: ['$user.email', '-'] },
            orderCount: 1,
            totalSpent: 1,
          },
        },
      ]),
      BulkOrder.aggregate([
        { $match: bulkMatch },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' },
          },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$user.name', 'Guest'] },
            email: { $ifNull: ['$user.email', '-'] },
            orderCount: 1,
            totalSpent: 1,
          },
        },
      ]),
    ]);

    const regularCustomerMap = new Map();
    for (const c of [...orderCustomersWithDetails, ...bulkCustomersWithDetails]) {
      const key = String(c._id);
      const existing = regularCustomerMap.get(key);
      if (existing) {
        existing.orderCount += c.orderCount;
        existing.totalSpent += c.totalSpent;
      } else {
        regularCustomerMap.set(key, {
          name: c.name,
          email: c.email,
          orderCount: c.orderCount,
          totalSpent: c.totalSpent,
        });
      }
    }
    const regularCustomers = Array.from(regularCustomerMap.values())
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 20);

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders + totalBulkOrders,
        totalTableOrders: totalOrders,
        totalBulkOrders,
        completedOrders: completedOrders + completedBulkOrders,
        pendingOrders: pendingOrders + pendingBulkOrders,
        rejectedOrders: rejectedOrders + rejectedBulkOrders,
        acceptedOrders: acceptedOrders + acceptedBulkOrders,
        preparingOrders: preparingOrders + preparingBulkOrders,
        totalRevenue,
        averageOrderValue,
        popularItems,
        ordersByTable: ordersByTableFormatted,
        totalUniqueCustomers,
        repeatCustomers,
        repeatOrderRate,
        regularCustomers,
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesChart = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const { start, end } = getDateRange(period);

    const orderData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'accepted', 'preparing'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
    ]);

    const bulkData = await BulkOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['completed', 'accepted', 'preparing'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
    ]);

    const dateMap = new Map();
    for (const d of [...orderData, ...bulkData]) {
      const existing = dateMap.get(d._id);
      if (existing) {
        existing.revenue += d.revenue;
        existing.orders += d.orders;
      } else {
        dateMap.set(d._id, { date: d._id, revenue: d.revenue, orders: d.orders });
      }
    }
    const formatted = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

const escapeCsv = (val) => {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const formatDateReadable = (d) => {
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const exportAnalytics = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const format = req.query.format || 'json';
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Export] Starting', period, format);
    }
    const { start, end } = getDateRange(period);

    const [orderData, bulkData, regularCustomers] = await Promise.all([
      Order.find({ createdAt: { $gte: start, $lte: end } })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      BulkOrder.find({ createdAt: { $gte: start, $lte: end } })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean(),
      (async () => {
        const [orderAgg, bulkAgg] = await Promise.all([
          Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
              $group: {
                _id: '$userId',
                orderCount: { $sum: 1 },
                totalSpent: { $sum: '$totalPrice' },
              },
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                name: { $ifNull: ['$user.name', 'Guest'] },
                email: { $ifNull: ['$user.email', '-'] },
                orderCount: 1,
                totalSpent: 1,
              },
            },
          ]),
          BulkOrder.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
              $group: {
                _id: '$userId',
                orderCount: { $sum: 1 },
                totalSpent: { $sum: '$totalPrice' },
              },
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                name: { $ifNull: ['$user.name', 'Guest'] },
                email: { $ifNull: ['$user.email', '-'] },
                orderCount: 1,
                totalSpent: 1,
              },
            },
          ]),
        ]);
        const map = new Map();
        for (const c of [...orderAgg, ...bulkAgg]) {
          const key = String(c._id);
          const existing = map.get(key);
          if (existing) {
            existing.orderCount += c.orderCount;
            existing.totalSpent += c.totalSpent;
          } else {
            map.set(key, { name: c.name, email: c.email, orderCount: c.orderCount, totalSpent: c.totalSpent });
          }
        }
        return Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount);
      })(),
    ]);

    const totalRevenue = (orderData.filter((o) => ['completed', 'accepted', 'preparing'].includes(o.status)).reduce((s, o) => s + o.totalPrice, 0)) +
      (bulkData.filter((o) => ['completed', 'accepted', 'preparing'].includes(o.status)).reduce((s, o) => s + o.totalPrice, 0));

    const itemsSummary = (items) => {
      if (!items?.length) return '-';
      return items.map((i) => `${i.name} x${i.quantity}`).join(', ');
    };

    const exportPayload = {
      reportTitle: `Analytics Report - ${period}`,
      period,
      dateRange: {
        from: formatDateReadable(start),
        to: formatDateReadable(end),
      },
      exportedAt: formatDateReadable(new Date()),
      summary: {
        totalOrders: orderData.length + bulkData.length,
        tableOrders: orderData.length,
        bulkOrders: bulkData.length,
        totalRevenue: `₹${totalRevenue.toFixed(2)}`,
        uniqueCustomers: regularCustomers.length,
      },
      regularCustomers: regularCustomers.map((c) => ({
        customerName: c.name,
        email: c.email,
        orderCount: c.orderCount,
        totalSpent: `₹${Number(c.totalSpent).toFixed(2)}`,
      })),
      orders: [...orderData.map((o) => ({ ...o, _type: 'table' })), ...bulkData.map((o) => ({ ...o, _type: 'bulk' }))]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((o) =>
          o._type === 'table'
            ? {
                orderType: 'Table',
                orderId: o._id.slice(-6).toUpperCase(),
                customerName: o.userId?.name || 'Guest',
                tableNumber: o.tableNumber,
                items: itemsSummary(o.items),
                total: `₹${Number(o.totalPrice).toFixed(2)}`,
                status: o.status,
                date: formatDateReadable(o.createdAt),
              }
            : {
                orderType: 'Bulk',
                orderId: o._id.slice(-6).toUpperCase(),
                customerName: o.userId?.name || 'Guest',
                items: itemsSummary(o.items),
                total: `₹${Number(o.totalPrice).toFixed(2)}`,
                status: o.status,
                pickupDate: formatDateReadable(o.pickupDate),
                date: formatDateReadable(o.createdAt),
              }
        ),
    };

    if (format === 'csv') {
      const rows = [];
      rows.push('=== SUMMARY ===');
      rows.push(`Period,${period}`);
      rows.push(`Date Range,${formatDateReadable(start)} to ${formatDateReadable(end)}`);
      rows.push(`Total Orders,${exportPayload.summary.totalOrders}`);
      rows.push(`Table Orders,${exportPayload.summary.tableOrders}`);
      rows.push(`Bulk Orders,${exportPayload.summary.bulkOrders}`);
      rows.push(`Total Revenue,${exportPayload.summary.totalRevenue}`);
      rows.push(`Unique Customers,${exportPayload.summary.uniqueCustomers}`);
      rows.push('');
      rows.push('=== REGULAR CUSTOMERS (Name, Email, Orders, Total Spent) ===');
      rows.push(['Customer Name', 'Email', 'Order Count', 'Total Spent'].map(escapeCsv).join(','));
      regularCustomers.forEach((c) => {
        rows.push([c.name, c.email, c.orderCount, `₹${Number(c.totalSpent).toFixed(2)}`].map(escapeCsv).join(','));
      });
      rows.push('');
      rows.push('=== ORDERS (Type, ID, Customer, Items, Total, Status, Date) ===');
      rows.push(['Type', 'Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(escapeCsv).join(','));
      orderData.forEach((o) => {
        rows.push([
          'Table',
          o._id.slice(-6).toUpperCase(),
          o.userId?.name || 'Guest',
          itemsSummary(o.items),
          `₹${Number(o.totalPrice).toFixed(2)}`,
          o.status,
          formatDateReadable(o.createdAt),
        ].map(escapeCsv).join(','));
      });
      bulkData.forEach((o) => {
        rows.push([
          'Bulk',
          o._id.slice(-6).toUpperCase(),
          o.userId?.name || 'Guest',
          itemsSummary(o.items),
          `₹${Number(o.totalPrice).toFixed(2)}`,
          o.status,
          formatDateReadable(o.createdAt),
        ].map(escapeCsv).join(','));
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      return res.send(rows.join('\n'));
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analytics-${period}-${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.send(JSON.stringify(exportPayload, null, 2));
  } catch (error) {
    next(error);
  }
};
