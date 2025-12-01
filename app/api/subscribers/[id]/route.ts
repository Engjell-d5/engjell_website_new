import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateSubscriber, deleteSubscriber, getSubscriber, getGroups } from '@/lib/data';
import { 
  updateSenderSubscriber, 
  getSenderSubscriber,
  addSubscribersToGroup,
  removeSubscribersFromGroup,
} from '@/lib/sender-subscribers';

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
    const { email, status, groupId, groupIds, groups } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (status && !['active', 'churned'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "active" or "churned"' },
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

    // Determine which groups to use
    // Priority: groupIds (explicitly provided, even if empty) > groups > groupId
    let groupsToUpdate: string[] = [];
    if (groupIds !== undefined && Array.isArray(groupIds)) {
      // groupIds was explicitly provided (could be empty array to remove all groups)
      groupsToUpdate = groupIds;
    } else if (groups !== undefined && Array.isArray(groups)) {
      // groups was explicitly provided
      groupsToUpdate = groups;
    } else if (groupId !== undefined) {
      // Fall back to single groupId
      groupsToUpdate = groupId ? [groupId] : [];
    }

    // Update in Sender.net if groupIds or groups were explicitly provided
    // This includes empty arrays (to remove all groups)
    if (groupIds !== undefined || groups !== undefined) {
      try {
        // Convert local group IDs to Sender.net group IDs
        const allGroups = await getGroups();
        const desiredSenderGroupIds = groupsToUpdate
          .map((localId: string) => {
            const group = allGroups.find(g => g.id === localId);
            return group?.senderGroupId;
          })
          .filter((id): id is string => id !== null && id !== undefined);

        // Get current subscriber state from Sender.net to see what groups they're in
        let currentSenderGroupIds: string[] = [];
        try {
          const senderSub = await getSenderSubscriber(subscriber.email);
          if (senderSub.subscriber_tags && senderSub.subscriber_tags.length > 0) {
            currentSenderGroupIds = senderSub.subscriber_tags.map(tag => tag.id);
          }
        } catch (error: any) {
          console.warn('Could not fetch current subscriber from Sender.net, will use update method:', error.message);
        }

        // Calculate groups to add and remove
        const groupsToAdd = desiredSenderGroupIds.filter(id => !currentSenderGroupIds.includes(id));
        const groupsToRemove = currentSenderGroupIds.filter(id => !desiredSenderGroupIds.includes(id));

        // Remove from groups that are no longer assigned
        for (const groupIdToRemove of groupsToRemove) {
          try {
            await removeSubscribersFromGroup({
              groupId: groupIdToRemove,
              subscribers: [subscriber.email],
            });
          } catch (error: any) {
            console.error(`Error removing subscriber from group ${groupIdToRemove} in Sender.net:`, error);
          }
        }

        // Add to new groups
        for (const groupIdToAdd of groupsToAdd) {
          try {
            await addSubscribersToGroup({
              groupId: groupIdToAdd,
              subscribers: [subscriber.email],
            });
          } catch (error: any) {
            console.error(`Error adding subscriber to group ${groupIdToAdd} in Sender.net:`, error);
          }
        }

        // If no current groups found and we have desired groups, also try the update method as fallback
        if (currentSenderGroupIds.length === 0 && desiredSenderGroupIds.length > 0) {
          try {
            await updateSenderSubscriber({
              email: subscriber.email,
              groups: desiredSenderGroupIds,
            });
          } catch (error: any) {
            console.warn('Update method also failed, but add operations should have worked:', error.message);
          }
        }
      } catch (error: any) {
        console.error('Error updating subscriber groups in Sender.net:', error);
        // Continue to update locally even if Sender.net update fails
      }
    }

    const singleGroupId = groupsToUpdate.length > 0 ? groupsToUpdate[0] : (groupId !== undefined ? (groupId || null) : undefined);
    
    // Always pass groupIds if it was explicitly provided (even if empty)
    // This ensures we can remove all groups when groupIds is []
    const groupIdsToPass = (groupIds !== undefined || groups !== undefined) 
      ? groupsToUpdate 
      : undefined;
    
    const updated = await updateSubscriber(resolvedParams.id, {
      email,
      status: status as 'active' | 'churned' | undefined,
      groupId: singleGroupId,
      groupIds: groupIdsToPass,
    });

    return NextResponse.json({
      success: true,
      subscriber: updated,
    });
  } catch (error: any) {
    if (error.message?.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update subscriber' },
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
    await deleteSubscriber(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Subscriber deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

