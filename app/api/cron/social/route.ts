import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { startSocialMediaCron, stopSocialMediaCron, restartSocialMediaCron, getCronStatusWithNextRun } from '@/lib/cron';
import { getConfig } from '@/lib/data';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const status = await getCronStatusWithNextRun();
    const config = await getConfig();
    return NextResponse.json({
      success: true,
      cron: status.socialMedia,
      schedule: config.socialMediaCronSchedule || '*/5 * * * *',
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
    const { action, schedule } = await request.json();

    // Handle schedule update
    if (action === 'updateSchedule' && schedule) {
      // Validate schedule format (basic validation)
      const parts = schedule.trim().split(/\s+/);
      if (parts.length !== 5) {
        return NextResponse.json(
          { error: 'Invalid cron schedule format. Expected format: "minute hour day month dayOfWeek"' },
          { status: 400 }
        );
      }

      const { getConfig, saveConfig } = await import('@/lib/data');
      const config = await getConfig();
      config.socialMediaCronSchedule = schedule;
      await saveConfig(config);

      // Restart cron job if it's running to apply new schedule
      const currentStatus = await getCronStatusWithNextRun();
      if (currentStatus.socialMedia.running) {
        await restartSocialMediaCron();
      }

      // Get updated status after restart
      const status = await getCronStatusWithNextRun();
      return NextResponse.json({
        success: true,
        message: 'Schedule updated successfully',
        cron: status.socialMedia,
        schedule: schedule,
      });
    }

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
        { error: 'Invalid action. Use "start", "stop", "restart", or "updateSchedule"' },
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

