import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

/**
 * Migration script to migrate data from SQLite to PostgreSQL
 * 
 * Usage:
 * 1. Set DATABASE_URL to PostgreSQL connection string
 * 2. Ensure SQLite database exists at data/database.db
 * 3. Run: npx tsx scripts/migrate-sqlite-to-postgres.ts
 */

const sqlitePath = path.join(process.cwd(), 'data', 'database.db');
const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function migrateSqliteToPostgres() {
  console.log('🔄 Starting SQLite to PostgreSQL migration...\n');

  // Check if SQLite database exists
  const sqlite = new Database(sqlitePath, { readonly: true });
  
  try {
    // Test PostgreSQL connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Migrate Users
    console.log('📦 Migrating users...');
    const users = sqlite.prepare('SELECT * FROM users').all() as any[];
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
    console.log(`  ✓ Migrated ${users.length} users\n`);

    // Migrate Blogs
    console.log('📦 Migrating blogs...');
    const blogs = sqlite.prepare('SELECT * FROM blogs').all() as any[];
    for (const blog of blogs) {
      await prisma.blog.upsert({
        where: { slug: blog.slug },
        update: {
          title: blog.title,
          category: blog.category,
          excerpt: blog.excerpt,
          hook: blog.hook || null,
          content: blog.content || '',
          imageUrl: blog.imageUrl,
          published: blog.published === 1 || blog.published === true,
          publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
          authorId: blog.authorId,
          seoMetaTitle: blog.seoMetaTitle || null,
          seoMetaDescription: blog.seoMetaDescription || null,
          seoKeywords: blog.seoKeywords || null,
          seoOgTitle: blog.seoOgTitle || null,
          seoOgDescription: blog.seoOgDescription || null,
          seoOgImage: blog.seoOgImage || null,
          seoTwitterCard: blog.seoTwitterCard || null,
          seoTwitterTitle: blog.seoTwitterTitle || null,
          seoTwitterDescription: blog.seoTwitterDescription || null,
          seoTwitterImage: blog.seoTwitterImage || null,
          updatedAt: new Date(blog.updatedAt),
        },
        create: {
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          category: blog.category,
          excerpt: blog.excerpt,
          hook: blog.hook || null,
          content: blog.content || '',
          imageUrl: blog.imageUrl,
          published: blog.published === 1 || blog.published === true,
          publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
          authorId: blog.authorId,
          createdAt: new Date(blog.createdAt),
          updatedAt: new Date(blog.updatedAt),
          seoMetaTitle: blog.seoMetaTitle || null,
          seoMetaDescription: blog.seoMetaDescription || null,
          seoKeywords: blog.seoKeywords || null,
          seoOgTitle: blog.seoOgTitle || null,
          seoOgDescription: blog.seoOgDescription || null,
          seoOgImage: blog.seoOgImage || null,
          seoTwitterCard: blog.seoTwitterCard || null,
          seoTwitterTitle: blog.seoTwitterTitle || null,
          seoTwitterDescription: blog.seoTwitterDescription || null,
          seoTwitterImage: blog.seoTwitterImage || null,
        },
      });
    }
    console.log(`  ✓ Migrated ${blogs.length} blogs\n`);

    // Migrate YouTube Videos
    console.log('📦 Migrating YouTube videos...');
    const videos = sqlite.prepare('SELECT * FROM youtube_videos').all() as any[];
    for (const video of videos) {
      await prisma.youTubeVideo.upsert({
        where: { videoId: video.videoId },
        update: {
          title: video.title,
          description: video.description || '',
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: new Date(video.publishedAt),
          duration: video.duration,
          viewCount: video.viewCount,
          channelTitle: video.channelTitle,
          fetchedAt: new Date(video.fetchedAt),
          featured: video.featured === 1 || video.featured === true,
          removed: video.removed === 1 || video.removed === true,
        },
        create: {
          id: video.id,
          videoId: video.videoId,
          title: video.title,
          description: video.description || '',
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: new Date(video.publishedAt),
          duration: video.duration,
          viewCount: video.viewCount,
          channelTitle: video.channelTitle,
          fetchedAt: new Date(video.fetchedAt),
          featured: video.featured === 1 || video.featured === true,
          removed: video.removed === 1 || video.removed === true,
        },
      });
    }
    console.log(`  ✓ Migrated ${videos.length} YouTube videos\n`);

    // Migrate Config
    console.log('📦 Migrating config...');
    const configs = sqlite.prepare('SELECT * FROM config').all() as any[];
    if (configs.length > 0) {
      const config = configs[0];
      const existingConfig = await prisma.config.findFirst();
      if (existingConfig) {
        await prisma.config.update({
          where: { id: existingConfig.id },
          data: {
            youtubeApiKey: config.youtubeApiKey || '',
            youtubeChannelId: config.youtubeChannelId || '',
            cronSchedule: config.cronSchedule || '0 2 * * *',
            socialMediaCronSchedule: config.socialMediaCronSchedule || '*/5 * * * *',
            lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
          },
        });
      } else {
        await prisma.config.create({
          data: {
            youtubeApiKey: config.youtubeApiKey || '',
            youtubeChannelId: config.youtubeChannelId || '',
            cronSchedule: config.cronSchedule || '0 2 * * *',
            socialMediaCronSchedule: config.socialMediaCronSchedule || '*/5 * * * *',
            lastVideoFetch: config.lastVideoFetch ? new Date(config.lastVideoFetch) : null,
          },
        });
      }
      console.log('  ✓ Migrated config\n');
    }

    // Migrate Groups FIRST (subscribers have foreign key to groups)
    console.log('📦 Migrating groups...');
    const groups = sqlite.prepare('SELECT * FROM groups').all() as any[];
    for (const group of groups) {
      await prisma.group.upsert({
        where: { id: group.id },
        update: {
          senderGroupId: group.senderGroupId || null,
          title: group.title,
          recipientCount: group.recipientCount || 0,
          activeSubscribers: group.activeSubscribers || 0,
          unsubscribedCount: group.unsubscribedCount || 0,
          bouncedCount: group.bouncedCount || 0,
          phoneCount: group.phoneCount || 0,
          activePhoneCount: group.activePhoneCount || 0,
          syncedAt: group.syncedAt ? new Date(group.syncedAt) : null,
          updatedAt: new Date(group.updatedAt),
        },
        create: {
          id: group.id,
          senderGroupId: group.senderGroupId || null,
          title: group.title,
          recipientCount: group.recipientCount || 0,
          activeSubscribers: group.activeSubscribers || 0,
          unsubscribedCount: group.unsubscribedCount || 0,
          bouncedCount: group.bouncedCount || 0,
          phoneCount: group.phoneCount || 0,
          activePhoneCount: group.activePhoneCount || 0,
          createdAt: new Date(group.createdAt),
          updatedAt: new Date(group.updatedAt),
          syncedAt: group.syncedAt ? new Date(group.syncedAt) : null,
        },
      });
    }
    console.log(`  ✓ Migrated ${groups.length} groups\n`);

    // Migrate Subscribers AFTER groups (they have foreign key to groups)
    console.log('📦 Migrating subscribers...');
    const subscribers = sqlite.prepare('SELECT * FROM subscribers').all() as any[];
    for (const subscriber of subscribers) {
      await prisma.subscriber.upsert({
        where: { email: subscriber.email },
        update: {
          syncedToSender: subscriber.syncedToSender === 1 || subscriber.syncedToSender === true,
          status: subscriber.status || 'active',
          groupId: subscriber.groupId || null,
        },
        create: {
          id: subscriber.id,
          email: subscriber.email,
          subscribedAt: new Date(subscriber.subscribedAt),
          syncedToSender: subscriber.syncedToSender === 1 || subscriber.syncedToSender === true,
          status: subscriber.status || 'active',
          groupId: subscriber.groupId || null,
        },
      });
    }
    console.log(`  ✓ Migrated ${subscribers.length} subscribers\n`);

    // Migrate SubscriberGroups (many-to-many)
    console.log('📦 Migrating subscriber groups...');
    try {
      const subscriberGroups = sqlite.prepare('SELECT * FROM subscriber_groups').all() as any[];
      for (const sg of subscriberGroups) {
        await prisma.subscriberGroup.upsert({
          where: {
            subscriberId_groupId: {
              subscriberId: sg.subscriberId,
              groupId: sg.groupId,
            },
          },
          update: {
            createdAt: new Date(sg.createdAt),
          },
          create: {
            id: sg.id,
            subscriberId: sg.subscriberId,
            groupId: sg.groupId,
            createdAt: new Date(sg.createdAt),
          },
        });
      }
      console.log(`  ✓ Migrated ${subscriberGroups.length} subscriber group relations\n`);
    } catch (error) {
      console.log('  ⚠️  Subscriber groups table might not exist, skipping...\n');
    }

    // Migrate Podcast Applications
    console.log('📦 Migrating podcast applications...');
    try {
      const applications = sqlite.prepare('SELECT * FROM podcast_applications').all() as any[];
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
      console.log(`  ✓ Migrated ${applications.length} podcast applications\n`);
    } catch (error) {
      console.log('  ⚠️  Podcast applications table might not exist, skipping...\n');
    }

    // Migrate Contact Messages
    console.log('📦 Migrating contact messages...');
    try {
      const messages = sqlite.prepare('SELECT * FROM contact_messages').all() as any[];
      for (const message of messages) {
        await prisma.contactMessage.upsert({
          where: { id: message.id },
          update: {
            name: message.name,
            email: message.email,
            message: message.message,
            read: message.read === 1 || message.read === true,
          },
          create: {
            id: message.id,
            name: message.name,
            email: message.email,
            message: message.message,
            submittedAt: new Date(message.submittedAt),
            read: message.read === 1 || message.read === true,
          },
        });
      }
      console.log(`  ✓ Migrated ${messages.length} contact messages\n`);
    } catch (error) {
      console.log('  ⚠️  Contact messages table might not exist, skipping...\n');
    }

    // Migrate Social Connections
    console.log('📦 Migrating social connections...');
    try {
      const connections = sqlite.prepare('SELECT * FROM social_connections').all() as any[];
      for (const conn of connections) {
        await prisma.socialConnection.upsert({
          where: { platform: conn.platform },
          update: {
            accessToken: conn.accessToken,
            refreshToken: conn.refreshToken || null,
            expiresAt: conn.expiresAt ? new Date(conn.expiresAt) : null,
            isActive: conn.isActive === 1 || conn.isActive === true,
            username: conn.username || null,
            profileImage: conn.profileImage || null,
            organizations: conn.organizations || null,
          },
          create: {
            id: conn.id,
            platform: conn.platform,
            accessToken: conn.accessToken,
            refreshToken: conn.refreshToken || null,
            expiresAt: conn.expiresAt ? new Date(conn.expiresAt) : null,
            connectedAt: new Date(conn.connectedAt),
            isActive: conn.isActive === 1 || conn.isActive === true,
            username: conn.username || null,
            profileImage: conn.profileImage || null,
            organizations: conn.organizations || null,
          },
        });
      }
      console.log(`  ✓ Migrated ${connections.length} social connections\n`);
    } catch (error) {
      console.log('  ⚠️  Social connections table might not exist, skipping...\n');
    }

    // Migrate Social Posts
    console.log('📦 Migrating social posts...');
    try {
      const posts = sqlite.prepare('SELECT * FROM social_posts').all() as any[];
      for (const post of posts) {
        await prisma.socialPost.upsert({
          where: { id: post.id },
          update: {
            content: post.content,
            mediaAssets: post.mediaAssets || null,
            platforms: post.platforms,
            scheduledFor: new Date(post.scheduledFor),
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
            status: post.status || 'scheduled',
            publishedOn: post.publishedOn || null,
            errorMessage: post.errorMessage || null,
            timesPosted: post.timesPosted || 0,
            comments: post.comments || null,
            createdBy: post.createdBy || null,
            updatedAt: new Date(post.updatedAt),
          },
          create: {
            id: post.id,
            content: post.content,
            mediaAssets: post.mediaAssets || null,
            platforms: post.platforms,
            scheduledFor: new Date(post.scheduledFor),
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
            status: post.status || 'scheduled',
            publishedOn: post.publishedOn || null,
            errorMessage: post.errorMessage || null,
            timesPosted: post.timesPosted || 0,
            comments: post.comments || null,
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt),
            createdBy: post.createdBy || null,
          },
        });
      }
      console.log(`  ✓ Migrated ${posts.length} social posts\n`);
    } catch (error) {
      console.log('  ⚠️  Social posts table might not exist, skipping...\n');
    }

    // Migrate Campaigns
    console.log('📦 Migrating campaigns...');
    try {
      const campaigns = sqlite.prepare('SELECT * FROM campaigns').all() as any[];
      for (const campaign of campaigns) {
        await prisma.campaign.upsert({
          where: { id: campaign.id },
          update: {
            senderCampaignId: campaign.senderCampaignId || null,
            blogId: campaign.blogId || null,
            title: campaign.title || null,
            subject: campaign.subject,
            from: campaign.from,
            preheader: campaign.preheader || null,
            replyTo: campaign.replyTo,
            contentType: campaign.contentType || 'html',
            content: campaign.content,
            googleAnalytics: campaign.googleAnalytics === 1 || campaign.googleAnalytics === true,
            autoFollowupActive: campaign.autoFollowupActive === 1 || campaign.autoFollowupActive === true,
            autoFollowupSubject: campaign.autoFollowupSubject || null,
            autoFollowupDelay: campaign.autoFollowupDelay || null,
            groups: campaign.groups || null,
            segments: campaign.segments || null,
            groupId: campaign.groupId || null,
            status: campaign.status || 'DRAFT',
            scheduleTime: campaign.scheduleTime ? new Date(campaign.scheduleTime) : null,
            sentTime: campaign.sentTime ? new Date(campaign.sentTime) : null,
            recipientCount: campaign.recipientCount || 0,
            sentCount: campaign.sentCount || 0,
            opens: campaign.opens || 0,
            clicks: campaign.clicks || 0,
            bouncesCount: campaign.bouncesCount || 0,
            syncedAt: campaign.syncedAt ? new Date(campaign.syncedAt) : null,
            updatedAt: new Date(campaign.updatedAt),
          },
          create: {
            id: campaign.id,
            senderCampaignId: campaign.senderCampaignId || null,
            blogId: campaign.blogId || null,
            title: campaign.title || null,
            subject: campaign.subject,
            from: campaign.from,
            preheader: campaign.preheader || null,
            replyTo: campaign.replyTo,
            contentType: campaign.contentType || 'html',
            content: campaign.content,
            googleAnalytics: campaign.googleAnalytics === 1 || campaign.googleAnalytics === true,
            autoFollowupActive: campaign.autoFollowupActive === 1 || campaign.autoFollowupActive === true,
            autoFollowupSubject: campaign.autoFollowupSubject || null,
            autoFollowupDelay: campaign.autoFollowupDelay || null,
            groups: campaign.groups || null,
            segments: campaign.segments || null,
            groupId: campaign.groupId || null,
            status: campaign.status || 'DRAFT',
            scheduleTime: campaign.scheduleTime ? new Date(campaign.scheduleTime) : null,
            sentTime: campaign.sentTime ? new Date(campaign.sentTime) : null,
            recipientCount: campaign.recipientCount || 0,
            sentCount: campaign.sentCount || 0,
            opens: campaign.opens || 0,
            clicks: campaign.clicks || 0,
            bouncesCount: campaign.bouncesCount || 0,
            createdAt: new Date(campaign.createdAt),
            updatedAt: new Date(campaign.updatedAt),
            syncedAt: campaign.syncedAt ? new Date(campaign.syncedAt) : null,
          },
        });
      }
      console.log(`  ✓ Migrated ${campaigns.length} campaigns\n`);
    } catch (error) {
      console.log('  ⚠️  Campaigns table might not exist, skipping...\n');
    }

    // Migrate other tables (Emails, EmailTasks, etc.) if they exist
    console.log('📦 Migrating additional tables...');
    
    // Emails
    try {
      const emails = sqlite.prepare('SELECT * FROM emails').all() as any[];
      for (const email of emails) {
        await prisma.email.upsert({
          where: { gmailId: email.gmailId },
          update: {
            threadId: email.threadId,
            subject: email.subject,
            from: email.from,
            to: email.to || null,
            snippet: email.snippet || null,
            body: email.body || null,
            bodyText: email.bodyText || null,
            receivedAt: new Date(email.receivedAt),
            isRead: email.isRead === 1 || email.isRead === true,
            isAnalyzed: email.isAnalyzed === 1 || email.isAnalyzed === true,
            isIrrelevant: email.isIrrelevant === 1 || email.isIrrelevant === true,
            lastSyncedAt: email.lastSyncedAt ? new Date(email.lastSyncedAt) : null,
            updatedAt: new Date(email.updatedAt),
          },
          create: {
            id: email.id,
            gmailId: email.gmailId,
            threadId: email.threadId,
            subject: email.subject,
            from: email.from,
            to: email.to || null,
            snippet: email.snippet || null,
            body: email.body || null,
            bodyText: email.bodyText || null,
            receivedAt: new Date(email.receivedAt),
            isRead: email.isRead === 1 || email.isRead === true,
            isAnalyzed: email.isAnalyzed === 1 || email.isAnalyzed === true,
            isIrrelevant: email.isIrrelevant === 1 || email.isIrrelevant === true,
            syncedAt: new Date(email.syncedAt),
            lastSyncedAt: email.lastSyncedAt ? new Date(email.lastSyncedAt) : null,
            createdAt: new Date(email.createdAt),
            updatedAt: new Date(email.updatedAt),
          },
        });
      }
      console.log(`  ✓ Migrated ${emails.length} emails\n`);
    } catch (error) {
      console.log('  ⚠️  Emails table might not exist, skipping...\n');
    }

    // EmailTasks
    try {
      const tasks = sqlite.prepare('SELECT * FROM email_tasks').all() as any[];
      for (const task of tasks) {
        await prisma.emailTask.upsert({
          where: { id: task.id },
          update: {
            emailId: task.emailId,
            title: task.title,
            description: task.description || null,
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            aiAnalysis: task.aiAnalysis || null,
            externalTaskId: task.externalTaskId || null,
            updatedAt: new Date(task.updatedAt),
          },
          create: {
            id: task.id,
            emailId: task.emailId,
            title: task.title,
            description: task.description || null,
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            aiAnalysis: task.aiAnalysis || null,
            externalTaskId: task.externalTaskId || null,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          },
        });
      }
      console.log(`  ✓ Migrated ${tasks.length} email tasks\n`);
    } catch (error) {
      console.log('  ⚠️  Email tasks table might not exist, skipping...\n');
    }

    // Push Subscriptions
    try {
      const subscriptions = sqlite.prepare('SELECT * FROM push_subscriptions').all() as any[];
      for (const sub of subscriptions) {
        await prisma.pushSubscription.upsert({
          where: { endpoint: sub.endpoint },
          update: {
            userId: sub.userId,
            p256dh: sub.p256dh,
            auth: sub.auth,
            updatedAt: new Date(sub.updatedAt),
          },
          create: {
            id: sub.id,
            userId: sub.userId,
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
            createdAt: new Date(sub.createdAt),
            updatedAt: new Date(sub.updatedAt),
          },
        });
      }
      console.log(`  ✓ Migrated ${subscriptions.length} push subscriptions\n`);
    } catch (error) {
      console.log('  ⚠️  Push subscriptions table might not exist, skipping...\n');
    }

    // AI Integrations
    try {
      const integrations = sqlite.prepare('SELECT * FROM ai_integrations').all() as any[];
      for (const integration of integrations) {
        await prisma.aiIntegration.upsert({
          where: { id: integration.id },
          update: {
            name: integration.name,
            provider: integration.provider,
            apiKey: integration.apiKey,
            model: integration.model || null,
            isActive: integration.isActive === 1 || integration.isActive === true,
            updatedAt: new Date(integration.updatedAt),
          },
          create: {
            id: integration.id,
            name: integration.name,
            provider: integration.provider,
            apiKey: integration.apiKey,
            model: integration.model || null,
            isActive: integration.isActive === 1 || integration.isActive === true,
            createdAt: new Date(integration.createdAt),
            updatedAt: new Date(integration.updatedAt),
          },
        });
      }
      console.log(`  ✓ Migrated ${integrations.length} AI integrations\n`);
    } catch (error) {
      console.log('  ⚠️  AI integrations table might not exist, skipping...\n');
    }

    // Post Ideas
    try {
      const ideas = sqlite.prepare('SELECT * FROM post_ideas').all() as any[];
      for (const idea of ideas) {
        await prisma.postIdea.upsert({
          where: { id: idea.id },
          update: {
            title: idea.title,
            prompt: idea.prompt,
            content: idea.content || null,
            platforms: idea.platforms || null,
            status: idea.status || 'draft',
            createdBy: idea.createdBy || null,
            updatedAt: new Date(idea.updatedAt),
          },
          create: {
            id: idea.id,
            title: idea.title,
            prompt: idea.prompt,
            content: idea.content || null,
            platforms: idea.platforms || null,
            status: idea.status || 'draft',
            createdAt: new Date(idea.createdAt),
            updatedAt: new Date(idea.updatedAt),
            createdBy: idea.createdBy || null,
          },
        });
      }
      console.log(`  ✓ Migrated ${ideas.length} post ideas\n`);
    } catch (error) {
      console.log('  ⚠️  Post ideas table might not exist, skipping...\n');
    }

    // Google Connections
    try {
      const googleConnections = sqlite.prepare('SELECT * FROM google_connections').all() as any[];
      for (const conn of googleConnections) {
        await prisma.googleConnection.upsert({
          where: { id: conn.id },
          update: {
            accessToken: conn.accessToken,
            refreshToken: conn.refreshToken || null,
            expiresAt: conn.expiresAt ? new Date(conn.expiresAt) : null,
            isActive: conn.isActive === 1 || conn.isActive === true,
            email: conn.email || null,
          },
          create: {
            id: conn.id,
            accessToken: conn.accessToken,
            refreshToken: conn.refreshToken || null,
            expiresAt: conn.expiresAt ? new Date(conn.expiresAt) : null,
            connectedAt: new Date(conn.connectedAt),
            isActive: conn.isActive === 1 || conn.isActive === true,
            email: conn.email || null,
          },
        });
      }
      console.log(`  ✓ Migrated ${googleConnections.length} Google connections\n`);
    } catch (error) {
      console.log('  ⚠️  Google connections table might not exist, skipping...\n');
    }

    // Email Cron Jobs
    try {
      const cronJobs = sqlite.prepare('SELECT * FROM email_cron_jobs').all() as any[];
      for (const job of cronJobs) {
        await prisma.emailCronJob.upsert({
          where: { id: job.id },
          update: {
            isEnabled: job.isEnabled === 1 || job.isEnabled === true,
            schedule: job.schedule || '0 */6 * * *',
            syncEmails: job.syncEmails === 1 || job.syncEmails === true,
            analyzeEmails: job.analyzeEmails === 1 || job.analyzeEmails === true,
            aiIntegrationId: job.aiIntegrationId || null,
            lastRun: job.lastRun ? new Date(job.lastRun) : null,
            lastSyncAt: job.lastSyncAt ? new Date(job.lastSyncAt) : null,
            lastAnalyzeAt: job.lastAnalyzeAt ? new Date(job.lastAnalyzeAt) : null,
            nextRun: job.nextRun ? new Date(job.nextRun) : null,
            updatedAt: new Date(job.updatedAt),
          },
          create: {
            id: job.id,
            isEnabled: job.isEnabled === 1 || job.isEnabled === true,
            schedule: job.schedule || '0 */6 * * *',
            syncEmails: job.syncEmails === 1 || job.syncEmails === true,
            analyzeEmails: job.analyzeEmails === 1 || job.analyzeEmails === true,
            aiIntegrationId: job.aiIntegrationId || null,
            lastRun: job.lastRun ? new Date(job.lastRun) : null,
            lastSyncAt: job.lastSyncAt ? new Date(job.lastSyncAt) : null,
            lastAnalyzeAt: job.lastAnalyzeAt ? new Date(job.lastAnalyzeAt) : null,
            nextRun: job.nextRun ? new Date(job.nextRun) : null,
            createdAt: new Date(job.createdAt),
            updatedAt: new Date(job.updatedAt),
          },
        });
      }
      console.log(`  ✓ Migrated ${cronJobs.length} email cron jobs\n`);
    } catch (error) {
      console.log('  ⚠️  Email cron jobs table might not exist, skipping...\n');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Blogs: ${blogs.length}`);
    console.log(`   - YouTube Videos: ${videos.length}`);
    console.log(`   - Subscribers: ${subscribers.length}`);
    console.log(`   - Groups: ${groups.length}`);
    console.log('\n⚠️  Please verify the data in PostgreSQL before deleting your SQLite database!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrateSqliteToPostgres()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

