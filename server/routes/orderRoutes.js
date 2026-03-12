import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('customer'), placeOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/', protect, authorize('admin', 'superadmin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'superadmin'), updateOrderStatus);

export default router;
