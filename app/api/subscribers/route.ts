import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSubscribers, addSubscriber } from '@/lib/data';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const subscribers = await getSubscribers();
    return NextResponse.json({ subscribers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
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
    const { email, status, groupId, groupIds } = await request.json();

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

    // Use groupIds if provided, otherwise fall back to groupId
    const groupIdsToUse = groupIds && Array.isArray(groupIds) && groupIds.length > 0 
      ? groupIds 
      : (groupId ? [groupId] : []);
    const singleGroupId = groupIdsToUse.length > 0 ? groupIdsToUse[0] : null;
    
    const subscriber = await addSubscriber(
      email, 
      (status as 'active' | 'churned') || 'active', 
      singleGroupId,
      groupIdsToUse
    );

    return NextResponse.json({
      success: true,
      subscriber,
    });
  } catch (error: any) {
    if (error.message === 'Email already subscribed') {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to add subscriber' },
      { status: 500 }
    );
  }
}

