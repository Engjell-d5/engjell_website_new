import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { startYouTubeCron, stopYouTubeCron, restartYouTubeCron, getCronStatusWithNextRun } from '@/lib/cron';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = await getCronStatusWithNextRun();
    return NextResponse.json({
      success: true,
      cron: status.youtube,
      schedule: status.youtube.schedule || '0 2 * * *',
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
      await startYouTubeCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'YouTube cron job started',
        cron: status.youtube,
      });
    } else if (action === 'stop') {
      stopYouTubeCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'YouTube cron job stopped',
        cron: status.youtube,
      });
    } else if (action === 'restart') {
      await restartYouTubeCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'YouTube cron job restarted',
        cron: status.youtube,
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

