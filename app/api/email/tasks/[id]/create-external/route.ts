import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PUBLIC_API_BASE_URL = process.env.PUBLIC_API_BASE_URL;
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;
const PUBLIC_API_BOARD_ID = process.env.PUBLIC_API_BOARD_ID;

/**
 * Create a task on the external platform (app.division5.co)
 * Maps email task to external task format
 */
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate environment variables
    if (!PUBLIC_API_BASE_URL || !PUBLIC_API_KEY) {
      return NextResponse.json(
        { error: 'External API configuration is missing. Please configure PUBLIC_API_BASE_URL and PUBLIC_API_KEY.' },
        { status: 500 }
      );
    }

    // Get the email task
    const task = await prisma.emailTask.findUnique({
      where: { id: params.id },
      include: {
        email: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Map priority: 'low' | 'medium' | 'high' -> 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    // High priority tasks can be mapped to URGENT if needed
    const priorityMap: Record<string, string> = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH', // Could be changed to 'URGENT' if high priority emails should be urgent
    };

    // Build task description with email context
    let description = task.description || '';
    if (task.email) {
      const emailContext = `\n\n--- Email Context ---\nSubject: ${task.email.subject}\nFrom: ${task.email.from}\nReceived: ${new Date(task.email.receivedAt).toLocaleString()}`;
      if (task.email.snippet) {
        description += `\n\nEmail Preview: ${task.email.snippet}`;
      }
      description += emailContext;
    }

    // Prepare task data for external API
    const externalTaskData: any = {
      title: task.title,
      description: description.trim(),
      priority: priorityMap[task.priority] || 'MEDIUM',
      tags: ['email', 'auto-generated'],
    };

    // Add contact information if available
    if (task.email?.from) {
      // Extract email from "Name <email@example.com>" format
      const emailMatch = task.email.from.match(/<(.+)>/);
      const emailAddress = emailMatch ? emailMatch[1] : task.email.from;
      externalTaskData.contactEmail = emailAddress;
      
      // Extract name if available
      const nameMatch = task.email.from.match(/^(.+?)\s*</);
      if (nameMatch) {
        externalTaskData.contactName = nameMatch[1].trim();
      }
    }

    // Add board ID if configured
    if (PUBLIC_API_BOARD_ID) {
      externalTaskData.boardId = PUBLIC_API_BOARD_ID;
    }

    // Call external API
    const apiUrl = `${PUBLIC_API_BASE_URL}/api/v1/tasks/public`;
    console.log(`[EXTERNAL-API] Creating task on external platform: ${apiUrl}`);
    console.log(`[EXTERNAL-API] Task data:`, { ...externalTaskData, description: externalTaskData.description.substring(0, 100) + '...' });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': PUBLIC_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalTaskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EXTERNAL-API] Failed to create task: ${response.status} ${errorText}`);
      return NextResponse.json(
        {
          error: 'Failed to create task on external platform',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`[EXTERNAL-API] Task created successfully:`, result);

    // Update the task with the external task ID
    const externalTaskId = result.taskId || result.id || result.externalTaskId;
    if (externalTaskId) {
      await prisma.emailTask.update({
        where: { id: params.id },
        data: { externalTaskId },
      });
      console.log(`[EXTERNAL-API] Updated task ${params.id} with externalTaskId: ${externalTaskId}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Task created successfully on external platform',
      taskId: result.taskId || result.id,
      externalTaskId: externalTaskId,
    });
  } catch (error) {
    console.error('[EXTERNAL-API] Error creating external task:', error);
    return NextResponse.json(
      {
        error: 'Failed to create task on external platform',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
