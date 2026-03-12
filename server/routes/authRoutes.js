import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/admin/login', loginAdmin);
router.get('/me', protect, getMe);

export default router;
