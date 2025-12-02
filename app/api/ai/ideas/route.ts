import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const ideas = await prisma.postIdea.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    type PostIdea = Awaited<ReturnType<typeof prisma.postIdea.findMany>>[0];
    
    return NextResponse.json({ 
      ideas: ideas.map((idea: PostIdea) => ({
        id: idea.id,
        title: idea.title,
        prompt: idea.prompt,
        content: idea.content,
        platforms: idea.platforms,
        status: idea.status,
        createdAt: idea.createdAt.toISOString(),
        updatedAt: idea.updatedAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Error fetching post ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post ideas' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { title, content, platforms, status } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (platforms !== undefined) updateData.platforms = platforms ? JSON.stringify(platforms) : null;
    if (status !== undefined) updateData.status = status;
    
    const idea = await prisma.postIdea.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({ 
      idea: {
        id: idea.id,
        title: idea.title,
        prompt: idea.prompt,
        content: idea.content,
        platforms: idea.platforms,
        status: idea.status,
        createdAt: idea.createdAt.toISOString(),
        updatedAt: idea.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error updating post idea:', error);
    return NextResponse.json(
      { error: 'Failed to update post idea' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.postIdea.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post idea:', error);
    return NextResponse.json(
      { error: 'Failed to delete post idea' },
      { status: 500 }
    );
  }
}
