# Instagram Integration Setup Guide

This guide will walk you through setting up Instagram posting capabilities using the Instagram Graph API via Facebook OAuth.

## Prerequisites

1. An Instagram account (must be a **Business** or **Creator** account)
2. A Facebook Page linked to your Instagram account
3. A Facebook App with Instagram Graph API access
4. Your application deployed or running locally

## Important Notes

⚠️ **Instagram Basic Display API has been deprecated** (as of December 4, 2024). This integration uses the **Instagram Graph API**, which requires:
- Instagram Business or Creator account
- Facebook Page linked to Instagram account
- Facebook App with Instagram Graph API product

## Step 1: Convert Instagram Account to Business/Creator

1. Open the Instagram mobile app
2. Go to your profile
3. Tap the menu (☰) in the top right
4. Go to **Settings** → **Account** → **Switch to Professional Account**
5. Choose **Business** or **Creator**
6. Complete the setup process

## Step 2: Link Instagram to Facebook Page

1. In Instagram, go to **Settings** → **Business** → **Page**
2. Select a Facebook Page to link (or create a new one)
3. Complete the linking process

**Important**: You must have admin access to the Facebook Page.

## Step 3: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type
4. Fill in:
   - **App Name**: Your app name (e.g., "Engjell Website")
   - **App Contact Email**: Your email
   - **Business Account**: (optional)

## Step 4: Add Instagram Graph API Product

1. In your Facebook App dashboard, go to **"Add Products"**
2. Find **"Instagram Graph API"** and click **"Set Up"**
3. Follow the setup wizard
   
## Step 5: Configure OAuth Settings

1. In your app dashboard, go to **"Settings"** → **"Basic"**
2. Add **"App Domains"**: 
   - For production: `yourdomain.com` (just the domain, no `https://`)
   - For ngrok: `nonephemeral-indeterminably-ellie.ngrok-free.dev` (the FULL subdomain, no `https://`)
   - **Important**: Add one domain per line, or comma-separated
3. Add **"Privacy Policy URL"**: `https://yourdomain.com/privacy` (required)
4. Add **"Terms of Service URL"**: `https://yourdomain.com/terms` (optional)
5. Click **"Add Platform"** → **"Website"**
   - Add your site URL: 
     - Production: `https://yourdomain.com`
     - ngrok: `https://nonephemeral-indeterminably-ellie.ngrok-free.dev`
6. Click **"Save Changes"**

## Step 6: Configure Redirect URI (Facebook Login Settings)

Instagram uses Facebook OAuth, so the redirect URI is configured in **Facebook Login** settings, not Instagram Graph API settings:

1. In your app dashboard, go to **"Products"** → **"Facebook Login"** → **"Settings"**
2. **Enable OAuth Logins** (IMPORTANT):
   - Under **"Client OAuth Login"**, toggle it to **ON** (enabled)
   - Under **"Web OAuth Login"**, toggle it to **ON** (enabled)
3. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   https://yourdomain.com/api/social/callback/instagram
   ```
   For ngrok/local development:
   ```
   https://abc123.ngrok-free.app/api/social/callback/instagram
   ```
4. Click **"Save Changes"**

**Note**: If Facebook Login product is not added, you may need to add it first (it's usually added automatically when you add Instagram Graph API).

## Step 7: Get App Credentials

1. In your app dashboard, go to **"Settings"** → **"Basic"**
2. Note your **App ID** and **App Secret**
3. **Important**: Keep your App Secret secure - never commit it to version control!

## Step 8: Request Permissions

Your app needs these permissions (scopes):

- `instagram_basic` - Basic access to Instagram account
- `instagram_content_publish` - Permission to publish content to Instagram
- `pages_read_engagement` - Read access to Facebook Page (required since Instagram must be linked to a Page)
- `pages_show_list` - List Facebook Pages (to select the connected Instagram account)

These permissions are automatically requested during the OAuth flow.

## Step 9: App Review Status

### Development Mode (Your Own Accounts)

**You do NOT need app review for development/testing** if:
- You're using the Facebook account that **owns/created the app**
- You're connecting Instagram accounts linked to Pages that account manages
- The app is in **Development Mode**

In Development Mode:
- ✅ You can test Instagram posting with your own accounts
- ✅ All permissions work without review
- ✅ OAuth flow works normally
- ❌ Other users cannot connect their accounts

**Important**: If you're getting the error "The user has not accepted the invite to test the app" (error code 1349245), see the troubleshooting section below.

### Production Mode (Other Users' Accounts)

**App Review IS required** if you want:
- Other users to connect their Instagram accounts
- Your app to work with accounts you don't own
- The app to be used in production by multiple users

**Required Permissions for Review:**
1. Go to **"App Review"** → **"Permissions and Features"**
2. Request permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
   - `pages_show_list`
3. Submit a detailed screencast showing how your app uses these permissions
4. Fill out the submission form with test credentials
5. Wait for Meta's review (typically 3-7 business days)

**Important**: App Review is NOT the same as "publishing" your app. Your app can work in Development Mode for your own accounts without being "published" or going through review.

## Step 10: Environment Variables

Add these to your `.env.local` file:

```env
# Facebook/Instagram OAuth Credentials
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### For Local Development with Instagram Testing

