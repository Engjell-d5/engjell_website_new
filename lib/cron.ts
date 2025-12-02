import 'server-only';
import cron from 'node-cron';
import { fetchYouTubeVideos } from './youtube';
import { getConfig } from './data';
import { publishScheduledPosts } from './social';
import { syncSubscribersWithSender } from './sender-sync';
import { sendPushNotificationToAllAdmins } from './push-notifications';

let cronJob: cron.ScheduledTask | null = null;
let socialCronJob: cron.ScheduledTask | null = null;
let subscriberSyncCronJob: cron.ScheduledTask | null = null;
let emailCronJob: cron.ScheduledTask | null = null;
let initialized = false;
let socialInitialized = false;
let subscriberSyncInitialized = false;
let emailCronInitialized = false;

export async function startYouTubeCron() {
  // Prevent multiple initializations
  if (initialized && cronJob) {
    return cronJob;
  }

  const config = await getConfig();
  const schedule = config.cronSchedule || '0 2 * * *'; // Default: 2 AM daily

  // Stop existing job if any
  if (cronJob) {
    cronJob.stop();
  }

  console.log(`Starting YouTube video fetch cron job with schedule: ${schedule}`);

  cronJob = cron.schedule(schedule, async () => {
    console.log('Running YouTube video fetch cron job...');
    try {
      await fetchYouTubeVideos();
      console.log('YouTube videos fetched successfully');
    } catch (error) {
      console.error('Error in YouTube video fetch cron job:', error);
    }
  });

  initialized = true;
  return cronJob;
}

export function stopYouTubeCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('YouTube video fetch cron job stopped');
  }
}

export async function restartYouTubeCron() {
  stopYouTubeCron();
  return await startYouTubeCron();
}

export async function startSocialMediaCron() {
  console.log(`[CRON-INIT] startSocialMediaCron called - initialized: ${socialInitialized}, hasJob: ${!!socialCronJob}`);
  
  // Prevent multiple initializations
  if (socialInitialized && socialCronJob) {
    console.log(`[CRON-INIT] Social media cron already initialized, returning existing job`);
    return socialCronJob;
  }

  // Get schedule from config
  const config = await getConfig();
  const schedule = config.socialMediaCronSchedule || '*/5 * * * *';

  // Stop existing job if any
  if (socialCronJob) {
    console.log(`[CRON-INIT] Stopping existing social media cron job`);
    socialCronJob.stop();
    socialCronJob = null;
  }

  console.log(`[CRON-INIT] Starting social media publishing cron job with schedule: ${schedule}`);
  console.log(`[CRON-INIT] Current time: ${new Date().toISOString()}`);

  socialCronJob = cron.schedule(schedule, async () => {
    const runTime = new Date().toISOString();
    console.log(`[CRON] ============================================`);
    console.log(`[CRON] Running social media publishing cron job at ${runTime}`);
    console.log(`[CRON] ============================================`);
    try {
      const result = await publishScheduledPosts();
      console.log(`[CRON] Social media cron complete - published: ${result.published}, failed: ${result.failed}, total: ${result.total}`);
      if (result.published > 0) {
        console.log(`[CRON] ✓ Published ${result.published} social media post(s)`);
        // Send push notification
        try {
          await sendPushNotificationToAllAdmins({
            title: 'Social Media Posts Published',
            body: `Successfully published ${result.published} post(s) to social media`,
            tag: 'social-posts-published',
            data: { url: '/admin/social' },
          });
        } catch (notifError) {
          console.error('[CRON] Failed to send push notification:', notifError);
        }
      } else {
        console.log(`[CRON] No posts were published this run`);
      }
    } catch (error) {
      console.error('[CRON] Error in social media publishing cron job:', error);
      if (error instanceof Error) {
        console.error('[CRON] Error details:', error.message, error.stack);
      }
    }
    console.log(`[CRON] ============================================`);
  });

  // Verify the job was created
  if (socialCronJob) {
    console.log(`[CRON-INIT] ✓ Social media cron job created successfully`);
    console.log(`[CRON-INIT] Next run will be at the next 5-minute mark`);
    
    // Calculate and log next run time
    const now = new Date();
    const minutes = now.getMinutes();
    const nextMinutes = Math.ceil((minutes + 1) / 5) * 5;
    const nextRun = new Date(now);
    nextRun.setMinutes(nextMinutes);
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
    if (nextMinutes >= 60) {
      nextRun.setHours(nextRun.getHours() + 1);
      nextRun.setMinutes(0);
    }
    console.log(`[CRON-INIT] Next scheduled run: ${nextRun.toISOString()}`);
  } else {
    console.error(`[CRON-INIT] ✗ Failed to create social media cron job`);
  }

  socialInitialized = true;
  return socialCronJob;
}

