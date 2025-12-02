import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { analyzeEmailAndGenerateTasks } from '@/lib/ai-service';
import { createEmailTask, getEmails } from '@/lib/data';
import { prisma } from '@/lib/prisma';
import { sendPushNotificationToUser } from '@/lib/push-notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { aiIntegrationId } = await request.json();

    if (!aiIntegrationId) {
      return NextResponse.json(
        { error: 'AI Integration ID is required' },
        { status: 400 }
      );
    }

    // Get all unanalyzed and relevant emails
    // Read status doesn't matter - analyze all unanalyzed relevant emails
    // Exclude irrelevant emails and already analyzed emails
    const emails = await prisma.email.findMany({
      where: {
        isAnalyzed: false, // Not yet analyzed
        isIrrelevant: false, // Only relevant emails
        // Note: isRead is not filtered - we analyze all unanalyzed relevant emails regardless of read status
      },
      orderBy: { receivedAt: 'desc' },
    });

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unanalyzed emails to analyze',
        tasksCreated: 0,
      });
    }

    // Group emails by threadId to analyze each thread once
    const threadMap = new Map<string, typeof emails>();
    for (const email of emails) {
      const threadId = email.threadId || email.id; // Use email.id as fallback for emails without threadId
      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, []);
      }
      threadMap.get(threadId)!.push(email);
    }

    let totalTasksCreated = 0;
    let threadsAnalyzed = 0;
    const errors: string[] = [];

    // Analyze each thread once
    for (const [threadId, threadEmails] of threadMap.entries()) {
      try {
        // Use the latest email in the thread for analysis
        const latestEmail = threadEmails[0]; // Already sorted by receivedAt desc
        
        const tasks = await analyzeEmailAndGenerateTasks({
          threadId: threadId !== latestEmail.id ? threadId : undefined, // Use threadId if it's not a single email
          emailId: latestEmail.id,
          aiIntegrationId,
        });

        // Save tasks to database, associated with the latest email in the thread
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

        // Mark all emails in the thread as analyzed
        if (threadId !== latestEmail.id) {
          // It's a thread - mark all emails in thread
          await prisma.email.updateMany({
            where: { threadId },
            data: { isAnalyzed: true },
          });
        } else {
          // Single email - mark just this email
          await prisma.email.update({
            where: { id: latestEmail.id },
            data: { isAnalyzed: true },
          });
        }

        totalTasksCreated += tasks.length;
        threadsAnalyzed++;
      } catch (error: any) {
        console.error(`Error analyzing thread ${threadId}:`, error);
        const subject = threadEmails[0]?.subject || 'Unknown';
        errors.push(`Thread "${subject}": ${error.message}`);
      }
    }

    // Send notification if tasks were created
    if (totalTasksCreated > 0 && user) {
      try {
        await sendPushNotificationToUser(user.id, {
          title: 'New Tasks Created',
          body: `${totalTasksCreated} new task(s) created from email analysis`,
          tag: 'new-tasks',
          data: { url: '/admin/email' },
        });
      } catch (notifError) {
        console.error('Failed to send push notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      threadsAnalyzed: threadsAnalyzed,
      emailsAnalyzed: emails.length,
      tasksCreated: totalTasksCreated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error analyzing all emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze emails' },
      { status: 500 }
    );
  }
}