⚠️ **Important**: Instagram requires publicly accessible URLs for images. `localhost` won't work for Instagram posting.

**Option 1: Use ngrok (Recommended for Development)**

See **[NGROK-SETUP.md](./NGROK-SETUP.md)** for detailed instructions. Quick start:

1. Install ngrok: Download from [ngrok.com](https://ngrok.com/) or use `choco install ngrok`
2. Configure: `ngrok config add-authtoken YOUR_TOKEN`
3. Start ngrok: `npm run ngrok` (or `ngrok http 3000`)
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
5. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
   ```
6. Update Facebook App redirect URI to: `https://abc123.ngrok-free.app/api/social/callback/instagram`
7. Restart your Next.js dev server

**Option 2: Test in Production**

Deploy your app and use production URLs for testing Instagram posting.

**Option 3: Development Without Images**

You can test the OAuth flow with `localhost`, but posting won't work until images are accessible.

## Step 11: Test the Integration

### If using ngrok for Instagram testing:

1. **Start ngrok** (in a separate terminal):
   ```powershell
   npm run ngrok
   ```
   Or manually: `ngrok http 3000`

2. **Copy the ngrok HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

3. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SITE_URL=https://abc123.ngrok-free.app
   ```

4. **Update Facebook App redirect URI**:
   - Go to Facebook App → **Products** → **Facebook Login** → **Settings**
   - Under **"Valid OAuth Redirect URIs"**, add:
     ```
     https://abc123.ngrok-free.app/api/social/callback/instagram
     ```
   - Click **Save Changes**
   
   **Note**: The redirect URI is in **Facebook Login** settings (not Instagram Graph API) because Instagram uses Facebook OAuth.

5. **Start your development server**:
   ```bash
   npm run dev
   ```

6. Navigate to your admin panel using the ngrok URL: `https://abc123.ngrok-free.app/admin/social`

### If testing OAuth only (without posting):

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your admin panel: `http://localhost:3000/admin/social`

3. Click **"Connect Account"** next to Instagram

4. You'll be redirected to Facebook to authorize the app:
   - Log in with the Facebook account that has access to the Page linked to your Instagram
   - **IMPORTANT**: When prompted to grant access to Pages:
     - Select the Facebook Page(s) you want to grant access to
     - **Check the box "Grant access to all current and future pages"** if available
     - This is critical - without granting Page access, the connection will fail
   - Grant all the requested permissions (Instagram access, Pages access, etc.)

5. After authorization, you'll be redirected back to your admin panel

6. Instagram should show as **"Connected"** with your username

## Step 12: Create Your First Instagram Post

1. Click **"Schedule Post"** in the admin panel
2. Enter your content (up to 2,200 characters)
3. **Add at least one image** (Instagram requires images)
4. Select **Instagram** as one of the platforms
5. Choose a scheduled date/time
6. Click **"Schedule Post"**

**Important**: Instagram posts require at least one image. Videos are also supported but require special handling.

## Features

### ✅ Supported Features

- **OAuth 2.0 Authentication**: Secure authentication via Facebook
- **Long-lived Tokens**: Tokens last 60 days (automatically refreshed)
- **Post Text + Images**: Post content with image(s)
- **Automatic Token Refresh**: Tokens refreshed automatically before expiration
- **Scheduled Posts**: Schedule Instagram posts for future publishing
- **Multiple Images**: Support for single image posts (carousel coming soon)

### ⚠️ Limitations

- **Image Required**: Instagram requires at least one image per post
- **Single Image Posts**: Currently supports single image posts (carousel posts require additional implementation)
- **Business/Creator Account Only**: Personal Instagram accounts cannot use this API
- **Facebook Page Required**: Instagram account must be linked to a Facebook Page

## Character Limits

- **Instagram Caption**: Up to 2,200 characters
- **Images**: Recommended max 1080x1080 pixels (square) or 1080x1350 pixels (portrait)

## Image Requirements

**⚠️ IMPORTANT**: Instagram has strict requirements for images. Images that don't meet these specs will be rejected.

- **Format**: **JPEG only** (PNG, WebP, and other formats are NOT supported)
- **File Size**: **8 MB maximum**
- **Dimensions**:
  - Width: 320px minimum, 1440px maximum
  - Height: Varies based on aspect ratio
- **Aspect Ratio**: Must be between **4:5 (0.8)** and **1.91:1**
  - Square: 1:1 (supported)
  - Portrait: 4:5 (recommended for portraits)
  - Landscape: Up to 1.91:1 (recommended for landscapes)
- **Color Space**: sRGB (Instagram will convert if needed)
- **Image URLs**: Must be publicly accessible (HTTPS required in production)

## Token Management

- **Long-lived Tokens**: Access tokens last 60 days
- **Automatic Refresh**: Tokens are automatically refreshed when they're close to expiring (within 7 days)
- **Refresh Tokens**: User tokens stored for token refresh functionality
- **Secure Storage**: Tokens are stored securely in your database

## Rate Limits

Instagram Graph API has rate limits:
- **25 requests per hour per user** for posting content
- The system handles rate limiting automatically
- If you hit rate limits, you'll need to wait before posting again

## Troubleshooting

### Error: "The user has not accepted the invite to test the app" (Error Code: 1349245)

**Cause**: Your Facebook App is in Development Mode, and the Facebook account you're trying to connect is not the app owner or hasn't been added as a tester.

**Solution**:

**Option 1: Use the App Owner's Facebook Account (Easiest)**
- Make sure you're connecting with the same Facebook account that **created/owns the app**
- The app owner can always connect their accounts in Development Mode without any additional setup

**Option 2: Add the User as a Tester (For Testing with Other Accounts)**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your Facebook App
3. Go to **"Roles"** → **"Roles"** tab (or **"Settings"** → **"Basic"** → scroll to **"Roles"**)
4. Click **"Add People"** or **"Add Testers"**
5. Enter the Facebook account email or name of the person you want to add
6. Select **"Tester"** or **"Developer"** role
7. Click **"Add"**
8. The user will receive an invitation email - they must **accept the invitation**
9. Once accepted, they can connect their Instagram account

**Option 3: Switch to Production Mode (For Public Use)**
- If you want anyone to be able to connect, you need to:
  1. Complete App Review (see "Production Mode" section above)
  2. Switch your app from Development Mode to Production Mode
  3. This requires Meta's approval and typically takes 3-7 business days

**Note**: In Development Mode, only the app owner and added testers can connect accounts. This is a security feature by Meta.

### Error: "No Facebook Pages found" or "No Facebook Pages found at all"

**Causes**:
1. You didn't grant access to your Facebook Page(s) during OAuth
2. The Facebook account you're using doesn't manage any Pages
3. Missing `pages_show_list` permission

**Solution**:
1. **Disconnect and reconnect Instagram** - This is the most important step!
   - Go to `/admin/social` and disconnect Instagram if connected
   - Click "Connect Account" again
   - **During OAuth, when Facebook asks about Pages:**
     - ✅ Select the Facebook Page(s) you want to grant access to
     - ✅ **Check the box "Grant access to all current and future pages"** if available
     - ⚠️ **Do NOT skip this step** - it's required!
   
2. Verify you have a Facebook Page:
   - Go to [Facebook Pages](https://www.facebook.com/pages/manage/)
   - Make sure you have at least one Page
   - Make sure the Page is published (not draft)
   
3. Verify the Facebook account manages the Page:
   - Use the Facebook account that has admin/editor access to the Page
   - Check Page settings → Page Roles to confirm your access level
   
4. **Enable Permission in Facebook Business Integrations**:
   - Go to [Facebook Business Integrations](https://www.facebook.com/settings?tab=business_tools)
   - Find your app and click **"View and edit"**
   - Scroll to **"Show a list of the Pages you manage"** section
   - **Check the checkbox** to enable this permission
   - Click **"Save"**
   - Note: This checkbox only enables the permission. You still need to grant page access during OAuth (see step 5)
   
5. **CRITICAL: Grant Page Access During OAuth** (This is the actual fix!):
   
   **First, completely remove the app to force a fresh OAuth flow:**
   - Go to [Facebook Business Integrations](https://www.facebook.com/settings?tab=business_tools)
   - Find your app and click **"Remove"** or **"Remove App"** (this clears old permissions)
   - Confirm removal
   
   **Then reconnect:**
   - Go to your admin panel: `/admin/social`
   - Click **"Connect Account"** next to Instagram
   - You'll be redirected to Facebook for OAuth
   
   **During OAuth - you MUST see and complete the page selection:**
   - Facebook should show a screen asking about Pages
   - **If you see a page selection screen:**
     - ✅ Check the checkbox next to your Facebook Page (select it individually, not "All Pages")
     - ✅ If you see "Opt in to all current and future Pages", you can check that too
     - ✅ Click **"Continue"** or **"Allow"** after selecting
     - ❌ Do NOT skip this step!
   
   - **If you DON'T see a page selection screen:**
     - The permission might not be properly enabled
     - Go back to step 4 and ensure the checkbox is checked, then try again
     - Make sure you're using an Admin/Editor role account for the Page
   
6. If logs show `pages_show_list permission: true` but still no pages:
   - This means the permission is enabled, but page access wasn't granted during OAuth
   - The checkbox in Business Integrations enables the permission, but you must still select pages during OAuth
   - Follow step 5 above to reconnect and properly grant page access

### Error: "Found X Facebook Page(s), but none have Instagram accounts linked"

**Cause**: You have Facebook Pages, but none of them are linked to Instagram accounts.

**Solution**:
1. Make sure your Instagram account is a **Business** or **Creator** account (not personal)
2. Link your Instagram account to a Facebook Page:
   - In Instagram app: Settings → Business → Page
   - Select or create a Facebook Page to link
3. Reconnect your Instagram account after linking

### Error: "No Instagram Business accounts found"

**Cause**: Your Instagram account is not a Business or Creator account, or it's not linked to a Facebook Page.

**Solution**:
1. Convert your Instagram account to Business or Creator (see Step 1)
2. Link it to a Facebook Page (see Step 2)
3. Reconnect your Instagram account

### Error: "Instagram requires at least one image per post"

**Cause**: You tried to post without an image.

**Solution**: Always include at least one image when posting to Instagram.

### Error: "URL blocked" - "The redirect URI is not white-listed in the app's client OAuth settings"

**Cause**: The redirect URI is not properly configured, or Client/Web OAuth logins are not enabled in your Facebook App settings.

**Solution**:

1. **Enable Client and Web OAuth Logins**:
   - Go to **Products** → **Facebook Login** → **Settings**
   - Under **"Client OAuth Login"**, toggle it to **ON** (enabled)
   - Under **"Web OAuth Login"**, toggle it to **ON** (enabled)
   - Click **Save Changes**

2. **Configure App Domains** (Settings → Basic):
   - Go to **Settings** → **Basic** → **App Domains**
   - Add your domain WITHOUT `https://` and WITHOUT trailing slash:
     - For production: `engjellrraklli.com` (just the domain, no www unless you use it)
     - For ngrok: `abc123.ngrok-free.app` (just the domain)
   - Click **Save Changes**

3. **Add Valid OAuth Redirect URIs** (Facebook Login → Settings):
   - Go to **Products** → **Facebook Login** → **Settings**
   - Under **"Valid OAuth Redirect URIs"**, add the FULL redirect URI:
     - For production: `https://engjellrraklli.com/api/social/callback/instagram` (or `https://www.engjellrraklli.com/api/social/callback/instagram` if you use www)
     - For ngrok: `https://abc123.ngrok-free.app/api/social/callback/instagram`
   - ⚠️ **IMPORTANT**: Must match EXACTLY (including `https://`, no trailing slashes)
   - Click **Save Changes**

4. **Wait for propagation** (2-5 minutes) before testing again

5. **Verify your `NEXT_PUBLIC_SITE_URL` environment variable**:
   - Make sure it matches exactly what you added in Facebook settings
   - For production: `https://engjellrraklli.com` (or `https://www.engjellrraklli.com` if you use www)
   - Restart your server after changing this variable

**Note**: The redirect URI is configured in **Facebook Login** settings, NOT in Instagram Graph API settings.

### Error: "Invalid redirect URI" or "redirect_uri_mismatch"

**Cause**: The redirect URI in your Facebook App settings doesn't match the callback URL exactly. Facebook requires an EXACT match, including:
- Protocol (http vs https)
- Domain/subdomain
- Path
- No trailing slashes
- Port numbers (if any)

**Common Issues with ngrok URLs**:
- ✅ Works with `localhost:3000` but ❌ doesn't work with ngrok URL
- This usually means the redirect URI is not properly configured in Facebook Login settings

**Solution**:

1. **Check your current redirect URI**:
   - Look at your server logs when initiating OAuth - it will show the exact redirect URI being used
   - The format should be: `https://your-ngrok-url.ngrok-free.app/api/social/callback/instagram`

2. **Configure Facebook App Settings** (TWO places need to be set):

   **a) App Domains** (Settings → Basic):
   - Go to **Settings** → **Basic** → **App Domains**
   - Add your domain WITHOUT `https://` and WITHOUT trailing slash:
     - For ngrok: `abc123.ngrok-free.app` (just the domain)
     - For production: `yourdomain.com`
   - Click **Save Changes**

   **b) Valid OAuth Redirect URIs** (Facebook Login → Settings):
   - Go to **Products** → **Facebook Login** → **Settings**
   - Under **"Valid OAuth Redirect URIs"**, add the FULL redirect URI:
     - For ngrok: `https://abc123.ngrok-free.app/api/social/callback/instagram`
     - For localhost: `http://localhost:3000/api/social/callback/instagram`
     - For production: `https://yourdomain.com/api/social/callback/instagram`
   - ⚠️ **IMPORTANT**: Must match EXACTLY (including `https://`, no trailing slashes)
   - Click **Save Changes**

3. **Wait for propagation**:
   - Facebook may take 2-5 minutes to propagate changes
   - Don't test immediately after saving

4. **Verify the exact URI**:
   - Check your server console logs - it will show the exact redirect URI being sent
   - Make sure it matches EXACTLY what you added in Facebook Login settings
   - Common mistakes:
     - ❌ `https://abc123.ngrok-free.app/api/social/callback/instagram/` (trailing slash)
     - ❌ `abc123.ngrok-free.app/api/social/callback/instagram` (missing https://)
     - ✅ `https://abc123.ngrok-free.app/api/social/callback/instagram` (correct)

5. **If using ngrok and URL changes**:
   - Every time your ngrok URL changes, you MUST update both:
     - App Domains (just the domain part)
     - Valid OAuth Redirect URIs (full URL)
   - Restart your Next.js server after updating `NEXT_PUBLIC_SITE_URL` in `.env.local`

**Note**: The redirect URI is configured in **Facebook Login** settings, NOT in Instagram Graph API settings. Instagram uses Facebook OAuth, so all OAuth settings are in Facebook Login.

### Error: "Token expired" or "Invalid token"

**Solution**:
- The system should automatically refresh tokens
- If refresh fails, disconnect and reconnect your Instagram account
- Ensure your app has the necessary permissions

### Posts not publishing

**Possible causes**:
1. **Missing Image**: Instagram requires at least one image
2. **Invalid Image URL**: Image URL must be publicly accessible (localhost won't work!)
3. **Image Format**: Only JPEG and PNG are supported
4. **Rate Limit**: You may have hit the hourly rate limit
5. **Token Issues**: Token may be expired or invalid

**Solution**:
1. Check that your post includes at least one image
2. **If using localhost**: Instagram can't access `localhost:3000`. Use ngrok or test in production. See [NGROK-SETUP.md](./NGROK-SETUP.md)
3. Verify image URLs are publicly accessible - test the URL in a browser
4. Check server logs for specific error messages
5. Ensure your Instagram account is still connected
6. Check post status in the admin panel for error details

### Error: "Media download has failed. The media URI doesn't meet our requirements."

**Cause**: Instagram cannot access the image URL. This happens when:
- Using `localhost` URLs (Instagram servers can't reach your local machine)
- The image URL is not publicly accessible
- The image URL returns an error or requires authentication
- Server configuration is blocking Instagram's servers
- Image format or encoding issues

**Solution**:

1. **Verify the image is accessible**:
   - Open the image URL directly in a browser: `https://engjellrraklli.com/api/uploads/your-image.jpg`
   - The image should load directly without any redirects or authentication
   - Check browser console/network tab for any errors

2. **Check server logs**:
   - Look for `[UPLOADS]` log entries when Instagram tries to fetch the image
   - Check if Instagram's requests are being received (user-agent may contain "facebookexternalhit" or similar)
   - Look for any 403, 404, or 500 errors

3. **Verify file exists**:
   - Make sure the file actually exists in `public/uploads/` on your production server
   - Check file permissions (should be readable by the web server)

4. **Image format requirements**:
   - Instagram only accepts JPEG and PNG formats
   - File size should be under 30MB (smaller is better)
   - Image should be properly encoded (not corrupted)

5. **Server configuration issues**:
   - **Firewall/CDN**: Check if your firewall or CDN (like Cloudflare) is blocking Instagram's servers
   - **User-Agent blocking**: Some servers block requests without common user agents - the endpoint now allows all user agents
   - **SSL/TLS**: Ensure your production server has valid SSL certificates (Instagram requires HTTPS)
   - **CORS**: The endpoint includes CORS headers, but verify they're not being stripped by a proxy/CDN

6. **Test with curl** (from your server):
   ```bash
   curl -I https://engjellrraklli.com/api/uploads/your-image.jpg
   ```
   - Should return `200 OK` with `Content-Type: image/jpeg` or `image/png`
   - Check that `Access-Control-Allow-Origin: *` header is present

7. **Alternative**: If the issue persists, consider:
   - Using a CDN (Cloudinary, Imgur, AWS S3) to host images instead
   - Checking with your hosting provider if there are any restrictions on external access
   - Verifying your server allows HEAD requests (Instagram may check with HEAD first)

### "App not approved" or "Permission denied"

**Cause**: Your app may need to be submitted for review, or permissions weren't granted.

**Solution**:
1. For development, use the Facebook account that owns the app
2. Make sure you granted all required permissions during OAuth
3. For production, submit your app for review (see Step 9)

## Security Notes

1. **Never commit** your `.env.local` file to version control
2. **Store credentials securely** in production (use environment variables or secret management)
3. **Use HTTPS** in production for OAuth callbacks
4. **Rotate credentials** if they're ever exposed
5. **Monitor API usage** in Facebook Developer Portal to avoid rate limits

## API Documentation

For more details about Instagram's API, see:
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [Instagram Content Publishing Guide](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login/)

## Next Steps

Once Instagram is working, you can:
- ✅ Schedule posts with images
- ✅ Post to multiple platforms simultaneously
- ⏳ Add support for carousel posts (multiple images)
- ⏳ Add support for video posts
- ⏳ Add support for Instagram Stories (requires additional permissions)

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the OAuth flow step by step
4. Check Facebook Developer Portal for API status and rate limit information
5. Ensure your Instagram account is properly set up (Business/Creator account, linked to Facebook Page)