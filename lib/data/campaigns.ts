import { prisma } from '../prisma';
import type { Campaign } from './types';

export async function getCampaigns(): Promise<Campaign[]> {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      blog: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      group: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  type CampaignType = Awaited<ReturnType<typeof prisma.campaign.findMany>>[0];
  return campaigns.map((campaign: CampaignType) => ({
    id: campaign.id,
    senderCampaignId: campaign.senderCampaignId,
    blogId: campaign.blogId,
    title: campaign.title,
    subject: campaign.subject,
    from: campaign.from,
    preheader: campaign.preheader,
    replyTo: campaign.replyTo,
    contentType: campaign.contentType,
    content: campaign.content,
    googleAnalytics: campaign.googleAnalytics,
    autoFollowupActive: campaign.autoFollowupActive,
    autoFollowupSubject: campaign.autoFollowupSubject,
    autoFollowupDelay: campaign.autoFollowupDelay,
    groups: campaign.groups,
    segments: campaign.segments,
    groupId: campaign.groupId,
    status: campaign.status,
    scheduleTime: campaign.scheduleTime?.toISOString() || null,
    sentTime: campaign.sentTime?.toISOString() || null,
    recipientCount: campaign.recipientCount,
    sentCount: campaign.sentCount,
    opens: campaign.opens,
    clicks: campaign.clicks,
    bouncesCount: campaign.bouncesCount,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    syncedAt: campaign.syncedAt?.toISOString() || null,
  }));
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      blog: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      group: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  
  if (!campaign) return null;
  
  return {
    id: campaign.id,
    senderCampaignId: campaign.senderCampaignId,
    blogId: campaign.blogId,
    title: campaign.title,
    subject: campaign.subject,
    from: campaign.from,
    preheader: campaign.preheader,
    replyTo: campaign.replyTo,
    contentType: campaign.contentType,
    content: campaign.content,
    googleAnalytics: campaign.googleAnalytics,
    autoFollowupActive: campaign.autoFollowupActive,
    autoFollowupSubject: campaign.autoFollowupSubject,
    autoFollowupDelay: campaign.autoFollowupDelay,
    groups: campaign.groups,
    segments: campaign.segments,
    groupId: campaign.groupId || null,
    status: campaign.status,
    scheduleTime: campaign.scheduleTime?.toISOString() || null,
    sentTime: campaign.sentTime?.toISOString() || null,
    recipientCount: campaign.recipientCount,
    sentCount: campaign.sentCount,
    opens: campaign.opens,
    clicks: campaign.clicks,
    bouncesCount: campaign.bouncesCount,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    syncedAt: campaign.syncedAt?.toISOString() || null,
  };
}

export async function createCampaign(data: {
  senderCampaignId?: string;
  blogId?: string;
  title?: string;
  subject: string;
  from: string;
  preheader?: string;
  replyTo: string;
  contentType: string;
  content: string;
  googleAnalytics?: boolean;
  autoFollowupActive?: boolean;
  autoFollowupSubject?: string;
  autoFollowupDelay?: number;
  groups?: string[];
  segments?: string[];
  status?: string;
}): Promise<Campaign> {
  const campaign = await prisma.campaign.create({
    data: {
      senderCampaignId: data.senderCampaignId,
      blogId: data.blogId,
      title: data.title,
      subject: data.subject,
      from: data.from,
      preheader: data.preheader,
      replyTo: data.replyTo,
      contentType: data.contentType,
      content: data.content,
      googleAnalytics: data.googleAnalytics || false,
      autoFollowupActive: data.autoFollowupActive || false,
      autoFollowupSubject: data.autoFollowupSubject,
      autoFollowupDelay: data.autoFollowupDelay,
      groups: data.groups ? JSON.stringify(data.groups) : null,
      segments: data.segments ? JSON.stringify(data.segments) : null,
      status: data.status || 'DRAFT',
      syncedAt: new Date(),
    },
  });
  
  return {
    id: campaign.id,
    senderCampaignId: campaign.senderCampaignId,
    blogId: campaign.blogId,
    title: campaign.title,
    subject: campaign.subject,
    from: campaign.from,
    preheader: campaign.preheader,
    replyTo: campaign.replyTo,
    contentType: campaign.contentType,
    content: campaign.content,
    googleAnalytics: campaign.googleAnalytics,
    autoFollowupActive: campaign.autoFollowupActive,
    autoFollowupSubject: campaign.autoFollowupSubject,
    autoFollowupDelay: campaign.autoFollowupDelay,
    groups: campaign.groups,
    segments: campaign.segments,
    groupId: campaign.groupId || null,
    status: campaign.status,
    scheduleTime: campaign.scheduleTime?.toISOString() || null,
    sentTime: campaign.sentTime?.toISOString() || null,
    recipientCount: campaign.recipientCount,
    sentCount: campaign.sentCount,
    opens: campaign.opens,
    clicks: campaign.clicks,
    bouncesCount: campaign.bouncesCount,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    syncedAt: campaign.syncedAt?.toISOString() || null,
  };
}

