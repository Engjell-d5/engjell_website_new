import { prisma } from './prisma';
import { publishToLinkedIn, refreshLinkedInToken, isLinkedInTokenExpired, commentOnLinkedInPost } from './social/linkedin';
import { publishToTwitter, refreshTwitterToken, isTwitterTokenExpired, commentOnTwitterPost } from './social/twitter';
import { publishToInstagram, refreshInstagramToken, isInstagramTokenExpired, getInstagramAccountInfoFromToken, commentOnInstagramPost } from './social/instagram';
import { publishToThreads, refreshThreadsToken, isThreadsTokenExpired, commentOnThreadsPost } from './social/threads';

interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Refresh access token if needed
 */
export async function ensureValidToken(connection: {
  platform: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}): Promise<string> {
  if (connection.platform === 'linkedin') {
    const isExpired = isLinkedInTokenExpired(connection.expiresAt);
    console.log(`[LINKEDIN] Token check: expiresAt=${connection.expiresAt?.toISOString() || 'N/A'}, isExpired=${isExpired}, hasRefreshToken=${!!connection.refreshToken}`);
    
    if (connection.refreshToken && isExpired) {
      console.log(`[LINKEDIN] Token expired, attempting to refresh...`);
      try {
        const newTokenData = await refreshLinkedInToken(connection.refreshToken);
        console.log(`[LINKEDIN] Token refresh successful, new expires_in: ${newTokenData.expires_in} seconds`);
        
        // Update token in database
        const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
        await prisma.socialConnection.update({
          where: { platform: 'linkedin' },
          data: {
            accessToken: newTokenData.access_token,
            expiresAt,
          },
        });
        
        console.log(`[LINKEDIN] Token updated in database, new expiresAt: ${expiresAt.toISOString()}`);
        return newTokenData.access_token;
      } catch (error) {
        console.error('[LINKEDIN] Failed to refresh LinkedIn token:', error);
        if (error instanceof Error) {
          console.error('[LINKEDIN] Token refresh error details:', error.message, error.stack);
        }
        // Return original token and let the publish attempt fail gracefully
        console.log(`[LINKEDIN] Returning original token after refresh failure`);
        return connection.accessToken;
      }
    }
  } else if (connection.platform === 'twitter') {
    const isExpired = isTwitterTokenExpired(connection.expiresAt);
    console.log(`[TWITTER] Token check: expiresAt=${connection.expiresAt?.toISOString() || 'N/A'}, isExpired=${isExpired}, hasRefreshToken=${!!connection.refreshToken}`);
    
    // Try to refresh if expired OR if no expiration date (might be invalid)
    if (connection.refreshToken && (isExpired || !connection.expiresAt)) {
      console.log(`[TWITTER] Token expired or missing expiration date, attempting to refresh...`);
      try {
        const newTokenData = await refreshTwitterToken(connection.refreshToken);
        console.log(`[TWITTER] Token refresh successful, new expires_in: ${newTokenData.expires_in} seconds`);
        
        // Update token in database
        const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
        await prisma.socialConnection.update({
          where: { platform: 'twitter' },
          data: {
            accessToken: newTokenData.access_token,
            expiresAt,
            refreshToken: newTokenData.refresh_token || connection.refreshToken, // Keep old refresh token if new one not provided
          },
        });
        
        console.log(`[TWITTER] Token updated in database, new expiresAt: ${expiresAt.toISOString()}`);
        return newTokenData.access_token;
      } catch (error) {
        console.error('[TWITTER] Failed to refresh Twitter token:', error);
        if (error instanceof Error) {
          console.error('[TWITTER] Token refresh error details:', error.message, error.stack);
        }
        // If refresh fails, the token might be completely invalid - user needs to reconnect
        console.log(`[TWITTER] Token refresh failed - user may need to reconnect their Twitter account`);
        // Return original token and let the publish attempt fail gracefully
        return connection.accessToken;
      }
    } else if (!connection.refreshToken) {
      console.warn(`[TWITTER] No refresh token available - token cannot be refreshed. User may need to reconnect.`);
    }
  } else if (connection.platform === 'instagram') {
    const isExpired = isInstagramTokenExpired(connection.expiresAt);
    console.log(`[INSTAGRAM] Token check: expiresAt=${connection.expiresAt?.toISOString() || 'N/A'}, isExpired=${isExpired}`);
    
    if (isExpired && connection.accessToken) {
      console.log(`[INSTAGRAM] Token expired or expiring soon, attempting to refresh...`);
      try {
        const newTokenData = await refreshInstagramToken(connection.accessToken);
        console.log(`[INSTAGRAM] Token refresh successful, new expires_in: ${newTokenData.expires_in} seconds`);
        
        // Update token in database
        const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
        await prisma.socialConnection.update({
          where: { platform: 'instagram' },
          data: {
            accessToken: newTokenData.access_token,
            expiresAt,
          },
        });
        
        console.log(`[INSTAGRAM] Token updated in database, new expiresAt: ${expiresAt.toISOString()}`);
        return newTokenData.access_token;
      } catch (error) {
        console.error('[INSTAGRAM] Failed to refresh Instagram token:', error);
        if (error instanceof Error) {
          console.error('[INSTAGRAM] Token refresh error details:', error.message, error.stack);
        }
        // Return original token and let the publish attempt fail gracefully
        console.log(`[INSTAGRAM] Returning original token after refresh failure`);
        return connection.accessToken;
      }
    }
  } else if (connection.platform === 'threads') {
    const isExpired = isThreadsTokenExpired(connection.expiresAt);
    console.log(`[THREADS] Token check: expiresAt=${connection.expiresAt?.toISOString() || 'N/A'}, isExpired=${isExpired}`);
    
    if (isExpired && connection.accessToken) {
      console.log(`[THREADS] Token expired or expiring soon, attempting to refresh...`);
      try {
        const newTokenData = await refreshThreadsToken(connection.accessToken);
        console.log(`[THREADS] Token refresh successful, new expires_in: ${newTokenData.expires_in} seconds`);
        
        // Update token in database
        const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
        await prisma.socialConnection.update({
          where: { platform: 'threads' },
          data: {
            accessToken: newTokenData.access_token,
            expiresAt,
          },
        });
        
        console.log(`[THREADS] Token updated in database, new expiresAt: ${expiresAt.toISOString()}`);
        return newTokenData.access_token;
      } catch (error) {
        console.error('[THREADS] Failed to refresh Threads token:', error);
        if (error instanceof Error) {
          console.error('[THREADS] Token refresh error details:', error.message, error.stack);
        }
        // Return original token and let the publish attempt fail gracefully
        console.log(`[THREADS] Returning original token after refresh failure`);
        return connection.accessToken;
      }
    }
  }
  
  return connection.accessToken;
}

