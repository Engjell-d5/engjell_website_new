import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, 'users.json');
const blogsFile = path.join(dataDir, 'blogs.json');
const videosFile = path.join(dataDir, 'videos.json');
const configFile = path.join(dataDir, 'config.json');
const subscribersFile = path.join(dataDir, 'subscribers.json');
const podcastApplicationsFile = path.join(dataDir, 'podcast-applications.json');
const contactMessagesFile = path.join(dataDir, 'contact-messages.json');

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(blogsFile)) {
  fs.writeFileSync(blogsFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(videosFile)) {
  fs.writeFileSync(videosFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(configFile)) {
  fs.writeFileSync(configFile, JSON.stringify({
    youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
    youtubeChannelId: '',
    cronSchedule: '0 2 * * *', // 2 AM daily
    lastVideoFetch: null,
  }, null, 2));
}

if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(podcastApplicationsFile)) {
  fs.writeFileSync(podcastApplicationsFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(contactMessagesFile)) {
  fs.writeFileSync(contactMessagesFile, JSON.stringify([], null, 2));
}

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

export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

export function getBlogs(): Blog[] {
  try {
    const data = fs.readFileSync(blogsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveBlogs(blogs: Blog[]): void {
  fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 2));
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

export function getVideos(): YouTubeVideo[] {
  try {
    const data = fs.readFileSync(videosFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveVideos(videos: YouTubeVideo[]): void {
  fs.writeFileSync(videosFile, JSON.stringify(videos, null, 2));
}

export function getConfig(): Config {
  try {
    const data = fs.readFileSync(configFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
      youtubeChannelId: '',
      cronSchedule: '0 2 * * *',
      lastVideoFetch: null,
    };
  }
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  syncedToSender: boolean;
}

export function getSubscribers(): Subscriber[] {
  try {
    const data = fs.readFileSync(subscribersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveSubscribers(subscribers: Subscriber[]): void {
  fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
}

export function addSubscriber(email: string): Subscriber {
  const subscribers = getSubscribers();
  
  // Check if email already exists
  const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('Email already subscribed');
  }
  
  const newSubscriber: Subscriber = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    subscribedAt: new Date().toISOString(),
    syncedToSender: false,
  };
  
  subscribers.push(newSubscriber);
  saveSubscribers(subscribers);
  
  return newSubscriber;
}

export function markSubscriberSynced(email: string): void {
  const subscribers = getSubscribers();
  const subscriber = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (subscriber) {
    subscriber.syncedToSender = true;
    saveSubscribers(subscribers);
  }
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

export function getPodcastApplications(): PodcastApplication[] {
  try {
    const data = fs.readFileSync(podcastApplicationsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function savePodcastApplications(applications: PodcastApplication[]): void {
  fs.writeFileSync(podcastApplicationsFile, JSON.stringify(applications, null, 2));
}

export function addPodcastApplication(application: Omit<PodcastApplication, 'id' | 'submittedAt' | 'status'>): PodcastApplication {
  const applications = getPodcastApplications();
  
  const newApplication: PodcastApplication = {
    ...application,
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  
  applications.push(newApplication);
  savePodcastApplications(applications);
  
  return newApplication;
}

export function updatePodcastApplicationStatus(id: string, status: PodcastApplication['status']): void {
  const applications = getPodcastApplications();
  const application = applications.find(a => a.id === id);
  if (application) {
    application.status = status;
    savePodcastApplications(applications);
  }
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  read: boolean;
}

export function getContactMessages(): ContactMessage[] {
  try {
    const data = fs.readFileSync(contactMessagesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveContactMessages(messages: ContactMessage[]): void {
  fs.writeFileSync(contactMessagesFile, JSON.stringify(messages, null, 2));
}

export function addContactMessage(message: Omit<ContactMessage, 'id' | 'submittedAt' | 'read'>): ContactMessage {
  const messages = getContactMessages();
  
  const newMessage: ContactMessage = {
    ...message,
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
    read: false,
  };
  
  messages.push(newMessage);
  saveContactMessages(messages);
  
  return newMessage;
}

export function markContactMessageAsRead(id: string): void {
  const messages = getContactMessages();
  const message = messages.find(m => m.id === id);
  if (message) {
    message.read = true;
    saveContactMessages(messages);
  }
}

export function deleteContactMessage(id: string): void {
  const messages = getContactMessages();
  const filteredMessages = messages.filter(m => m.id !== id);
  saveContactMessages(filteredMessages);
}

