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
}

export interface Config {
  youtubeApiKey: string;
  youtubeChannelId: string;
  cronSchedule: string;
  lastVideoFetch: string | null;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  syncedToSender: boolean;
  status: 'active' | 'churned';
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
  return users.map(user => ({
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
    include: { author: true },
  });
  return blogs.map(blog => ({
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
export async function getVideos(): Promise<YouTubeVideo[]> {
  const videos = await prisma.youTubeVideo.findMany({
    orderBy: { publishedAt: 'desc' },
  });
  return videos.map(video => ({
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
  }));
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
      lastVideoFetch: config.lastVideoFetch?.toISOString() || null,
    };
  }
  // Create default config if none exists
  const defaultConfig = await prisma.config.create({
    data: {
      youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
      youtubeChannelId: '',
      cronSchedule: '0 2 * * *',
      lastVideoFetch: null,
    },
  });
  return {
    youtubeApiKey: defaultConfig.youtubeApiKey || process.env.YOUTUBE_API_KEY || '',
    youtubeChannelId: defaultConfig.youtubeChannelId || '',
    cronSchedule: defaultConfig.cronSchedule || '0 2 * * *',
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
        lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
      },
    });
  } else {
    await prisma.config.create({
      data: {
        youtubeApiKey: config.youtubeApiKey,
        youtubeChannelId: config.youtubeChannelId,
        cronSchedule: config.cronSchedule,
        lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
      },
    });
  }
}

// Subscriber functions
export async function getSubscribers(): Promise<Subscriber[]> {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { subscribedAt: 'desc' },
  });
  return subscribers.map(sub => ({
    id: sub.id,
    email: sub.email,
    subscribedAt: sub.subscribedAt.toISOString(),
    syncedToSender: sub.syncedToSender,
    status: (sub.status as 'active' | 'churned') || 'active',
  }));
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

export async function addSubscriber(email: string, status: 'active' | 'churned' = 'active'): Promise<Subscriber> {
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
    },
  });
  
  return {
    id: newSubscriber.id,
    email: newSubscriber.email,
    subscribedAt: newSubscriber.subscribedAt.toISOString(),
    syncedToSender: newSubscriber.syncedToSender,
    status: (newSubscriber.status as 'active' | 'churned') || 'active',
  };
}

export async function updateSubscriber(id: string, data: { email?: string; status?: 'active' | 'churned' }): Promise<Subscriber> {
  const updateData: any = {};
  if (data.email !== undefined) {
    updateData.email = data.email.toLowerCase();
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  
  const updated = await prisma.subscriber.update({
    where: { id },
    data: updateData,
  });
  
  return {
    id: updated.id,
    email: updated.email,
    subscribedAt: updated.subscribedAt.toISOString(),
    syncedToSender: updated.syncedToSender,
    status: (updated.status as 'active' | 'churned') || 'active',
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
  return subscribers.map(sub => ({
    id: sub.id,
    email: sub.email,
    subscribedAt: sub.subscribedAt.toISOString(),
    syncedToSender: sub.syncedToSender,
    status: (sub.status as 'active' | 'churned') || 'active',
  }));
}

// Podcast Application functions
export async function getPodcastApplications(): Promise<PodcastApplication[]> {
  const applications = await prisma.podcastApplication.findMany({
    orderBy: { submittedAt: 'desc' },
  });
  return applications.map(app => ({
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
  return messages.map(msg => ({
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
