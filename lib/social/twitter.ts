import 'server-only';
import crypto from 'crypto';

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate code challenge from verifier
 */
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Get Twitter OAuth authorization URL with PKCE
 * Returns both the URL and the code verifier (which should be stored temporarily)
 */
export function getTwitterAuthUrl(state?: string): { url: string; codeVerifier: string } {
  if (!TWITTER_CLIENT_ID) {
    throw new Error('Twitter OAuth not configured. Please set TWITTER_CLIENT_ID environment variable.');
  }

  const redirectUri = `${BASE_URL}/api/social/callback/twitter`;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  // Twitter API v2 requires these scopes for posting tweets and media
  // Note: Scope order matters for Twitter - they must be in this exact order
  // media.write is required for uploading images/videos
  const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access', 'media.write'];
  
  console.log('[TWITTER] Generating OAuth URL:', {
    redirectUri,
    clientId: TWITTER_CLIENT_ID?.substring(0, 10) + '...',
    scopes: scopes.join(' '),
    hasCodeVerifier: !!codeVerifier,
    codeChallengeLength: codeChallenge.length,
  });
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: state || 'twitter_oauth',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  console.log('[TWITTER] Generated auth URL (first 200 chars):', authUrl.substring(0, 200));

  return {
    url: authUrl,
    codeVerifier,
  };
}

/**
 * Exchange authorization code for access token using PKCE
 */
export async function getTwitterAccessToken(
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
}> {
  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    throw new Error('Twitter OAuth credentials not configured');
  }

  const redirectUri = `${BASE_URL}/api/social/callback/twitter`;
  
  // Twitter uses Basic Auth for client credentials
  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
  
  const params = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[TWITTER] Token exchange error:', error);
    throw new Error(`Failed to get Twitter access token: ${error}`);
  }

  return await response.json();
}

/**
 * Refresh Twitter access token
 */
export async function refreshTwitterToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}> {
  console.log(`[TWITTER] Attempting to refresh access token...`);
  
  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    console.error(`[TWITTER] OAuth credentials not configured`);
    throw new Error('Twitter OAuth credentials not configured');
  }

  const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
  
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    client_id: TWITTER_CLIENT_ID,
  });

  console.log(`[TWITTER] Sending token refresh request to Twitter...`);
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  });

  console.log(`[TWITTER] Token refresh response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error(`[TWITTER] Token refresh failed: ${error}`);
    throw new Error(`Failed to refresh Twitter token (${response.status}): ${error}`);
  }

  const tokenData = await response.json();
  console.log(`[TWITTER] Token refresh successful - expires_in: ${tokenData.expires_in} seconds`);
  return tokenData;
}

/**
 * Get Twitter user profile information
 */
export async function getTwitterProfile(accessToken: string): Promise<{
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}> {
  console.log(`[TWITTER] Fetching profile from Twitter API...`);
  const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(`[TWITTER] Profile API response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error(`[TWITTER] Profile API error: ${error}`);
    throw new Error(`Failed to get Twitter profile (${response.status}): ${error}`);
  }

  const data = await response.json();
  console.log(`[TWITTER] Profile fetched successfully:`, JSON.stringify(data, null, 2));
  
  if (!data.data || !data.data.id) {
    throw new Error('Twitter profile response missing user data');
  }
  
  return {
    id: data.data.id,
    name: data.data.name || '',
    username: data.data.username || '',
    profile_image_url: data.data.profile_image_url,
  };
}

/**
 * Upload media to Twitter using API v2 endpoint (supports OAuth 2.0)
 * Note: Twitter's v2 media upload endpoint supports OAuth 2.0 Bearer tokens with media.write scope
 * The v1.1 endpoints were deprecated on March 31, 2025
 */