export function stopSocialMediaCron() {
  if (socialCronJob) {
    socialCronJob.stop();
    socialCronJob = null;
    console.log('Social media publishing cron job stopped');
  }
}

export async function restartSocialMediaCron() {
  stopSocialMediaCron();
  return await startSocialMediaCron();
}

export async function startSubscriberSyncCron() {
  // Prevent multiple initializations
  if (subscriberSyncInitialized && subscriberSyncCronJob) {
    return subscriberSyncCronJob;
  }

  // Run daily at 3 AM (after YouTube fetch at 2 AM)
  const schedule = '0 3 * * *';

  // Stop existing job if any
  if (subscriberSyncCronJob) {
    subscriberSyncCronJob.stop();
    subscriberSyncCronJob = null;
  }

  console.log(`[CRON-INIT] Starting subscriber sync cron job with schedule: ${schedule}`);

  subscriberSyncCronJob = cron.schedule(schedule, async () => {
    const runTime = new Date().toISOString();
    console.log(`[CRON] ============================================`);
    console.log(`[CRON] Running subscriber sync cron job at ${runTime}`);
    console.log(`[CRON] ============================================`);
    try {
      const result = await syncSubscribersWithSender();
      console.log(`[CRON] Subscriber sync complete:`);
      console.log(`[CRON]   - Pushed: ${result.pushed.synced} synced, ${result.pushed.failed} failed`);
      console.log(`[CRON]   - Pulled: ${result.pulled.updated} updated, ${result.pulled.created} created, ${result.pulled.errors} errors`);
      if (result.errors.length > 0) {
        console.log(`[CRON]   - Errors: ${result.errors.slice(0, 5).join(', ')}${result.errors.length > 5 ? '...' : ''}`);
      }
    } catch (error) {
      console.error('[CRON] Error in subscriber sync cron job:', error);
      if (error instanceof Error) {
        console.error('[CRON] Error details:', error.message, error.stack);
      }
    }
    console.log(`[CRON] ============================================`);
  });

  subscriberSyncInitialized = true;
  return subscriberSyncCronJob;
}

export function stopSubscriberSyncCron() {
  if (subscriberSyncCronJob) {
    subscriberSyncCronJob.stop();
    subscriberSyncCronJob = null;
    console.log('Subscriber sync cron job stopped');
  }
}

export async function restartSubscriberSyncCron() {
  stopSubscriberSyncCron();
  return await startSubscriberSyncCron();
}

