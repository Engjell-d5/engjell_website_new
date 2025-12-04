import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllEmails, parseGmailMessage, refreshGoogleToken, isGoogleTokenExpired, getThreadDetails } from '@/lib/google-email';
import { sendPushNotificationToUser } from '@/lib/push-notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Google connection
    const connection = await prisma.googleConnection.findFirst({
      where: { isActive: true },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 400 }
      );
    }

    // Check and refresh token if needed
    let accessToken = connection.accessToken;
    if (isGoogleTokenExpired(connection.expiresAt)) {
      if (!connection.refreshToken) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 400 }
        );
      }

      const tokenData = await refreshGoogleToken(connection.refreshToken);
      accessToken = tokenData.access_token;

      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null;

      await prisma.googleConnection.update({
        where: { id: connection.id },
        data: {
          accessToken,
          expiresAt,
        },
      });
    }

    // Fetch all emails (read and unread)
    const gmailMessages = await getAllEmails(accessToken, 100);
    
    let syncedCount = 0;
    let newCount = 0;
    const threadIds = new Set<string>();

    // First pass: sync all emails and collect thread IDs
    for (const message of gmailMessages) {
      const parsed = parseGmailMessage(message);
      
      // Ensure threadId is set (it should always be present from Gmail)
      if (!parsed.threadId) {
        console.error(`Message ${parsed.gmailId} has no threadId!`, message);
        continue; // Skip this message
      }
      
      threadIds.add(parsed.threadId);
      
      // Check if email already exists
      const existing = await prisma.email.findUnique({
        where: { gmailId: parsed.gmailId },
      });

      if (existing) {
        // Check if thread has new messages (follow-ups)
        // If email was analyzed but thread has new messages, mark as not analyzed
        let shouldResetAnalyzed = false;
        if (existing.isAnalyzed) {
          try {
            const thread = await getThreadDetails(accessToken, parsed.threadId);
            const threadMessages = thread.messages || [];
            // Check if there are messages newer than when we last synced
            const lastSyncedTime = existing.lastSyncedAt || existing.syncedAt;
            const hasNewMessages = threadMessages.some((msg: any) => {
              const msgTime = parseInt(msg.internalDate);
              return msgTime > lastSyncedTime.getTime();
            });
            if (hasNewMessages) {
              shouldResetAnalyzed = true;
            }
          } catch (error) {
            console.error('Error checking thread details:', error);
          }
        }

        // Update existing email
        // Also update threadId in case it was missing or incorrect
        await prisma.email.update({
          where: { id: existing.id },
          data: {
            threadId: parsed.threadId, // Ensure threadId is always up to date
            subject: parsed.subject,
            from: parsed.from,
            to: parsed.to,
            snippet: parsed.snippet,
            body: parsed.body,
            bodyText: parsed.bodyText,
            isRead: parsed.isRead,
            isAnalyzed: shouldResetAnalyzed ? false : existing.isAnalyzed,
            lastSyncedAt: new Date(),
          },
        });
        syncedCount++;
      } else {
        // Create new email
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
    // If a thread has new messages (newer than last sync), reset analyzed status for all emails in that thread
    const threadsWithNewMessages = new Set<string>();
    
    // Get the latest sync time for comparison
    const syncStartTime = Date.now();
    
    for (const threadId of threadIds) {
      try {
        const thread = await getThreadDetails(accessToken, threadId);
        const threadMessages = thread.messages || [];
        
        // Get all emails in this thread from our database
        const threadEmails = await prisma.email.findMany({
          where: { threadId },
          select: { id: true, lastSyncedAt: true, syncedAt: true },
        });
        
        type EmailSync = {
          id: string;
          lastSyncedAt: Date | null;
          syncedAt: Date;
        };
        
        // Find the most recent sync time for this thread
        const mostRecentSync = threadEmails.reduce((latest: number, email: EmailSync) => {
          const emailSyncTime = email.lastSyncedAt || email.syncedAt;
          if (!emailSyncTime) return latest;
          const emailTime = emailSyncTime.getTime();
          return emailTime > latest ? emailTime : latest;
        }, 0);
        
        // Check if thread has any messages newer than the most recent sync
        // This includes both read and unread new messages
        const hasNewMessages = threadMessages.some((msg: any) => {
          const msgTime = parseInt(msg.internalDate);
          return msgTime > mostRecentSync;
        });
        
        // Also check if thread has any unread messages (follow-ups)
        const hasUnreadInThread = threadMessages.some((msg: any) => 
          msg.labelIds?.includes('UNREAD')
        );

        if (hasNewMessages || hasUnreadInThread) {
          threadsWithNewMessages.add(threadId);
        }
      } catch (error) {
        console.error(`Error checking thread ${threadId}:`, error);
      }
    }

    // Update emails in threads with new messages
    // Reset analyzed status so they can be re-analyzed with the new context
    if (threadsWithNewMessages.size > 0) {
      await prisma.email.updateMany({
        where: {
          threadId: { in: Array.from(threadsWithNewMessages) },
        },
        data: {
          isRead: false, // Mark as unread for analysis purposes when thread has new messages
          isAnalyzed: false, // Reset analyzed status since thread has been updated
        },
      });
    }

    // Send notification if new emails were synced
    if (newCount > 0 && user) {
      try {
        await sendPushNotificationToUser(user.id, {
          title: 'New Emails Synced',
          body: `${newCount} new email(s) synced from Gmail`,
          tag: 'new-emails',
          data: { url: '/admin/email' },
        });
      } catch (notifError) {
        console.error('Failed to send push notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      new: newCount,
      total: gmailMessages.length,
    });
  } catch (error: any) {
    console.error('Error syncing emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync emails' },
      { status: 500 }
    );
  }
}
