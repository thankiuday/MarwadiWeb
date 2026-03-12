import mongoose from 'mongoose';

const userSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    mealLog: {
      type: Map,
      of: {
        lunch: { type: Boolean, default: false },
        dinner: { type: Boolean, default: false },
      },
      default: {},
    },
  },
  { timestamps: true }
);

userSubscriptionSchema.index({ user: 1, status: 1 });
userSubscriptionSchema.index({ plan: 1, status: 1 });

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);
export default UserSubscription;