export async function startEmailCron() {
  // Prevent multiple initializations
  if (emailCronInitialized && emailCronJob) {
    return emailCronJob;
  }

  // Get email cron job configuration from database
  const { prisma } = await import('./prisma');
  let emailCronConfig = await prisma.emailCronJob.findFirst();
  
  // Create default config if none exists
  if (!emailCronConfig) {
    emailCronConfig = await prisma.emailCronJob.create({
      data: {
        isEnabled: false,
        schedule: '0 */6 * * *', // Default: every 6 hours
        syncEmails: true,
        analyzeEmails: true,
      },
    });
  }

  // Only start if enabled
  if (!emailCronConfig.isEnabled) {
    console.log(`[CRON-INIT] Email cron job is disabled, skipping initialization`);
    return null;
  }

  const schedule = emailCronConfig.schedule || '0 */6 * * *';

  // Stop existing job if any
  if (emailCronJob) {
    emailCronJob.stop();
    emailCronJob = null;
  }

  console.log(`[CRON-INIT] Starting email sync/analyze cron job with schedule: ${schedule}`);

  emailCronJob = cron.schedule(schedule, async () => {
    const runTime = new Date().toISOString();
    console.log(`[CRON] ============================================`);
    console.log(`[CRON] Running email sync/analyze cron job at ${runTime}`);
    console.log(`[CRON] ============================================`);
    
    try {
      // Get updated config
      const config = await prisma.emailCronJob.findFirst();
      if (!config || !config.isEnabled) {
        console.log(`[CRON] Email cron job is disabled, stopping`);
        if (emailCronJob) {
          emailCronJob.stop();
          emailCronJob = null;
          emailCronInitialized = false;
        }
        return;
      }

      // Update last run time
      await prisma.emailCronJob.updateMany({
        data: { lastRun: new Date() },
      });

      // Sync emails if enabled
      if (config.syncEmails) {
        console.log(`[CRON] Syncing emails from Gmail...`);
        try {
          // Import sync functions directly
          const { getAllEmails, parseGmailMessage, refreshGoogleToken, isGoogleTokenExpired, getThreadDetails } = await import('./google-email');
          
          // Get Google connection
          const connection = await prisma.googleConnection.findFirst({
            where: { isActive: true },
          });

          if (!connection) {
            console.error(`[CRON] No active Google connection found`);
          } else {
            // Check and refresh token if needed
            let accessToken = connection.accessToken;
            if (isGoogleTokenExpired(connection.expiresAt)) {
              if (connection.refreshToken) {
                const tokenData = await refreshGoogleToken(connection.refreshToken);
                accessToken = tokenData.access_token;
                const expiresAt = tokenData.expires_in
                  ? new Date(Date.now() + tokenData.expires_in * 1000)
                  : null;
                await prisma.googleConnection.update({
                  where: { id: connection.id },
                  data: { accessToken, expiresAt },
                });
              }
            }

            // Fetch and sync emails
            const gmailMessages = await getAllEmails(accessToken, 100);
            let syncedCount = 0;
            let newCount = 0;
            const threadIds = new Set<string>();

            // First pass: sync all emails
            for (const message of gmailMessages) {
              const parsed = parseGmailMessage(message);
              if (!parsed.threadId) continue;
              
              threadIds.add(parsed.threadId);
              const existing = await prisma.email.findUnique({
                where: { gmailId: parsed.gmailId },
              });

              if (existing) {
                await prisma.email.update({
                  where: { id: existing.id },
                  data: {
                    threadId: parsed.threadId,
                    subject: parsed.subject,
                    from: parsed.from,
                    to: parsed.to,
                    snippet: parsed.snippet,
                    body: parsed.body,
                    bodyText: parsed.bodyText,
                    isRead: parsed.isRead,
                    lastSyncedAt: new Date(),
                  },
                });
                syncedCount++;
              } else {
                await prisma.email.create({
                  data: {
                    gmailId: parsed.gmailId,
                    threadId: parsed.threadId,
                    subject: parsed.subject,
                    from: parsed.from,
                    to: parsed.to,
                    snippet: parsed.snippet,
                    body: parsed.body,
                    bodyText: parsed.bodyText,
                    receivedAt: parsed.receivedAt,
                    isRead: parsed.isRead,
                    syncedAt: new Date(),
                    isAnalyzed: false,
                  },
                });
                newCount++;
              }
            }

            // Second pass: Check threads for new messages
            const threadsWithNewMessages = new Set<string>();
            for (const threadId of threadIds) {
              try {
                const thread = await getThreadDetails(accessToken, threadId);
                const threadMessages = thread.messages || [];
                const threadEmails = await prisma.email.findMany({
                  where: { threadId },
                  select: { id: true, lastSyncedAt: true, syncedAt: true },
                });
                const mostRecentSync = threadEmails.reduce((latest: number, email: { lastSyncedAt: Date | null; syncedAt: Date | null }) => {
                  const emailSyncTime = email.lastSyncedAt || email.syncedAt;
                  if (!emailSyncTime) return latest;
                  return emailSyncTime.getTime() > latest ? emailSyncTime.getTime() : latest;
                }, 0);
                const hasNewMessages = threadMessages.some((msg: any) => {
                  const msgTime = parseInt(msg.internalDate);
                  return msgTime > mostRecentSync;
                });
                const hasUnreadInThread = threadMessages.some((msg: any) => 
                  msg.labelIds?.includes('UNREAD')
                );
                if (hasNewMessages || hasUnreadInThread) {
                  threadsWithNewMessages.add(threadId);
                }
              } catch (error) {
                console.error(`[CRON] Error checking thread ${threadId}:`, error);
              }
            }

            if (threadsWithNewMessages.size > 0) {
              await prisma.email.updateMany({
                where: { threadId: { in: Array.from(threadsWithNewMessages) } },
                data: { isRead: false, isAnalyzed: false },
              });
            }

            console.log(`[CRON] Email sync complete: ${syncedCount} synced, ${newCount} new`);
            await prisma.emailCronJob.updateMany({
              data: { lastSyncAt: new Date() },
            });
            
            // Send notification if new emails were synced
            if (newCount > 0) {
              try {
                await sendPushNotificationToAllAdmins({
                  title: 'New Emails Synced',
                  body: `${newCount} new email(s) synced from Gmail`,
                  tag: 'new-emails',
                  data: { url: '/admin/email' },
                });
              } catch (notifError) {
                console.error('[CRON] Failed to send push notification:', notifError);
              }
            }
          }
        } catch (error) {
          console.error(`[CRON] Error syncing emails:`, error);
        }
      }

      // Analyze emails if enabled
      if (config.analyzeEmails && config.aiIntegrationId) {
        console.log(`[CRON] Analyzing emails...`);
        try {
          const { analyzeEmailAndGenerateTasks } = await import('./ai-service');
          const { createEmailTask } = await import('./data');
          
          // Get all unanalyzed, relevant emails
          const emails = await prisma.email.findMany({
            where: {
              isAnalyzed: false,
              isIrrelevant: false,
            },
            orderBy: { receivedAt: 'desc' },
          });

          if (emails.length > 0) {
            // Group emails by threadId
            const threadMap = new Map<string, typeof emails>();
            for (const email of emails) {
              const threadId = email.threadId || email.id;
              if (!threadMap.has(threadId)) {
                threadMap.set(threadId, []);
              }
              threadMap.get(threadId)!.push(email);
            }

            let totalTasksCreated = 0;
            let threadsAnalyzed = 0;

            // Analyze each thread once
            for (const [threadId, threadEmails] of threadMap.entries()) {
              try {
                const latestEmail = threadEmails[0];
                const tasks = await analyzeEmailAndGenerateTasks({
                  threadId: threadId !== latestEmail.id ? threadId : undefined,
                  emailId: latestEmail.id,
                  aiIntegrationId: config.aiIntegrationId,
                });

                // Save tasks
                await Promise.all(
                  tasks.map(task =>
                    createEmailTask({
                      emailId: latestEmail.id,
                      title: task.title,
                      description: task.description,
                      priority: task.priority,
                      status: 'pending',
                      aiAnalysis: JSON.stringify({ generatedAt: new Date().toISOString() }),
                    })
                  )
                );

                // Mark all emails in thread as analyzed
                if (threadId !== latestEmail.id) {
                  await prisma.email.updateMany({
                    where: { threadId },
                    data: { isAnalyzed: true },
                  });
                } else {
                  await prisma.email.update({
                    where: { id: latestEmail.id },
                    data: { isAnalyzed: true },
                  });
                }

                totalTasksCreated += tasks.length;
                threadsAnalyzed++;
              } catch (error: any) {
                console.error(`[CRON] Error analyzing thread ${threadId}:`, error);
              }
            }

            console.log(`[CRON] Email analysis complete: ${threadsAnalyzed} threads analyzed, ${totalTasksCreated} tasks created`);
            await prisma.emailCronJob.updateMany({
              data: { lastAnalyzeAt: new Date() },
            });
            
            // Send notification if tasks were created
            if (totalTasksCreated > 0) {
              try {
                await sendPushNotificationToAllAdmins({
                  title: 'New Tasks Created',
                  body: `${totalTasksCreated} new task(s) created from email analysis`,
                  tag: 'new-tasks',
                  data: { url: '/admin/email' },
                });
              } catch (notifError) {
                console.error('[CRON] Failed to send push notification:', notifError);
              }
            }
          } else {
            console.log(`[CRON] No unanalyzed emails to analyze`);
          }
        } catch (error) {
          console.error(`[CRON] Error analyzing emails:`, error);
        }
      }
      
      // Send notification when cron completes
      try {
        await sendPushNotificationToAllAdmins({
          title: 'Email Cron Completed',
          body: 'Email sync and analysis cron job completed',
          tag: 'email-cron-complete',
          data: { url: '/admin/email' },
        });
      } catch (notifError) {
        console.error('[CRON] Failed to send push notification:', notifError);
      }
    } catch (error) {
      console.error('[CRON] Error in email sync/analyze cron job:', error);
      if (error instanceof Error) {
        console.error('[CRON] Error details:', error.message, error.stack);
      }
    }
    console.log(`[CRON] ============================================`);
  });

  // Calculate and update next run time
  const nextRun = getNextRunTime(schedule);
  if (nextRun) {
    await prisma.emailCronJob.updateMany({
      data: { nextRun },
    });
  }

  emailCronInitialized = true;
  return emailCronJob;
}

