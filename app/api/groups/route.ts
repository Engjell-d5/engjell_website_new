import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getGroups, createGroup, syncGroupFromSender } from '@/lib/data';
import {
  getAllSenderGroups,
  createSenderGroup,
} from '@/lib/sender-groups';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const sync = searchParams.get('sync') === 'true';

    // If sync is requested, fetch from Sender.net and update local database
    if (sync) {
      try {
        const senderGroups = await getAllSenderGroups();
        
        // Sync each group to local database
        for (const senderGroup of senderGroups) {
          await syncGroupFromSender(senderGroup);
        }
      } catch (error: any) {
        console.error('Error syncing groups from Sender.net:', error);
        // Continue to return local groups even if sync fails
      }
    }

    const groups = await getGroups();
    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, createInSender } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    let senderGroupId: string | undefined;
    
    // Create group in Sender.net if requested
    if (createInSender) {
      try {
        const senderGroup = await createSenderGroup({ title });
        senderGroupId = senderGroup.id;
      } catch (error: any) {
        console.error('Error creating group in Sender.net:', error);
        return NextResponse.json(
          { error: `Failed to create group in Sender.net: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Create group in local database
    const group = await createGroup({
      senderGroupId,
      title,
      recipientCount: 0,
      activeSubscribers: 0,
      unsubscribedCount: 0,
      bouncedCount: 0,
      phoneCount: 0,
      activePhoneCount: 0,
    });

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create group' },
      { status: 500 }
    );
  }
}

