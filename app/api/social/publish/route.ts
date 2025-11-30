import { NextRequest, NextResponse } from 'next/server';
import { publishScheduledPosts } from '@/lib/social';
import { getAuthUser } from '@/lib/auth';

/**
 * API endpoint to manually trigger publishing of scheduled posts
 * This can also be called by a cron job
 */
export async function POST(request: NextRequest) {
  console.log(`[PUBLISH-API] Manual publish request received at ${new Date().toISOString()}`);
  try {
    // Allow both authenticated requests and cron jobs (with secret key)
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    const cronSecretEnv = process.env.CRON_SECRET;

    // Check if it's a cron job request
    if (cronSecret && cronSecretEnv && cronSecret === cronSecretEnv) {
      console.log(`[PUBLISH-API] Authenticated via cron secret`);
      // Cron job request
    } else {
      // Regular authenticated request
      const user = await getAuthUser(request);
      if (!user || user.role !== 'admin') {
        console.error(`[PUBLISH-API] Unauthorized request`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      console.log(`[PUBLISH-API] Authenticated as admin: ${user.email}`);
    }

    console.log(`[PUBLISH-API] Triggering publishScheduledPosts...`);
    const result = await publishScheduledPosts();
    console.log(`[PUBLISH-API] Publish complete - result object:`, JSON.stringify(result, null, 2));
    console.log(`[PUBLISH-API] published: ${result.published}, failed: ${result.failed}, total: ${result.total}`);

    const responseData = {
      success: true,
      published: result.published ?? 0,
      failed: result.failed ?? 0,
      total: result.total ?? 0,
      ...(result.message && { message: result.message }),
      ...(result.error && { error: result.error }),
    };

    console.log(`[PUBLISH-API] Response data:`, JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[PUBLISH-API] Error in publish endpoint:', error);
    if (error instanceof Error) {
      console.error('[PUBLISH-API] Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to publish posts' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to manually trigger publishing (for testing)
 */
export async function GET(request: NextRequest) {
  console.log(`[PUBLISH-API] GET request received - treating as manual trigger`);
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      console.error(`[PUBLISH-API] Unauthorized GET request`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[PUBLISH-API] Triggering publishScheduledPosts via GET...`);
    const result = await publishScheduledPosts();
    console.log(`[PUBLISH-API] Publish complete - result object:`, JSON.stringify(result, null, 2));
    console.log(`[PUBLISH-API] published: ${result.published}, failed: ${result.failed}, total: ${result.total}`);

    const responseData = {
      success: true,
      message: 'Publishing triggered',
      published: result.published ?? 0,
      failed: result.failed ?? 0,
      total: result.total ?? 0,
      ...(result.message && { message: result.message }),
      ...(result.error && { error: result.error }),
    };

    console.log(`[PUBLISH-API] Response data:`, JSON.stringify(responseData, null, 2));
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[PUBLISH-API] Error in GET publish endpoint:', error);
    if (error instanceof Error) {
      console.error('[PUBLISH-API] Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to publish posts' },
      { status: 500 }
    );
  }
}
