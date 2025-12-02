import { prisma } from './prisma';

// Type exports (keeping same interface for compatibility)
export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // hashed
  role: 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  hook?: string | null;
  content: string;
  imageUrl: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
}

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  channelTitle: string;
  fetchedAt: string;
  featured?: boolean;
  removed?: boolean;
}

export interface Config {
  youtubeApiKey: string;
  youtubeChannelId: string;
  cronSchedule: string;
  socialMediaCronSchedule: string;
  lastVideoFetch: string | null;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  syncedToSender: boolean;
  status: 'active' | 'churned';
  groupId?: string | null; // Legacy: single group for backward compatibility
  group?: {
    id: string;
    title: string;
  } | null;
  groups?: Array<{
    id: string;
    title: string;
  }>; // Multiple groups via many-to-many
}

export interface Campaign {
  id: string;
  senderCampaignId: string | null;
  blogId: string | null;
  title: string | null;
  subject: string;
  from: string;
  preheader: string | null;
  replyTo: string;
  contentType: string;
  content: string;
  googleAnalytics: boolean;
  autoFollowupActive: boolean;
  autoFollowupSubject: string | null;
  autoFollowupDelay: number | null;
  groups: string | null;
  segments: string | null;
  groupId: string | null;
  status: string;
  scheduleTime: string | null;
  sentTime: string | null;
  recipientCount: number;
  sentCount: number;
  opens: number;
  clicks: number;
  bouncesCount: number;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

export interface PodcastApplication {
  id: string;
  name: string;
  email: string;
  about: string;
  businesses: string;
  industry: string;
  vision: string;
  biggestChallenge: string;
  whyPodcast: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  read: boolean;
}

// User functions
export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  type UserType = Awaited<ReturnType<typeof prisma.user.findMany>>[0];
  return users.map((user: UserType) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    password: user.password,
    role: user.role as 'admin' | 'editor',
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));
}

export async function saveUsers(users: User[]): Promise<void> {
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        updatedAt: new Date(user.updatedAt),
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }
}

// Blog functions
export async function getBlogs(): Promise<Blog[]> {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      author: true,
      campaigns: {
        select: {
          id: true,
          subject: true,
          status: true,
        },
        take: 1, // Just get the first linked campaign
      },
    },
  });
  type BlogType = Awaited<ReturnType<typeof prisma.blog.findMany>>[0];
  return blogs.map((blog: BlogType) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    excerpt: blog.excerpt,
    content: blog.content,
    imageUrl: blog.imageUrl,
    published: blog.published,
    publishedAt: blog.publishedAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    authorId: blog.authorId,
    seo: {
      metaTitle: blog.seoMetaTitle || undefined,
      metaDescription: blog.seoMetaDescription || undefined,
      keywords: blog.seoKeywords || undefined,
      ogTitle: blog.seoOgTitle || undefined,
      ogDescription: blog.seoOgDescription || undefined,
      ogImage: blog.seoOgImage || undefined,
      twitterCard: blog.seoTwitterCard || undefined,
      twitterTitle: blog.seoTwitterTitle || undefined,
      twitterDescription: blog.seoTwitterDescription || undefined,
      twitterImage: blog.seoTwitterImage || undefined,
    },
  }));
}

export async function getBlog(id: string): Promise<Blog | null> {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: { 
      author: true,
      campaigns: {
        select: {
          id: true,
          subject: true,
          status: true,
        },
        take: 1, // Just get the first linked campaign
      },
    },
  });
  
  if (!blog) return null;
  
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    excerpt: blog.excerpt,
    content: blog.content,
    imageUrl: blog.imageUrl,
    published: blog.published,
    publishedAt: blog.publishedAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    authorId: blog.authorId,
    seo: {
      metaTitle: blog.seoMetaTitle || undefined,
      metaDescription: blog.seoMetaDescription || undefined,
      keywords: blog.seoKeywords || undefined,
      ogTitle: blog.seoOgTitle || undefined,
      ogDescription: blog.seoOgDescription || undefined,
      ogImage: blog.seoOgImage || undefined,
      twitterCard: blog.seoTwitterCard || undefined,
      twitterTitle: blog.seoTwitterTitle || undefined,
      twitterDescription: blog.seoTwitterDescription || undefined,
      twitterImage: blog.seoTwitterImage || undefined,
    },
  };
}

export async function getBlogCampaign(blogId: string): Promise<{ id: string; subject: string; status: string } | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { blogId },
    select: {
      id: true,
      subject: true,
      status: true,
    },
  });
  
  return campaign;
}

