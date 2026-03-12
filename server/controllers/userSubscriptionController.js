import UserSubscription from '../models/UserSubscription.js';
import Subscription from '../models/Subscription.js';
import ApiError from '../utils/ApiError.js';

const PLAN_SCHEDULE_POPULATE = [
  { path: 'weeklySchedule.sunday.lunch', model: 'Menu' },
  { path: 'weeklySchedule.sunday.dinner', model: 'Menu' },
  { path: 'weeklySchedule.monday.lunch', model: 'Menu' },
  { path: 'weeklySchedule.monday.dinner', model: 'Menu' },
  { path: 'weeklySchedule.tuesday.lunch', model: 'Menu' },
  { path: 'weeklySchedule.tuesday.dinner', model: 'Menu' },
  { path: 'weeklySchedule.wednesday.lunch', model: 'Menu' },
  { path: 'weeklySchedule.wednesday.dinner', model: 'Menu' },
  { path: 'weeklySchedule.thursday.lunch', model: 'Menu' },
  { path: 'weeklySchedule.thursday.dinner', model: 'Menu' },
  { path: 'weeklySchedule.friday.lunch', model: 'Menu' },
  { path: 'weeklySchedule.friday.dinner', model: 'Menu' },
  { path: 'weeklySchedule.saturday.lunch', model: 'Menu' },
  { path: 'weeklySchedule.saturday.dinner', model: 'Menu' },
];

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const createUserSubscription = async (req, res, next) => {
  try {
    if (req.accountType !== 'customer') {
      throw new ApiError(403, 'Only customers can subscribe');
    }
    const { planId } = req.body;
    if (!planId) throw new ApiError(400, 'Plan ID is required');

    const plan = await Subscription.findById(planId);
    if (!plan) throw new ApiError(404, 'Plan not found');
    if (!plan.active) throw new ApiError(400, 'Plan is not active');

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate;
    if (plan.duration === 'weekly') {
      endDate = addDays(startDate, 7);
    } else {
      endDate = addDays(startDate, 30);
    }

    const userSubscription = await UserSubscription.create({
      user: req.user._id,
      plan: planId,
      startDate,
      endDate,
      status: 'active',
    });

    const populated = await UserSubscription.findById(userSubscription._id)
      .populate({
        path: 'plan',
        populate: PLAN_SCHEDULE_POPULATE,
      })
      .populate('user', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    let filter = {};
    if (req.accountType === 'customer') {
      filter.user = req.user._id;
    }

    const subscriptions = await UserSubscription.find(filter)
      .populate({
        path: 'plan',
        populate: PLAN_SCHEDULE_POPULATE,
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptionById = async (req, res, next) => {
  try {
    const sub = await UserSubscription.findById(req.params.id);
    if (!sub) throw new ApiError(404, 'Subscription not found');

    if (req.accountType === 'customer' && sub.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized');
    }

    const populated = await UserSubscription.findById(req.params.id)
      .populate({
        path: 'plan',
        populate: PLAN_SCHEDULE_POPULATE,
      })
      .populate('user', 'name email');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const markMealDone = async (req, res, next) => {
  try {
    if (req.accountType === 'customer') {
      throw new ApiError(403, 'Only admin can mark meals');
    }

    const { date, meal, done } = req.body;
    if (!date || !meal || !['lunch', 'dinner'].includes(meal)) {
      throw new ApiError(400, 'Valid date and meal (lunch/dinner) required');
    }

    const sub = await UserSubscription.findById(req.params.id);
    if (!sub) throw new ApiError(404, 'Subscription not found');

    const mealLog = sub.mealLog || new Map();
    const dayLog = mealLog.get(date) || { lunch: false, dinner: false };
    dayLog[meal] = !!done;
    mealLog.set(date, dayLog);
    sub.mealLog = mealLog;
    await sub.save();

    const populated = await UserSubscription.findById(sub._id)
      .populate('plan')
      .populate('user', 'name email');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
