import { Router } from 'express';
import PushSubscription from '../models/PushSubscription.js';
import { protect } from '../middleware/auth.js';
import { getVapidPublicKey, initWebPush } from '../utils/pushNotifications.js';
import ApiError from '../utils/ApiError.js';

initWebPush();

const router = Router();

router.get('/vapid-public-key', (req, res) => {
  const key = getVapidPublicKey();
  if (!key) throw new ApiError(503, 'Push notifications not configured');
  res.json({ success: true, data: { publicKey: key } });
});

router.post('/subscribe', protect, async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new ApiError(400, 'Invalid subscription: endpoint and keys required');
    }
    const userModel = req.accountType === 'admin' ? 'Admin' : 'User';
    const userId = req.user._id;

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId,
        userModel,
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
        userAgent: req.headers['user-agent'],
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/unsubscribe', protect, async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) throw new ApiError(400, 'Endpoint required');
    await PushSubscription.deleteOne({ endpoint });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
