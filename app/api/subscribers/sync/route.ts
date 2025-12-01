import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { syncSubscribersWithSender } from '@/lib/sender-sync';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await syncSubscribersWithSender();
    
    const totalSynced = result.pushed.synced;
    const totalUpdated = result.pulled.updated;
    const totalCreated = result.pulled.created;
    const totalFailed = result.pushed.failed + result.pulled.errors;

    let message = '';
    if (totalSynced > 0 || totalUpdated > 0 || totalCreated > 0) {
      const parts: string[] = [];
      if (totalSynced > 0) parts.push(`pushed ${totalSynced} to Sender.net`);
      if (totalUpdated > 0) parts.push(`updated ${totalUpdated} from Sender.net`);
      if (totalCreated > 0) parts.push(`created ${totalCreated} new from Sender.net`);
      message = `Sync complete: ${parts.join(', ')}`;
    } else {
      message = 'All subscribers are already in sync';
    }

    return NextResponse.json({
      success: result.success,
      message,
      pushed: result.pushed,
      pulled: result.pulled,
      errors: result.errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscribers' },
      { status: 500 }
    );
  }
}