export async function uploadTwitterMedia(
  accessToken: string, // OAuth 2.0 Bearer token with media.write scope
  mediaUrl: string,
  mediaType: 'image' | 'video' = 'image'
): Promise<string> {
  console.log(`[TWITTER] Starting media upload for URL: ${mediaUrl}, type: ${mediaType}`);
  
  // Convert relative URLs to absolute URLs
  let absoluteMediaUrl: string;
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    absoluteMediaUrl = mediaUrl;
  } else if (mediaUrl.startsWith('/')) {
    // Relative URL starting with / - prepend base URL
    absoluteMediaUrl = `${BASE_URL}${mediaUrl}`;
  } else {
    // Relative URL without leading / - treat as relative to base
    absoluteMediaUrl = `${BASE_URL}/${mediaUrl}`;
  }
  
  console.log(`[TWITTER] Resolved media URL: ${absoluteMediaUrl}`);
  
  // Download the media from the URL
  console.log(`[TWITTER] Downloading media from: ${absoluteMediaUrl}`);
  const mediaResponse = await fetch(absoluteMediaUrl);
  console.log(`[TWITTER] Media download response status: ${mediaResponse.status} ${mediaResponse.statusText}`);
  
  if (!mediaResponse.ok) {
    const errorMsg = `Failed to download media from ${mediaUrl} (${mediaResponse.status})`;
    console.error(`[TWITTER] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  const mediaBuffer = await mediaResponse.arrayBuffer();
  const contentType = mediaResponse.headers.get('content-type') || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4');
  const fileSize = mediaBuffer.byteLength;
  console.log(`[TWITTER] Media downloaded successfully, size: ${fileSize} bytes, type: ${contentType}`);

  // Check file size limits
  const maxImageSize = 5 * 1024 * 1024; // 5MB for images
  const maxVideoSize = 512 * 1024 * 1024; // 512MB for videos
  
  if (mediaType === 'image' && fileSize > maxImageSize) {
    throw new Error(`Image size (${fileSize} bytes) exceeds maximum allowed size (${maxImageSize} bytes)`);
  }
  if (mediaType === 'video' && fileSize > maxVideoSize) {
    throw new Error(`Video size (${fileSize} bytes) exceeds maximum allowed size (${maxVideoSize} bytes)`);
  }

  // Use Twitter API v2 chunked upload process (INIT/APPEND/FINALIZE)
  // This works with OAuth 2.0 Bearer tokens when media.write scope is included
  console.log(`[TWITTER] Starting chunked media upload using API v2...`);
  
  // Determine media category
  let mediaCategory: string;
  if (mediaType === 'video') {
    mediaCategory = 'amplify_video'; // For videos
  } else if (contentType.includes('gif')) {
    mediaCategory = 'tweet_gif';
  } else {
    mediaCategory = 'tweet_image'; // For regular images
  }

  // Step 1: Initialize upload with OAuth 2.0 (v2 API uses separate endpoints)
  console.log(`[TWITTER] Initializing media upload with OAuth 2.0...`);
  const initPayload = {
    media_type: contentType,
    media_category: mediaCategory,
    total_bytes: fileSize,
  };
  
  const initUrl = 'https://api.twitter.com/2/media/upload/initialize';
  const initResponse = await fetch(initUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(initPayload),
  });

  console.log(`[TWITTER] INIT response status: ${initResponse.status} ${initResponse.statusText}`);

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    console.error(`[TWITTER] Failed to initialize media upload: ${errorText}`);
    
    // 403 Forbidden usually means token is invalid, revoked, or missing permissions
    if (initResponse.status === 403) {
      let errorMessage = `Failed to initialize Twitter media upload (403 Forbidden): ${errorText}`;
      errorMessage += '\n\nThis usually means:';
      errorMessage += '\n1. Your access token has been revoked or expired';
      errorMessage += '\n2. Your app permissions have changed';
      errorMessage += '\n3. The token needs to be refreshed';
      errorMessage += '\n\nPlease disconnect and reconnect your Twitter account to get a new token.';
      throw new Error(errorMessage);
    }
    
    throw new Error(`Failed to initialize Twitter media upload (${initResponse.status}): ${errorText}`);
  }

  const initData = await initResponse.json();
  console.log(`[TWITTER] Initialize response:`, JSON.stringify(initData, null, 2));
  
  // Twitter v2 API returns media_id in data.id field
  const mediaId = initData.data?.id || initData.media_id || initData.media_id_string;
  console.log(`[TWITTER] Media upload initialized, media_id: ${mediaId}`);

  if (!mediaId) {
    console.error(`[TWITTER] ERROR: No media_id found in response. Full response:`, JSON.stringify(initData, null, 2));
    throw new Error('Twitter API did not return media_id in initialize response');
  }

  // Step 2: Upload media in chunks
  // For files < 5MB, we still need at least one APPEND call
  // Try v2 append endpoint first, fallback to v1.1 if needed
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const chunks = Math.ceil(fileSize / chunkSize);
  
  console.log(`[TWITTER] Uploading ${chunks} chunk(s) (file size: ${fileSize} bytes)...`);
  
  for (let segmentIndex = 0; segmentIndex < chunks; segmentIndex++) {
    const start = segmentIndex * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const chunk = mediaBuffer.slice(start, end);
    
    console.log(`[TWITTER] Uploading chunk ${segmentIndex + 1}/${chunks} (${chunk.byteLength} bytes)...`);
    
    // Create multipart form data for chunk
    // Note: media_id is in the URL path, so we don't include it in the body
    const boundary = `----TwitterChunk${Date.now()}-${segmentIndex}`;
    const CRLF = '\r\n';
    
    let bodyParts: string[] = [];
    bodyParts.push(`--${boundary}`);
    bodyParts.push(`Content-Disposition: form-data; name="segment_index"`);
    bodyParts.push('');
    bodyParts.push(segmentIndex.toString());
    
    bodyParts.push(`--${boundary}`);
    bodyParts.push(`Content-Disposition: form-data; name="media"; filename="chunk"`);
    bodyParts.push(`Content-Type: ${contentType}`);
    bodyParts.push('');
    
    const textParts = bodyParts.join(CRLF) + CRLF;
    const textBuffer = Buffer.from(textParts, 'utf-8');
    const chunkBuffer = Buffer.from(chunk);
    const endBoundary = Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf-8');
    const chunkBody = Buffer.concat([textBuffer, chunkBuffer, endBoundary]);
    
    // Use v2 append endpoint with media_id in URL path: /2/media/upload/{media_id}/append
    const appendUrl = `https://api.twitter.com/2/media/upload/${mediaId}/append`;
    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: chunkBody,
    });

    if (!appendResponse.ok) {
      const error = await appendResponse.text();
      console.error(`[TWITTER] Failed to append chunk ${segmentIndex + 1} to ${appendUrl}: ${error}`);
      console.error(`[TWITTER] Response status: ${appendResponse.status} ${appendResponse.statusText}`);
      
      // 403 Forbidden usually means token is invalid, revoked, or missing permissions
      if (appendResponse.status === 403) {
        let errorMessage = `Failed to append Twitter media chunk (403 Forbidden): ${error}`;
        errorMessage += '\n\nThis usually means:';
        errorMessage += '\n1. Your access token has been revoked or expired';
        errorMessage += '\n2. Your app permissions have changed';
        errorMessage += '\n3. The token needs to be refreshed';
        errorMessage += '\n\nPlease disconnect and reconnect your Twitter account to get a new token.';
        throw new Error(errorMessage);
      }
      
      throw new Error(`Failed to append Twitter media chunk ${segmentIndex + 1} (${appendResponse.status}): ${error}`);
    }
    
    console.log(`[TWITTER] Chunk ${segmentIndex + 1}/${chunks} uploaded successfully to ${appendUrl}`);
  }

  // Step 3: Finalize upload with OAuth 2.0 (v2 API uses /2/media/upload/{media_id}/finalize)
  console.log(`[TWITTER] Finalizing media upload...`);
  
  const finalizeUrl = `https://api.twitter.com/2/media/upload/${mediaId}/finalize`;
  const finalizeResponse = await fetch(finalizeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // Empty body, media_id is in URL
  });

  console.log(`[TWITTER] FINALIZE response status: ${finalizeResponse.status} ${finalizeResponse.statusText}`);

  if (!finalizeResponse.ok) {
    const error = await finalizeResponse.text();
    console.error(`[TWITTER] Failed to finalize media upload: ${error}`);
    
    // 403 Forbidden usually means token is invalid, revoked, or missing permissions
    if (finalizeResponse.status === 403) {
      let errorMessage = `Failed to finalize Twitter media upload (403 Forbidden): ${error}`;
      errorMessage += '\n\nThis usually means:';
      errorMessage += '\n1. Your access token has been revoked or expired';
      errorMessage += '\n2. Your app permissions have changed';
      errorMessage += '\n3. The token needs to be refreshed';
      errorMessage += '\n\nPlease disconnect and reconnect your Twitter account to get a new token.';
      throw new Error(errorMessage);
    }
    
    throw new Error(`Failed to finalize Twitter media upload (${finalizeResponse.status}): ${error}`);
  }

  const finalizeData = await finalizeResponse.json();
  console.log(`[TWITTER] Media upload finalized:`, JSON.stringify(finalizeData, null, 2));

  // For videos, check processing status
  if (mediaType === 'video' && finalizeData.processing_info) {
    console.log(`[TWITTER] Video is processing, checking status...`);
    const processingInfo = finalizeData.processing_info;
    let checkAfter = processingInfo.check_after_secs || 5;
    let state = processingInfo.state;
    
    // Poll until processing is complete
    while (state === 'in_progress' || state === 'pending') {
      console.log(`[TWITTER] Waiting ${checkAfter} seconds before checking status...`);
      await new Promise(resolve => setTimeout(resolve, checkAfter * 1000));
      
      // Check status using the status endpoint (v2 API)
      const statusUrl = `https://api.twitter.com/2/media/upload/status`;
      const statusResponse = await fetch(`${statusUrl}?media_id=${mediaId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        state = statusData.processing_info?.state;
        checkAfter = statusData.processing_info?.check_after_secs || 5;
        console.log(`[TWITTER] Video processing state: ${state}`);
        
        if (state === 'succeeded') {
          console.log(`[TWITTER] Video processing completed`);
          break;
        } else if (state === 'failed') {
          throw new Error(`Video processing failed: ${statusData.processing_info?.error?.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(`Failed to check video processing status (${statusResponse.status})`);
      }
    }
  }
  
  console.log(`[TWITTER] Media uploaded successfully, media_id: ${mediaId}`);
  return mediaId;
}

