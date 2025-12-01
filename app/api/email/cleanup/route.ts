import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllEmails, parseGmailMessage, refreshGoogleToken, isGoogleTokenExpired } from '@/lib/google-email';

/**
 * Cleanup endpoint to:
 * 1. Remove emails that no longer exist in Gmail
 * 2. Fix emails with missing/null threadIds
 * 3. Report on any issues found
 */
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

    // Get all emails from Gmail (fetch more to ensure we check all)
    const gmailMessages = await getAllEmails(accessToken, 500);
    const gmailIds = new Set<string>();
    
    for (const message of gmailMessages) {
      const parsed = parseGmailMessage(message);
      if (parsed.gmailId) {
        gmailIds.add(parsed.gmailId);
      }
    }

    // Get all emails from database
    const dbEmails = await prisma.email.findMany({
      select: { id: true, gmailId: true, threadId: true },
    });

    const dbGmailIds = new Set(dbEmails.map(e => e.gmailId));
    
    // Find emails in DB that don't exist in Gmail anymore
    const emailsToRemove: string[] = [];
    for (const dbEmail of dbEmails) {
      if (!gmailIds.has(dbEmail.gmailId)) {
        emailsToRemove.push(dbEmail.id);
      }
    }

    // Find emails with missing or empty threadIds
    const emailsWithMissingThreadId = dbEmails.filter(
      e => !e.threadId || e.threadId.trim() === ''
    );

    // Remove emails that no longer exist in Gmail
    let removedCount = 0;
    if (emailsToRemove.length > 0) {
      const result = await prisma.email.deleteMany({
        where: {
          id: { in: emailsToRemove },
        },
      });
      removedCount = result.count;
    }

    // Try to fix emails with missing threadIds by fetching from Gmail
    let fixedCount = 0;
    for (const email of emailsWithMissingThreadId) {
      try {
        // Try to find this email in the current Gmail messages
        const gmailMessage = gmailMessages.find(
          (msg: any) => msg.id === email.gmailId
        );
        
        if (gmailMessage) {
          const parsed = parseGmailMessage(gmailMessage);
          if (parsed.threadId) {
            await prisma.email.update({
              where: { id: email.id },
              data: { threadId: parsed.threadId },
            });
            fixedCount++;
          }
        }
      } catch (error) {
        console.error(`Error fixing email ${email.gmailId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalInGmail: gmailIds.size,
        totalInDatabase: dbEmails.length,
        removed: removedCount,
        fixedThreadIds: fixedCount,
        stillMissingThreadId: emailsWithMissingThreadId.length - fixedCount,
      },
      details: {
        emailsRemoved: emailsToRemove.length,
        emailsWithMissingThreadId: emailsWithMissingThreadId.length,
      },
    });
  } catch (error: any) {
    console.error('Error cleaning up emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup emails' },
      { status: 500 }
    );
  }
}
