import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startEmailCron, stopEmailCron, restartEmailCron, getNextRunTime } from '@/lib/cron';

export const dynamic = 'force-dynamic';

/**
 * GET - Get email cron job configuration
 */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let config = await prisma.emailCronJob.findFirst();

    // Create default config if none exists
    if (!config) {
      config = await prisma.emailCronJob.create({
        data: {
          isEnabled: false,
          schedule: '0 */6 * * *', // Default: every 6 hours
          syncEmails: true,
          analyzeEmails: true,
        },
      });
    }

    // Calculate next run time if enabled
    let nextRun = null;
    if (config.isEnabled) {
      nextRun = getNextRunTime(config.schedule);
    }

    return NextResponse.json({
      config: {
        ...config,
        nextRun: nextRun ? nextRun.toISOString() : null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching email cron config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email cron configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST/PUT - Update email cron job configuration
 */
export async function POST(request: NextRequest) {
  return handleUpdate(request);
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

async function handleUpdate(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isEnabled, schedule, syncEmails, analyzeEmails, aiIntegrationId } = body;

    // Validate schedule format (basic validation)
    if (schedule && typeof schedule === 'string') {
      const parts = schedule.trim().split(/\s+/);
      if (parts.length !== 5) {
        return NextResponse.json(
          { error: 'Invalid cron schedule format. Expected format: "minute hour day month dayOfWeek"' },
          { status: 400 }
        );
      }
    }

    // Get or create config
    let config = await prisma.emailCronJob.findFirst();
    
    const updateData: any = {};
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (syncEmails !== undefined) updateData.syncEmails = syncEmails;
    if (analyzeEmails !== undefined) updateData.analyzeEmails = analyzeEmails;
    if (aiIntegrationId !== undefined) updateData.aiIntegrationId = aiIntegrationId;

    if (config) {
      // Update existing config
      config = await prisma.emailCronJob.update({
        where: { id: config.id },
        data: updateData,
      });
    } else {
      // Create new config
      config = await prisma.emailCronJob.create({
        data: {
          isEnabled: isEnabled ?? false,
          schedule: schedule || '0 */6 * * *',
          syncEmails: syncEmails ?? true,
          analyzeEmails: analyzeEmails ?? true,
          aiIntegrationId: aiIntegrationId || null,
        },
      });
    }

    // Restart cron job if enabled status changed or schedule changed
    if (isEnabled !== undefined || schedule !== undefined) {
      if (config.isEnabled) {
        await restartEmailCron();
      } else {
        stopEmailCron();
      }
    } else if (config.isEnabled) {
      // If already enabled, restart to pick up any other changes
      await restartEmailCron();
    }

    // Calculate next run time
    let nextRun = null;
    if (config.isEnabled) {
      nextRun = getNextRunTime(config.schedule);
      if (nextRun) {
        await prisma.emailCronJob.update({
          where: { id: config.id },
          data: { nextRun },
        });
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        nextRun: nextRun ? nextRun.toISOString() : null,
      },
    });
  } catch (error: any) {
    console.error('Error updating email cron config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update email cron configuration' },
      { status: 500 }
    );
  }
}
