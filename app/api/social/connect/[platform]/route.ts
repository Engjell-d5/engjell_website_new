import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getLinkedInAuthUrl } from '@/lib/social/linkedin';
import { getTwitterAuthUrl } from '@/lib/social/twitter';
import { getInstagramAuthUrl } from '@/lib/social/instagram';
import { getThreadsAuthUrl } from '@/lib/social/threads';
import { cookies } from 'next/headers';

// This route initiates OAuth flow for the specified platform
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform } = params;
    const validPlatforms = ['linkedin', 'twitter', 'instagram', 'threads'];

    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Generate OAuth URL based on platform
    let oauthUrl: string;

    switch (platform) {
      case 'linkedin':
        if (!process.env.LINKEDIN_CLIENT_ID) {
          return NextResponse.json(
            { error: 'LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables.' },
            { status: 500 }
          );
        }
        oauthUrl = getLinkedInAuthUrl();
        break;
      
      case 'twitter':
        if (!process.env.TWITTER_CLIENT_ID) {
          return NextResponse.json(
            { error: 'Twitter OAuth not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET environment variables.' },
            { status: 500 }
          );
        }
        const { url: twitterUrl, codeVerifier } = getTwitterAuthUrl();
        // Store code verifier in cookie for the callback
        // Create response with redirect and set cookie on it
        const redirectResponse = NextResponse.redirect(twitterUrl);
        redirectResponse.cookies.set('twitter_code_verifier', codeVerifier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 600, // 10 minutes
          path: '/',
        });
        return redirectResponse;
      
      case 'instagram':
        if (!process.env.FACEBOOK_APP_ID) {
        return NextResponse.json(
            { error: 'Instagram OAuth not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables.' },
            { status: 500 }
        );
        }
        oauthUrl = getInstagramAuthUrl();
        break;
      
      case 'threads':
        if (!process.env.THREADS_APP_ID && !process.env.FACEBOOK_APP_ID) {
        return NextResponse.json(
            { error: 'Threads OAuth not configured. Please set THREADS_APP_ID and THREADS_APP_SECRET environment variables (or FACEBOOK_APP_ID/FACEBOOK_APP_SECRET as fallback).' },
            { status: 500 }
        );
        }
        oauthUrl = getThreadsAuthUrl();
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid platform' },
          { status: 400 }
        );
    }

    // Redirect to OAuth URL (only for non-Twitter platforms, Twitter already returned)
    return NextResponse.redirect(oauthUrl);
  } catch (error: any) {
    console.error('Error initiating OAuth:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
