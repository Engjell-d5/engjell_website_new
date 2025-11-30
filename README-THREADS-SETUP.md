# Threads Integration Setup Guide

This guide will walk you through setting up Threads posting capabilities using the Threads API via Facebook OAuth.

## Prerequisites

1. A Threads account
2. A Facebook Page linked to your Threads account
3. A Facebook App with Threads API access
4. Your application deployed or running locally

## Important Notes

⚠️ **Threads API requires**:
- Threads account linked to a Facebook Page
- Facebook App with Threads API product added
- Proper OAuth scopes configured

## Step 1: Link Threads to Instagram and Facebook Page

**Important**: Threads accounts are linked to Instagram accounts, which are linked to Facebook Pages. The relationship is:
- **Facebook Page** → **Instagram Business Account** → **Threads Account**

1. Make sure your Instagram account is a **Business** or **Creator** account (not personal)
2. Link your Instagram account to a Facebook Page:
   - In Instagram: Settings → Business → Page
   - Select or create a Facebook Page to link
3. Link your Threads account to your Instagram account:
   - This is usually done automatically when you create a Threads account with the same email as your Instagram
   - Verify the connection in your Threads or Instagram settings

## Step 2: Add Threads API Product to Facebook App

**This is the critical step that fixes the "Invalid Scopes" error!**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your Facebook App (the same one you use for Instagram)
3. In your app dashboard, go to **"Add Products"** or **"Products"** → **"Add Product"**
4. Find **"Threads"** or **"Threads API"** in the product list
5. Click **"Set Up"** or **"Add"** to add the Threads product to your app
6. Follow the setup wizard if prompted

## Step 2b: Configure Threads API Access

**CRITICAL**: After adding the Threads product, you MUST configure API access:

1. In your app dashboard, look for **"Access the Threads API"** or go to **"Products"** → **"Threads"** → **"Access the Threads API"**
2. In this section, you need to add the **Threads-specific** permissions:
   - `threads_basic` - Basic access to Threads account (required)
   - `threads_content_publish` - Permission to publish content
   - `threads_manage_insights` - Access to analytics (optional but recommended)
3. Make sure these permissions are enabled/added in the "Access the Threads API" section
4. Save your changes

**Important Notes**: 
- You must add the Threads API product to your app BEFORE the Threads scopes will be recognized
- You must configure **Threads permissions** in "Access the Threads API" section for them to be valid
- **`pages_show_list` and `pages_read_engagement` are NOT configured here** - they are Facebook Page permissions that are:
  - Automatically requested during OAuth (included in the scope parameter)
  - Enabled by users in Facebook Business Integrations settings
  - Requested in App Review for production use
- Simply adding permissions in App Review is NOT enough for Threads permissions - they must be configured in the API access section

## Step 3: Configure OAuth Settings

1. In your app dashboard, go to **"Settings"** → **"Basic"**
2. Add **"App Domains"**: 
   - For production: `yourdomain.com` (just the domain, no `https://`)
   - For ngrok: `abc123.ngrok-free.app` (the FULL subdomain, no `https://`)
   - **Important**: Add one domain per line, or comma-separated
3. Add **"Privacy Policy URL"**: `https://yourdomain.com/privacy` (required)
4. Add **"Terms of Service URL"**: `https://yourdomain.com/terms` (optional)
5. Click **"Add Platform"** → **"Website"** (if not already added)
   - Add your site URL: 
     - Production: `https://yourdomain.com`
     - ngrok: `https://abc123.ngrok-free.app`
6. Click **"Save Changes"**

## Step 4: Configure Redirect URI (Threads API Settings)

Threads API uses its own OAuth system (threads.net), so the redirect URI is configured in **Threads API** settings:

1. In your app dashboard, go to **"Products"** → **"Threads"** → **"Settings"**
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   https://yourdomain.com/api/social/callback/threads
   ```
   For ngrok/local development:
   ```
   https://abc123.ngrok-free.app/api/social/callback/threads
   ```
3. Click **"Save Changes"**

**Note**: The redirect URI is configured in **Threads API** settings (not Facebook Login), because Threads uses threads.net OAuth endpoints.

**Important**: If you're also using Facebook Login (for Instagram integration), make sure **Client OAuth Login** and **Web OAuth Login** are enabled in **Products** → **Facebook Login** → **Settings**.

## Step 5: Request Permissions (App Review)

Your app needs these permissions (scopes):

**Threads Permissions** (configured in "Access the Threads API" section):
- `threads_basic` - Basic access to Threads account (required for all Threads API calls, dependency for other permissions)
- `threads_content_publish` - Permission to publish content to Threads (depends on `threads_basic`)
- `threads_manage_insights` - Access to Threads profile and post insights/analytics (depends on `threads_basic`)

**Facebook Page Permissions** (automatically requested during OAuth, NOT configured in Threads API section):
- `pages_read_engagement` - Read access to Facebook Page (required since Threads must be linked to a Page)
- `pages_show_list` - List Facebook Pages (to select the connected Threads account)

**Note**: The Page permissions (`pages_show_list` and `pages_read_engagement`) are automatically included in the OAuth scope and don't need to be configured in the Threads API section. They will be requested during the OAuth flow and users can enable them in Facebook Business Integrations.

### For Development Mode (Your Own Accounts)

**You do NOT need app review for development/testing** if:
- You're using the Facebook account that **owns/created the app**
- You're connecting Threads accounts linked to Pages that account manages
- The app is in **Development Mode**

In Development Mode:
- ✅ You can test Threads posting with your own accounts
- ✅ All permissions work without review
- ✅ OAuth flow works normally
- ❌ Other users cannot connect their accounts

**Important**: If you're getting the error "The user has not accepted the invite to test the app" (error code 1349245), see the troubleshooting section below.

### For Production Mode (Other Users' Accounts)

**App Review IS required** if you want:
- Other users to connect their Threads accounts
- Your app to work with accounts you don't own
- The app to be used in production by multiple users

**Required Permissions for Review:**
1. Go to **"App Review"** → **"Permissions and Features"**
2. Request **Threads permissions**:
   - `threads_basic` (required dependency)
   - `threads_content_publish` (for posting content)
   - `threads_manage_insights` (for analytics - optional but included)
3. Request **Page permissions** (if not already approved):
   - `pages_read_engagement` (for Page access)
   - `pages_show_list` (to list Pages)
   - **Note**: These may already be approved if you've set up Instagram, as they're the same permissions
4. Submit a detailed screencast showing how your app uses these permissions
5. Fill out the submission form with test credentials
6. Wait for Meta's review (typically 3-7 business days)

## Step 6: Environment Variables

Add these to your `.env.local` file:

```env
# Threads OAuth Credentials (separate from Facebook App ID/Secret)
# When creating a Meta app with Threads use case, you get 2 app IDs:
# 1. Facebook App ID (for Facebook/Instagram)
# 2. Threads App ID (for Threads API - use this one)
THREADS_APP_ID=your_threads_app_id_here
THREADS_APP_SECRET=your_threads_app_secret_here

# Facebook App Credentials (still needed if you use Instagram)
# These are different from Threads App ID/Secret
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional: Pre-configured Threads User Access Token
# If set, this token will be used instead of the token from OAuth connection
# Useful for testing or if you have a long-lived token you want to use directly
# The token must have threads_basic and threads_content_publish permissions
# THREADS_USER_ACCESS_TOKEN=your_long_lived_threads_user_access_token_here
```

**Important**: 
- Threads API uses **separate** App ID and App Secret (THREADS_APP_ID and THREADS_APP_SECRET)
- These are different from the Facebook App ID/Secret used for Instagram
- When creating a Meta app with Threads use case, you'll see 2 app IDs - use the **Threads App ID** for Threads API
- The code will fallback to FACEBOOK_APP_ID/FACEBOOK_APP_SECRET if THREADS_APP_ID/THREADS_APP_SECRET are not set (for backward compatibility)
- **THREADS_USER_ACCESS_TOKEN** (optional): If you have a pre-configured long-lived user access token, you can set it here. The system will use this token instead of the OAuth connection token. This is useful for testing or if you want to bypass the OAuth flow temporarily.

### For Local Development with Threads Testing

⚠️ **Important**: Threads requires publicly accessible URLs for images. `localhost` won't work for Threads posting.

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
6. Update Facebook App redirect URI to: `https://abc123.ngrok-free.app/api/social/callback/threads`
7. Restart your Next.js dev server

**Option 2: Test in Production**

Deploy your app and use production URLs for testing Threads posting.

## Step 7: Test the Integration

### If using ngrok for Threads testing:

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