export async function saveBlogs(blogs: Blog[]): Promise<void> {
  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {
        title: blog.title,
        category: blog.category,
        excerpt: blog.excerpt,
        content: blog.content,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        authorId: blog.authorId,
        seoMetaTitle: blog.seo?.metaTitle || null,
        seoMetaDescription: blog.seo?.metaDescription || null,
        seoKeywords: blog.seo?.keywords || null,
        seoOgTitle: blog.seo?.ogTitle || null,
        seoOgDescription: blog.seo?.ogDescription || null,
        seoOgImage: blog.seo?.ogImage || null,
        seoTwitterCard: blog.seo?.twitterCard || null,
        seoTwitterTitle: blog.seo?.twitterTitle || null,
        seoTwitterDescription: blog.seo?.twitterDescription || null,
        seoTwitterImage: blog.seo?.twitterImage || null,
        updatedAt: new Date(blog.updatedAt),
      },
      create: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        excerpt: blog.excerpt,
        content: blog.content,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        authorId: blog.authorId,
        createdAt: new Date(blog.createdAt),
        updatedAt: new Date(blog.updatedAt),
        seoMetaTitle: blog.seo?.metaTitle || null,
        seoMetaDescription: blog.seo?.metaDescription || null,
        seoKeywords: blog.seo?.keywords || null,
        seoOgTitle: blog.seo?.ogTitle || null,
        seoOgDescription: blog.seo?.ogDescription || null,
        seoOgImage: blog.seo?.ogImage || null,
        seoTwitterCard: blog.seo?.twitterCard || null,
        seoTwitterTitle: blog.seo?.twitterTitle || null,
        seoTwitterDescription: blog.seo?.twitterDescription || null,
        seoTwitterImage: blog.seo?.twitterImage || null,
      },
    });
  }
}

// Video functions
export async function getVideos(includeRemoved: boolean = false): Promise<YouTubeVideo[]> {
  const where = includeRemoved ? {} : { removed: false };
  const videos = await prisma.youTubeVideo.findMany({
    where,
    orderBy: [
      { featured: 'desc' }, // Featured videos first
      { publishedAt: 'desc' }, // Then by published date
    ],
  });
  type VideoType = Awaited<ReturnType<typeof prisma.youTubeVideo.findMany>>[0];
  return videos.map((video: VideoType) => ({
    id: video.id,
    videoId: video.videoId,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt.toISOString(),
    duration: video.duration,
    viewCount: video.viewCount,
    channelTitle: video.channelTitle,
    fetchedAt: video.fetchedAt.toISOString(),
    featured: video.featured,
    removed: video.removed,
  }));
}

export async function getFeaturedVideo(): Promise<YouTubeVideo | null> {
  const video = await prisma.youTubeVideo.findFirst({
    where: { 
      featured: true,
      removed: false,
    },
    orderBy: { publishedAt: 'desc' },
  });
  
  if (!video) return null;
  
  return {
    id: video.id,
    videoId: video.videoId,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt.toISOString(),
    duration: video.duration,
    viewCount: video.viewCount,
    channelTitle: video.channelTitle,
    fetchedAt: video.fetchedAt.toISOString(),
    featured: video.featured,
    removed: video.removed,
  };
}

export async function setVideoFeatured(videoId: string, featured: boolean): Promise<void> {
  // If setting as featured, unfeature all other videos first
  if (featured) {
    await prisma.youTubeVideo.updateMany({
      where: { featured: true },
      data: { featured: false },
    });
  }
  
  await prisma.youTubeVideo.update({
    where: { videoId },
    data: { featured },
  });
}

export async function removeVideo(videoId: string): Promise<void> {
  await prisma.youTubeVideo.update({
    where: { videoId },
    data: { removed: true },
  });
}

export async function restoreVideo(videoId: string): Promise<void> {
  await prisma.youTubeVideo.update({
    where: { videoId },
    data: { removed: false },
  });
}

export async function saveVideos(videos: YouTubeVideo[]): Promise<void> {
  for (const video of videos) {
    await prisma.youTubeVideo.upsert({
      where: { videoId: video.videoId },
      update: {
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: new Date(video.publishedAt),
        duration: video.duration,
        viewCount: video.viewCount,
        channelTitle: video.channelTitle,
        fetchedAt: new Date(video.fetchedAt),
        // Preserve featured and removed status if they exist, otherwise keep existing values
        ...(video.featured !== undefined && { featured: video.featured }),
        ...(video.removed !== undefined && { removed: video.removed }),
      },
      create: {
        id: video.id,
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: new Date(video.publishedAt),
        duration: video.duration,
        viewCount: video.viewCount,
        channelTitle: video.channelTitle,
        fetchedAt: new Date(video.fetchedAt),
        featured: video.featured || false,
        removed: video.removed || false,
      },
    });
  }
}

