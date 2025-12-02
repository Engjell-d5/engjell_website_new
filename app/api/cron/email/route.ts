import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { startEmailCron, stopEmailCron, restartEmailCron, getCronStatusWithNextRun } from '@/lib/cron';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = await getCronStatusWithNextRun();
    return NextResponse.json({
      success: true,
      cron: status.email,
      schedule: status.email.schedule || '0 */6 * * *',
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
      await startEmailCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'Email cron job started',
        cron: status.email,
      });
    } else if (action === 'stop') {
      stopEmailCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'Email cron job stopped',
        cron: status.email,
      });
    } else if (action === 'restart') {
      await restartEmailCron();
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'Email cron job restarted',
        cron: status.email,
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

