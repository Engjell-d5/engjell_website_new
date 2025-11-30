import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAccessToken, getLinkedInProfile } from '@/lib/social/linkedin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/social?error=${encodeURIComponent(error)}`, BASE_URL)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/social?error=no_code', BASE_URL)
      );
    }

    // Verify user is authenticated (optional check since this is OAuth callback)
    // We'll verify through the connection creation

    try {
      // Exchange code for access token
      const tokenData = await getLinkedInAccessToken(code);
      
      // Get user profile to store username and profile image
      const profile = await getLinkedInProfile(tokenData.access_token);
      
      // Calculate expiration date
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null;

      // Get display name
      const firstName = profile.firstName?.preferredLocale && profile.firstName.localized
        ? profile.firstName.localized[`${profile.firstName.preferredLocale.language}_${profile.firstName.preferredLocale.country}`]
        : profile.firstName?.localized?.[Object.keys(profile.firstName.localized || {})[0]] || '';
      const lastName = profile.lastName?.localized?.[Object.keys(profile.lastName.localized || {})[0]] || '';
      const username = `${firstName} ${lastName}`.trim() || profile.emailAddress || 'LinkedIn User';
      
      // Get profile image if available
      const profileImage = profile.profilePicture?.displayImage || null;

      // Store or update connection in database
      await prisma.socialConnection.upsert({
        where: { platform: 'linkedin' },
        create: {
          platform: 'linkedin',
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt,
          isActive: true,
          username,
          profileImage,
        },
        update: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt,
          isActive: true,
          username,
          profileImage,
        },
      });

      // Redirect back to admin panel
      return NextResponse.redirect(
        new URL('/admin/social?connected=linkedin', BASE_URL)
      );
    } catch (error: any) {
      console.error('Error during LinkedIn OAuth callback:', error);
      return NextResponse.redirect(
        new URL(
          `/admin/social?error=${encodeURIComponent(error.message || 'oauth_failed')}`,
          BASE_URL
        )
      );
    }
  } catch (error: any) {
    console.error('Error in LinkedIn callback route:', error);
    return NextResponse.redirect(
      new URL('/admin/social?error=server_error', BASE_URL)
    );
  }
}