// Config functions
export async function getConfig(): Promise<Config> {
  const config = await prisma.config.findFirst();
  if (config) {
    return {
      youtubeApiKey: config.youtubeApiKey || process.env.YOUTUBE_API_KEY || '',
      youtubeChannelId: config.youtubeChannelId || '',
      cronSchedule: config.cronSchedule || '0 2 * * *',
      socialMediaCronSchedule: config.socialMediaCronSchedule || '*/5 * * * *',
      lastVideoFetch: config.lastVideoFetch?.toISOString() || null,
    };
  }
  // Create default config if none exists
  const defaultConfig = await prisma.config.create({
    data: {
      youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
      youtubeChannelId: '',
      cronSchedule: '0 2 * * *',
      socialMediaCronSchedule: '*/5 * * * *',
      lastVideoFetch: null,
    },
  });
  return {
    youtubeApiKey: defaultConfig.youtubeApiKey || process.env.YOUTUBE_API_KEY || '',
    youtubeChannelId: defaultConfig.youtubeChannelId || '',
    cronSchedule: defaultConfig.cronSchedule || '0 2 * * *',
    socialMediaCronSchedule: defaultConfig.socialMediaCronSchedule || '*/5 * * * *',
    lastVideoFetch: defaultConfig.lastVideoFetch?.toISOString() || null,
  };
}

export async function saveConfig(config: Config): Promise<void> {
  const existing = await prisma.config.findFirst();
  if (existing) {
    await prisma.config.update({
      where: { id: existing.id },
      data: {
        youtubeApiKey: config.youtubeApiKey,
        youtubeChannelId: config.youtubeChannelId,
        cronSchedule: config.cronSchedule,
        socialMediaCronSchedule: config.socialMediaCronSchedule,
        lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
      },
    });
  } else {
    await prisma.config.create({
      data: {
        youtubeApiKey: config.youtubeApiKey,
        youtubeChannelId: config.youtubeChannelId,
        cronSchedule: config.cronSchedule,
        socialMediaCronSchedule: config.socialMediaCronSchedule || '*/5 * * * *',
        lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
      },
    });
  }
}

