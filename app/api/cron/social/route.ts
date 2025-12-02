import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { startSocialMediaCron, stopSocialMediaCron, restartSocialMediaCron, getCronStatusWithNextRun } from '@/lib/cron';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = await getCronStatusWithNextRun();
    return NextResponse.json({
      success: true,
      cron: status.socialMedia,
      schedule: 'Runs every 5 minutes (*/5 * * * *)',
    });
  } catch (error) {
    console.error('Error getting cron status:', error);
    return NextResponse.json(
      { error: 'Failed to get cron status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    if (action === 'start') {
      await startSocialMediaCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'Social media cron job started',
        cron: status.socialMedia,
      });
    } else if (action === 'stop') {
      stopSocialMediaCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'Social media cron job stopped',
        cron: status.socialMedia,
      });
    } else if (action === 'restart') {
      await restartSocialMediaCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'Social media cron job restarted',
        cron: status.socialMedia,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start", "stop", or "restart"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error controlling cron:', error);
    return NextResponse.json(
      { error: 'Failed to control cron job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

