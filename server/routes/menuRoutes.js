import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', protect, authorize('superadmin'), upload.single('image'), createMenuItem);
router.put('/:id', protect, authorize('superadmin'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, authorize('superadmin'), deleteMenuItem);

export default router;
