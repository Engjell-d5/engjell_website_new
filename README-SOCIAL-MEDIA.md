# Social Media Scheduling Feature

This feature allows you to schedule posts to multiple social media platforms (LinkedIn, Twitter/X, Instagram, and Threads) directly from your admin panel.

## Features

- ✅ Schedule posts to multiple platforms simultaneously
- ✅ Add images to posts
- ✅ View scheduled, published, and failed posts
- ✅ Edit or delete scheduled posts
- ✅ Automatic publishing via cron job
- ✅ Connection status for each platform

## Setup Instructions

### 1. Database Migration

First, run the database migration to create the necessary tables:

```bash
npx prisma migrate dev --name add_social_media
npx prisma generate
```

### 2. Platform OAuth Setup

To connect each platform, you'll need to set up OAuth credentials. Here's what's needed for each:

#### LinkedIn
1. Create a LinkedIn app at [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Add the OAuth 2.0 redirect URL: `https://yourdomain.com/api/social/callback/linkedin`
3. Request the `w_member_social` permission
4. Add environment variables:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

#### Twitter/X
1. Apply for Twitter API access at [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app and generate OAuth 2.0 credentials
3. Add callback URL: `https://yourdomain.com/api/social/callback/twitter`
4. Add environment variables:
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   ```
   **Note**: `TWITTER_BEARER_TOKEN` is optional and only needed for read-only Bearer token authentication. OAuth 2.0 user authentication doesn't require it.
   
   For detailed setup instructions, see [README-TWITTER-SETUP.md](./README-TWITTER-SETUP.md)

#### Instagram
1. Create a Facebook App at [Facebook Developers](https://developers.facebook.com/)
2. Add Instagram Graph API product
3. Set up OAuth redirect URIs
4. Add environment variables:
   ```
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   ```
   
   For detailed setup instructions, see [README-INSTAGRAM-SETUP.md](./README-INSTAGRAM-SETUP.md)

#### Threads
1. Create a Facebook App at [Facebook Developers](https://developers.facebook.com/)
2. Add **Threads** product to your Facebook App (can use the same app as Instagram)
3. Set up OAuth redirect URIs
4. Add environment variables (same as Instagram):
   ```
   FACEBOOK_APP_ID=your_app_id  # Same as Instagram
   FACEBOOK_APP_SECRET=your_app_secret  # Same as Instagram
   ```
   
   **Note**: Threads uses the same Facebook App as Instagram, so you can reuse the same credentials!
   
   For detailed setup instructions, see [Meta Threads API Documentation](https://developers.facebook.com/docs/threads)

### 3. Environment Variables

Add these to your `.env.local` file:

```env
# Social Media OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_BEARER_TOKEN=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Encryption key for storing tokens securely
ENCRYPTION_KEY=your_random_encryption_key_here

# Cron secret for secure cron job calls (optional)
CRON_SECRET=your_random_cron_secret
```

### 4. Implement Platform Integrations

The current implementation includes placeholder functions in `lib/social.ts`. You'll need to implement the actual API calls for each platform:

1. **LinkedIn**: Use the LinkedIn Share API or Post API
2. **Twitter/X**: Use the Twitter API v2 Tweet endpoint
3. **Instagram**: Use the Instagram Graph API
4. **Threads**: Implement when Meta releases the API

Example integration structure:
- `lib/social/linkedin.ts` - LinkedIn API implementation
- `lib/social/twitter.ts` - Twitter/X API implementation
- `lib/social/instagram.ts` - Instagram API implementation
- `lib/social/threads.ts` - Threads API implementation

### 5. OAuth Callback Routes

You'll need to create callback routes for each platform:
- `app/api/social/callback/linkedin/route.ts`
- `app/api/social/callback/twitter/route.ts`
- `app/api/social/callback/instagram/route.ts`
- `app/api/social/callback/threads/route.ts`

These routes will:
1. Exchange authorization codes for access tokens
2. Store tokens securely in the database
3. Fetch user profile information
4. Redirect back to the admin panel

### 6. Token Management

Consider implementing:
- Token encryption before storing in database
- Token refresh logic for expired tokens
- Token expiration checking before publishing

## Usage

1. Navigate to Admin Panel → Social Media
2. Connect your social media accounts (one-time OAuth flow)
3. Create a new scheduled post:
   - Enter your content
   - Optionally add an image URL
   - Select platforms
   - Choose scheduled date/time
4. Posts will automatically publish at the scheduled time

## Character Limits

- LinkedIn: 3,000 characters
- Twitter/X: 280 characters
- Instagram: 2,200 characters
- Threads: 500 characters

The system will validate content length before scheduling.

## Cron Job

The publishing cron job runs every 5 minutes to check for scheduled posts.

### Initializing Cron Jobs

Cron jobs can be initialized in several ways:

1. **Automatic**: Visit the admin dashboard (`/admin`) or social media page (`/admin/social`)
2. **Manual API call**: `GET /api/cron/init`
3. **Status endpoint**: `GET /api/cron/status` (auto-initializes if not running)
4. **Admin dashboard**: Click "Initialize All" button in the CRON JOBS section

### Checking Status

Check if cron jobs are running:
```
GET /api/cron/status
```

### Manual Publishing

You can also manually trigger publishing by calling:

```
POST /api/social/publish
```

With the cron secret header:
```
X-Cron-Secret: your_cron_secret
```

### Important: Serverless Environment Notes

**For Development/Local Server:**
- Cron jobs will run continuously as long as your server is running
- They initialize automatically when you visit admin pages

**For Production (Vercel/Serverless):**
- In-memory cron jobs don't persist across cold starts
- Each serverless function instance has its own memory
- **Recommended Solution**: Use external cron service or Vercel Cron Jobs to call `/api/social/publish` directly

**Vercel Cron Jobs Setup:**
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/social/publish",
    "schedule": "*/5 * * * *"
  }]
}
```

**External Cron Service:**
Use services like cron-job.org or EasyCron to call:
```
POST https://yourdomain.com/api/social/publish
Header: X-Cron-Secret: your_cron_secret
```
Every 5 minutes.

## Next Steps

1. ✅ Database schema created
2. ✅ Admin UI created
3. ✅ API routes created
4. ✅ LinkedIn OAuth flow implemented
5. ✅ LinkedIn publishing logic implemented
6. ✅ Twitter OAuth 2.0 flow implemented (with PKCE)
7. ✅ Twitter publishing logic implemented
8. ✅ Token refresh logic implemented (LinkedIn & Twitter)
9. ✅ Instagram OAuth flow implemented (via Facebook)
10. ✅ Instagram publishing logic implemented
11. ✅ Token refresh logic implemented (LinkedIn, Twitter & Instagram)
12. ⏳ Implement OAuth flows for Threads
13. ⏳ Implement publishing logic for Threads
14. ⏳ Add token encryption/security
15. ⏳ Add error handling and retry logic

## Notes

- The current implementation is a foundation that needs platform-specific OAuth and API integrations
- Token security is critical - ensure tokens are encrypted at rest
- Each platform has different rate limits - implement rate limiting if needed
- Test thoroughly with each platform's sandbox/test mode before going live