4. **Update Threads App redirect URI**:
   - Go to Facebook App → **Products** → **Threads** → **Settings**
   - Under **"Valid OAuth Redirect URIs"**, add:
     ```
     https://abc123.ngrok-free.app/api/social/callback/threads
     ```
   - Click **Save Changes**
   
   **Note**: The redirect URI is in **Threads API** settings (not Facebook Login) because Threads uses threads.net OAuth.

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

3. Click **"Connect Account"** next to Threads

4. You'll be redirected to Facebook to authorize the app:
   - Log in with the Facebook account that has access to the Page linked to your Threads
   - **IMPORTANT**: When prompted to grant access to Pages:
     - Select the Facebook Page(s) you want to grant access to
     - **Check the box "Grant access to all current and future pages"** if available
     - This is critical - without granting Page access, the connection will fail
   - Grant all the requested permissions (Threads access, Pages access, etc.)

5. After authorization, you'll be redirected back to your admin panel

6. Threads should show as **"Connected"** with your username

## Step 8: Create Your First Threads Post

1. Click **"Schedule Post"** in the admin panel
2. Enter your content (up to 500 characters)
3. Optionally add an image or video
4. Select **Threads** as one of the platforms
5. Choose a scheduled date/time
6. Click **"Schedule Post"**

**Note**: Threads supports both text-only posts and posts with media (images/videos).

## Features

### ✅ Supported Features

- **OAuth 2.0 Authentication**: Secure authentication via Facebook
- **Long-lived Tokens**: Tokens last 60 days (automatically refreshed)
- **Post Text**: Text-only posts (up to 500 characters)
- **Post with Media**: Posts with images or videos
- **Automatic Token Refresh**: Tokens refreshed automatically before expiration
- **Scheduled Posts**: Schedule Threads posts for future publishing

### ⚠️ Limitations

- **Text Limit**: Threads posts are limited to 500 characters
- **Single Media**: Currently supports single image or video per post
- **Facebook Page Required**: Threads account must be linked to a Facebook Page

## Character Limits

- **Threads Post**: Up to 500 characters
- **Images**: Recommended max 1080x1080 pixels (square) or 1080x1350 pixels (portrait)
- **Videos**: Supported formats and size limits per Meta's documentation

## Troubleshooting

### Error: "Invalid Scopes: threads_basic, threads_content_publish"

**This is the most common error!**

**Cause**: The Threads API product has not been added to your Facebook App, or the permissions are not configured in the "Access the Threads API" use case.

**Solution**:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your Facebook App
3. Go to **"Add Products"** or **"Products"** → **"Add Product"**
4. Find **"Threads"** or **"Threads API"** in the product list
5. Click **"Set Up"** or **"Add"** to add the Threads product
6. **Configure the use case**: Go to **"Use cases"** → **"Access the Threads API"**
7. **Add required permissions**: Click **"Add"** next to:
   - `threads_basic` (Required - cannot be removed)
   - `threads_content_publish` (Optional - but required for posting)
   - `threads_manage_insights` (Optional - for analytics)
8. Wait a few minutes for the changes to propagate
9. Try connecting again

**Important**: 
- You cannot use Threads API scopes until the Threads API product is added to your app
- You must configure permissions in the "Access the Threads API" use case settings
- Simply adding the product is not enough - you must add the specific permissions

### Error: "InvalidScopeRequested: The combination of scopes requested are not valid" (Error Code: 1349218)

**Cause**: You're trying to request Facebook Page scopes (`pages_read_engagement`, `pages_show_list`) in Threads OAuth, but Threads.net OAuth doesn't accept these scopes.

**Solution**:
- The code has been updated to only request Threads-specific scopes
- Make sure you're using the latest version of the code
- Threads OAuth only accepts: `threads_basic`, `threads_content_publish`, `threads_manage_insights`
- If you need Facebook Page access, you'll need to use Facebook OAuth separately (not currently implemented)

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
9. Once accepted, they can connect their Threads account

**Option 3: Switch to Production Mode (For Public Use)**
- If you want anyone to be able to connect, you need to:
  1. Complete App Review (see "For Production Mode" section above)
  2. Switch your app from Development Mode to Production Mode
  3. This requires Meta's approval and typically takes 3-7 business days

**Note**: In Development Mode, only the app owner and added testers can connect accounts. This is a security feature by Meta.

### Error: "No Facebook Pages found" or "No Facebook Pages found at all"

**Causes**:
1. You didn't grant access to your Facebook Page(s) during OAuth
2. The Facebook account you're using doesn't manage any Pages
3. Missing `pages_show_list` permission

