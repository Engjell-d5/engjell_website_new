# LinkedIn Integration Setup Guide

This guide will walk you through setting up LinkedIn OAuth and API access for the social media scheduling feature.

## Prerequisites

1. A LinkedIn account
2. Access to LinkedIn Developer Portal
3. A registered app on LinkedIn

## Step 1: Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in the required information:
   - **App name**: Your app name (e.g., "Engjell Rraklli Website")
   - **LinkedIn Page**: Select your LinkedIn company page (if applicable)
   - **Privacy policy URL**: `https://yourdomain.com/privacy` (required)
   - **App logo**: Upload your logo
   - **App use case**: Select "Marketing Developer Platform"

## Step 2: Configure OAuth 2.0

1. In your app, go to the **"Auth"** tab
2. Under **"Redirect URLs"**, add your callback URL:
   ```
   https://yourdomain.com/api/social/callback/linkedin
   ```
   For local development:
   ```
   http://localhost:3000/api/social/callback/linkedin
   ```
3. Note your **Client ID** and **Client Secret**

## Step 3: Request API Products

1. Go to the **"Products"** tab
2. Request access to:
   - **Sign In with LinkedIn using OpenID Connect** (for basic auth)
   - **Share on LinkedIn** (for posting content)

3. Wait for approval (usually instant for development)

## Step 4: Request Permissions

The app needs these permissions (scopes):

- `openid` - Basic authentication
- `profile` - Access to basic profile information
- `email` - Access to email address
- `w_member_social` - Permission to post content to LinkedIn

These are automatically requested during the OAuth flow.

## Step 5: Environment Variables

Add these to your `.env.local` file:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

For local development:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 6: Database Migration

Run the database migration to create the social media tables:

```bash
npx prisma migrate dev --name add_social_media
npx prisma generate
```

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to Admin Panel → Social Media

3. Click **"Connect Account"** for LinkedIn

4. You'll be redirected to LinkedIn to authorize the app

5. After authorization, you'll be redirected back and LinkedIn should show as connected

## Step 8: Schedule Your First Post

1. Click **"Schedule Post"**
2. Enter your content (up to 3,000 characters)
3. Optionally add an image URL
4. Select LinkedIn as the platform
5. Choose a date/time in the future
6. Click **"Schedule Post"**

The post will automatically publish at the scheduled time!

## Features

- ✅ OAuth 2.0 authentication
- ✅ Automatic token refresh
- ✅ Post text content
- ✅ Post with images
- ✅ Schedule posts for future publishing
- ✅ View connection status
- ✅ See username of connected account

## Important Notes

### Character Limits
- LinkedIn posts: Up to 3,000 characters
- Images: Recommended max 1,200x627 pixels for optimal display

### Image Requirements
- Supported formats: JPEG, PNG, GIF
- Maximum file size: 100MB (but smaller is better for performance)
- The image URL must be publicly accessible

### Token Management
- Access tokens expire after 60 days
- Refresh tokens are automatically used to get new access tokens
- Tokens are stored securely in your database

### Rate Limits
- LinkedIn API has rate limits (typically 500 requests per day)
- The system handles rate limiting automatically

### Post Visibility
- All posts are published as **PUBLIC** by default
- Posts appear on your LinkedIn profile feed

## Troubleshooting

### "OAuth not configured" error
- Make sure `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` are set in your environment variables
- Restart your development server after adding environment variables

### "Failed to connect" error
- Check that your redirect URL matches exactly in LinkedIn app settings
- Ensure the callback URL is accessible (not blocked by firewall)
- Check server logs for detailed error messages

### "Failed to publish" error
- Verify your LinkedIn connection is still active
- Check that the content doesn't exceed character limits
- Ensure image URLs are publicly accessible
- Check the post status in the admin panel for specific error messages

### Token expiration issues
- The system should automatically refresh tokens
- If tokens fail to refresh, you may need to reconnect your LinkedIn account

## API Documentation

For more details about LinkedIn's API, see:
- [LinkedIn Share API](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [LinkedIn OAuth 2.0](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)

## Next Steps

Once LinkedIn is working, you can:
- Set up Twitter/X integration
- Set up Instagram integration
- Set up Threads integration
- Schedule posts to multiple platforms simultaneously
