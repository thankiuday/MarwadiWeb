import mongoose from 'mongoose';

const bulkOrderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: true,
    },
    name: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const bulkOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    items: {
      type: [bulkOrderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Bulk order must have at least one item',
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'preparing', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

bulkOrderSchema.index({ userId: 1, createdAt: -1 });
bulkOrderSchema.index({ status: 1 });

const BulkOrder = mongoose.model('BulkOrder', bulkOrderSchema);
export default BulkOrder;
