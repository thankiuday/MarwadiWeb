import { Router } from 'express';
import { createAdmin, getAdmins, deleteAdmin } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('superadmin'));

router.post('/', createAdmin);
router.get('/', getAdmins);
router.delete('/:id', deleteAdmin);

export default router;
