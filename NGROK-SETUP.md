# Using ngrok for Instagram Development

This guide explains how to use ngrok to expose your local development server so Instagram can access your image URLs.

## Why ngrok?

Instagram requires publicly accessible URLs for images. When developing locally, `localhost:3000` isn't accessible from Facebook's servers. ngrok creates a secure tunnel that makes your local server publicly accessible.

## Installation

### Option 1: Download ngrok (Recommended)

1. Go to [ngrok.com](https://ngrok.com/)
2. Sign up for a free account
3. Download ngrok for Windows
4. Extract it to a folder (e.g., `C:\ngrok\`)

### Option 2: Install via package manager

**Using Chocolatey:**
```powershell
choco install ngrok
```

**Using Scoop:**
```powershell
scoop install ngrok
```

## Setup

1. **Get your ngrok authtoken:**
   - Go to https://dashboard.ngrok.com/get-started/your-authtoken
   - Copy your authtoken

2. **Configure ngrok:**
   ```powershell
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

## Quick Start

### Method 1: Using npm scripts (Recommended)

1. **Start your Next.js dev server** (Terminal 1):
   ```powershell
   npm run dev
   ```

2. **Start ngrok** (Terminal 2):
   ```powershell
   npm run ngrok
   ```
   Or use the simple version: `npm run ngrok:simple`

3. **Copy the HTTPS URL** from the ngrok output (e.g., `https://abc123.ngrok-free.app`)

4. **Update your `.env.local` file:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
   ```

5. **Restart your Next.js dev server** (important - environment variables are loaded at startup)
   - Stop the current dev server (Ctrl+C)
   - Run `npm run dev` again

6. **Update your Facebook App settings** (⚠️ TWO places need to be updated):

   **a) App Domains** (Settings → Basic):
   - Go to **Settings** → **Basic** → **App Domains**
   - Add your ngrok domain (WITHOUT `https://` and WITHOUT trailing slash):
     ```
     abc123.ngrok-free.app
     ```
   - Click **Save Changes**

   **b) Valid OAuth Redirect URIs** (Facebook Login → Settings):
   - Go to **Products** → **Facebook Login** → **Settings**
   - ⚠️ **IMPORTANT**: This is in Facebook Login, NOT Instagram Graph API settings!
   - Under **"Valid OAuth Redirect URIs"**, add the FULL redirect URI:
     ```
     https://abc123.ngrok-free.app/api/social/callback/instagram
     ```
   - ⚠️ Must match EXACTLY (including `https://`, no trailing slashes)
   - Click **Save Changes**
   - Wait 2-5 minutes for changes to propagate before testing

7. **Test your setup:**
   - Navigate to: `https://abc123.ngrok-free.app/admin/social`
   - Connect Instagram and try posting!

### Method 2: Manual (Alternative)

1. **Start your Next.js dev server:**
   ```powershell
   npm run dev
   ```

2. **In a new terminal, start ngrok:**
   ```powershell
   ngrok http 3000
   ```

3. Follow steps 3-7 from Method 1 above

## Important Notes

### ngrok URL Changes

- **Free ngrok accounts**: Get a random URL each time (e.g., `abc123.ngrok-free.app`)
- **Paid ngrok accounts**: Can use a fixed custom domain
- If your ngrok URL changes, you need to:
  1. Update `NEXT_PUBLIC_SITE_URL` in `.env.local`
  2. Update the Facebook App redirect URI
  3. Restart your Next.js server

### Security

- The ngrok URL is publicly accessible
- Anyone with the URL can access your local development server
- Don't expose sensitive data or admin panels without authentication
- Consider using ngrok's authentication features for additional security

### Best Practices

1. **Use ngrok only for development** - Never use it in production
2. **Restart after URL changes** - Next.js loads env vars at startup
3. **Update Facebook redirect URIs** - Always update Facebook App settings when URL changes
4. **Test locally first** - Make sure everything works on localhost before using ngrok

## Troubleshooting

### ngrok URL not working

- Make sure your Next.js server is running on port 3000
- Check that ngrok is actually running: `ngrok http 3000`
- Verify the URL in ngrok dashboard: http://localhost:4040

### Environment variable not updating

- Next.js caches environment variables at build/start time
- You MUST restart your dev server after changing `.env.local`
- Try: Stop server → Update env → Start server

### Facebook OAuth redirect error

**Common issue**: Works with `localhost:3000` but not with ngrok URL.

**Solution**:
1. **Check both settings** (many people only set one):
   - ✅ **App Domains** (Settings → Basic): Add `abc123.ngrok-free.app` (just domain, no https://)
   - ✅ **Valid OAuth Redirect URIs** (Products → Facebook Login → Settings): Add `https://abc123.ngrok-free.app/api/social/callback/instagram` (full URL)

2. **Verify exact match**:
   - Check your server console logs - it shows the exact redirect URI being sent
   - Must match EXACTLY: protocol (`https://`), domain, path, no trailing slashes
   - Common mistakes:
     - ❌ Missing `https://`
     - ❌ Trailing slash: `/api/social/callback/instagram/`
     - ❌ Wrong path or typos

3. **Wait for propagation**:
   - Facebook may take 2-5 minutes to propagate changes
   - Don't test immediately after saving

4. **Note**: Redirect URI is in **Facebook Login** settings, NOT Instagram Graph API settings!

### Images still not accessible / Instagram can't fetch media

**Common issue**: Instagram error: "Media download has failed. The media URI doesn't meet our requirements."

**Possible causes:**

1. **ngrok Interstitial Page (Most Common)**:
   - Free ngrok accounts show an interstitial warning page that requires user interaction
   - Instagram's servers can't interact with this page, so they can't fetch the image
   - **Solution**: 
     - **Option A (Recommended)**: Upgrade to ngrok paid plan (removes interstitial completely)
     - **Option B**: Use a different tunneling service that doesn't show interstitials (e.g., Cloudflare Tunnel, localtunnel)
     - **Option C**: Deploy to a staging/production environment for testing
     - **Option D**: Use a CDN or image hosting service (e.g., Cloudinary, Imgur) for images instead of serving them through ngrok

2. **Image URL not publicly accessible**:
   - Test the image URL directly in a browser: `https://your-ngrok-url.ngrok-free.app/api/uploads/your-image.jpg`
   - If you see an ngrok warning page, that's the problem
   - The image should load directly without any interstitial

3. **File doesn't exist**:
   - Check server logs for "[UPLOADS] File not found" errors
   - Verify the file exists in `public/uploads/` directory

4. **CORS or authentication issues**:
   - The uploads endpoint should be publicly accessible (no auth required)
   - CORS headers have been added to allow Instagram servers to fetch images

**Quick test:**
1. Open the image URL directly in a browser
2. If you see an ngrok warning page → This is the problem (upgrade ngrok or use paid plan)
3. If the image loads directly → Check server logs for other errors
4. If 404 → File doesn't exist or path is wrong

## Alternative: Production Testing

If ngrok is too complicated or unreliable, you can:

1. Deploy to production/staging environment
2. Test Instagram posting there
3. Use production URLs for development testing

This is often more reliable but requires deploying for each test.

## Additional Resources

- [ngrok Documentation](https://ngrok.com/docs)
- [ngrok Dashboard](https://dashboard.ngrok.com/)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
