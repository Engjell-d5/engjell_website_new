import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Mark a thread as irrelevant (all emails in the thread)
 */
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId, isIrrelevant } = await request.json();

    if (!threadId || typeof isIrrelevant !== 'boolean') {
      return NextResponse.json(
        { error: 'threadId and isIrrelevant (boolean) are required' },
        { status: 400 }
      );
    }

    // Update all emails in the thread
    const result = await prisma.email.updateMany({
      where: { threadId },
      data: { isIrrelevant },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      threadId,
      isIrrelevant,
    });
  } catch (error: any) {
    console.error('Error marking thread as irrelevant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update thread' },
      { status: 500 }
    );
  }
}
