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

    const [totalOrders, completedOrders, pendingOrders, totalBulkOrders, completedBulkOrders, pendingBulkOrders] =
      await Promise.all([
        Order.countDocuments(orderMatch),
        Order.countDocuments({ ...orderMatch, status: 'completed' }),
        Order.countDocuments({ ...orderMatch, status: 'pending' }),
        BulkOrder.countDocuments(bulkMatch),
        BulkOrder.countDocuments({ ...bulkMatch, status: 'completed' }),
        BulkOrder.countDocuments({ ...bulkMatch, status: 'pending' }),
      ]);

    const [orderRevenue, bulkRevenue] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            ...orderMatch,
            status: { $in: ['completed', 'accepted', 'preparing'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      BulkOrder.aggregate([
        {
          $match: {
            ...bulkMatch,
            status: { $in: ['completed', 'accepted', 'preparing'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const totalRevenue = (orderRevenue[0]?.total || 0) + (bulkRevenue[0]?.total || 0);

    const [orderPopular, bulkPopular] = await Promise.all([
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

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders + totalBulkOrders,
        totalTableOrders: totalOrders,
        totalBulkOrders,
        completedOrders: completedOrders + completedBulkOrders,
        pendingOrders: pendingOrders + pendingBulkOrders,
        totalRevenue,
        popularItems,
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

export const exportAnalytics = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const format = req.query.format || 'json';
    const { start, end } = getDateRange(period);

    const [orderData, bulkData, summary] = await Promise.all([
      Order.find({ createdAt: { $gte: start, $lte: end } })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      BulkOrder.find({ createdAt: { $gte: start, $lte: end } })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean(),
      (async () => {
        const [ordCount, bulkCount, ordRev, bulkRev] = await Promise.all([
          Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          BulkOrder.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Order.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
                status: { $in: ['completed', 'accepted', 'preparing'] },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
          ]),
          BulkOrder.aggregate([
            {
              $match: {
                createdAt: { $gte: start, $lte: end },
                status: { $in: ['completed', 'accepted', 'preparing'] },
              },
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
          ]),
        ]);
        return {
          period,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          totalTableOrders: ordCount,
          totalBulkOrders: bulkCount,
          totalOrders: ordCount + bulkCount,
          totalRevenue: (ordRev[0]?.total || 0) + (bulkRev[0]?.total || 0),
        };
      })(),
    ]);

    const exportPayload = {
      ...summary,
      exportedAt: new Date().toISOString(),
      tableOrders: orderData.map((o) => ({
        id: o._id,
        type: 'table',
        tableNumber: o.tableNumber,
        totalPrice: o.totalPrice,
        status: o.status,
        createdAt: o.createdAt,
        items: o.items,
      })),
      bulkOrders: bulkData.map((o) => ({
        id: o._id,
        type: 'bulk',
        pickupDate: o.pickupDate,
        totalPrice: o.totalPrice,
        status: o.status,
        note: o.note,
        createdAt: o.createdAt,
        userId: o.userId,
        items: o.items,
      })),
    };

    if (format === 'csv') {
      const rows = [
        ['Type', 'Order ID', 'Total', 'Status', 'Date'].join(','),
        ...orderData.map((o) =>
          ['Table', o._id, o.totalPrice, o.status, new Date(o.createdAt).toISOString()].join(',')
        ),
        ...bulkData.map((o) =>
          ['Bulk', o._id, o.totalPrice, o.status, new Date(o.createdAt).toISOString()].join(',')
        ),
      ];
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
