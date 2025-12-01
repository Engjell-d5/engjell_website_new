import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getGoogleAccessToken, getGoogleProfile } from '@/lib/google-email';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', BASE_URL));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/email?error=${encodeURIComponent(error)}`, BASE_URL)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/email?error=missing_code', BASE_URL)
      );
    }

    // Exchange code for tokens
    const tokenData = await getGoogleAccessToken(code);
    
    // Get user profile
    const profile = await getGoogleProfile(tokenData.access_token);
    
    // Calculate expiration
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    // Store connection in database
    const existing = await prisma.googleConnection.findFirst();
    
    if (existing) {
      await prisma.googleConnection.update({
        where: { id: existing.id },
        data: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || existing.refreshToken,
          expiresAt,
          email: profile.email,
          isActive: true,
        },
      });
    } else {
      await prisma.googleConnection.create({
        data: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt,
          email: profile.email,
          isActive: true,
        },
      });
    }

    return NextResponse.redirect(
      new URL('/admin/email?connected=true', BASE_URL)
    );
  } catch (error: any) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL(
        `/admin/email?error=${encodeURIComponent(error.message || 'OAuth failed')}`,
        BASE_URL
      )
    );
  }
}