// Subscriber functions
export async function getSubscribers(): Promise<Subscriber[]> {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
  return subscribers.map((sub: any) => ({
    id: sub.id,
    email: sub.email,
    subscribedAt: sub.subscribedAt.toISOString(),
    syncedToSender: sub.syncedToSender,
    status: (sub.status as 'active' | 'churned') || 'active',
    groupId: sub.groupId,
    group: sub.group ? {
      id: sub.group.id,
      title: sub.group.title,
    } : null,
    groups: (sub.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  }));
}

export async function getSubscriber(id: string): Promise<Subscriber | null> {
  const subscriber = await prisma.subscriber.findUnique({
    where: { id },
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  }) as any;
  
  if (!subscriber) return null;
  
  return {
    id: subscriber.id,
    email: subscriber.email,
    subscribedAt: subscriber.subscribedAt.toISOString(),
    syncedToSender: subscriber.syncedToSender,
    status: (subscriber.status as 'active' | 'churned') || 'active',
    groupId: subscriber.groupId,
    group: subscriber.group ? {
      id: subscriber.group.id,
      title: subscriber.group.title,
    } : null,
    groups: (subscriber.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  };
}

export async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  for (const subscriber of subscribers) {
    await prisma.subscriber.upsert({
      where: { email: subscriber.email },
      update: {
        syncedToSender: subscriber.syncedToSender,
        status: subscriber.status || 'active',
      },
      create: {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: new Date(subscriber.subscribedAt),
        syncedToSender: subscriber.syncedToSender,
        status: subscriber.status || 'active',
      },
    });
  }
}

export async function addSubscriber(
  email: string, 
  status: 'active' | 'churned' = 'active', 
  groupId?: string | null,
  groupIds?: string[]
): Promise<Subscriber> {
  const existing = await prisma.subscriber.findUnique({
    where: { email: email.toLowerCase() },
  });
  
  if (existing) {
    throw new Error('Email already subscribed');
  }
  
  const newSubscriber = await prisma.subscriber.create({
    data: {
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      syncedToSender: false,
      status: status,
      groupId: groupId || null,
      groups: groupIds && groupIds.length > 0 ? {
        create: groupIds.map((gId: string) => ({ groupId: gId })),
      } : undefined,
    },
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  }) as any;
  
  return {
    id: newSubscriber.id,
    email: newSubscriber.email,
    subscribedAt: newSubscriber.subscribedAt.toISOString(),
    syncedToSender: newSubscriber.syncedToSender,
    status: (newSubscriber.status as 'active' | 'churned') || 'active',
    groupId: newSubscriber.groupId,
    group: newSubscriber.group ? {
      id: newSubscriber.group.id,
      title: newSubscriber.group.title,
    } : null,
    groups: (newSubscriber.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  };
}

export async function updateSubscriber(
  id: string, 
  data: { 
    email?: string; 
    status?: 'active' | 'churned'; 
    groupId?: string | null;
    groupIds?: string[];
  }
): Promise<Subscriber> {
  const updateData: any = {};
  if (data.email !== undefined) {
    updateData.email = data.email.toLowerCase();
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.groupId !== undefined) {
    updateData.groupId = data.groupId;
  }
  
  // Handle multiple groups
  if (data.groupIds !== undefined) {
    // Delete existing group associations
    await (prisma as any).subscriberGroup.deleteMany({
      where: { subscriberId: id },
    });
    
    // Create new group associations
    // SQLite doesn't support skipDuplicates in createMany, so we use individual creates
    if (data.groupIds.length > 0) {
      for (const groupId of data.groupIds) {
        try {
          await (prisma as any).subscriberGroup.create({
            data: {
              subscriberId: id,
              groupId: groupId,
            },
          });
        } catch (error: any) {
          // Ignore unique constraint errors (duplicates)
          // P2002 is Prisma's unique constraint violation code
          if (error.code !== 'P2002' && !error.message?.includes('Unique constraint')) {
            throw error;
          }
        }
      }
    }
  }
  
  const updated = await prisma.subscriber.update({
    where: { id },
    data: updateData,
    include: {
      group: {
        select: {
          id: true,
          title: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  }) as any;
  
  return {
    id: updated.id,
    email: updated.email,
    subscribedAt: updated.subscribedAt.toISOString(),
    syncedToSender: updated.syncedToSender,
    status: (updated.status as 'active' | 'churned') || 'active',
    groupId: updated.groupId,
    group: updated.group ? {
      id: updated.group.id,
      title: updated.group.title,
    } : null,
    groups: (updated.groups || []).map((sg: any) => ({
      id: sg.group.id,
      title: sg.group.title,
    })),
  };
}

export async function deleteSubscriber(id: string): Promise<void> {
  await prisma.subscriber.delete({
    where: { id },
  });
}

export async function markSubscriberSynced(email: string): Promise<void> {
  await prisma.subscriber.updateMany({
    where: { email: email.toLowerCase() },
    data: { syncedToSender: true },
  });
}

export async function getUnsyncedSubscribers(): Promise<Subscriber[]> {
  const subscribers = await prisma.subscriber.findMany({
    where: { 
      syncedToSender: false,
      status: 'active', // Only sync active subscribers
    },
    orderBy: { subscribedAt: 'desc' },
  });
  type SubscriberType = Awaited<ReturnType<typeof prisma.subscriber.findMany>>[0];
  return subscribers.map((sub: SubscriberType) => ({
    id: sub.id,
    email: sub.email,
    subscribedAt: sub.subscribedAt.toISOString(),
    syncedToSender: sub.syncedToSender,
    status: (sub.status as 'active' | 'churned') || 'active',
  }));
}

// Campaign functions
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

// Podcast Application functions
export async function getPodcastApplications(): Promise<PodcastApplication[]> {
  const applications = await prisma.podcastApplication.findMany({
    orderBy: { submittedAt: 'desc' },
  });
  type ApplicationType = Awaited<ReturnType<typeof prisma.podcastApplication.findMany>>[0];
  return applications.map((app: ApplicationType) => ({
    id: app.id,
    name: app.name,
    email: app.email,
    about: app.about,
    businesses: app.businesses,
    industry: app.industry,
    vision: app.vision,
    biggestChallenge: app.biggestChallenge,
    whyPodcast: app.whyPodcast,
    submittedAt: app.submittedAt.toISOString(),
    status: app.status as 'pending' | 'reviewed' | 'approved' | 'rejected',
  }));
}

export async function savePodcastApplications(applications: PodcastApplication[]): Promise<void> {
  for (const app of applications) {
    await prisma.podcastApplication.upsert({
      where: { id: app.id },
      update: {
        name: app.name,
        email: app.email,
        about: app.about,
        businesses: app.businesses,
        industry: app.industry,
        vision: app.vision,
        biggestChallenge: app.biggestChallenge,
        whyPodcast: app.whyPodcast,
        status: app.status,
      },
      create: {
        id: app.id,
        name: app.name,
        email: app.email,
        about: app.about,
        businesses: app.businesses,
        industry: app.industry,
        vision: app.vision,
        biggestChallenge: app.biggestChallenge,
        whyPodcast: app.whyPodcast,
        submittedAt: new Date(app.submittedAt),
        status: app.status,
      },
    });
  }
}

export async function addPodcastApplication(application: Omit<PodcastApplication, 'id' | 'submittedAt' | 'status'>): Promise<PodcastApplication> {
  const newApplication = await prisma.podcastApplication.create({
    data: {
      name: application.name,
      email: application.email,
      about: application.about,
      businesses: application.businesses,
      industry: application.industry,
      vision: application.vision,
      biggestChallenge: application.biggestChallenge,
      whyPodcast: application.whyPodcast,
      submittedAt: new Date(),
      status: 'pending',
    },
  });
  
  return {
    id: newApplication.id,
    name: newApplication.name,
    email: newApplication.email,
    about: newApplication.about,
    businesses: newApplication.businesses,
    industry: newApplication.industry,
    vision: newApplication.vision,
    biggestChallenge: newApplication.biggestChallenge,
    whyPodcast: newApplication.whyPodcast,
    submittedAt: newApplication.submittedAt.toISOString(),
    status: newApplication.status as 'pending' | 'reviewed' | 'approved' | 'rejected',
  };
}

export async function updatePodcastApplicationStatus(id: string, status: PodcastApplication['status']): Promise<void> {
  await prisma.podcastApplication.update({
    where: { id },
    data: { status },
  });
}

// Contact Message functions
export async function getContactMessages(): Promise<ContactMessage[]> {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { submittedAt: 'desc' },
  });
  type MessageType = Awaited<ReturnType<typeof prisma.contactMessage.findMany>>[0];
  return messages.map((msg: MessageType) => ({
    id: msg.id,
    name: msg.name,
    email: msg.email,
    message: msg.message,
    submittedAt: msg.submittedAt.toISOString(),
    read: msg.read,
  }));
}

export async function saveContactMessages(messages: ContactMessage[]): Promise<void> {
  for (const message of messages) {
    await prisma.contactMessage.upsert({
      where: { id: message.id },
      update: {
        name: message.name,
        email: message.email,
        message: message.message,
        read: message.read,
      },
      create: {
        id: message.id,
        name: message.name,
        email: message.email,
        message: message.message,
        submittedAt: new Date(message.submittedAt),
        read: message.read,
      },
    });
  }
}

export async function addContactMessage(message: Omit<ContactMessage, 'id' | 'submittedAt' | 'read'>): Promise<ContactMessage> {
  const newMessage = await prisma.contactMessage.create({
    data: {
      name: message.name,
      email: message.email,
      message: message.message,
      submittedAt: new Date(),
      read: false,
    },
  });
  
  return {
    id: newMessage.id,
    name: newMessage.name,
    email: newMessage.email,
    message: newMessage.message,
    submittedAt: newMessage.submittedAt.toISOString(),
    read: newMessage.read,
  };
}

export async function markContactMessageAsRead(id: string): Promise<void> {
  await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await prisma.contactMessage.delete({
    where: { id },
  });
}

// Group interfaces and functions
export interface Group {
  id: string;
  senderGroupId: string | null;
  title: string;
  recipientCount: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  bouncedCount: number;
  phoneCount: number;
  activePhoneCount: number;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

export async function getGroups(): Promise<Group[]> {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: 'desc' },
  });
  type GroupType = Awaited<ReturnType<typeof prisma.group.findMany>>[0];
  return groups.map((group: GroupType) => ({
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  }));
}

export async function getGroup(id: string): Promise<Group | null> {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      subscribers: {
        select: {
          id: true,
          email: true,
          status: true,
        },
      },
      campaigns: {
        select: {
          id: true,
          subject: true,
          status: true,
        },
      },
    },
  });
  
  if (!group) return null;
  
  return {
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  };
}

