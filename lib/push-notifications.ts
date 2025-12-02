import { prisma } from './prisma';
import webpush from 'web-push';

// Initialize web-push with VAPID keys from environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@engjellrraklli.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: {
    url?: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Send push notification to all subscriptions for a user
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icon-192.png',
          badge: payload.badge || '/icon-192.png',
          tag: payload.tag || 'admin-notification',
          requireInteraction: payload.requireInteraction || false,
          data: payload.data || {},
          actions: payload.actions || [],
        })
      );
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  // Remove failed subscriptions (likely expired/invalid)
  const failedSubscriptions = subscriptions.filter(
    (_, index) => results[index].status === 'rejected'
  );

  if (failedSubscriptions.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: {
        id: { in: failedSubscriptions.map((s) => s.id) },
      },
    });
  }

  return { sent, failed };
}

/**
 * Send push notification to all admin users
 */
export async function sendPushNotificationToAllAdmins(
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  const adminUsers = await prisma.user.findMany({
    where: { role: 'admin' },
  });

  const results = await Promise.allSettled(
    adminUsers.map((user) => sendPushNotificationToUser(user.id, payload))
  );

  const totalSent = results
    .filter((r) => r.status === 'fulfilled')
    .reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.sent : 0), 0);

  const totalFailed = results
    .filter((r) => r.status === 'fulfilled')
    .reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.failed : 0), 0);

  return { sent: totalSent, failed: totalFailed };
}
