import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generateIdeas } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { prompt, aiIntegrationId, count } = await request.json();
    
    if (!prompt || !aiIntegrationId) {
      return NextResponse.json(
        { error: 'Prompt and AI integration ID are required' },
        { status: 400 }
      );
    }
    
    const ideas = await generateIdeas({
      prompt,
      aiIntegrationId,
      count: count || 5,
    });
    
    // Save ideas to database
    const savedIdeas = await Promise.all(
      ideas.map(idea =>
        prisma.postIdea.create({
          data: {
            title: idea,
            prompt,
            status: 'draft',
            createdBy: user.id,
          },
        })
      )
    );
    
    return NextResponse.json({ 
      ideas: savedIdeas.map(idea => ({
        id: idea.id,
        title: idea.title,
        prompt: idea.prompt,
        status: idea.status,
        createdAt: idea.createdAt.toISOString(),
      }))
    });
  } catch (error: any) {
    console.error('Error generating ideas:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}
