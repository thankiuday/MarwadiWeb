import { Router } from 'express';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getSubscriptions);
router.post('/', protect, authorize('superadmin'), createSubscription);
router.put('/:id', protect, authorize('superadmin'), updateSubscription);
router.delete('/:id', protect, authorize('superadmin'), deleteSubscription);

export default router;