**Solution**:
1. **Disconnect and reconnect Threads** - This is the most important step!
   - Go to `/admin/social` and disconnect Threads if connected
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

### Error: "Found X Facebook Page(s), but none have Instagram accounts linked"

**Cause**: You have Facebook Pages, but none of them are linked to Instagram accounts. Since Threads accounts are linked via Instagram, you need Instagram accounts first.

**Solution**:
1. Make sure your Instagram account is a **Business** or **Creator** account (not personal)
2. Link your Instagram account to a Facebook Page:
   - In Instagram: Settings → Business → Page
   - Select or create a Facebook Page to link
3. Reconnect your Threads account after linking Instagram

### Error: "Instagram account found, but no Threads account is linked to it"

**Cause**: Your Instagram account is linked to a Facebook Page, but your Threads account is not linked to that Instagram account.

**Solution**:
1. Make sure your Threads account is linked to your Instagram account
2. Verify the connection in your Threads or Instagram settings
3. If needed, unlink and relink your Threads account to your Instagram account
4. Reconnect your Threads account in the admin panel

### Error: "URL blocked" - "The redirect URI is not white-listed in the app's client OAuth settings"

**Cause**: The redirect URI is not properly configured, or Client/Web OAuth logins are not enabled in your Facebook App settings.

**Solution**:

1. **Enable Client and Web OAuth Logins** (if using Facebook Login for Threads):
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

3. **Add Valid OAuth Redirect URIs** (Threads API → Settings):
   - Go to **Products** → **Threads** → **Settings**
   - Under **"Valid OAuth Redirect URIs"**, add the FULL redirect URI:
     - For production: `https://engjellrraklli.com/api/social/callback/threads` (or `https://www.engjellrraklli.com/api/social/callback/threads` if you use www)
     - For ngrok: `https://abc123.ngrok-free.app/api/social/callback/threads`
   - ⚠️ **IMPORTANT**: Must match EXACTLY (including `https://`, no trailing slashes)
   - Click **Save Changes**

4. **Wait for propagation** (2-5 minutes) before testing again

5. **Verify your `NEXT_PUBLIC_SITE_URL` environment variable**:
   - Make sure it matches exactly what you added in Threads settings
   - For production: `https://engjellrraklli.com` (or `https://www.engjellrraklli.com` if you use www)
   - Restart your server after changing this variable

**Note**: The redirect URI is configured in **Threads API** settings (not Facebook Login), because Threads uses threads.net OAuth endpoints.

### Error: "Invalid redirect URI" or "redirect_uri_mismatch"

**Cause**: The redirect URI in your Facebook App settings doesn't match the callback URL exactly.

**Solution**:
1. **Check your current redirect URI**:
   - Look at your server logs when initiating OAuth - it will show the exact redirect URI being used
   - The format should be: `https://your-ngrok-url.ngrok-free.app/api/social/callback/threads`

2. **Configure Facebook App Settings** (TWO places need to be set):

   **a) App Domains** (Settings → Basic):
   - Go to **Settings** → **Basic** → **App Domains**
   - Add your domain WITHOUT `https://` and WITHOUT trailing slash:
     - For ngrok: `abc123.ngrok-free.app` (just the domain)
     - For production: `yourdomain.com`
   - Click **Save Changes**

   **b) Valid OAuth Redirect URIs** (Threads API → Settings):
   - Go to **Products** → **Threads** → **Settings**
   - Under **"Valid OAuth Redirect URIs"**, add the FULL redirect URI:
     - For ngrok: `https://abc123.ngrok-free.app/api/social/callback/threads`
     - For localhost: `http://localhost:3000/api/social/callback/threads`
     - For production: `https://yourdomain.com/api/social/callback/threads`
   - ⚠️ **IMPORTANT**: Must match EXACTLY (including `https://`, no trailing slashes)
   - Click **Save Changes**

3. **Wait for propagation**:
   - Facebook may take 2-5 minutes to propagate changes
   - Don't test immediately after saving

4. **Verify the exact URI**:
   - Check your server console logs - it will show the exact redirect URI being sent
   - Make sure it matches EXACTLY what you added in Facebook Login settings

### Error: "Token expired" or "Invalid token"

**Solution**:
- The system should automatically refresh tokens
- If refresh fails, disconnect and reconnect your Threads account
- Ensure your app has the necessary permissions

