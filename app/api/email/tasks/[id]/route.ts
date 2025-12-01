import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateEmailTask, deleteEmailTask } from '@/lib/data';

/**
 * Update a task (e.g., mark as completed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, priority, title, description } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const task = await updateEmailTask(id, updateData);

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * Delete a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    // Get the task first to get the emailId and threadId
    const task = await prisma.emailTask.findUnique({
      where: { id },
      include: {
        email: {
          select: {
            id: true,
            threadId: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete the task
    await deleteEmailTask(id);

    // Reset analyzed status for all emails in the thread
    // This allows the email to be re-analyzed if needed
    if (task.email?.threadId) {
      await prisma.email.updateMany({
        where: {
          threadId: task.email.threadId,
        },
        data: {
          isAnalyzed: false,
        },
      });
    } else if (task.emailId) {
      // Fallback: if no threadId, just update the single email
      await prisma.email.update({
        where: { id: task.emailId },
        data: { isAnalyzed: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
