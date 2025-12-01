import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCampaign, updateCampaign } from '@/lib/data';
import { sendSenderCampaign } from '@/lib/sender-campaigns';

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

    // Send campaign via Sender.net
    const result = await sendSenderCampaign(campaign.senderCampaignId);

    // Update local campaign status
    await updateCampaign(resolvedParams.id, {
      status: 'SENDING',
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      campaign: await getCampaign(resolvedParams.id),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
