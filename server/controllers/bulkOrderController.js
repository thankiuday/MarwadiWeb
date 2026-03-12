import BulkOrder from '../models/BulkOrder.js';
import Menu from '../models/Menu.js';
import ApiError from '../utils/ApiError.js';
import { getIO } from '../config/socket.js';

export const placeBulkOrder = async (req, res, next) => {
  try {
    const { pickupDate, items, note } = req.body;

    if (!pickupDate || !items || items.length === 0) {
      throw new ApiError(400, 'Pickup date and at least one item are required');
    }

    const pickup = new Date(pickupDate);
    if (isNaN(pickup.getTime()) || pickup < new Date().setHours(0, 0, 0, 0)) {
      throw new ApiError(400, 'Pickup date must be today or later');
    }

    const validatedItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) throw new ApiError(404, `Menu item not found: ${item.menuItem}`);
      if (!menuItem.available) throw new ApiError(400, `Item "${menuItem.name}" is not available`);

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const price = menuItem.price;
      const lineTotal = price * qty;
      totalPrice += lineTotal;

      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: qty,
        price,
      });
    }

    const bulkOrder = await BulkOrder.create({
      userId: req.user._id,
      pickupDate: pickup,
      items: validatedItems,
      totalPrice,
      note: note || '',
    });

    const populated = await BulkOrder.findById(bulkOrder._id).populate(
      'userId',
      'name email phone'
    );

    const io = getIO();
    io.to('superadmin_room').emit('new_bulk_order', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getMyBulkOrders = async (req, res, next) => {
  try {
    const orders = await BulkOrder.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'name image');

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getAllBulkOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await BulkOrder.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateBulkOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'preparing', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await BulkOrder.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Bulk order not found');

    order.status = status;
    await order.save();

    const populated = await BulkOrder.findById(order._id).populate(
      'userId',
      'name email phone'
    );

    const io = getIO();
    const userRoom = `user_${String(order.userId)}`;
    io.to(userRoom).emit('bulk_order_status_updated', {
      orderId: String(order._id),
      status: order.status,
      order: populated,
    });
    io.to('superadmin_room').emit('bulk_order_updated', populated);

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
