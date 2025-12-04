import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { publishToPlatform, ensureValidToken } from '@/lib/social';
import { commentOnLinkedInPost } from '@/lib/social/linkedin';
import { commentOnTwitterPost } from '@/lib/social/twitter';
import { commentOnThreadsPost } from '@/lib/social/threads';
import { commentOnInstagramPost } from '@/lib/social/instagram';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[PUBLISH-API] Publishing post ${params.id} immediately`);
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      console.error(`[PUBLISH-API] Unauthorized request`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the post
    const post = await prisma.socialPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      console.error(`[PUBLISH-API] Post not found: ${params.id}`);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Allow retry for failed posts or publishing scheduled posts
    // Only block if already fully published (all platforms succeeded)
    if (post.status === 'published' && !post.errorMessage) {
      console.log(`[PUBLISH-API] Post ${params.id} is already published successfully`);
      return NextResponse.json(
        { error: 'Post is already published successfully' },
        { status: 400 }
      );
    }
    
    // If retrying a failed post, log it
    if (post.status === 'failed') {
      console.log(`[PUBLISH-API] Retrying failed post ${params.id}`);
    }

    console.log(`[PUBLISH-API] Post ${params.id} found, status: ${post.status}`);

    const platforms = JSON.parse(post.platforms || '[]') as string[];
    
    if (platforms.length === 0) {
      console.warn(`[PUBLISH-API] Post ${params.id} has no platforms selected. Cannot publish.`);
      return NextResponse.json(
        { error: 'Post has no platforms selected. Please edit the post and select at least one platform.' },
        { status: 400 }
      );
    }
    
    console.log(`[PUBLISH-API] Post ${params.id} platforms: ${platforms.join(', ')}`);

    const publishedResults: Record<string, string> = {};
    const errors: string[] = [];

    // Get connections for each platform
    const connections = await prisma.socialConnection.findMany({
      where: {
        platform: { in: platforms },
        isActive: true,
      },
    });

    console.log(`[PUBLISH-API] Found ${connections.length} active connection(s) for platforms: ${platforms.join(', ')}`);
    
    if (connections.length === 0) {
      console.warn(`[PUBLISH-API] No active connections found for platforms: ${platforms.join(', ')}`);
      return NextResponse.json(
        { error: `No active connections found for selected platforms: ${platforms.join(', ')}. Please connect your social media accounts first.` },
        { status: 400 }
      );
    }

    // Publish to each platform
    for (const platform of platforms) {
      console.log(`[PUBLISH-API] Attempting to publish to ${platform} for post ${params.id}`);
      type SocialConnection = Awaited<ReturnType<typeof prisma.socialConnection.findMany>>[0];
      const connection = connections.find((c: SocialConnection) => c.platform === platform);

      if (!connection) {
        const errorMsg = `${platform}: No active connection`;
        console.error(`[PUBLISH-API] ${errorMsg} for post ${params.id}`);
        errors.push(errorMsg);
        continue;
      }

      console.log(`[PUBLISH-API] Found connection for ${platform}, publishing...`);
      
      // Parse mediaAssets from post
      let mediaAssets: Array<{ type: 'image' | 'video'; url: string }> | null = null;
      if (post.mediaAssets) {
        try {
          mediaAssets = JSON.parse(post.mediaAssets);
        } catch (e) {
          console.error(`[PUBLISH-API] Error parsing mediaAssets for post ${params.id}:`, e);
        }
      }
      
      // Parse mentions from post (if available)
      let mentions: Array<{ 
        type: 'person' | 'organization';
        member?: string;
        organization?: string;
        firstName?: string;
        lastName?: string;
        headline?: string;
        name?: string;
      }> | null = null;
      if ((post as any).mentions) {
        try {
          const mentionsData = JSON.parse((post as any).mentions);
          if (Array.isArray(mentionsData) && mentionsData.length > 0) {
            mentions = mentionsData;
            console.log(`[PUBLISH-API] Found ${mentions.length} mention(s) for post ${params.id}`);
          }
        } catch (e) {
          console.error(`[PUBLISH-API] Error parsing mentions for post ${params.id}:`, e);
        }
      }
      
      const result = await publishToPlatform(
        platform,
        post.content,
        connection.accessToken,
        connection,
        mediaAssets,
        mentions
      );

      if (result.success && result.postId) {
        console.log(`[PUBLISH-API] ✓ Successfully published to ${platform} for post ${params.id}. Post ID: ${result.postId}`);
        publishedResults[platform] = new Date().toISOString();
        
        // Post comments after the main post if comments exist
        if (post.comments) {
          try {
            let commentsArray: string[] = [];
            try {
              commentsArray = JSON.parse(post.comments);
            } catch (e) {
              console.error(`[PUBLISH-API] Error parsing comments for post ${params.id}:`, e);
            }
            
            if (commentsArray && commentsArray.length > 0) {
              console.log(`[PUBLISH-API] Posting ${commentsArray.length} comment(s) on ${platform} for post ${params.id}`);
              
              // Ensure token is valid (refresh if needed) before posting comments
              const validToken = await ensureValidToken(connection);
              
              // Post each comment with a small delay between them
              for (let i = 0; i < commentsArray.length; i++) {
                const comment = commentsArray[i].trim();
                if (!comment) continue; // Skip empty comments
                
                try {
                  // Add a small delay between comments (1 second)
                  if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                  
                  if (platform === 'linkedin') {
                    // LinkedIn needs the full URN format
                    const postUrn = result.postId.startsWith('urn:li:') 
                      ? result.postId 
                      : `urn:li:ugcPost:${result.postId}`;
                    await commentOnLinkedInPost(validToken, postUrn, comment);
                    console.log(`[PUBLISH-API] ✓ Comment ${i + 1}/${commentsArray.length} posted on LinkedIn`);
                  } else if (platform === 'twitter') {
                    await commentOnTwitterPost(validToken, result.postId, comment);
                    console.log(`[PUBLISH-API] ✓ Comment ${i + 1}/${commentsArray.length} posted on Twitter`);
                  } else if (platform === 'threads') {
                    // Get Threads account ID from connection (stored in username field as "username|threads_id")
                    let threadsAccountId: string | null = null;
                    if (connection.username) {
                      const parts = connection.username.split('|');
                      if (parts.length >= 2) {
                        threadsAccountId = parts[1]; // Second part is the Threads account ID
                      }
                    }
                    
                    if (!threadsAccountId) {
                      throw new Error('Threads account ID not found in connection');
                    }
                    
                    await commentOnThreadsPost(validToken, threadsAccountId, result.postId, comment);
                    console.log(`[PUBLISH-API] ✓ Comment ${i + 1}/${commentsArray.length} posted on Threads`);
                  } else if (platform === 'instagram') {
                    // Instagram uses page access token (same as for posting)
                    await commentOnInstagramPost(validToken, result.postId, comment);
                    console.log(`[PUBLISH-API] ✓ Comment ${i + 1}/${commentsArray.length} posted on Instagram`);
                  } else {
                    console.log(`[PUBLISH-API] Comment posting not yet implemented for ${platform}, skipping`);
                  }
                } catch (commentError) {
                  const errorMsg = `Failed to post comment ${i + 1} on ${platform}: ${commentError instanceof Error ? commentError.message : 'Unknown error'}`;
                  console.error(`[PUBLISH-API] ${errorMsg}`);
                  // Don't fail the whole post if a comment fails, just log it
                  errors.push(errorMsg);
                }
              }
            }
          } catch (commentError) {
            console.error(`[PUBLISH-API] Error processing comments for ${platform}:`, commentError);
            // Don't fail the whole post if comments fail
          }
        }
      } else {
        const errorMsg = `${platform}: ${result.error || 'Unknown error - no postId returned'}`;
        console.error(`[PUBLISH-API] ✗ Failed to publish to ${platform} for post ${params.id}: ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Update post status
    const allSucceeded = errors.length === 0;
    const someSucceeded = Object.keys(publishedResults).length > 0;
    const finalStatus = allSucceeded ? 'published' : someSucceeded ? 'published' : 'failed';

    console.log(`[PUBLISH-API] Updating post ${params.id} status to: ${finalStatus}, errors: ${errors.length}, successes: ${Object.keys(publishedResults).length}`);

    const updatedPost = await prisma.socialPost.update({
      where: { id: params.id },
      data: {
        status: finalStatus,
        publishedAt: someSucceeded ? new Date() : null,
        publishedOn: JSON.stringify(publishedResults),
        errorMessage: errors.length > 0 ? errors.join('; ') : null,
      },
    });

    console.log(`[PUBLISH-API] Post ${params.id} updated successfully`);

    return NextResponse.json({
      success: true,
      message: allSucceeded
        ? `Post published successfully to ${platforms.join(', ')}`
        : someSucceeded
        ? `Post published to some platforms. Errors: ${errors.join('; ')}`
        : `Failed to publish post. Errors: ${errors.join('; ')}`,
      post: updatedPost,
      published: Object.keys(publishedResults).length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error(`[PUBLISH-API] Error publishing post ${params.id}:`, error);
    if (error instanceof Error) {
      console.error(`[PUBLISH-API] Error details:`, error.message, error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to publish post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
