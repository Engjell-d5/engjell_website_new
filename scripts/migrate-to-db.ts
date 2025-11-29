import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
const dataDir = path.join(process.cwd(), 'data');

async function migrate() {
  console.log('Starting migration from JSON to database...\n');

  try {
    // Migrate Users
    console.log('Migrating users...');
    const usersFile = path.join(dataDir, 'users.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
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
      console.log(`  ✓ Migrated ${users.length} users`);
    }

    // Migrate Blogs
    console.log('Migrating blogs...');
    const blogsFile = path.join(dataDir, 'blogs.json');
    if (fs.existsSync(blogsFile)) {
      const blogs = JSON.parse(fs.readFileSync(blogsFile, 'utf8'));
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
      console.log(`  ✓ Migrated ${blogs.length} blogs`);
    }

    // Migrate YouTube Videos
    console.log('Migrating YouTube videos...');
    const videosFile = path.join(dataDir, 'videos.json');
    if (fs.existsSync(videosFile)) {
      const videos = JSON.parse(fs.readFileSync(videosFile, 'utf8'));
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
      console.log(`  ✓ Migrated ${videos.length} videos`);
    }

    // Migrate Config
    console.log('Migrating config...');
    const configFile = path.join(dataDir, 'config.json');
    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      const existingConfig = await prisma.config.findFirst();
      if (existingConfig) {
        await prisma.config.update({
          where: { id: existingConfig.id },
          data: {
            youtubeApiKey: config.youtubeApiKey || process.env.YOUTUBE_API_KEY || '',
            youtubeChannelId: config.youtubeChannelId || '',
            cronSchedule: config.cronSchedule || '0 2 * * *',
            lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
          },
        });
      } else {
        await prisma.config.create({
          data: {
            youtubeApiKey: config.youtubeApiKey || process.env.YOUTUBE_API_KEY || '',
            youtubeChannelId: config.youtubeChannelId || '',
            cronSchedule: config.cronSchedule || '0 2 * * *',
            lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
          },
        });
      }
      console.log('  ✓ Migrated config');
    }

    // Migrate Subscribers
    console.log('Migrating subscribers...');
    const subscribersFile = path.join(dataDir, 'subscribers.json');
    if (fs.existsSync(subscribersFile)) {
      const subscribers = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
      for (const subscriber of subscribers) {
        await prisma.subscriber.upsert({
          where: { email: subscriber.email },
          update: {
            syncedToSender: subscriber.syncedToSender,
          },
          create: {
            id: subscriber.id,
            email: subscriber.email,
            subscribedAt: new Date(subscriber.subscribedAt),
            syncedToSender: subscriber.syncedToSender || false,
          },
        });
      }
      console.log(`  ✓ Migrated ${subscribers.length} subscribers`);
    }

    // Migrate Podcast Applications
    console.log('Migrating podcast applications...');
    const podcastApplicationsFile = path.join(dataDir, 'podcast-applications.json');
    if (fs.existsSync(podcastApplicationsFile)) {
      const applications = JSON.parse(fs.readFileSync(podcastApplicationsFile, 'utf8'));
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
            status: app.status || 'pending',
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
            status: app.status || 'pending',
          },
        });
      }
      console.log(`  ✓ Migrated ${applications.length} podcast applications`);
    }

    // Migrate Contact Messages
    console.log('Migrating contact messages...');
    const contactMessagesFile = path.join(dataDir, 'contact-messages.json');
    if (fs.existsSync(contactMessagesFile)) {
      const messages = JSON.parse(fs.readFileSync(contactMessagesFile, 'utf8'));
      for (const message of messages) {
        await prisma.contactMessage.upsert({
          where: { id: message.id },
          update: {
            name: message.name,
            email: message.email,
            message: message.message,
            read: message.read || false,
          },
          create: {
            id: message.id,
            name: message.name,
            email: message.email,
            message: message.message,
            submittedAt: new Date(message.submittedAt),
            read: message.read || false,
          },
        });
      }
      console.log(`  ✓ Migrated ${messages.length} contact messages`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNote: Your JSON files are still in the data/ directory.');
    console.log('You can delete them after verifying the database migration is working correctly.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