### Posts not publishing

**Error: "Object with ID 'XXXXX' does not exist, cannot be loaded due to missing permissions, or does not support this operation" (Error Code: 100, Subcode: 33)**

**This is the most common publishing error!**

**Possible causes**:
1. **Tester invitation not accepted**: If your app is in Development Mode, you MUST accept the tester invitation in Threads settings
2. **Missing permissions**: The token might not have `threads_content_publish` permission granted
3. **Account not properly set up**: Threads account might not be linked to Instagram Business account
4. **Permissions not configured in app**: `threads_content_publish` might not be added in the "Access the Threads API" use case

**Solution (try in this order)**:

1. **CRITICAL: Accept Tester Invitation in Threads** (if in Development Mode):
   - Open the **Threads mobile app** or go to [threads.net](https://threads.net)
   - Go to **Settings** → **Website permissions** (or **Account settings** → **Website permissions**)
   - Look for an invitation from your app
   - **Accept the invitation** - this is REQUIRED for publishing in Development Mode
   - If you don't see an invitation, make sure you're added as a tester in the Meta App Dashboard

2. **Verify permissions in app settings**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Select your app
   - Go to **Use cases** → **Access the Threads API**
   - Make sure `threads_content_publish` is added (click "Add" button if not present)
   - Make sure `threads_basic` is present (required, cannot be removed)

3. **Add yourself as Threads Tester** (if not already):
   - Go to **App roles** → **Roles** tab
   - Click **"Add People"**
   - Add your Threads account as a **"Threads Tester"**
   - The user will receive an invitation in Threads → Settings → Website permissions

4. **Verify account setup**:
   - Make sure Threads account is linked to Instagram Business/Creator account (not personal)
   - Make sure Instagram account is linked to a Facebook Page
   - You can check this in Instagram → Settings → Business → Page

5. **Try disconnecting and reconnecting**:
   - Disconnect Threads in admin panel
   - Reconnect and grant all permissions during OAuth
   - Make sure you see `threads_content_publish` in the permission list during OAuth
   - Check server logs for the account ID being used

6. **Check token scopes** (after reconnecting):
   - Check server logs for token debug information
   - The token should have `threads_basic` and `threads_content_publish` scopes
   - If `threads_content_publish` is missing, the permission wasn't granted during OAuth

**Important Notes**:
- In Development Mode, you MUST accept the tester invitation in Threads settings before publishing will work
- The error "does not exist" often means "missing permissions" - check that `threads_content_publish` is both:
  1. Added in the app's "Access the Threads API" use case settings
  2. Granted during OAuth (you should see it in the permission screen)
  3. Accepted via tester invitation (if in Development Mode)

**Other possible causes**:
1. **Invalid Image URL**: Image URL must be publicly accessible (localhost won't work!)
2. **Image Format**: Only JPEG and PNG are supported for images
3. **Rate Limit**: You may have hit the hourly rate limit
4. **Token Issues**: Token may be expired or invalid

**Solution for other issues**:
1. **If using localhost**: Threads can't access `localhost:3000`. Use ngrok or test in production. See [NGROK-SETUP.md](./NGROK-SETUP.md)
2. Verify image URLs are publicly accessible - test the URL in a browser
3. Check server logs for specific error messages
4. Ensure your Threads account is still connected
5. Check post status in the admin panel for error details

## Security Notes

1. **Never commit** your `.env.local` file to version control
2. **Store credentials securely** in production (use environment variables or secret management)
3. **Use HTTPS** in production for OAuth callbacks
4. **Rotate credentials** if they're ever exposed
5. **Monitor API usage** in Facebook Developer Portal to avoid rate limits

## API Documentation

For more details about Threads API, see:
- [Threads API Documentation](https://developers.facebook.com/docs/threads)
- [Threads Content Publishing Guide](https://developers.facebook.com/docs/threads/content-publishing)
- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login/)

## Next Steps

Once Threads is working, you can:
- ✅ Schedule posts with text
- ✅ Schedule posts with images/videos
- ✅ Post to multiple platforms simultaneously
- ⏳ Add support for carousel posts (multiple images)
- ⏳ Add support for Threads analytics

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the OAuth flow step by step
4. Check Facebook Developer Portal for API status and rate limit information
5. Ensure your Threads account is properly set up (linked to Facebook Page)
6. **Most importantly**: Make sure the Threads API product is added to your Facebook App!
