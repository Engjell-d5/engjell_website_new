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

