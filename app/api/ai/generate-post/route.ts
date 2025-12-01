import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generatePost } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { blogContent, blogTitle, blogExcerpt, prompt, platform, aiIntegrationId, count } = await request.json();
    
    if (!prompt || !platform || !aiIntegrationId) {
      return NextResponse.json(
        { error: 'Prompt, platform, and AI integration ID are required' },
        { status: 400 }
      );
    }
    
    const postCount = count || 1;
    
    // If generating multiple posts, use generateMultiplePosts
    if (postCount > 1) {
      const { generateMultiplePosts } = await import('@/lib/ai-service');
      const generatedContents = await generateMultiplePosts({
        blogContent,
        blogTitle,
        blogExcerpt,
        prompt,
        platform,
        aiIntegrationId,
        count: postCount,
      });
      
      return NextResponse.json({ 
        content: generatedContents[0], // For backward compatibility
        contents: generatedContents, // Array of all generated posts
        count: generatedContents.length 
      });
    } else {
      const generatedContent = await generatePost({
        blogContent,
        blogTitle,
        blogExcerpt,
        prompt,
        platform,
        aiIntegrationId,
        count: 1,
      });
      
      return NextResponse.json({ 
        content: generatedContent,
        contents: [generatedContent],
        count: 1
      });
    }
  } catch (error: any) {
    console.error('Error generating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate post' },
      { status: 500 }
    );
  }
}
