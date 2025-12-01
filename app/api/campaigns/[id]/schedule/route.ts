import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCampaign, updateCampaign } from '@/lib/data';
import { scheduleSenderCampaign, cancelScheduledSenderCampaign } from '@/lib/sender-campaigns';

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
    const { scheduleTime } = body;

    if (!scheduleTime) {
      return NextResponse.json(
        { error: 'Schedule time is required' },
        { status: 400 }
      );
    }

    const campaign = await getCampaign(resolvedParams.id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (!campaign.senderCampaignId) {
      return NextResponse.json(
        { error: 'Campaign must be created in Sender.net first' },
        { status: 400 }
      );
    }

    const scheduleDate = new Date(scheduleTime);

    // Schedule campaign via Sender.net
    const result = await scheduleSenderCampaign(campaign.senderCampaignId, scheduleDate);

    // Update local campaign
    await updateCampaign(resolvedParams.id, {
      status: 'SCHEDULED',
      scheduleTime: scheduleDate,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      campaign: await getCampaign(resolvedParams.id),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to schedule campaign' },
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
    const campaign = await getCampaign(resolvedParams.id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (!campaign.senderCampaignId) {
      return NextResponse.json(
        { error: 'Campaign must be created in Sender.net first' },
        { status: 400 }
      );
    }

    // Cancel scheduled campaign via Sender.net
    const result = await cancelScheduledSenderCampaign(campaign.senderCampaignId);

    // Update local campaign
    await updateCampaign(resolvedParams.id, {
      status: 'DRAFT',
      scheduleTime: null,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      campaign: await getCampaign(resolvedParams.id),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to cancel scheduled campaign' },
      { status: 500 }
    );
  }
}
