import mongoose from 'mongoose';

const dayScheduleSchema = new mongoose.Schema(
  {
    lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
    dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      enum: ['weekly', 'monthly'],
    },
    weeklySchedule: {
      sunday: { type: dayScheduleSchema, default: () => ({ lunch: [], dinner: [] }) },
      monday: { type: dayScheduleSchema, default: () => ({ lunch: [], dinner: [] }) },
      tuesday: { type: dayScheduleSchema, default: () => ({ lunch: [], dinner: [] }) },
      wednesday: { type: dayScheduleSchema, default: () => ({ lunch: [], dinner: [] }) },
      thursday: { type: dayScheduleSchema, default: () => ({ lunch: [], dinner: [] }) },
      friday: { type: dayScheduleSchema, default: () => ({ lunch: [], dinner: [] }) },
      saturday: { type: dayScheduleSchema, default: () => ({ lunch: [], dinner: [] }) },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