export async function updateCampaign(
  id: string,
  data: {
    senderCampaignId?: string;
    blogId?: string | null;
    title?: string;
    subject?: string;
    from?: string;
    preheader?: string;
    replyTo?: string;
    contentType?: string;
    content?: string;
    googleAnalytics?: boolean;
    autoFollowupActive?: boolean;
    autoFollowupSubject?: string;
    autoFollowupDelay?: number;
    groups?: string[];
    segments?: string[];
    status?: string;
    scheduleTime?: Date | null;
    sentTime?: Date | null;
    recipientCount?: number;
    sentCount?: number;
    opens?: number;
    clicks?: number;
    bouncesCount?: number;
    syncedAt?: Date;
  }
): Promise<Campaign> {
  const updateData: any = { ...data };
  
  if (data.groups !== undefined) {
    updateData.groups = data.groups ? JSON.stringify(data.groups) : null;
  }
  if (data.segments !== undefined) {
    updateData.segments = data.segments ? JSON.stringify(data.segments) : null;
  }
  
  const campaign = await prisma.campaign.update({
    where: { id },
    data: updateData,
  });
  
  return {
    id: campaign.id,
    senderCampaignId: campaign.senderCampaignId,
    blogId: campaign.blogId,
    title: campaign.title,
    subject: campaign.subject,
    from: campaign.from,
    preheader: campaign.preheader,
    replyTo: campaign.replyTo,
    contentType: campaign.contentType,
    content: campaign.content,
    googleAnalytics: campaign.googleAnalytics,
    autoFollowupActive: campaign.autoFollowupActive,
    autoFollowupSubject: campaign.autoFollowupSubject,
    autoFollowupDelay: campaign.autoFollowupDelay,
    groups: campaign.groups,
    segments: campaign.segments,
    groupId: campaign.groupId || null,
    status: campaign.status,
    scheduleTime: campaign.scheduleTime?.toISOString() || null,
    sentTime: campaign.sentTime?.toISOString() || null,
    recipientCount: campaign.recipientCount,
    sentCount: campaign.sentCount,
    opens: campaign.opens,
    clicks: campaign.clicks,
    bouncesCount: campaign.bouncesCount,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
    syncedAt: campaign.syncedAt?.toISOString() || null,
  };
}

export async function deleteCampaign(id: string): Promise<void> {
  await prisma.campaign.delete({
    where: { id },
  });
}

export async function syncCampaignFromSender(senderCampaign: any): Promise<Campaign> {
  // Find existing campaign by senderCampaignId
  const existing = senderCampaign.id
    ? await prisma.campaign.findUnique({
        where: { senderCampaignId: senderCampaign.id },
      })
    : null;

  // Handle groups - campaign_groups is an array of group IDs from Sender.net
  const groupsArray = Array.isArray(senderCampaign.campaign_groups) 
    ? senderCampaign.campaign_groups 
    : (senderCampaign.campaign_groups ? [senderCampaign.campaign_groups] : []);
  const segmentsArray = Array.isArray(senderCampaign.segments)
    ? senderCampaign.segments
    : (senderCampaign.segments ? [senderCampaign.segments] : []);

  const campaignData = {
    senderCampaignId: senderCampaign.id,
    title: senderCampaign.title,
    subject: senderCampaign.subject,
    from: senderCampaign.from,
    preheader: senderCampaign.preheader,
    replyTo: senderCampaign.reply_to,
    contentType: senderCampaign.editor || 'html',
    content: senderCampaign.html?.html_content || '',
    googleAnalytics: false, // Not in API response
    autoFollowupActive: senderCampaign.auto_followup_active === 1,
    autoFollowupSubject: senderCampaign.auto_followup_subject,
    autoFollowupDelay: senderCampaign.auto_followup_delay,
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
  };

  if (existing) {
    return await updateCampaign(existing.id, campaignData);
  } else {
    return await createCampaign(campaignData);
  }
}

