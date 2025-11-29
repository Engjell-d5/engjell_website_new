import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSubscribers } from '@/lib/data';

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