/**
 * Publish a post to a specific platform
 */
export async function publishToPlatform(
  platform: string,
  content: string,
  accessToken: string,
  connection?: any,
  mediaAssets?: Array<{ type: 'image' | 'video'; url: string }> | null,
  mentions?: Array<{ 
    type: 'person' | 'organization';
    member?: string;
    organization?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    name?: string;
  }> | null
): Promise<PublishResult> {
  try {
    console.log(`[LINKEDIN] publishToPlatform called for ${platform}, content length: ${content.length}, mediaAssets: ${mediaAssets?.length || 0}`);
    
    // Ensure token is valid and refresh if needed
    let validToken = accessToken;
    if (connection) {
      console.log(`[LINKEDIN] Checking token validity for ${platform}, expiresAt: ${connection.expiresAt?.toISOString() || 'N/A'}`);
      validToken = await ensureValidToken(connection);
      if (validToken !== accessToken) {
        console.log(`[LINKEDIN] Token was refreshed for ${platform}`);
      } else {
        console.log(`[LINKEDIN] Token is valid for ${platform}`);
      }
    }

    switch (platform) {
      case 'linkedin':
        console.log(`[LINKEDIN] Calling publishToLinkedIn...`);
        const linkedinResult = await publishToLinkedIn(validToken, content, mediaAssets || null, mentions || null);
        console.log(`[LINKEDIN] publishToLinkedIn returned - postId: ${linkedinResult.postId}, urn: ${linkedinResult.urn}`);
        
        // Validate that we actually got a post ID/URN
        if (!linkedinResult.postId && !linkedinResult.urn) {
          console.error(`[LINKEDIN] ERROR: LinkedIn returned success but no postId or URN!`);
          return {
            platform,
            success: false,
            error: 'LinkedIn API returned no post ID or URN',
          };
        }
        
        const postId = linkedinResult.postId || linkedinResult.urn;
        if (!postId || postId.trim() === '') {
          console.error(`[LINKEDIN] ERROR: Post ID is empty or invalid: "${postId}"`);
          return {
            platform,
            success: false,
            error: 'Invalid post ID returned from LinkedIn',
          };
        }
        
        console.log(`[LINKEDIN] ✓ publishToLinkedIn succeeded with valid postId: ${postId}`);
        return {
          platform,
          success: true,
          postId: postId,
        };
      
      case 'twitter':
        console.log(`[TWITTER] Calling publishToTwitter...`);
        try {
        const twitterResult = await publishToTwitter(validToken, content, mediaAssets || null);
        console.log(`[TWITTER] publishToTwitter returned - postId: ${twitterResult.postId}`);
        
        // Validate that we actually got a post ID
        if (!twitterResult.postId || twitterResult.postId.trim() === '') {
          console.error(`[TWITTER] ERROR: Twitter returned success but no postId!`);
          return {
            platform,
            success: false,
            error: 'Twitter API returned no post ID',
          };
        }
        
        console.log(`[TWITTER] ✓ publishToTwitter succeeded with valid postId: ${twitterResult.postId}`);
        return {
          platform,
          success: true,
          postId: twitterResult.postId,
        };
        } catch (error) {
          // If we get a 403 error, try refreshing the token and retry once
          if (error instanceof Error && error.message.includes('403')) {
            console.log(`[TWITTER] Got 403 error, attempting token refresh and retry...`);
            if (connection && connection.refreshToken) {
              try {
                const newTokenData = await refreshTwitterToken(connection.refreshToken);
                console.log(`[TWITTER] Token refresh successful, retrying publish...`);
                
                // Update token in database
                const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
                await prisma.socialConnection.update({
                  where: { platform: 'twitter' },
                  data: {
                    accessToken: newTokenData.access_token,
                    expiresAt,
                    refreshToken: newTokenData.refresh_token || connection.refreshToken,
                  },
                });
                
                // Retry with new token
                const retryResult = await publishToTwitter(newTokenData.access_token, content, mediaAssets || null);
                console.log(`[TWITTER] Retry successful - postId: ${retryResult.postId}`);
                
                if (!retryResult.postId || retryResult.postId.trim() === '') {
                  return {
                    platform,
                    success: false,
                    error: 'Twitter API returned no post ID after retry',
                  };
                }
                
                return {
                  platform,
                  success: true,
                  postId: retryResult.postId,
                };
              } catch (refreshError) {
                console.error('[TWITTER] Token refresh failed during retry:', refreshError);
                // Fall through to throw original error with helpful message
                throw new Error(`Twitter authentication failed. Please disconnect and reconnect your Twitter account. Original error: ${error.message}`);
              }
            } else {
              throw new Error(`Twitter authentication failed. No refresh token available. Please disconnect and reconnect your Twitter account. Original error: ${error.message}`);
            }
          }
          // Re-throw the error if it's not a 403 or retry didn't work
          throw error;
        }
      
      case 'instagram':
        console.log(`[INSTAGRAM] Calling publishToInstagram...`);
        
        // Instagram requires Instagram account ID, which we can get from the connection
        // The username field stores "username|instagram_id|page_id"
        let instagramAccountId: string | null = null;
        if (connection?.username) {
          const parts = connection.username.split('|');
          if (parts.length >= 2) {
            instagramAccountId = parts[1]; // Second part is the Instagram account ID
          }
        }
        
        // If we don't have it in the connection, retrieve it from the token
        if (!instagramAccountId) {
          console.log(`[INSTAGRAM] Instagram account ID not found in connection, retrieving from token...`);
          try {
            const accountInfo = await getInstagramAccountInfoFromToken(validToken);
            instagramAccountId = accountInfo.instagramAccountId;
            console.log(`[INSTAGRAM] Retrieved Instagram account ID from token: ${instagramAccountId}`);
          } catch (error) {
            console.error(`[INSTAGRAM] Failed to get Instagram account ID:`, error);
            return {
              platform,
              success: false,
              error: `Failed to get Instagram account ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
          }
        }
        
        if (!instagramAccountId) {
          return {
            platform,
            success: false,
            error: 'Instagram account ID not found',
          };
        }
        
        try {
          const instagramResult = await publishToInstagram(
            validToken,
            instagramAccountId,
            content,
            mediaAssets || null
          );
          console.log(`[INSTAGRAM] publishToInstagram returned - postId: ${instagramResult.postId}`);
          
          // Validate that we actually got a post ID
          if (!instagramResult.postId || instagramResult.postId.trim() === '') {
            console.error(`[INSTAGRAM] ERROR: Instagram returned success but no postId!`);
            return {
              platform,
              success: false,
              error: 'Instagram API returned no post ID',
            };
          }
          
          console.log(`[INSTAGRAM] ✓ publishToInstagram succeeded with valid postId: ${instagramResult.postId}`);
          return {
            platform,
            success: true,
            postId: instagramResult.postId,
          };
        } catch (error) {
          console.error(`[INSTAGRAM] Error publishing to Instagram:`, error);
          return {
            platform,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      
      case 'threads':
        console.log(`[THREADS] Calling publishToThreads...`);
        
        // Check if a pre-configured user access token is set (useful for testing)
        const preConfiguredToken = process.env.THREADS_USER_ACCESS_TOKEN;
        let threadsAccessToken = validToken;
        let threadsAccountId: string | null = null;
        
        if (preConfiguredToken) {
          console.log('[THREADS] Using pre-configured THREADS_USER_ACCESS_TOKEN from environment');
          threadsAccessToken = preConfiguredToken;
          
          // Get account ID from the token using /me endpoint
          try {
            const { getThreadsUser } = await import('./social/threads');
            const threadsUser = await getThreadsUser(preConfiguredToken);
            threadsAccountId = threadsUser.id;
            console.log('[THREADS] Got account ID from pre-configured token:', threadsAccountId);
          } catch (error) {
            console.error('[THREADS] Failed to get account ID from pre-configured token:', error);
            return {
              platform,
              success: false,
              error: `Failed to get Threads account ID from pre-configured token: ${error instanceof Error ? error.message : String(error)}`,
            };
          }
        } else {
          // Use token from database connection
          // Threads requires Threads account ID, which we can get from the connection
          // The username field stores "username|threads_id"
          if (connection?.username) {
            const parts = connection.username.split('|');
            if (parts.length >= 2) {
              threadsAccountId = parts[1]; // Second part is the Threads account ID
            }
          }
          
          if (!threadsAccountId) {
            return {
              platform,
              success: false,
              error: 'Threads account ID not found. Either connect Threads via OAuth or set THREADS_USER_ACCESS_TOKEN environment variable.',
            };
          }
        }
        
        try {
          const threadsResult = await publishToThreads(
            threadsAccessToken,
            threadsAccountId,
            content,
            mediaAssets || null
          );
          console.log(`[THREADS] publishToThreads returned - postId: ${threadsResult.postId}`);
          
          // Validate that we actually got a post ID
          if (!threadsResult.postId || threadsResult.postId.trim() === '') {
            console.error(`[THREADS] ERROR: Threads returned success but no postId!`);
            return {
              platform,
              success: false,
              error: 'Threads API returned no post ID',
            };
          }
          
          console.log(`[THREADS] ✓ publishToThreads succeeded with valid postId: ${threadsResult.postId}`);
          return {
            platform,
            success: true,
            postId: threadsResult.postId,
          };
        } catch (error) {
          console.error(`[THREADS] Error publishing to Threads:`, error);
          return {
            platform,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      
      default:
        return { platform, success: false, error: 'Unknown platform' };
    }
  } catch (error: any) {
    console.error(`[LINKEDIN] Error publishing to ${platform}:`, error);
    if (error.stack) {
      console.error(`[LINKEDIN] Error stack:`, error.stack);
    }
    return {
      platform,
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Publish scheduled posts that are due
 */
export async function publishScheduledPosts() {
  try {
    const now = new Date();
    console.log(`[LINKEDIN] ============================================`);
    console.log(`[LINKEDIN] Starting scheduled post check at ${now.toISOString()}`);
    console.log(`[LINKEDIN] Current time: ${now.toISOString()}`);
    
    // First, let's see ALL scheduled posts
    const allScheduledPosts = await prisma.socialPost.findMany({
      where: {
        status: 'scheduled',
      },
      select: {
        id: true,
        scheduledFor: true,
        status: true,
        content: true,
      },
    });
    
    console.log(`[LINKEDIN] Total scheduled posts in database: ${allScheduledPosts.length}`);
    type SocialPostSelect = {
      id: string;
      scheduledFor: Date;
      status: string;
      content: string;
    };
    allScheduledPosts.forEach((post: SocialPostSelect) => {
      console.log(`[LINKEDIN] - Post ${post.id}: scheduledFor=${post.scheduledFor.toISOString()}, status=${post.status}, content=${post.content.substring(0, 50)}...`);
      const scheduledTime = new Date(post.scheduledFor).getTime();
      const nowTime = now.getTime();
      const diff = nowTime - scheduledTime;
      console.log(`[LINKEDIN]   Time difference: ${diff}ms (${Math.round(diff / 1000 / 60)} minutes)`);
    });
    
    // Find posts scheduled for now or in the past that haven't been published
    const postsToPublish = await prisma.socialPost.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now,
        },
      },
    });

    console.log(`[LINKEDIN] Found ${postsToPublish.length} post(s) due for publishing (scheduledFor <= ${now.toISOString()})`);
    
    if (postsToPublish.length > 0) {
      type SocialPostType = Awaited<ReturnType<typeof prisma.socialPost.findMany>>[0];
      postsToPublish.forEach((post: SocialPostType) => {
        console.log(`[LINKEDIN] Post ${post.id} is due - scheduled: ${post.scheduledFor.toISOString()}`);
      });
    } else {
      console.log(`[LINKEDIN] No posts found that are due. Checking why...`);
      type SocialPostSelect = {
        id: string;
        scheduledFor: Date;
        status: string;
        content: string;
      };
      allScheduledPosts.forEach((post: SocialPostSelect) => {
        const isPast = new Date(post.scheduledFor) <= now;
        console.log(`[LINKEDIN] - Post ${post.id}: ${post.scheduledFor.toISOString()} ${isPast ? '✓ IS DUE' : '✗ NOT YET DUE'}`);
      });
    }
    
    if (postsToPublish.length === 0) {
      console.log(`[LINKEDIN] No posts to publish`);
      return { 
        published: 0, 
        failed: 0,
        total: 0,
        message: 'No posts to publish' 
      };
    }

    type SocialPostFullType = Awaited<ReturnType<typeof prisma.socialPost.findMany>>[0];
    
    const results = await Promise.allSettled(
      postsToPublish.map(async (post: SocialPostFullType) => {
        console.log(`[LINKEDIN] Processing post ID: ${post.id}, scheduled for: ${post.scheduledFor.toISOString()}`);
        const platforms = JSON.parse(post.platforms || '[]') as string[];
        console.log(`[LINKEDIN] Post ${post.id} platforms: ${platforms.join(', ')}`);
        const publishedResults: Record<string, string> = {};
        const errors: string[] = [];

        // Get connections for each platform
        const connections = await prisma.socialConnection.findMany({
          where: {
            platform: { in: platforms },
            isActive: true,
          },
        });

        console.log(`[LINKEDIN] Found ${connections.length} active connection(s) for platforms: ${platforms.join(', ')}`);
        type SocialConnectionType = Awaited<ReturnType<typeof prisma.socialConnection.findMany>>[0];
        connections.forEach((conn: SocialConnectionType) => {
          console.log(`[LINKEDIN] Connection: platform=${conn.platform}, expiresAt=${conn.expiresAt?.toISOString() || 'N/A'}, isActive=${conn.isActive}`);
        });

        // Publish to each platform
        for (const platform of platforms) {
          console.log(`[LINKEDIN] Attempting to publish to ${platform} for post ${post.id}`);
          type SocialConnectionType = Awaited<ReturnType<typeof prisma.socialConnection.findMany>>[0];
          const connection = connections.find((c: SocialConnectionType) => c.platform === platform);
          
          if (!connection) {
            const errorMsg = `${platform}: No active connection`;
            console.error(`[LINKEDIN] ${errorMsg} for post ${post.id}`);
            errors.push(errorMsg);
            continue;
          }

          console.log(`[LINKEDIN] Found connection for ${platform}, checking token...`);
          
          // Parse mediaAssets from post
          let mediaAssets: Array<{ type: 'image' | 'video'; url: string }> | null = null;
          if (post.mediaAssets) {
            try {
              mediaAssets = JSON.parse(post.mediaAssets);
            } catch (e) {
              console.error(`[LINKEDIN] Error parsing mediaAssets for post ${post.id}:`, e);
            }
          }
          
          const result = await publishToPlatform(
            platform,
            post.content,
            connection.accessToken,
            connection,
            mediaAssets
          );

          if (result.success && result.postId) {
            console.log(`[LINKEDIN] ✓ Successfully published to ${platform} for post ${post.id}. Post ID: ${result.postId}`);
            publishedResults[platform] = new Date().toISOString();
            
            // Post comments after the main post if comments exist
            if (post.comments) {
              try {
                let commentsArray: string[] = [];
                try {
                  commentsArray = JSON.parse(post.comments);
                } catch (e) {
                  console.error(`[LINKEDIN] Error parsing comments for post ${post.id}:`, e);
                }
                
                if (commentsArray && commentsArray.length > 0) {
                  console.log(`[LINKEDIN] Posting ${commentsArray.length} comment(s) on ${platform} for post ${post.id}`);
                  
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
                        console.log(`[LINKEDIN] ✓ Comment ${i + 1}/${commentsArray.length} posted on LinkedIn`);
                      } else if (platform === 'twitter') {
                        await commentOnTwitterPost(validToken, result.postId, comment);
                        console.log(`[LINKEDIN] ✓ Comment ${i + 1}/${commentsArray.length} posted on Twitter`);
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
                        console.log(`[LINKEDIN] ✓ Comment ${i + 1}/${commentsArray.length} posted on Threads`);
                      } else if (platform === 'instagram') {
                        // Instagram uses page access token (same as for posting)
                        await commentOnInstagramPost(validToken, result.postId, comment);
                        console.log(`[LINKEDIN] ✓ Comment ${i + 1}/${commentsArray.length} posted on Instagram`);
                      } else {
                        console.log(`[LINKEDIN] Comment posting not yet implemented for ${platform}, skipping`);
                      }
                    } catch (commentError) {
                      const errorMsg = `Failed to post comment ${i + 1} on ${platform}: ${commentError instanceof Error ? commentError.message : 'Unknown error'}`;
                      console.error(`[LINKEDIN] ${errorMsg}`);
                      // Don't fail the whole post if a comment fails, just log it
                      errors.push(errorMsg);
                    }
                  }
                }
              } catch (commentError) {
                console.error(`[LINKEDIN] Error processing comments for ${platform}:`, commentError);
                // Don't fail the whole post if comments fail
              }
            }
          } else {
            const errorMsg = `${platform}: ${result.error || 'Unknown error - no postId returned'}`;
            console.error(`[LINKEDIN] ✗ Failed to publish to ${platform} for post ${post.id}: ${errorMsg}`);
            console.error(`[LINKEDIN] Result object:`, JSON.stringify(result, null, 2));
            errors.push(errorMsg);
          }
        }

        // Update post status
        const allSucceeded = errors.length === 0;
        const someSucceeded = Object.keys(publishedResults).length > 0;
        const finalStatus = allSucceeded ? 'published' : someSucceeded ? 'published' : 'failed';

        console.log(`[LINKEDIN] Updating post ${post.id} status to: ${finalStatus}, errors: ${errors.length}, successes: ${Object.keys(publishedResults).length}`);

        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: finalStatus,
            publishedAt: someSucceeded ? new Date() : null,
            publishedOn: JSON.stringify(publishedResults),
            errorMessage: errors.length > 0 ? errors.join('; ') : null,
          },
        });

        console.log(`[LINKEDIN] Post ${post.id} updated successfully`);
        return { postId: post.id, success: allSucceeded };
      })
    );

    type PromiseResult = PromiseSettledResult<{ postId: string; success: boolean }>;
    
    const successful = results.filter((r: PromiseResult) => r.status === 'fulfilled').length;
    const failed = results.filter((r: PromiseResult) => r.status === 'rejected').length;

    console.log(`[LINKEDIN] Publishing complete: ${successful} succeeded, ${failed} failed, ${postsToPublish.length} total`);

    // Log any rejected promises
    results.forEach((result: PromiseResult, index: number) => {
      if (result.status === 'rejected') {
        console.error(`[LINKEDIN] Post ${postsToPublish[index].id} was rejected:`, result.reason);
      }
    });

    return {
      published: successful,
      failed,
      total: postsToPublish.length,
    };
  } catch (error) {
    console.error('[LINKEDIN] Error publishing scheduled posts:', error);
    if (error instanceof Error) {
      console.error('[LINKEDIN] Error stack:', error.stack);
    }
    // Return error structure instead of throwing
    return {
      published: 0,
      failed: 0,
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get platform-specific character limits
 */
export function getCharacterLimit(platform: string): number {
  const limits: Record<string, number> = {
    linkedin: 3000,
    twitter: 280,
    instagram: 2200,
    threads: 500,
  };
  return limits[platform] || 1000;
}

/**
 * Validate content length for platform
 */
export function validateContent(content: string, platforms: string[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const platform of platforms) {
    const limit = getCharacterLimit(platform);
    if (content.length > limit) {
      errors.push(`${platform}: Content exceeds ${limit} characters`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
