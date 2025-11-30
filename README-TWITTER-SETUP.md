# Twitter/X API Integration Setup Guide

This guide will help you set up Twitter/X API integration for the admin panel's social media scheduling feature using the **free tier (Essential)**.

## Prerequisites

1. A Twitter/X account
2. Access to Twitter Developer Portal
3. Your application deployed or running locally

## Step 1: Create a Twitter Developer Account

1. Visit [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Apply for a developer account (if you haven't already)
4. Accept the Developer Agreement and complete the application

## Step 2: Create a Project and App

1. Once approved, go to the [Developer Portal Dashboard](https://developer.twitter.com/en/portal/dashboard)
2. Click **"Create Project"** or **"Create App"**
3. Fill in the project details:
   - **Project name**: Your project name (e.g., "Engjell Website")
   - **Use case**: Select "Making a bot" or "Exploring the API"
   - **Project description**: Brief description of your project
4. Click **"Next"** and complete the setup

## Step 3: Configure OAuth 2.0 Settings

1. In your app settings, navigate to **"User authentication settings"**
2. Click **"Set up"** or **"Edit"**
3. Configure the following:
   - **App permissions**: Select **"Read and write"** (required for posting tweets)
   - **Type of App**: Select **"Web App, Automated App or Bot"**
   - **Callback URI / Redirect URL**: 
     - For production: `https://yourdomain.com/api/social/callback/twitter`
     - For local development: `http://localhost:3000/api/social/callback/twitter`
   - **Website URL**: Your website URL
   - **App info**: Fill in required fields
4. Click **"Save"**

## Step 4: Generate OAuth 2.0 Credentials

1. In your app settings, go to **"Keys and tokens"** tab
2. Under **"OAuth 2.0 Client ID and Client Secret"**, click **"Generate"** or copy existing credentials
3. You'll get:
   - **Client ID** (also called Consumer Key)
   - **Client Secret** (also called Consumer Secret)
4. **Important**: Save these credentials securely - you won't be able to see the Client Secret again!

## Step 5: Set Up Environment Variables

Add the following to your `.env.local` file:

```env
# Twitter OAuth 2.0 Credentials (for posting tweets and uploading media)
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
```

**Important Notes**:
- **OAuth 2.0** credentials are used for both posting tweets AND uploading media
- Twitter's v2 media upload endpoint (`/2/media/upload`) supports OAuth 2.0 Bearer tokens
- The v1.1 media upload endpoints were deprecated on March 31, 2025
- You only need OAuth 2.0 credentials - no OAuth 1.0a required!

## Step 6: Configure App Settings

1. In your app settings, ensure:
   - **OAuth 2.0** is enabled
   - **Read and write** permissions are set
   - **Callback URI** matches exactly (including protocol and trailing slashes)
2. Under **"App permissions"**, make sure you have:
   - `tweet.read` - Read tweets
   - `tweet.write` - Post tweets
   - `users.read` - Read user profile
   - `offline.access` - Refresh tokens (for token refresh)
   - `media.write` - **Required for uploading images/videos** ⚠️

**Important**: If you connected your Twitter account before adding the `media.write` scope, you'll need to **disconnect and reconnect** your account to get the new permissions.

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your admin panel: `http://localhost:3000/admin/social`

3. Click **"Connect"** next to Twitter/X

4. You'll be redirected to Twitter to authorize the app

5. After authorization, you'll be redirected back to your admin panel

6. The connection status should show as **"Connected"**

## Step 8: Create Your First Scheduled Post

1. In the admin panel, click **"Create Post"**
2. Enter your tweet content (max 280 characters)
3. Optionally add an image URL
4. Select **Twitter/X** as one of the platforms
5. Choose a scheduled date/time
6. Click **"Schedule Post"**

## Features

### ✅ Supported Features

- **OAuth 2.0 with PKCE**: Secure authentication flow
- **Post Text Tweets**: Up to 280 characters
- **Post with Images**: Up to 4 images per tweet
- **Post with Video**: 1 video per tweet (may require elevated access)
- **Token Refresh**: Automatic token refresh when expired
- **Scheduled Posts**: Schedule tweets for future publishing

### ⚠️ Limitations (Free Tier)

- **Rate Limits**: 
  - 1,500 tweets per month (for Essential tier)
  - 10,000 tweets per month (if you have elevated access)
- **Media Uploads**: 
  - Images: Supported (up to 4 per tweet)
  - Videos: May require elevated access or OAuth 1.0a credentials
- **API Endpoints**: Some advanced endpoints may require elevated access

## Troubleshooting

### Error: "Invalid redirect URI" or "You weren't able to give access to the App"

This is the **most common error**. Twitter is extremely strict about redirect URI matching:

1. **Exact Match Required**: The callback URL in your Twitter app settings must **EXACTLY match** (character-for-character) the URL used in the code:
   - ✅ Correct: `http://localhost:3000/api/social/callback/twitter`
   - ❌ Wrong: `http://localhost:3000/api/social/callback/twitter/` (trailing slash)
   - ❌ Wrong: `https://localhost:3000/api/social/callback/twitter` (wrong protocol)
   - ❌ Wrong: `http://127.0.0.1:3000/api/social/callback/twitter` (different host)

2. **Check Your Environment Variable**:
   - Verify `NEXT_PUBLIC_SITE_URL` is set correctly:
     - Local: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
     - Production: `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
   - The redirect URI is constructed as: `${NEXT_PUBLIC_SITE_URL}/api/social/callback/twitter`

3. **Twitter App Settings**:
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Navigate to your app → **User authentication settings**
   - Under **Callback URI / Redirect URL**, add:
     - For local: `http://localhost:3000/api/social/callback/twitter`
     - For production: `https://yourdomain.com/api/social/callback/twitter`
   - **Important**: You can add multiple callback URLs, but each must match exactly

4. **Common Mistakes**:
   - Adding trailing slashes
   - Using `https` in local development
   - Using `127.0.0.1` instead of `localhost`
   - Port number mismatch
   - Case sensitivity (though URLs are usually case-insensitive)

5. **After Changing Callback URI**:
   - Save the changes in Twitter Developer Portal
   - Wait a few minutes for changes to propagate
   - Clear your browser cookies and try again
   - Restart your development server

### Error: "Invalid client credentials"

- Verify `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are set correctly
- Make sure there are no extra spaces or quotes in your `.env.local` file
- Regenerate credentials in Twitter Developer Portal if needed

### Error: "Media upload failed" or Images not appearing in tweets

**Most Common Cause**: Missing `media.write` scope

1. **Check if you have the `media.write` scope**:
   - If you connected your Twitter account before the scope was added, you need to reconnect
   - Go to `/admin/social` and disconnect your Twitter account
   - Click "Connect" again to reconnect with the new scope

2. **Verify scope in Twitter Developer Portal**:
   - Go to your app → **User authentication settings**
   - Under **App permissions**, ensure `media.write` is listed
   - The scopes should include: `tweet.read`, `tweet.write`, `users.read`, `offline.access`, `media.write`

3. **Check server logs**:
   - Look for `[TWITTER]` log messages when uploading
   - Common errors:
     - `401 Unauthorized` - Missing or invalid `media.write` scope
     - `403 Forbidden` - App doesn't have media upload permissions or using wrong endpoint
     - `400 Bad Request` - Invalid media format or size
   - Make sure you see `[TWITTER] Initializing media upload with OAuth 2.0...` (not OAuth 1.0a)

4. **Media Requirements**:
   - Images: Max 5MB, formats: JPG, PNG, GIF, WebP
   - Videos: Max 512MB, formats: MP4, MOV
   - Up to 4 images per tweet, or 1 video per tweet

5. **If still failing**:
   - Try posting a text-only tweet first to verify basic OAuth works
   - Check that your Twitter app has "Read and write" permissions (not just "Read")
   - Verify your access token includes the `media.write` scope
   - Ensure you're using the v2 endpoint (`/2/media/upload`) - the v1.1 endpoints are deprecated

### Error: "Token expired" or "Invalid token"

- The system should automatically refresh tokens
- If refresh fails, disconnect and reconnect your Twitter account
- Ensure `offline.access` scope is enabled in your app settings

### Posts not publishing

- Check the cron job status in the admin panel
- Verify the scheduled time has passed
- Check server logs for error messages
- Ensure your Twitter account is still connected

## Security Notes

1. **Never commit** your `.env.local` file to version control
2. **Store credentials securely** in production (use environment variables or secret management)
3. **Use HTTPS** in production for OAuth callbacks
4. **Rotate credentials** if they're ever exposed
5. **Monitor API usage** in Twitter Developer Portal to avoid rate limits

## Next Steps

- ✅ Twitter OAuth 2.0 integration complete
- ✅ Tweet publishing implemented
- ✅ Token refresh implemented
- ✅ Media uploads implemented (using v2 API with OAuth 2.0)

## Additional Resources

- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [OAuth 2.0 with PKCE Guide](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [Rate Limits Documentation](https://developer.twitter.com/en/docs/twitter-api/rate-limits)

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the OAuth flow step by step
4. Check Twitter Developer Portal for API status and rate limit information
