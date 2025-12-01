import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getGroup, updateGroup, deleteGroup } from '@/lib/data';
import {
  updateSenderGroup,
  deleteSenderGroup,
} from '@/lib/sender-groups';

export async function GET(
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
    const group = await getGroup(resolvedParams.id);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ group });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const group = await getGroup(resolvedParams.id);
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Update in Sender.net if it exists there
    if (group.senderGroupId) {
      try {
        await updateSenderGroup(group.senderGroupId, { title });
      } catch (error: any) {
        console.error('Error updating group in Sender.net:', error);
        // Continue to update locally even if Sender.net update fails
      }
    }

    // Update in local database
    const updated = await updateGroup(resolvedParams.id, { title });

    return NextResponse.json({
      success: true,
      group: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update group' },
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
    const deleteSubscribers = searchParams.get('delete_subscribers') === 'true';

    const group = await getGroup(resolvedParams.id);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Delete from Sender.net if it exists there
    if (group.senderGroupId) {
      try {
        await deleteSenderGroup(group.senderGroupId, deleteSubscribers);
      } catch (error: any) {
        console.error('Error deleting group from Sender.net:', error);
        // Continue to delete locally even if Sender.net deletion fails
      }
    }

    // Delete from local database
    await deleteGroup(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete group' },
      { status: 500 }
    );
  }
}

