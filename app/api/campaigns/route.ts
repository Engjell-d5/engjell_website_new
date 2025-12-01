import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCampaigns, createCampaign, syncCampaignFromSender, deleteCampaign, getCampaign } from '@/lib/data';
import {
  createSenderCampaign,
  getAllSenderCampaigns,
  deleteSenderCampaigns,
} from '@/lib/sender-campaigns';

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
    const status = searchParams.get('status') as 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | null;

    // If sync is requested, fetch from Sender.net and update local database
    if (sync) {
      try {
        const senderCampaigns = await getAllSenderCampaigns(100, status || undefined);
        
        // Sync each campaign to local database
        for (const senderCampaign of senderCampaigns) {
          await syncCampaignFromSender(senderCampaign);
        }
      } catch (error: any) {
        console.error('Error syncing campaigns from Sender.net:', error);
        // Continue to return local campaigns even if sync fails
      }
    }

    const campaigns = await getCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
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
    const {
      blogId,
      title,
      subject,
      from,
      preheader,
      replyTo,
      contentType,
      content,
      googleAnalytics,
      autoFollowupActive,
      autoFollowupSubject,
      autoFollowupDelay,
      groups,
      segments,
      createInSender,
    } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    let senderCampaignId: string | undefined;
    
    // Create campaign in Sender.net if requested
    if (createInSender) {
      try {
        const senderCampaign = await createSenderCampaign({
          title,
          subject,
          from,
          preheader,
          replyTo,
          contentType: contentType || 'html',
          content,
          googleAnalytics,
          autoFollowupActive,
          autoFollowupSubject,
          autoFollowupDelay,
          groups,
          segments,
        });
        senderCampaignId = senderCampaign.id;
      } catch (error: any) {
        console.error('Error creating campaign in Sender.net:', error);
        return NextResponse.json(
          { error: `Failed to create campaign in Sender.net: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Create campaign in local database
    const campaign = await createCampaign({
      senderCampaignId,
      blogId,
      title,
      subject,
      from,
      preheader,
      replyTo,
      contentType: contentType || 'html',
      content,
      googleAnalytics,
      autoFollowupActive,
      autoFollowupSubject,
      autoFollowupDelay,
      groups,
      segments,
      status: 'DRAFT',
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    
    if (!ids) {
      return NextResponse.json(
        { error: 'Campaign IDs are required' },
        { status: 400 }
      );
    }

    const campaignIds = JSON.parse(ids);
    
    if (!Array.isArray(campaignIds)) {
      return NextResponse.json(
        { error: 'Invalid campaign IDs format' },
        { status: 400 }
      );
    }

    // Delete from Sender.net first
    const senderCampaignIds: string[] = [];
    const allCampaigns = await getCampaigns();
    for (const id of campaignIds) {
      const found = allCampaigns.find(c => c.id === id);
      if (found?.senderCampaignId) {
        senderCampaignIds.push(found.senderCampaignId);
      }
    }

    if (senderCampaignIds.length > 0) {
      try {
        const result = await deleteSenderCampaigns(senderCampaignIds);
        if (!result.success) {
          console.warn(`Some campaigns may not exist in Sender.net or were already deleted: ${result.message}`);
        }
      } catch (error: any) {
        console.error('Error deleting campaigns from Sender.net:', error);
        // Continue to delete locally even if Sender.net deletion fails
        // This could happen if campaigns don't exist in Sender.net anymore
      }
    }

    // Delete from local database
    for (const id of campaignIds) {
      await deleteCampaign(id);
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${campaignIds.length} campaign(s)`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaigns' },
      { status: 500 }
    );
  }
}