export async function createGroup(data: {
  senderGroupId?: string;
  title: string;
  recipientCount?: number;
  activeSubscribers?: number;
  unsubscribedCount?: number;
  bouncedCount?: number;
  phoneCount?: number;
  activePhoneCount?: number;
}): Promise<Group> {
  const group = await prisma.group.create({
    data: {
      senderGroupId: data.senderGroupId,
      title: data.title,
      recipientCount: data.recipientCount || 0,
      activeSubscribers: data.activeSubscribers || 0,
      unsubscribedCount: data.unsubscribedCount || 0,
      bouncedCount: data.bouncedCount || 0,
      phoneCount: data.phoneCount || 0,
      activePhoneCount: data.activePhoneCount || 0,
      syncedAt: new Date(),
    },
  });
  
  return {
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  };
}

export async function updateGroup(
  id: string,
  data: {
    title?: string;
    recipientCount?: number;
    activeSubscribers?: number;
    unsubscribedCount?: number;
    bouncedCount?: number;
    phoneCount?: number;
    activePhoneCount?: number;
  }
): Promise<Group> {
  const group = await prisma.group.update({
    where: { id },
    data: {
      ...data,
      syncedAt: new Date(),
    },
  });
  
  return {
    id: group.id,
    senderGroupId: group.senderGroupId,
    title: group.title,
    recipientCount: group.recipientCount,
    activeSubscribers: group.activeSubscribers,
    unsubscribedCount: group.unsubscribedCount,
    bouncedCount: group.bouncedCount,
    phoneCount: group.phoneCount,
    activePhoneCount: group.activePhoneCount,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
    syncedAt: group.syncedAt?.toISOString() || null,
  };
}

export async function deleteGroup(id: string): Promise<void> {
  await prisma.group.delete({
    where: { id },
  });
}

