import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSubscriber, getGroups } from '@/lib/data';
import {
  addSubscribersToGroup,
  removeSubscribersFromGroup,
  updateSenderSubscriber,
} from '@/lib/sender-subscribers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const subscriber = await getSubscriber(resolvedParams.id);
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Get the Sender.net group ID
    const groups = await getGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.senderGroupId) {
      return NextResponse.json(
        { error: 'Group not found or not synced with Sender.net' },
        { status: 404 }
      );
    }

    // Add subscriber to group in Sender.net
    const result = await addSubscribersToGroup({
      groupId: group.senderGroupId,
      subscribers: [subscriber.email],
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add subscriber to group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const subscriber = await getSubscriber(resolvedParams.id);
    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Get the Sender.net group ID
    const groups = await getGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.senderGroupId) {
      return NextResponse.json(
        { error: 'Group not found or not synced with Sender.net' },
        { status: 404 }
      );
    }

    // Remove subscriber from group in Sender.net
    const result = await removeSubscribersFromGroup({
      groupId: group.senderGroupId,
      subscribers: [subscriber.email],
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove subscriber from group' },
      { status: 500 }
    );
  }
}
