import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { refinePost } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { content, refinementPrompt, aiIntegrationId } = await request.json();
    
    if (!content || !refinementPrompt || !aiIntegrationId) {
      return NextResponse.json(
        { error: 'Content, refinement prompt, and AI integration ID are required' },
        { status: 400 }
      );
    }
    
    const refinedContent = await refinePost({
      content,
      refinementPrompt,
      aiIntegrationId,
    });
    
    return NextResponse.json({ content: refinedContent });
  } catch (error: any) {
    console.error('Error refining post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refine post' },
      { status: 500 }
    );
  }
}