export async function syncGroupFromSender(senderGroup: any): Promise<Group> {
  // Find existing group by senderGroupId
  const existing = senderGroup.id
    ? await prisma.group.findUnique({
        where: { senderGroupId: senderGroup.id },
      })
    : null;

  const groupData = {
    senderGroupId: senderGroup.id,
    title: senderGroup.title,
    recipientCount: senderGroup.recipient_count || 0,
    activeSubscribers: senderGroup.active_subscribers || 0,
    unsubscribedCount: senderGroup.unsubscribed_count || 0,
    bouncedCount: senderGroup.bounced_count || 0,
    phoneCount: senderGroup.phone_count || 0,
    activePhoneCount: senderGroup.active_phone_count || 0,
    syncedAt: new Date(),
  };

  if (existing) {
    return await updateGroup(existing.id, groupData);
  } else {
    return await createGroup(groupData);
  }
}

// Email interfaces and functions
export interface Email {
  id: string;
  gmailId: string;
  threadId: string;
  subject: string;
  from: string;
  to?: string | null;
  snippet?: string | null;
  body?: string | null;
  bodyText?: string | null;
  receivedAt: string;
  isRead: boolean;
  isAnalyzed: boolean;
  isIrrelevant: boolean;
  syncedAt: string;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: EmailTask[];
}

export interface EmailTask {
  id: string;
  emailId: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  aiAnalysis?: string | null;
  createdAt: string;
  updatedAt: string;
  email?: Email;
}

export interface EmailThread {
  threadId: string;
  subject: string;
  emails: Email[];
  latestEmail: Email;
  isRead: boolean;
  isAnalyzed: boolean;
  isIrrelevant: boolean;
  unreadCount: number;
  totalCount: number;
  tasks: EmailTask[];
}

export interface EmailThreadFilters {
  search?: string;
  readStatus?: 'read' | 'unread' | 'all';
  analyzedStatus?: 'analyzed' | 'unanalyzed' | 'all';
  relevantStatus?: 'relevant' | 'irrelevant' | 'all';
  page?: number;
  pageSize?: number;
}

