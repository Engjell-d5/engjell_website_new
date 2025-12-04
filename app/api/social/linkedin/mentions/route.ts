import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { ensureValidToken } from '@/lib/social';
import { searchLinkedInPeople } from '@/lib/social/linkedin';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords');
    const organizationUrn = searchParams.get('organizationUrn');

    if (!keywords) {
      return NextResponse.json(
        { error: 'Keywords parameter is required' },
        { status: 400 }
      );
    }

    if (!organizationUrn) {
      return NextResponse.json(
        { error: 'Organization URN parameter is required' },
        { status: 400 }
      );
    }

    // Get LinkedIn connection
    const connection = await prisma.socialConnection.findFirst({
      where: {
        platform: 'linkedin',
        isActive: true,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'No active LinkedIn connection found' },
        { status: 404 }
      );
    }

    // Ensure token is valid
    const validToken = await ensureValidToken(connection);

    // Search for people
    const people = await searchLinkedInPeople(validToken, keywords, organizationUrn);

    return NextResponse.json({ people });
  } catch (error) {
    console.error('Error searching LinkedIn people:', error);
    
    // If it's a permission error (403), return empty results instead of error
    // This allows the feature to degrade gracefully - organizations will still work
    if (error instanceof Error && error.message.includes('403')) {
      console.warn('[LINKEDIN] People search API not available due to permissions. Returning empty results.');
      return NextResponse.json({ people: [] });
    }
    
    // For other errors, check if it's a validation error (should return 400)
    if (error instanceof Error && (
      error.message.includes('Keywords must be') ||
      error.message.includes('Keywords contain') ||
      error.message.includes('Consecutive special characters')
    )) {
      return NextResponse.json(
        {
          error: 'Invalid search query',
          details: error.message,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Failed to search people',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

