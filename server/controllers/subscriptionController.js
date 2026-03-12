import Subscription from '../models/Subscription.js';
import ApiError from '../utils/ApiError.js';

const WEEKLY_SCHEDULE_PATHS = [
  'weeklySchedule.sunday.lunch', 'weeklySchedule.sunday.dinner',
  'weeklySchedule.monday.lunch', 'weeklySchedule.monday.dinner',
  'weeklySchedule.tuesday.lunch', 'weeklySchedule.tuesday.dinner',
  'weeklySchedule.wednesday.lunch', 'weeklySchedule.wednesday.dinner',
  'weeklySchedule.thursday.lunch', 'weeklySchedule.thursday.dinner',
  'weeklySchedule.friday.lunch', 'weeklySchedule.friday.dinner',
  'weeklySchedule.saturday.lunch', 'weeklySchedule.saturday.dinner',
];

export const getSubscriptions = async (_req, res, next) => {
  try {
    let query = Subscription.find().sort({ price: 1 });
    WEEKLY_SCHEDULE_PATHS.forEach((p) => { query = query.populate(p); });
    const subscriptions = await query;
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create(req.body);
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subscription) throw new ApiError(404, 'Subscription not found');
    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) throw new ApiError(404, 'Subscription not found');
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (error) {
    next(error);
  }
};
