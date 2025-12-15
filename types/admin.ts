// Shared admin types

// Email types
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
  syncedAt: string;
  lastSyncedAt?: string | null;
  tasks?: EmailTask[];
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

export interface EmailTask {
  id: string;
  emailId: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  aiAnalysis?: string | null;
  externalTaskId?: string | null;
  createdAt: string;
  updatedAt: string;
  email?: Email;
}

export interface AiIntegration {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  syncedToSender: boolean;
  status: 'active' | 'churned';
  groupId?: string | null;
  group?: {
    id: string;
    title: string;
  } | null;
  groups?: Array<{
    id: string;
    title: string;
  }>;
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
  groups?: string | null;
  groupId?: string | null;
  group?: {
    id: string;
    title: string;
  } | null;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  hook?: string | null;
  content?: string;
  imageUrl: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  campaigns?: Array<{
    id: string;
    subject: string;
    status: string;
  }>;
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

// Social media types
export interface MediaAsset {
  type: 'image' | 'video';
  url: string;
  filename?: string;
}

export interface SocialPost {
  id: string;
  content: string;
  mediaAssets: string | null; // JSON string of MediaAsset[]
  platforms: string;
  scheduledFor: string;
  publishedAt: string | null;
  status: string;
  publishedOn: string | null;
  errorMessage: string | null;
  timesPosted: number;
  comments: string | null; // JSON string of string[]
  createdAt: string;
}

export interface SocialConnection {
  id: string;
  platform: string;
  isActive: boolean;
  username: string | null;
  profileImage: string | null;
  organizations?: string | null; // JSON string of organizations
}

export interface PostIdea {
  id: string;
  title: string;
  prompt: string;
  status: string;
  createdAt: string;
}

