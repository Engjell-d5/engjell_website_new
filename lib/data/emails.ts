import { prisma } from '../prisma';
import type { Email, EmailTask, EmailThread, EmailThreadFilters, EmailThreadResult } from './types';

export async function getEmails(): Promise<Email[]> {
  const emails = await prisma.email.findMany({
    orderBy: { receivedAt: 'desc' },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  type EmailType = Awaited<ReturnType<typeof prisma.email.findMany>>[0] & {
    tasks: Array<{
      id: string;
      emailId: string;
      title: string;
      description: string | null;
      priority: string;
      status: string;
      aiAnalysis: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  };
  
  return emails.map((email: EmailType) => ({
    id: email.id,
    gmailId: email.gmailId,
    threadId: email.threadId,
    subject: email.subject,
    from: email.from,
    to: email.to,
    snippet: email.snippet,
    body: email.body,
    bodyText: email.bodyText,
    receivedAt: email.receivedAt.toISOString(),
    isRead: email.isRead,
    isAnalyzed: email.isAnalyzed,
    isIrrelevant: email.isIrrelevant,
    syncedAt: email.syncedAt.toISOString(),
    lastSyncedAt: email.lastSyncedAt?.toISOString() || null,
    createdAt: email.createdAt.toISOString(),
    updatedAt: email.updatedAt.toISOString(),
    tasks: email.tasks.map((task: { id: string; emailId: string; title: string; description: string | null; priority: string; status: string; aiAnalysis: string | null; createdAt: Date; updatedAt: Date }) => ({
      id: task.id,
      emailId: task.emailId,
      title: task.title,
      description: task.description,
      priority: task.priority as 'low' | 'medium' | 'high',
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      aiAnalysis: task.aiAnalysis,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  }));
}

export async function getEmailThreads(filters?: EmailThreadFilters): Promise<EmailThreadResult> {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 20;
  const search = filters?.search?.trim() || '';
  const readStatus = filters?.readStatus || 'all';
  const analyzedStatus = filters?.analyzedStatus || 'all';
  const relevantStatus = filters?.relevantStatus || 'relevant'; // Default to showing only relevant
  
  // Build where clause
  const where: any = {};
  
  // Filter by irrelevant status (default to showing only relevant)
  if (relevantStatus === 'relevant') {
    where.isIrrelevant = false;
  } else if (relevantStatus === 'irrelevant') {
    where.isIrrelevant = true;
  }
  // 'all' means no filter on isIrrelevant
  
  // Search filter (subject, snippet, bodyText, from)
  // SQLite doesn't support case-insensitive mode, so we'll filter in memory after fetching
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { snippet: { contains: search } },
      { bodyText: { contains: search } },
      { from: { contains: search } },
    ];
  }
  
  // Read status filter
  if (readStatus === 'read') {
    where.isRead = true;
  } else if (readStatus === 'unread') {
    where.isRead = false;
  }
  
  // Analyzed status filter
  if (analyzedStatus === 'analyzed') {
    where.isAnalyzed = true;
  } else if (analyzedStatus === 'unanalyzed') {
    where.isAnalyzed = false;
  }
  
  // Get all matching emails
  const emails = await prisma.email.findMany({
    where,
    orderBy: { receivedAt: 'desc' },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  // Group emails by threadId
  // Normalize threadId to ensure consistent grouping (trim whitespace)
  const threadMap = new Map<string, Email[]>();
  
  for (const email of emails) {
    // Normalize threadId - trim whitespace
    // If threadId is missing, use gmailId as fallback (shouldn't happen in normal cases)
    const normalizedThreadId = (email.threadId || email.gmailId || '').trim();
    
    if (!email.threadId && email.gmailId) {
      console.warn(`Email ${email.gmailId} has no threadId, using gmailId as fallback. This email will appear as its own thread.`);
    }
    
    const emailData: Email = {
      id: email.id,
      gmailId: email.gmailId,
      threadId: normalizedThreadId,
      subject: email.subject,
      from: email.from,
      to: email.to,
      snippet: email.snippet,
      body: email.body,
      bodyText: email.bodyText,
      receivedAt: email.receivedAt.toISOString(),
      isRead: email.isRead,
      isAnalyzed: email.isAnalyzed,
      isIrrelevant: email.isIrrelevant,
      syncedAt: email.syncedAt.toISOString(),
      lastSyncedAt: email.lastSyncedAt?.toISOString() || null,
      createdAt: email.createdAt.toISOString(),
      updatedAt: email.updatedAt.toISOString(),
      tasks: email.tasks.map((task: { id: string; emailId: string; title: string; description: string | null; priority: string; status: string; aiAnalysis: string | null; createdAt: Date; updatedAt: Date }) => ({
        id: task.id,
        emailId: task.emailId,
        title: task.title,
        description: task.description,
        priority: task.priority as 'low' | 'medium' | 'high',
        status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        aiAnalysis: task.aiAnalysis,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
    
    if (!threadMap.has(normalizedThreadId)) {
      threadMap.set(normalizedThreadId, []);
    }
    threadMap.get(normalizedThreadId)!.push(emailData);
  }
  
  // Convert to thread objects
  const threads: EmailThread[] = [];
  
  for (const [threadId, threadEmails] of threadMap.entries()) {
    // Sort emails in thread by receivedAt (oldest first)
    threadEmails.sort((a, b) => 
      new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
    );
    
    // Latest email is the last one
    const latestEmail = threadEmails[threadEmails.length - 1];
    
    // Collect all tasks from all emails in the thread
    const allTasks: EmailTask[] = [];
    for (const email of threadEmails) {
      if (email.tasks) {
        allTasks.push(...email.tasks);
      }
    }
    
    // Thread is read if all emails are read
    const isRead = threadEmails.every(e => e.isRead);
    
    // Thread is analyzed if all emails are analyzed
    const isAnalyzed = threadEmails.every(e => e.isAnalyzed);
    
    // Thread is irrelevant if any email is irrelevant
    const isIrrelevant = threadEmails.some(e => e.isIrrelevant);
    
    // Count unread emails in thread
    const unreadCount = threadEmails.filter(e => !e.isRead).length;
    
    threads.push({
      threadId,
      subject: latestEmail.subject,
      emails: threadEmails,
      latestEmail,
      isRead,
      isAnalyzed,
      isIrrelevant,
      unreadCount,
      totalCount: threadEmails.length,
      tasks: allTasks,
    });
  }
  
  // Apply case-insensitive search filter if needed (SQLite limitation)
  let filteredThreads = threads;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredThreads = threads.filter(thread => {
      const subject = (thread.subject || '').toLowerCase();
      const snippet = (thread.latestEmail.snippet || '').toLowerCase();
      const bodyText = (thread.latestEmail.bodyText || '').toLowerCase();
      const from = (thread.latestEmail.from || '').toLowerCase();
      return subject.includes(searchLower) || 
             snippet.includes(searchLower) || 
             bodyText.includes(searchLower) || 
             from.includes(searchLower);
    });
  }
  
  // Sort threads by latest email receivedAt (newest first)
  filteredThreads.sort((a, b) => 
    new Date(b.latestEmail.receivedAt).getTime() - new Date(a.latestEmail.receivedAt).getTime()
  );
  
  // Apply pagination
  const total = filteredThreads.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedThreads = filteredThreads.slice(startIndex, endIndex);
  
  return {
    threads: paginatedThreads,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getEmail(id: string): Promise<Email | null> {
  const email = await prisma.email.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  
  if (!email) return null;
  
  return {
    id: email.id,
    gmailId: email.gmailId,
    threadId: email.threadId,
    subject: email.subject,
    from: email.from,
    to: email.to,
    snippet: email.snippet,
    body: email.body,
    bodyText: email.bodyText,
    receivedAt: email.receivedAt.toISOString(),
    isRead: email.isRead,
    isAnalyzed: email.isAnalyzed,
    isIrrelevant: email.isIrrelevant,
    syncedAt: email.syncedAt.toISOString(),
    lastSyncedAt: email.lastSyncedAt?.toISOString() || null,
    createdAt: email.createdAt.toISOString(),
    updatedAt: email.updatedAt.toISOString(),
    tasks: email.tasks.map((task: { id: string; emailId: string; title: string; description: string | null; priority: string; status: string; aiAnalysis: string | null; createdAt: Date; updatedAt: Date }) => ({
      id: task.id,
      emailId: task.emailId,
      title: task.title,
      description: task.description,
      priority: task.priority as 'low' | 'medium' | 'high',
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      aiAnalysis: task.aiAnalysis,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })),
  };
}

export async function getEmailTasks(): Promise<EmailTask[]> {
  const tasks = await prisma.emailTask.findMany({
    orderBy: [
      { priority: 'desc' }, // high, medium, low
      { createdAt: 'desc' },
    ],
    include: {
      email: true,
    },
  });
  
  type TaskType = Awaited<ReturnType<typeof prisma.emailTask.findMany<{ include: { email: true } }>>>[0];
  
  return tasks.map((task: TaskType) => ({
    id: task.id,
    emailId: task.emailId,
    title: task.title,
    description: task.description,
    priority: task.priority as 'low' | 'medium' | 'high',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    aiAnalysis: task.aiAnalysis,
    externalTaskId: task.externalTaskId || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    email: task.email ? {
      id: task.email.id,
      gmailId: task.email.gmailId,
      threadId: task.email.threadId,
      subject: task.email.subject,
      from: task.email.from,
      to: task.email.to,
      snippet: task.email.snippet,
      body: task.email.body,
      bodyText: task.email.bodyText,
      receivedAt: task.email.receivedAt.toISOString(),
      isRead: task.email.isRead,
      isAnalyzed: task.email.isAnalyzed,
      isIrrelevant: task.email.isIrrelevant,
      syncedAt: task.email.syncedAt.toISOString(),
      lastSyncedAt: task.email.lastSyncedAt?.toISOString() || null,
      createdAt: task.email.createdAt.toISOString(),
      updatedAt: task.email.updatedAt.toISOString(),
    } : undefined,
  }));
}

export async function createEmailTask(data: {
  emailId: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  aiAnalysis?: string;
}): Promise<EmailTask> {
  const task = await prisma.emailTask.create({
    data: {
      emailId: data.emailId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      status: data.status || 'pending',
      aiAnalysis: data.aiAnalysis,
    },
    include: {
      email: true,
    },
  });
  
  return {
    id: task.id,
    emailId: task.emailId,
    title: task.title,
    description: task.description,
    priority: task.priority as 'low' | 'medium' | 'high',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    aiAnalysis: task.aiAnalysis,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    email: task.email ? {
      id: task.email.id,
      gmailId: task.email.gmailId,
      threadId: task.email.threadId,
      subject: task.email.subject,
      from: task.email.from,
      to: task.email.to,
      snippet: task.email.snippet,
      body: task.email.body,
      bodyText: task.email.bodyText,
      receivedAt: task.email.receivedAt.toISOString(),
      isRead: task.email.isRead,
      isAnalyzed: task.email.isAnalyzed,
      isIrrelevant: task.email.isIrrelevant,
      syncedAt: task.email.syncedAt.toISOString(),
      lastSyncedAt: task.email.lastSyncedAt?.toISOString() || null,
      createdAt: task.email.createdAt.toISOString(),
      updatedAt: task.email.updatedAt.toISOString(),
    } : undefined,
  };
}

export async function updateEmailTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }
): Promise<EmailTask> {
  const task = await prisma.emailTask.update({
    where: { id },
    data,
    include: {
      email: true,
    },
  });
  
  return {
    id: task.id,
    emailId: task.emailId,
    title: task.title,
    description: task.description,
    priority: task.priority as 'low' | 'medium' | 'high',
    status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    aiAnalysis: task.aiAnalysis,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    email: task.email ? {
      id: task.email.id,
      gmailId: task.email.gmailId,
      threadId: task.email.threadId,
      subject: task.email.subject,
      from: task.email.from,
      to: task.email.to,
      snippet: task.email.snippet,
      body: task.email.body,
      bodyText: task.email.bodyText,
      receivedAt: task.email.receivedAt.toISOString(),
      isRead: task.email.isRead,
      isAnalyzed: task.email.isAnalyzed,
      isIrrelevant: task.email.isIrrelevant,
      syncedAt: task.email.syncedAt.toISOString(),
      lastSyncedAt: task.email.lastSyncedAt?.toISOString() || null,
      createdAt: task.email.createdAt.toISOString(),
      updatedAt: task.email.updatedAt.toISOString(),
    } : undefined,
  };
}

export async function deleteEmailTask(id: string): Promise<void> {
  await prisma.emailTask.delete({
    where: { id },
  });
}

