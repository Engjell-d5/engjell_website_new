import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getEmailTasks } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await getEmailTasks();
    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Error fetching email tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email tasks' },
      { status: 500 }
    );
  }
}
