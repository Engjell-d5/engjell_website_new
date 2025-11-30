import { NextRequest, NextResponse } from 'next/server';
import { getTwitterAccessToken, getTwitterProfile } from '@/lib/social/twitter';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    console.log('[TWITTER] Callback received:', {
      hasCode: !!code,
      hasError: !!error,
      error,
      errorDescription,
      state,
      url: request.url,
    });

    if (error) {
      console.error('[TWITTER] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/admin/social?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`,
          BASE_URL
        )
      );
    }

    if (!code) {
      console.error('[TWITTER] No authorization code received');
      return NextResponse.redirect(
        new URL('/admin/social?error=no_code', BASE_URL)
      );
    }

    // Get code verifier from cookie (set during OAuth initiation)
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;

    console.log('[TWITTER] Code verifier check:', {
      hasCodeVerifier: !!codeVerifier,
      codeVerifierLength: codeVerifier?.length || 0,
      allCookies: Array.from(cookieStore.getAll()).map(c => c.name),
    });

    if (!codeVerifier) {
      console.error('[TWITTER] No code verifier found in cookies');
      return NextResponse.redirect(
        new URL('/admin/social?error=missing_code_verifier', BASE_URL)
      );
    }

    try {
      console.log('[TWITTER] Attempting to exchange code for access token...');
      // Exchange code for access token
      const tokenData = await getTwitterAccessToken(code, codeVerifier);
      console.log('[TWITTER] Token exchange successful, fetching profile...');
      
      // Get user profile to store username and profile image
      const profile = await getTwitterProfile(tokenData.access_token);
      console.log('[TWITTER] Profile fetched successfully:', {
        id: profile.id,
        username: profile.username,
        name: profile.name,
      });
      
      // Calculate expiration date
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null;

      // Get display name
      const username = profile.username || profile.name || 'Twitter User';
      const displayName = profile.name || profile.username || 'Twitter User';
      
      // Get profile image if available
      const profileImage = profile.profile_image_url || null;

      // Store or update connection in database
      await prisma.socialConnection.upsert({
        where: { platform: 'twitter' },
        create: {
          platform: 'twitter',
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt,
          isActive: true,
          username: displayName,
          profileImage,
        },
        update: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt,
          isActive: true,
          username: displayName,
          profileImage,
        },
      });

      // Clear the code verifier cookie
      const response = NextResponse.redirect(
        new URL('/admin/social?connected=twitter', BASE_URL)
      );
      response.cookies.delete('twitter_code_verifier');
      
      return response;
    } catch (error: any) {
      console.error('Error during Twitter OAuth callback:', error);
      return NextResponse.redirect(
        new URL(
          `/admin/social?error=${encodeURIComponent(error.message || 'oauth_failed')}`,
          BASE_URL
        )
      );
    }
  } catch (error: any) {
    console.error('Error in Twitter callback route:', error);
    return NextResponse.redirect(
      new URL('/admin/social?error=server_error', BASE_URL)
    );
  }
}
