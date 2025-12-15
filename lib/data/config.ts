import { prisma } from '../prisma';
import type { Config } from './types';

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