/**
 * Publish a tweet to Twitter
 */
export async function publishToTwitter(
  accessToken: string,
  content: string,
  mediaAssets?: Array<{ type: 'image' | 'video'; url: string }> | null
): Promise<{ postId: string }> {
  console.log(`[TWITTER] publishToTwitter called - content length: ${content.length}, media assets: ${mediaAssets?.length || 0}`);
  console.log(`[TWITTER] Access token prefix: ${accessToken.substring(0, 20)}...`);
  
  // Validate content length (Twitter limit is 280 characters)
  if (content.length > 280) {
    throw new Error(`Twitter content exceeds 280 characters (${content.length})`);
  }

  // Prepare tweet payload
  const tweetPayload: any = {
    text: content,
  };

  // Upload and attach media if provided
  if (mediaAssets && mediaAssets.length > 0) {
    console.log(`[TWITTER] Uploading ${mediaAssets.length} media asset(s)...`);
    const mediaIds: string[] = [];
    const errors: string[] = [];

    // Twitter supports up to 4 images or 1 video
    const images = mediaAssets.filter(a => a.type === 'image').slice(0, 4);
    const videos = mediaAssets.filter(a => a.type === 'video').slice(0, 1);

    if (videos.length > 0) {
      // Twitter only supports 1 video per tweet
      try {
        console.log(`[TWITTER] Uploading video from URL: ${videos[0].url}`);
        const mediaId = await uploadTwitterMedia(accessToken, videos[0].url, 'video');
        mediaIds.push(mediaId);
        console.log(`[TWITTER] Video uploaded successfully, media_id: ${mediaId}`);
      } catch (error) {
        const errorMsg = `Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[TWITTER] ${errorMsg}`);
        errors.push(errorMsg);
      }
    } else if (images.length > 0) {
      // Upload all images
      for (let i = 0; i < images.length; i++) {
        try {
          console.log(`[TWITTER] Uploading image ${i + 1}/${images.length} from URL: ${images[i].url}`);
          const mediaId = await uploadTwitterMedia(accessToken, images[i].url, 'image');
          mediaIds.push(mediaId);
          console.log(`[TWITTER] Image ${i + 1} uploaded successfully, media_id: ${mediaId}`);
        } catch (error) {
          const errorMsg = `Failed to upload image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`[TWITTER] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
    }

    if (mediaIds.length > 0) {
      console.log(`[TWITTER] Successfully uploaded ${mediaIds.length}/${mediaAssets.length} media assets`);
      tweetPayload.media = {
        media_ids: mediaIds,
      };
      
      if (errors.length > 0) {
        console.warn(`[TWITTER] Some media assets failed to upload: ${errors.join('; ')}`);
      }
    } else {
      console.error(`[TWITTER] All media assets failed to upload: ${errors.join('; ')}`);
      // Continue without media if all uploads failed
    }
  }

  console.log(`[TWITTER] Publishing tweet to Twitter API v2...`);
  console.log(`[TWITTER] Tweet payload: ${JSON.stringify(tweetPayload, null, 2)}`);

  // Publish the tweet using Twitter API v2
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetPayload),
  });

  console.log(`[TWITTER] Twitter API response status: ${response.status} ${response.statusText}`);
  console.log(`[TWITTER] Response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[TWITTER] Twitter API error response: ${errorText}`);
    
    // 403 Forbidden usually means token is invalid, revoked, or missing permissions
    if (response.status === 403) {
      let errorMessage = `Failed to publish to Twitter (403 Forbidden): ${errorText}`;
      errorMessage += '\n\nThis usually means:';
      errorMessage += '\n1. Your access token has been revoked or expired';
      errorMessage += '\n2. Your app permissions have changed';
      errorMessage += '\n3. The token needs to be refreshed';
      errorMessage += '\n\nPlease disconnect and reconnect your Twitter account to get a new token.';
      throw new Error(errorMessage);
    }
    
    throw new Error(`Failed to publish to Twitter (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log(`[TWITTER] Twitter API success response:`, JSON.stringify(data, null, 2));

  const tweetId = data.data?.id;
  if (!tweetId) {
    console.error(`[TWITTER] ERROR: No tweet ID found in response!`);
    throw new Error('Twitter API returned success but no tweet ID in response');
  }

  console.log(`[TWITTER] ✓ Tweet published successfully - Tweet ID: ${tweetId}`);
  return {
    postId: tweetId,
  };
}

/**
 * Post a comment/reply on a Twitter post
 */
export async function commentOnTwitterPost(
  accessToken: string,
  tweetId: string,
  commentText: string
): Promise<{ commentId: string }> {
  console.log(`[TWITTER] Posting comment/reply on tweet ${tweetId}, comment length: ${commentText.length}`);
  
  // Validate content length (Twitter limit is 280 characters)
  if (commentText.length > 280) {
    throw new Error(`Twitter comment exceeds 280 characters (${commentText.length})`);
  }

  // Twitter uses the same POST /2/tweets endpoint but with in_reply_to_tweet_id
  const replyPayload: any = {
    text: commentText,
    reply: {
      in_reply_to_tweet_id: tweetId,
    },
  };

  console.log(`[TWITTER] Posting reply to Twitter API v2...`);
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(replyPayload),
  });

  console.log(`[TWITTER] Reply API response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[TWITTER] Failed to post reply: ${errorText}`);
    
    // 403 Forbidden usually means token is invalid, revoked, or missing permissions
    if (response.status === 403) {
      let errorMessage = `Failed to post reply on Twitter (403 Forbidden): ${errorText}`;
      errorMessage += '\n\nThis usually means:';
      errorMessage += '\n1. Your access token has been revoked or expired';
      errorMessage += '\n2. Your app permissions have changed';
      errorMessage += '\n3. The token needs to be refreshed';
      errorMessage += '\n\nPlease disconnect and reconnect your Twitter account to get a new token.';
      throw new Error(errorMessage);
    }
    
    throw new Error(`Failed to post reply on Twitter (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log(`[TWITTER] Reply API success response:`, JSON.stringify(data, null, 2));

  const replyId = data.data?.id;
  if (!replyId) {
    console.error(`[TWITTER] ERROR: No reply ID found in response!`);
    throw new Error('Twitter API returned success but no reply ID in response');
  }

  console.log(`[TWITTER] ✓ Reply posted successfully - Reply ID: ${replyId}`);
  return {
    commentId: replyId,
  };
}

/**
 * Check if Twitter token is expired or about to expire
 */
export function isTwitterTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  // Consider token expired if it expires in less than 5 minutes
  return expiresAt.getTime() < Date.now() + 5 * 60 * 1000;
}
