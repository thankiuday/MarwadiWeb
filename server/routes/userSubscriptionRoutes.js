import { Router } from 'express';
import {
  createUserSubscription,
  getUserSubscriptions,
  getUserSubscriptionById,
  markMealDone,
} from '../controllers/userSubscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, createUserSubscription);
router.get('/', protect, getUserSubscriptions);
router.get('/:id', protect, getUserSubscriptionById);
router.patch('/:id/meal', protect, authorize('admin', 'superadmin'), markMealDone);

export default router;