export function stopEmailCron() {
  if (emailCronJob) {
    emailCronJob.stop();
    emailCronJob = null;
    emailCronInitialized = false;
    console.log('Email sync/analyze cron job stopped');
  }
}

export async function restartEmailCron() {
  stopEmailCron();
  return await startEmailCron();
}

export async function initializeAllCronJobs() {
  console.log(`[CRON-INIT] ============================================`);
  console.log(`[CRON-INIT] Initializing all cron jobs at ${new Date().toISOString()}`);
  console.log(`[CRON-INIT] ============================================`);
  try {
    await startYouTubeCron();
    console.log(`[CRON-INIT] YouTube cron initialized`);
  } catch (error) {
    console.error(`[CRON-INIT] Failed to initialize YouTube cron:`, error);
  }
  
  try {
    await startSocialMediaCron();
    console.log(`[CRON-INIT] Social media cron initialized`);
  } catch (error) {
    console.error(`[CRON-INIT] Failed to initialize social media cron:`, error);
  }
  
  try {
    await startSubscriberSyncCron();
    console.log(`[CRON-INIT] Subscriber sync cron initialized`);
  } catch (error) {
    console.error(`[CRON-INIT] Failed to initialize subscriber sync cron:`, error);
  }
  
  try {
    await startEmailCron();
    console.log(`[CRON-INIT] Email cron initialized`);
  } catch (error) {
    console.error(`[CRON-INIT] Failed to initialize email cron:`, error);
  }
  
  console.log(`[CRON-INIT] ============================================`);
}

