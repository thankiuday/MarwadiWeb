import Subscription from '../models/Subscription.js';
import UserSubscription from '../models/UserSubscription.js';

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

export const getSubscriptionSummary = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const { start, end } = getDateRange(period);
    const now = new Date();

    const [
      totalPlans,
      activePlans,
      totalActiveSubscribers,
      newSubscribersInPeriod,
      activeRevenueResult,
      newRevenueResult,
      popularPlans,
    ] = await Promise.all([
      Subscription.countDocuments(),
      Subscription.countDocuments({ active: true }),
      UserSubscription.countDocuments({
        status: 'active',
        endDate: { $gte: now },
      }),
      UserSubscription.countDocuments({
        createdAt: { $gte: start, $lte: end },
      }),
      UserSubscription.aggregate([
        {
          $match: {
            status: 'active',
            endDate: { $gte: now },
          },
        },
        { $lookup: { from: 'subscriptions', localField: 'plan', foreignField: '_id', as: 'planDoc' } },
        { $unwind: '$planDoc' },
        { $group: { _id: null, total: { $sum: '$planDoc.price' } } },
      ]),
      UserSubscription.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $lookup: { from: 'subscriptions', localField: 'plan', foreignField: '_id', as: 'planDoc' } },
        { $unwind: '$planDoc' },
        { $group: { _id: null, total: { $sum: '$planDoc.price' } } },
      ]),
      UserSubscription.aggregate([
        { $match: { status: 'active', endDate: { $gte: now } } },
        { $group: { _id: '$plan', count: { $sum: 1 } } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: '_id', as: 'planDoc' } },
        { $unwind: '$planDoc' },
        { $project: { _id: '$planDoc.name', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const activeSubscriptionRevenue = activeRevenueResult[0]?.total || 0;
    const newSubscriptionRevenue = newRevenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalPlans,
        activePlans,
        totalActiveSubscribers,
        newSubscribersInPeriod,
        activeSubscriptionRevenue,
        newSubscriptionRevenue,
        popularPlans: popularPlans.map((p) => ({ name: p._id, count: p.count })),
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionChart = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const { start, end } = getDateRange(period);

    const data = await UserSubscription.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $lookup: { from: 'subscriptions', localField: 'plan', foreignField: '_id', as: 'planDoc' } },
      { $unwind: '$planDoc' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$planDoc.price' },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, revenue: 1, _id: 0 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
