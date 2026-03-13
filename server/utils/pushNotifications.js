import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

let initialized = false;

export const initWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not set - push notifications disabled. Run: npx web-push generate-vapid-keys');
    return null;
  }
  webpush.setVapidDetails('mailto:gowind.tech@gmail.com', publicKey, privateKey);
  initialized = true;
  return { publicKey };
};

export const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY;

export const sendPushToAdmins = async (title, body, url = '/admin/orders') => {
  if (!initialized || !process.env.VAPID_PRIVATE_KEY) return;
  try {
    const subs = await PushSubscription.find({ userModel: 'Admin' }).lean();
    const payload = JSON.stringify({ title, body, url });
    await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          { TTL: 60 }
        )
      )
    );
  } catch (err) {
    console.error('Push to admins failed:', err.message);
  }
};

export const sendPushToUser = async (userId, title, body, url = '/orders') => {
  if (!initialized || !process.env.VAPID_PRIVATE_KEY) return;
  try {
    const subs = await PushSubscription.find({ userId, userModel: 'User' }).lean();
    const payload = JSON.stringify({ title, body, url });
    await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          { TTL: 60 }
        )
      )
    );
  } catch (err) {
    console.error('Push to user failed:', err.message);
  }
};