export function getCronStatus() {
  return {
    youtube: {
      initialized,
      running: initialized && cronJob !== null,
    },
    socialMedia: {
      initialized: socialInitialized,
      running: socialInitialized && socialCronJob !== null,
    },
    subscriberSync: {
      initialized: subscriberSyncInitialized,
      running: subscriberSyncInitialized && subscriberSyncCronJob !== null,
    },
    email: {
      initialized: emailCronInitialized,
      running: emailCronInitialized && emailCronJob !== null,
    },
  };
}

/**
 * Calculate next run time for a cron schedule
 */
export function getNextRunTime(schedule: string): Date | null {
  try {
    const now = new Date();
    let nextRun = new Date(now);

    // Parse cron format: minute hour day month dayOfWeek
    // Examples:
    // "*/5 * * * *" - Every 5 minutes
    // "0 2 * * *" - Daily at 2 AM
    
    const parts = schedule.trim().split(/\s+/);
    if (parts.length !== 5) return null;

    const [minute, hour, day, month, dayOfWeek] = parts;

    // Handle "*/5 * * * *" pattern (every 5 minutes)
    if (minute.startsWith('*/')) {
      const interval = parseInt(minute.substring(2));
      if (!isNaN(interval) && interval > 0) {
        // Calculate next run time: round up to next interval
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        
        // If we're at exactly an interval mark and no seconds have passed, move to next
        const remainder = currentMinutes % interval;
        let minutesToAdd = interval - remainder;
        
        // If we're already at an interval mark, move to next one
        if (remainder === 0 && currentSeconds === 0) {
          minutesToAdd = interval;
        }
        
        nextRun = new Date(now);
        nextRun.setMinutes(currentMinutes + minutesToAdd);
        nextRun.setSeconds(0);
        nextRun.setMilliseconds(0);
        
        // If we've passed the hour, it will automatically roll over
        if (currentMinutes + minutesToAdd >= 60) {
          nextRun.setHours(now.getHours() + 1);
          nextRun.setMinutes((currentMinutes + minutesToAdd) % 60);
        }
        
        return nextRun;
      }
    }

    // Handle daily schedule like "0 2 * * *" (daily at 2 AM)
    if (minute === '0' && hour !== '*' && day === '*' && month === '*' && dayOfWeek === '*') {
      const targetHour = parseInt(hour);
      if (!isNaN(targetHour)) {
        nextRun = new Date(now);
        nextRun.setHours(targetHour);
        nextRun.setMinutes(0);
        nextRun.setSeconds(0);
        nextRun.setMilliseconds(0);
        
        // If we've passed today's target time, move to tomorrow
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        
        return nextRun;
      }
    }

    return null;
  } catch (error) {
    console.error('Error calculating next run time:', error);
    return null;
  }
}

