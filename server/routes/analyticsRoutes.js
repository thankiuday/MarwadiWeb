import { Router } from 'express';
import { getSalesSummary, getSalesChart, exportAnalytics } from '../controllers/analyticsController.js';
import { getSubscriptionSummary, getSubscriptionChart } from '../controllers/subscriptionAnalyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('superadmin'));

router.get('/summary', getSalesSummary);
router.get('/sales', getSalesChart);
router.get('/export', exportAnalytics);

router.get('/subscriptions/summary', getSubscriptionSummary);
router.get('/subscriptions/chart', getSubscriptionChart);

export default router;