export interface EmailThreadResult {
  threads: EmailThread[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getEmails(): Promise<Email[]> {
  const emails = await prisma.email.findMany({
    orderBy: { receivedAt: 'desc' },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  type EmailType = Awaited<ReturnType<typeof prisma.email.findMany>>[0] & {
    tasks: Array<{
      id: string;
      emailId: string;
      title: string;
      description: string | null;
      priority: string;
      status: string;
      aiAnalysis: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  };
  
  return emails.map((email: EmailType) => ({
    id: email.id,
    gmailId: email.gmailId,
    threadId: email.threadId,
    subject: email.subject,
    from: email.from,
    to: email.to,
    snippet: email.snippet,
    body: email.body,
    bodyText: email.bodyText,
    receivedAt: email.receivedAt.toISOString(),
    isRead: email.isRead,
    isAnalyzed: email.isAnalyzed,
    isIrrelevant: email.isIrrelevant,
    syncedAt: email.syncedAt.toISOString(),
    lastSyncedAt: email.lastSyncedAt?.toISOString() || null,
    createdAt: email.createdAt.toISOString(),
    updatedAt: email.updatedAt.toISOString(),
    tasks: email.tasks.map((task: { id: string; emailId: string; title: string; description: string | null; priority: string; status: string; aiAnalysis: string | null; createdAt: Date; updatedAt: Date }) => ({
      id: task.id,
      emailId: task.emailId,
      title: task.title,
      description: task.description,
      priority: task.priority as 'low' | 'medium' | 'high',
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      aiAnalysis: task.aiAnalysis,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  }));
}

export async function getEmailThreads(filters?: EmailThreadFilters): Promise<EmailThreadResult> {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 20;
  const search = filters?.search?.trim() || '';
  const readStatus = filters?.readStatus || 'all';
  const analyzedStatus = filters?.analyzedStatus || 'all';
  const relevantStatus = filters?.relevantStatus || 'relevant'; // Default to showing only relevant
  
  // Build where clause
  const where: any = {};
  
  // Filter by irrelevant status (default to showing only relevant)
  if (relevantStatus === 'relevant') {
    where.isIrrelevant = false;
  } else if (relevantStatus === 'irrelevant') {
    where.isIrrelevant = true;
  }
  // 'all' means no filter on isIrrelevant
  
  // Search filter (subject, snippet, bodyText, from)
  // SQLite doesn't support case-insensitive mode, so we'll filter in memory after fetching
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { snippet: { contains: search } },
      { bodyText: { contains: search } },
      { from: { contains: search } },
    ];
  }
  
  // Read status filter
  if (readStatus === 'read') {
    where.isRead = true;
  } else if (readStatus === 'unread') {
    where.isRead = false;
  }
  
  // Analyzed status filter
  if (analyzedStatus === 'analyzed') {
    where.isAnalyzed = true;
  } else if (analyzedStatus === 'unanalyzed') {
    where.isAnalyzed = false;
  }
  
  // Get all matching emails
  const emails = await prisma.email.findMany({
    where,
    orderBy: { receivedAt: 'desc' },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  // Group emails by threadId
  // Normalize threadId to ensure consistent grouping (trim whitespace)
  const threadMap = new Map<string, Email[]>();
  
  for (const email of emails) {
    // Normalize threadId - trim whitespace
    // If threadId is missing, use gmailId as fallback (shouldn't happen in normal cases)
    const normalizedThreadId = (email.threadId || email.gmailId || '').trim();
    
    if (!email.threadId && email.gmailId) {
      console.warn(`Email ${email.gmailId} has no threadId, using gmailId as fallback. This email will appear as its own thread.`);
    }
    
    const emailData: Email = {
      id: email.id,
      gmailId: email.gmailId,
      threadId: normalizedThreadId,
      subject: email.subject,
      from: email.from,
      to: email.to,
      snippet: email.snippet,
      body: email.body,
      bodyText: email.bodyText,
      receivedAt: email.receivedAt.toISOString(),
      isRead: email.isRead,
      isAnalyzed: email.isAnalyzed,
      isIrrelevant: email.isIrrelevant,
      syncedAt: email.syncedAt.toISOString(),
      lastSyncedAt: email.lastSyncedAt?.toISOString() || null,
      createdAt: email.createdAt.toISOString(),
      updatedAt: email.updatedAt.toISOString(),
      tasks: email.tasks.map((task: { id: string; emailId: string; title: string; description: string | null; priority: string; status: string; aiAnalysis: string | null; createdAt: Date; updatedAt: Date }) => ({
        id: task.id,
        emailId: task.emailId,
        title: task.title,
        description: task.description,
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        aiAnalysis: task.aiAnalysis,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
    
    if (!threadMap.has(normalizedThreadId)) {
      threadMap.set(normalizedThreadId, []);
    }
    threadMap.get(normalizedThreadId)!.push(emailData);
  }
  
  // Convert to thread objects
  const threads: EmailThread[] = [];
  
  for (const [threadId, threadEmails] of threadMap.entries()) {
    // Sort emails in thread by receivedAt (oldest first)
    threadEmails.sort((a, b) => 
      new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
    );
    
    // Latest email is the last one
    const latestEmail = threadEmails[threadEmails.length - 1];
    
    // Collect all tasks from all emails in the thread
    const allTasks: EmailTask[] = [];
    for (const email of threadEmails) {
      if (email.tasks) {
        allTasks.push(...email.tasks);
      }
    }
    
    // Thread is read if all emails are read
    const isRead = threadEmails.every(e => e.isRead);
    
    // Thread is analyzed if all emails are analyzed
    const isAnalyzed = threadEmails.every(e => e.isAnalyzed);
    
    // Thread is irrelevant if any email is irrelevant
    const isIrrelevant = threadEmails.some(e => e.isIrrelevant);
    
    // Count unread emails in thread
    const unreadCount = threadEmails.filter(e => !e.isRead).length;
    
    threads.push({
      threadId,
      subject: latestEmail.subject,
      emails: threadEmails,
      latestEmail,
      isRead,
      isAnalyzed,
      isIrrelevant,
      unreadCount,
      totalCount: threadEmails.length,
      tasks: allTasks,
    });
  }
  
  // Apply case-insensitive search filter if needed (SQLite limitation)
  let filteredThreads = threads;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredThreads = threads.filter(thread => {
      const subject = (thread.subject || '').toLowerCase();
      const snippet = (thread.latestEmail.snippet || '').toLowerCase();
      const bodyText = (thread.latestEmail.bodyText || '').toLowerCase();
      const from = (thread.latestEmail.from || '').toLowerCase();
      return subject.includes(searchLower) || 
             snippet.includes(searchLower) || 
             bodyText.includes(searchLower) || 
             from.includes(searchLower);
    });
  }
  
  // Sort threads by latest email receivedAt (newest first)
  filteredThreads.sort((a, b) => 
    new Date(b.latestEmail.receivedAt).getTime() - new Date(a.latestEmail.receivedAt).getTime()
  );
  
  // Apply pagination
  const total = filteredThreads.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedThreads = filteredThreads.slice(startIndex, endIndex);
  
  return {
    threads: paginatedThreads,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getEmail(id: string): Promise<Email | null> {
  const email = await prisma.email.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  if (!email) return null;
  
  return {
    id: email.id,
    gmailId: email.gmailId,
    threadId: email.threadId,
    subject: email.subject,
    from: email.from,
    to: email.to,
    snippet: email.snippet,
    body: email.body,
    bodyText: email.bodyText,
    receivedAt: email.receivedAt.toISOString(),
    isRead: email.isRead,
    isAnalyzed: email.isAnalyzed,
    isIrrelevant: email.isIrrelevant,
    syncedAt: email.syncedAt.toISOString(),
    lastSyncedAt: email.lastSyncedAt?.toISOString() || null,
    createdAt: email.createdAt.toISOString(),
    updatedAt: email.updatedAt.toISOString(),
    tasks: email.tasks.map((task: { id: string; emailId: string; title: string; description: string | null; priority: string; status: string; aiAnalysis: string | null; createdAt: Date; updatedAt: Date }) => ({
      id: task.id,
      emailId: task.emailId,
      title: task.title,
      description: task.description,
      priority: task.priority as 'low' | 'medium' | 'high',
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      aiAnalysis: task.aiAnalysis,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  };
}

export async function getEmailTasks(): Promise<EmailTask[]> {
  const tasks = await prisma.emailTask.findMany({
    orderBy: [
      { priority: 'desc' }, // high, medium, low
      { createdAt: 'desc' },
    ],
    include: {
      email: true,
    },
  });
  
  type TaskType = Awaited<ReturnType<typeof prisma.emailTask.findMany<{ include: { email: true } }>>>[0];
  
  return tasks.map((task: TaskType) => ({
    id: task.id,
    emailId: task.emailId,
    title: task.title,
    description: task.description,
    priority: task.priority as 'low' | 'medium' | 'high',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    aiAnalysis: task.aiAnalysis,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    email: task.email ? {
      id: task.email.id,
      gmailId: task.email.gmailId,
      threadId: task.email.threadId,
      subject: task.email.subject,
      from: task.email.from,
      to: task.email.to,
      snippet: task.email.snippet,
      body: task.email.body,
      bodyText: task.email.bodyText,
      receivedAt: task.email.receivedAt.toISOString(),
      isRead: task.email.isRead,
      isAnalyzed: task.email.isAnalyzed,
      isIrrelevant: task.email.isIrrelevant,
      syncedAt: task.email.syncedAt.toISOString(),
      lastSyncedAt: task.email.lastSyncedAt?.toISOString() || null,
      createdAt: task.email.createdAt.toISOString(),
      updatedAt: task.email.updatedAt.toISOString(),
    } : undefined,
  }));
}

export async function createEmailTask(data: {
  emailId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  aiAnalysis?: string;
}): Promise<EmailTask> {
  const task = await prisma.emailTask.create({
    data: {
      emailId: data.emailId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      aiAnalysis: data.aiAnalysis,
    },
    include: {
      email: true,
    },
  });
  
  return {
    id: task.id,
    emailId: task.emailId,
    title: task.title,
    description: task.description,
    priority: task.priority as 'low' | 'medium' | 'high',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    aiAnalysis: task.aiAnalysis,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    email: task.email ? {
      id: task.email.id,
      gmailId: task.email.gmailId,
      threadId: task.email.threadId,
      subject: task.email.subject,
      from: task.email.from,
      to: task.email.to,
      snippet: task.email.snippet,
      body: task.email.body,
      bodyText: task.email.bodyText,
      receivedAt: task.email.receivedAt.toISOString(),
      isRead: task.email.isRead,
      isAnalyzed: task.email.isAnalyzed,
      isIrrelevant: task.email.isIrrelevant,
      syncedAt: task.email.syncedAt.toISOString(),
      lastSyncedAt: task.email.lastSyncedAt?.toISOString() || null,
      createdAt: task.email.createdAt.toISOString(),
      updatedAt: task.email.updatedAt.toISOString(),
    } : undefined,
  };
}

export async function updateEmailTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }
): Promise<EmailTask> {
  const task = await prisma.emailTask.update({
    where: { id },
    data,
    include: {
      email: true,
    },
  });
  
  return {
    id: task.id,
    emailId: task.emailId,
    title: task.title,
    description: task.description,
    priority: task.priority as 'low' | 'medium' | 'high',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    aiAnalysis: task.aiAnalysis,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    email: task.email ? {
      id: task.email.id,
      gmailId: task.email.gmailId,
      threadId: task.email.threadId,
      subject: task.email.subject,
      from: task.email.from,
      to: task.email.to,
      snippet: task.email.snippet,
      body: task.email.body,
      bodyText: task.email.bodyText,
      receivedAt: task.email.receivedAt.toISOString(),
      isRead: task.email.isRead,
      isAnalyzed: task.email.isAnalyzed,
      isIrrelevant: task.email.isIrrelevant,
      syncedAt: task.email.syncedAt.toISOString(),
      lastSyncedAt: task.email.lastSyncedAt?.toISOString() || null,
      createdAt: task.email.createdAt.toISOString(),
      updatedAt: task.email.updatedAt.toISOString(),
    } : undefined,
  };
}

export async function deleteEmailTask(id: string): Promise<void> {
  await prisma.emailTask.delete({
    where: { id },
  });
}
