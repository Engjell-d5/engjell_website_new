# Push Notifications Setup

The admin PWA now supports push notifications for important events.

## Features

Push notifications are sent for:
- ✅ **Cron Jobs Completed**: When email sync/analysis cron jobs complete
- ✅ **New Emails**: When new emails are synced from Gmail
- ✅ **New Tasks**: When tasks are created from email analysis
- ✅ **Posts Published**: When social media posts are published via cron

## Setup Instructions

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications. Generate them using:

```bash
npm run generate-vapid-keys
```

Or manually:

```bash
npx tsx scripts/generate-vapid-keys.ts
```

This will output:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Add to your `.env` file
- `VAPID_PRIVATE_KEY` - Add to your `.env` file (keep secret!)
- `VAPID_SUBJECT` - Add to your `.env` file (e.g., `mailto:admin@engjellrraklli.com`)

### 2. Add to Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@engjellrraklli.com
```

**Important**: 
- The public key must start with `NEXT_PUBLIC_` to be accessible in the browser
- Keep the private key secret - never commit it to version control
- The subject should be a mailto: URL or your website URL

### 3. Enable Push Notifications

1. **Open the admin panel** in a supported browser (Chrome, Edge, Firefox)
2. **Click the bell icon** in the header to enable push notifications
3. **Grant permission** when prompted by your browser
4. **Verify subscription** - the bell icon should turn green when enabled

### 4. Service Worker

The service worker (`/public/sw.js`) is automatically registered when you enable push notifications. It handles:
- Receiving push notifications
- Displaying notifications
- Handling notification clicks (opens relevant admin page)

## How It Works

1. **Subscription**: When you enable notifications, your browser creates a push subscription
2. **Storage**: The subscription is saved to the database linked to your user account
3. **Events**: When events occur (cron jobs, new emails, tasks, posts), the server sends push notifications
4. **Delivery**: Your browser receives the notification even when the app is closed
5. **Click Action**: Clicking a notification opens the relevant admin page

## Notification Types

### Email Cron Completed
- **Trigger**: Email sync/analysis cron job finishes
- **Message**: "Email sync and analysis cron job completed"
- **Action**: Opens `/admin/email`

### New Emails Synced
- **Trigger**: New emails are synced from Gmail
- **Message**: "X new email(s) synced from Gmail"
- **Action**: Opens `/admin/email`

### New Tasks Created
- **Trigger**: Tasks are created from email analysis (cron or manual)
- **Message**: "X new task(s) created from email analysis"
- **Action**: Opens `/admin/email`

### Posts Published
- **Trigger**: Social media posts are published via cron
- **Message**: "Successfully published X post(s) to social media"
- **Action**: Opens `/admin/social`

## Troubleshooting

**Notifications not working?**
1. Check that VAPID keys are set in `.env`
2. Verify the service worker is registered (check browser DevTools → Application → Service Workers)
3. Check browser console for errors
4. Ensure you granted notification permission
5. Verify HTTPS is enabled (required for push notifications, except localhost)

**Service worker not registering?**
- Clear browser cache and reload
- Check that `/sw.js` is accessible at the root URL
- Verify the service worker file exists in `/public/sw.js`

**Notifications not received?**
- Check that push subscriptions exist in the database
- Verify the VAPID keys match between client and server
- Check server logs for push notification errors
- Ensure the user account has an active subscription

## Browser Support

Push notifications work on:
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (iOS 16.4+, macOS)
- ❌ Safari (iOS < 16.4) - Not supported

## Security

- Push subscriptions are linked to user accounts
- Only authenticated users can subscribe
- VAPID keys authenticate the server
- Notifications are encrypted end-to-end
- Expired/invalid subscriptions are automatically removed

## Testing

To test push notifications:

1. Enable notifications in the admin panel
2. Manually trigger an event (e.g., sync emails, analyze emails)
3. Check that you receive a notification
4. Click the notification to verify it opens the correct page

## Future Enhancements

Possible additions:
- Notification preferences (choose which events to receive)
- Notification history
- Rich notifications with images
- Action buttons in notifications
- Notification grouping
