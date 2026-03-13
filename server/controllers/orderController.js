import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { getIO } from '../config/socket.js';
import { sendPushToAdmins, sendPushToUser } from '../utils/pushNotifications.js';

export const placeOrder = async (req, res, next) => {
  try {
    const { tableNumber, items } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order must have at least one item');
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId: req.user._id,
      tableNumber,
      items,
      totalPrice,
    });

    const populated = await Order.findById(order._id).populate('userId', 'name email');

    const io = getIO();
    io.to('admin_room').emit('new_order', populated);

    const itemsPreview = populated.items?.slice(0, 2).map((i) => `${i.name} x${i.quantity}`).join(', ') || 'Order';
    await sendPushToAdmins('New order arrive', `Table ${tableNumber}: ${itemsPreview}`, '/admin/orders');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'name image');

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'preparing', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Order not found');

    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('userId', 'name email');

    const io = getIO();
    const userRoom = `user_${String(order.userId)}`;
    io.to(userRoom).emit('order_status_updated', {
      orderId: String(order._id),
      status: order.status,
    });
    io.to('admin_room').emit('order_updated', populated);

    const statusMessages = {
      accepted: 'Your order has been accepted!',
      preparing: 'Your order is being prepared!',
      completed: 'Your order is ready!',
      rejected: 'Your order was rejected.',
    };
    await sendPushToUser(order.userId, 'Order update', statusMessages[order.status] || `Status: ${order.status}`, '/orders');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
