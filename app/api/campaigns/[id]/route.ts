import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCampaign, updateCampaign, deleteCampaign } from '@/lib/data';
import {
  getSenderCampaign,
  sendSenderCampaign,
  scheduleSenderCampaign,
  cancelScheduledSenderCampaign,
  deleteSenderCampaigns,
} from '@/lib/sender-campaigns';

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
    const { searchParams } = new URL(request.url);
    const sync = searchParams.get('sync') === 'true';

    let campaign = await getCampaign(resolvedParams.id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Sync from Sender.net if requested and campaign has senderCampaignId
    if (sync && campaign.senderCampaignId) {
      try {
        const senderCampaign = await getSenderCampaign(campaign.senderCampaignId);
        // Extract HTML content - try html_content first, then html_body, then fallback to existing content
        // Only update content if Sender.net actually has HTML content, otherwise keep local content
        let htmlContent = campaign.content; // Default to existing local content
        if (senderCampaign.html?.html_content && senderCampaign.html.html_content.trim()) {
          htmlContent = senderCampaign.html.html_content;
        } else if (senderCampaign.html?.html_body && senderCampaign.html.html_body.trim()) {
          htmlContent = senderCampaign.html.html_body;
        }
        // If neither is available, keep the existing local content (don't overwrite with empty)
        
        // Update local campaign with latest data from Sender.net
        // Handle groups - campaign_groups is an array of group IDs from Sender.net
        const groupsArray = Array.isArray(senderCampaign.campaign_groups) 
          ? senderCampaign.campaign_groups 
          : (senderCampaign.campaign_groups ? [senderCampaign.campaign_groups] : []);
        const segmentsArray = Array.isArray(senderCampaign.segments)
          ? senderCampaign.segments
          : (senderCampaign.segments ? [senderCampaign.segments] : []);

        campaign = await updateCampaign(resolvedParams.id, {
          title: senderCampaign.title,
          subject: senderCampaign.subject,
          from: senderCampaign.from,
          preheader: senderCampaign.preheader,
          replyTo: senderCampaign.reply_to,
          contentType: senderCampaign.editor || 'html',
          content: htmlContent, // Use the content we determined above
          autoFollowupActive: senderCampaign.auto_followup_active === 1,
          autoFollowupSubject: senderCampaign.auto_followup_subject || undefined,
          autoFollowupDelay: senderCampaign.auto_followup_delay || undefined,
          groups: groupsArray.length > 0 ? groupsArray : undefined,
          segments: segmentsArray.length > 0 ? segmentsArray : undefined,
          status: senderCampaign.status,
          scheduleTime: senderCampaign.schedule_time ? new Date(senderCampaign.schedule_time) : null,
          sentTime: senderCampaign.sent_time ? new Date(senderCampaign.sent_time) : null,
          recipientCount: senderCampaign.recipient_count || 0,
          sentCount: senderCampaign.sent_count || 0,
          opens: senderCampaign.opens || 0,
          clicks: senderCampaign.clicks || 0,
          bouncesCount: senderCampaign.bounces_count || 0,
          syncedAt: new Date(),
        });
      } catch (error: any) {
        console.error('Error syncing campaign from Sender.net:', error);
        // Return local campaign even if sync fails
      }
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign' },
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

    const updated = await updateCampaign(resolvedParams.id, body);

    return NextResponse.json({
      success: true,
      campaign: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
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

    // Delete from Sender.net if it exists there
    if (campaign.senderCampaignId) {
      try {
        const result = await deleteSenderCampaigns([campaign.senderCampaignId]);
        if (!result.success) {
          console.warn(`Campaign ${campaign.senderCampaignId} may not exist in Sender.net or was already deleted: ${result.message}`);
        }
      } catch (error: any) {
        console.error('Error deleting campaign from Sender.net:', error);
        // Continue to delete locally even if Sender.net deletion fails
        // This could happen if the campaign doesn't exist in Sender.net anymore
      }
    }

    // Delete from local database
    await deleteCampaign(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
