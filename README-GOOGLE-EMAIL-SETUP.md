# Google Email Integration Setup Guide

This guide will help you set up Google OAuth for the email integration feature.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name for reference

## Step 2: Enable Gmail API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on "Gmail API" and click **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: Your app name
     - User support email: Your email
     - Developer contact information: Your email
   - Click **Save and Continue**
   - Add scopes (if needed):
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Click **Save and Continue**
   - Add test users (your email) if in testing mode
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Email Integration" (or any name)
   - **Authorized redirect URIs**: Add the following:
     ```
     http://localhost:3000/api/email/callback
     ```
     If you're deploying to production, also add:
     ```
     https://yourdomain.com/api/email/callback
     ```
   - Click **Create**

5. **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately (you won't be able to see the secret again)

## Step 4: Configure Environment Variables

1. Open your `.env.local` file (or create it if it doesn't exist)
2. Add the following variables:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For production**, update `NEXT_PUBLIC_SITE_URL` to your production URL:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Step 5: Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Troubleshooting

### Error: "invalid_client" (Error 401)

This error usually means one of the following:

1. **Client ID or Secret is incorrect**
   - Double-check that you copied the Client ID and Client Secret correctly
   - Make sure there are no extra spaces or line breaks
   - Verify the values in your `.env.local` file

2. **Redirect URI mismatch**
   - The redirect URI in your Google Cloud Console must **exactly** match:
     - For local: `http://localhost:3000/api/email/callback`
     - For production: `https://yourdomain.com/api/email/callback`
   - Check for:
     - Trailing slashes (should NOT have one)
     - HTTP vs HTTPS
     - Port numbers
     - Exact path: `/api/email/callback`

3. **Environment variables not loaded**
   - Make sure the file is named `.env.local` (not `.env.local.txt`)
   - Restart your development server after adding variables
   - Verify variables are loaded by checking `process.env.GOOGLE_CLIENT_ID` in your code

4. **OAuth Consent Screen not configured**
   - Make sure you've completed the OAuth consent screen setup
   - If in testing mode, add your email as a test user

### Verify Your Setup

To verify your environment variables are loaded:

1. Check the server console when starting - it should not show "Google OAuth not configured"
2. Try accessing `/api/email/connect` - it should redirect to Google, not show an error

### Common Redirect URI Issues

**Wrong:**
- `http://localhost:3000/api/email/callback/` (trailing slash)
- `http://localhost:3000/email/callback` (missing `/api`)
- `https://localhost:3000/api/email/callback` (HTTPS on localhost)

**Correct:**
- `http://localhost:3000/api/email/callback` (for local development)
- `https://yourdomain.com/api/email/callback` (for production)

## Testing

1. Go to `/admin/email` in your application
2. Click "Connect Google Account"
3. You should be redirected to Google's OAuth consent screen
4. After authorizing, you'll be redirected back to `/admin/email?connected=true`

## Production Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_SITE_URL` in your production environment variables
2. Add your production redirect URI to Google Cloud Console:
   - `https://yourdomain.com/api/email/callback`
3. If your OAuth consent screen is still in "Testing" mode, you'll need to:
   - Publish your app in Google Cloud Console, OR
   - Add all users who need access as test users

## Security Notes

- Never commit `.env.local` to version control
- Keep your Client Secret secure
- Use different OAuth credentials for development and production
- Regularly rotate your OAuth credentials
