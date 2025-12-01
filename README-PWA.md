# PWA Setup Instructions

The admin interface can now be installed as a Progressive Web App (PWA) on Android phones and other devices.

## What's Been Set Up

✅ **Manifest file** (`/public/manifest.json`) - Defines the app metadata
✅ **Metadata configuration** - Added PWA metadata to the layout
✅ **App shortcuts** - Quick access to Social Media and Email Tasks sections

## Required Icon Files

You need to create two icon files in the `public` directory:

1. **`icon-192.png`** - 192x192 pixels (for Android home screen)
2. **`icon-512.png`** - 512x512 pixels (for Android splash screen and app drawer)

### Creating Icons

You can:
- Use an online tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- Create them manually using any image editor
- Use your existing logo/branding

**Recommended**: Use a square image with your logo/branding centered on a solid background color.

## Installing on Android

1. **Open the admin page** in Chrome on your Android phone:
   - Navigate to `https://yourdomain.com/admin` (or your local URL)
   - Make sure you're logged in

2. **Install the PWA**:
   - Chrome will show an "Install" banner at the bottom, OR
   - Tap the menu (three dots) → "Add to Home screen" or "Install app"

3. **Grant permissions** (if prompted):
   - Allow notifications (if you want push notifications in the future)
   - Allow location (if needed for any features)

4. **Launch from home screen**:
   - The app will appear on your home screen with the icon
   - Tap it to open in standalone mode (no browser UI)

## Features

- **Standalone mode**: Opens without browser UI
- **App shortcuts**: Long-press the icon to access:
  - Social Media management
  - Email Tasks
- **Offline support**: (Can be enhanced with service worker if needed)

## Testing

To test if PWA is working:

1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section - should show your manifest
4. Check "Service Workers" (if you add one later)

## Troubleshooting

**Install button not showing?**
- Make sure you're using HTTPS (or localhost for development)
- Check that `manifest.json` is accessible at `/manifest.json`
- Verify icon files exist and are the correct size

**Icons not showing?**
- Ensure `icon-192.png` and `icon-512.png` exist in the `public` folder
- Check file permissions
- Clear browser cache and try again

## Future Enhancements

You can add:
- Service worker for offline functionality
- Push notifications
- Background sync
- App updates notification
