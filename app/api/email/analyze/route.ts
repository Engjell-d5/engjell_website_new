import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { analyzeEmailAndGenerateTasks } from '@/lib/ai-service';
import { createEmailTask } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailId, aiIntegrationId } = await request.json();

    if (!emailId || !aiIntegrationId) {
      return NextResponse.json(
        { error: 'Email ID and AI Integration ID are required' },
        { status: 400 }
      );
    }

    // Get the email to find its threadId
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      select: { threadId: true },
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Analyze the entire thread
    const tasks = await analyzeEmailAndGenerateTasks({
      emailId,
      aiIntegrationId,
    });

    // Get all emails in the thread to associate tasks with the latest email
    const threadEmails = email.threadId
      ? await prisma.email.findMany({
          where: { threadId: email.threadId },
          orderBy: { receivedAt: 'desc' },
        })
      : [await prisma.email.findUnique({ where: { id: emailId } })].filter(Boolean);

    const latestEmail = threadEmails[0];
    
    if (!latestEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Save tasks to database, associated with the latest email in the thread
    const savedTasks = await Promise.all(
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
    if (email.threadId) {
      await prisma.email.updateMany({
        where: { threadId: email.threadId },
        data: { isAnalyzed: true },
      });
    } else {
      await prisma.email.update({
        where: { id: emailId },
        data: { isAnalyzed: true },
      });
    }

    return NextResponse.json({ success: true, tasks: savedTasks });
  } catch (error: any) {
    console.error('Error analyzing email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze email' },
      { status: 500 }
    );
  }
}
