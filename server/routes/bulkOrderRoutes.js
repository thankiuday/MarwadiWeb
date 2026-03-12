import { Router } from 'express';
import {
  placeBulkOrder,
  getMyBulkOrders,
  getAllBulkOrders,
  updateBulkOrderStatus,
} from '../controllers/bulkOrderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('customer'), placeBulkOrder);
router.get('/my', protect, authorize('customer'), getMyBulkOrders);
router.get('/', protect, authorize('superadmin'), getAllBulkOrders);
router.put('/:id/status', protect, authorize('superadmin'), updateBulkOrderStatus);

export default router;