export async function getCronStatusWithNextRun() {
  const status = getCronStatus();
  const config = await getConfig();
  const youtubeSchedule = config.cronSchedule || '0 2 * * *';
  const socialMediaSchedule = config.socialMediaCronSchedule || '*/5 * * * *';
  const subscriberSyncSchedule = '0 3 * * *';

  // Get email cron config
  const { prisma } = await import('./prisma');
  const emailCronConfig = await prisma.emailCronJob.findFirst();
  const emailSchedule = emailCronConfig?.schedule || '0 */6 * * *';

  const youtubeNextRun = status.youtube.running ? getNextRunTime(youtubeSchedule) : null;
  const socialNextRun = status.socialMedia.running ? getNextRunTime(socialMediaSchedule) : null;
  const subscriberSyncNextRun = status.subscriberSync.running ? getNextRunTime(subscriberSyncSchedule) : null;
  const emailNextRun = status.email.running && emailCronConfig?.isEnabled ? getNextRunTime(emailSchedule) : null;

  return {
    youtube: {
      ...status.youtube,
      nextRun: youtubeNextRun ? youtubeNextRun.toISOString() : null,
      schedule: youtubeSchedule,
    },
    socialMedia: {
      ...status.socialMedia,
      nextRun: socialNextRun ? socialNextRun.toISOString() : null,
      schedule: socialMediaSchedule,
    },
    subscriberSync: {
      ...status.subscriberSync,
      nextRun: subscriberSyncNextRun ? subscriberSyncNextRun.toISOString() : null,
      schedule: subscriberSyncSchedule,
    },
    email: {
      ...status.email,
      nextRun: emailNextRun ? emailNextRun.toISOString() : null,
      schedule: emailSchedule,
      isEnabled: emailCronConfig?.isEnabled || false,
      syncEmails: emailCronConfig?.syncEmails || false,
      analyzeEmails: emailCronConfig?.analyzeEmails || false,
      lastRun: emailCronConfig?.lastRun?.toISOString() || null,
      lastSyncAt: emailCronConfig?.lastSyncAt?.toISOString() || null,
      lastAnalyzeAt: emailCronConfig?.lastAnalyzeAt?.toISOString() || null,
    },
  };
}

