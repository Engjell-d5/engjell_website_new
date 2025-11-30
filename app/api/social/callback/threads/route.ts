import { NextRequest, NextResponse } from 'next/server';
import { 
  getThreadsAccessToken, 
  getThreadsUser,
  verifyThreadsAccount
} from '@/lib/social/threads';
import { prisma } from '@/lib/prisma';

const THREADS_APP_ID = process.env.THREADS_APP_ID || process.env.FACEBOOK_APP_ID;
const THREADS_APP_SECRET = process.env.THREADS_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID; // Still needed for Pages/Instagram access
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET; // Still needed for Pages/Instagram access
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    if (error) {
      console.error('[THREADS] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/admin/social?error=${encodeURIComponent(errorDescription || error)}`,
          BASE_URL
        )
      );
    }

    if (!code) {
      const expectedRedirectUri = `${BASE_URL.replace(/\/+$/, '')}/api/social/callback/threads`;
      const actualCallbackUrl = request.url;
      
      console.error('[THREADS] No authorization code received in callback');
      console.error('[THREADS] Expected redirect URI:', expectedRedirectUri);
      console.error('[THREADS] Actual callback URL:', actualCallbackUrl);
      console.error('[THREADS] Query params:', Object.fromEntries(request.nextUrl.searchParams));
      
      // Check if there's an error in the query params
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (errorParam) {
        console.error('[THREADS] Facebook OAuth error:', errorParam, errorDescription);
        let errorMsg = `Facebook OAuth error: ${errorDescription || errorParam}`;
        
        // Provide helpful guidance for common errors
        if (errorDescription?.includes('redirect_uri') || errorParam === 'redirect_uri_mismatch') {
          errorMsg += `\n\n❌ Redirect URI Mismatch!\n\n` +
            `Expected redirect URI: ${expectedRedirectUri}\n\n` +
            `To fix this:\n` +
            `1. Go to Facebook App → Products → Facebook Login → Settings\n` +
            `2. Under "Valid OAuth Redirect URIs", add EXACTLY:\n` +
            `   ${expectedRedirectUri}\n` +
            `3. Also add to "App Domains" (without https://):\n` +
            `   ${BASE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}\n` +
            `4. Click "Save Changes" and wait 2-3 minutes for changes to propagate`;
        }
        
        return NextResponse.redirect(
          new URL(`/admin/social?error=${encodeURIComponent(errorMsg)}`, BASE_URL)
        );
      }
      
      return NextResponse.redirect(
        new URL(`/admin/social?error=${encodeURIComponent(`OAuth callback did not receive authorization code. Expected redirect URI: ${expectedRedirectUri}. Make sure this EXACT URI is added in Threads API → Settings → Valid OAuth Redirect URIs.`)}`, BASE_URL)
      );
    }

    try {
      // Exchange code for access token
      console.log('[THREADS] Exchanging authorization code for access token...');
      const tokenData = await getThreadsAccessToken(code);
      
      // Get Threads user profile directly using Threads API /me endpoint
      // Threads.net OAuth doesn't support Facebook Page scopes, so we use /me directly
      console.log('[THREADS] Fetching Threads user profile from /me endpoint...');
      let threadsUser;
      let threadsAccountId: string;
      let threadsUsername: string;
      
      try {
        threadsUser = await getThreadsUser(tokenData.access_token);
        threadsAccountId = threadsUser.id;
        threadsUsername = threadsUser.username || `threads_${threadsAccountId}`;
        console.log('[THREADS] Threads user from /me:', threadsUser);
        console.log('[THREADS] Threads account ID (for publishing):', threadsAccountId);
        console.log('[THREADS] Threads username:', threadsUsername);
        
        // Verify the account can be accessed (this helps catch permission issues early)
        const canAccess = await verifyThreadsAccount(tokenData.access_token, threadsAccountId);
        if (!canAccess) {
          console.warn('[THREADS] Account verification failed, but continuing with connection...');
        }
      } catch (error) {
        console.error('[THREADS] Failed to get Threads user from /me endpoint:', error);
        throw new Error(`Failed to get Threads user. Make sure:\n` +
          `1. Your Threads account is properly set up\n` +
          `2. You've accepted the app invitation (if in Development Mode)\n` +
          `3. You've granted all requested permissions\n` +
          `Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Calculate expiration date (long-lived tokens expire in 60 days)
      const expiresIn = tokenData.expires_in || 60 * 24 * 60 * 60; // Default to 60 days
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Store or update connection in database
      // Threads API uses Threads user access token directly (not page access token)
      const profileImage = null; // Threads API doesn't provide profile image in basic endpoint

      // Store the connection with Threads access token
      // Store Threads account ID in username field as "username|threads_id" for retrieval
      const usernameWithIds = `${threadsUsername}|${threadsAccountId}`;
      
      await prisma.socialConnection.upsert({
        where: { platform: 'threads' },
        create: {
          platform: 'threads',
          accessToken: tokenData.access_token, // Use Threads user access token directly
          refreshToken: tokenData.access_token, // Same token for refresh
          expiresAt,
          isActive: true,
          username: usernameWithIds, // Store "username|threads_id"
          profileImage,
        },
        update: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.access_token,
          expiresAt,
          isActive: true,
          username: usernameWithIds,
          profileImage,
        },
      });

      console.log('[THREADS] Connection stored successfully');

      // Redirect back to admin panel
      return NextResponse.redirect(
        new URL('/admin/social?connected=threads', BASE_URL)
      );
    } catch (error: any) {
      console.error('[THREADS] Error during Threads OAuth callback:', error);
      return NextResponse.redirect(
        new URL(
          `/admin/social?error=${encodeURIComponent(error.message || 'oauth_failed')}`,
          BASE_URL
        )
      );
    }
  } catch (error: any) {
    console.error('[THREADS] Error in Threads callback route:', error);
    return NextResponse.redirect(
      new URL('/admin/social?error=server_error', BASE_URL)
    );
  }
}
