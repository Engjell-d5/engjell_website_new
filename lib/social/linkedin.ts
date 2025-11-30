import 'server-only';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Get LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(state?: string): string {
  const redirectUri = `${BASE_URL}/api/social/callback/linkedin`;
  const scopes = ['w_member_social', 'openid', 'profile', 'email'];
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID || '',
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: state || 'linkedin_oauth',
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getLinkedInAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}> {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    throw new Error('LinkedIn OAuth credentials not configured');
  }

  const redirectUri = `${BASE_URL}/api/social/callback/linkedin`;
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get LinkedIn access token: ${error}`);
  }

  return await response.json();
}

/**
 * Refresh LinkedIn access token
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  console.log(`[LINKEDIN] Attempting to refresh access token...`);
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    console.error(`[LINKEDIN] OAuth credentials not configured - CLIENT_ID: ${!!LINKEDIN_CLIENT_ID}, CLIENT_SECRET: ${!!LINKEDIN_CLIENT_SECRET}`);
    throw new Error('LinkedIn OAuth credentials not configured');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  });

  console.log(`[LINKEDIN] Sending token refresh request to LinkedIn...`);
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  console.log(`[LINKEDIN] Token refresh response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error(`[LINKEDIN] Token refresh failed: ${error}`);
    throw new Error(`Failed to refresh LinkedIn token (${response.status}): ${error}`);
  }

  const tokenData = await response.json();
  console.log(`[LINKEDIN] Token refresh successful - expires_in: ${tokenData.expires_in} seconds`);
  return tokenData;
}

/**
 * Get LinkedIn user profile information from /v2/userinfo (OpenID Connect)
 */
export async function getLinkedInProfile(accessToken: string): Promise<{
  id: string;
  sub?: string;
  firstName?: {
    localized: Record<string, string>;
    preferredLocale?: {
      country: string;
      language: string;
    };
  };
  lastName?: {
    localized: Record<string, string>;
  };
  profilePicture?: {
    displayImage: string;
  };
  emailAddress?: string;
  [key: string]: any;
}> {
  console.log(`[LINKEDIN] Fetching profile from LinkedIn API (/v2/userinfo)...`);
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(`[LINKEDIN] Profile API response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error(`[LINKEDIN] Profile API error: ${error}`);
    throw new Error(`Failed to get LinkedIn profile (${response.status}): ${error}`);
  }

  const profile = await response.json();
  console.log(`[LINKEDIN] Profile fetched successfully - Full profile:`, JSON.stringify(profile, null, 2));
  
  // LinkedIn OpenID Connect returns 'sub' (subject) as the user ID
  const userId = profile.sub || profile.id;
  console.log(`[LINKEDIN] Extracted user ID: ${userId} (from sub: ${profile.sub}, id: ${profile.id})`);
  
  if (!userId) {
    console.error(`[LINKEDIN] ERROR: No user ID found in profile response!`);
    throw new Error('LinkedIn profile response missing user ID (sub or id field)');
  }
  
  // Return profile with normalized ID
  return {
    ...profile,
    id: userId, // Ensure id field is always present
  };
}

/**
 * Get LinkedIn member ID from /v2/me endpoint (for UGC posts)
 * This endpoint returns the ID that should be used in urn:li:person:{id} format
 */
export async function getLinkedInMemberId(accessToken: string): Promise<string> {
  console.log(`[LINKEDIN] Fetching member ID from /v2/me endpoint...`);
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(`[LINKEDIN] /v2/me API response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.text();
    console.error(`[LINKEDIN] /v2/me API error: ${error}`);
    throw new Error(`Failed to get LinkedIn member ID (${response.status}): ${error}`);
  }

  const data = await response.json();
  console.log(`[LINKEDIN] /v2/me response:`, JSON.stringify(data, null, 2));
  
  // The /v2/me endpoint returns an 'id' field which is the member ID
  const memberId = data.id;
  if (!memberId) {
    console.error(`[LINKEDIN] ERROR: No member ID found in /v2/me response!`);
    throw new Error('LinkedIn /v2/me response missing member ID');
  }
  
  console.log(`[LINKEDIN] Member ID extracted: ${memberId}`);
  return memberId;
}

/**
 * Get user's LinkedIn profile URN for posting
 */
export async function getLinkedInPersonUrn(accessToken: string): Promise<string> {
  console.log(`[LINKEDIN] Getting LinkedIn person URN for posting...`);
  
  try {
    // Try to get member ID from /v2/me endpoint first (preferred for UGC posts)
    const memberId = await getLinkedInMemberId(accessToken);
    
    // For UGC posts, LinkedIn requires urn:li:person:{id} format
    // The ID from /v2/me is the correct format
    const urn = `urn:li:person:${memberId}`;
    console.log(`[LINKEDIN] Person URN generated from /v2/me: ${urn}`);
    return urn;
  } catch (meError) {
    console.warn(`[LINKEDIN] Failed to get member ID from /v2/me, falling back to /v2/userinfo:`, meError);
    
    // Fallback to OpenID Connect endpoint
    const profile = await getLinkedInProfile(accessToken);
    const userId = profile.id || profile.sub;
    
    if (!userId) {
      console.error(`[LINKEDIN] ERROR: No user ID found in profile!`);
      throw new Error('LinkedIn profile missing user ID');
    }
    
    console.log(`[LINKEDIN] Using user ID from /v2/userinfo: ${userId}`);
    
    // Try person format first (most common)
    const urn = `urn:li:person:${userId}`;
    console.log(`[LINKEDIN] Person URN generated from /v2/userinfo: ${urn}`);
    return urn;
  }
}

/**
 * Upload a video to LinkedIn
 * Returns the video asset URN
 */
export async function uploadLinkedInVideo(
  accessToken: string,
  videoUrl: string,
  personUrn: string
): Promise<string> {
  console.log(`[LINKEDIN] Starting video upload process for URL: ${videoUrl}`);
  
  // Register the video upload
  console.log(`[LINKEDIN] Registering video upload with LinkedIn...`);
  const registerResponse = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
          owner: personUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    }
  );

  console.log(`[LINKEDIN] Video registration response status: ${registerResponse.status} ${registerResponse.statusText}`);

  if (!registerResponse.ok) {
    const error = await registerResponse.text();
    console.error(`[LINKEDIN] Failed to register video upload: ${error}`);
    throw new Error(`Failed to register LinkedIn video upload (${registerResponse.status}): ${error}`);
  }

  const registerData = await registerResponse.json();
  console.log(`[LINKEDIN] Video registration successful, asset URN: ${registerData.value.asset}`);

  // Download the video from the URL
  console.log(`[LINKEDIN] Downloading video from: ${videoUrl}`);
  const videoResponse = await fetch(videoUrl);
  console.log(`[LINKEDIN] Video download response status: ${videoResponse.status} ${videoResponse.statusText}`);
  
  if (!videoResponse.ok) {
    const errorMsg = `Failed to download video from ${videoUrl} (${videoResponse.status})`;
    console.error(`[LINKEDIN] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  const videoBuffer = await videoResponse.arrayBuffer();
  console.log(`[LINKEDIN] Video downloaded successfully, size: ${videoBuffer.byteLength} bytes`);

  // Upload the video to LinkedIn's upload URL
  const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
    .uploadUrl;
  const uploadHeaders = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
    .headers;

  console.log(`[LINKEDIN] Uploading video to LinkedIn at: ${uploadUrl}`);

  const uploadHeadersObj: Record<string, string> = {};
  if (uploadHeaders) {
    Object.entries(uploadHeaders).forEach(([key, value]) => {
      uploadHeadersObj[key] = String(value);
    });
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      ...uploadHeadersObj,
      'Content-Type': videoResponse.headers.get('content-type') || 'video/mp4',
    },
    body: videoBuffer,
  });

  console.log(`[LINKEDIN] Video upload response status: ${uploadResponse.status} ${uploadResponse.statusText}`);

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error(`[LINKEDIN] Failed to upload video to LinkedIn: ${error}`);
    throw new Error(`Failed to upload video to LinkedIn (${uploadResponse.status}): ${error}`);
  }

  console.log(`[LINKEDIN] Video uploaded successfully, asset URN: ${registerData.value.asset}`);
  return registerData.value.asset;
}

/**
 * Upload an image to LinkedIn
 * Returns the image asset URN
 */
export async function uploadLinkedInImage(
  accessToken: string,
  imageUrl: string,
  personUrn: string
): Promise<string> {
  console.log(`[LINKEDIN] Starting image upload process for URL: ${imageUrl}`);
  
  // First, register the image
  console.log(`[LINKEDIN] Registering image upload with LinkedIn...`);
  const registerResponse = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: personUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    }
  );

  console.log(`[LINKEDIN] Image registration response status: ${registerResponse.status} ${registerResponse.statusText}`);

  if (!registerResponse.ok) {
    const error = await registerResponse.text();
    console.error(`[LINKEDIN] Failed to register image upload: ${error}`);
    throw new Error(`Failed to register LinkedIn image upload (${registerResponse.status}): ${error}`);
  }

  const registerData = await registerResponse.json();
  console.log(`[LINKEDIN] Image registration successful, asset URN: ${registerData.value.asset}`);

  // Download the image from the URL
  console.log(`[LINKEDIN] Downloading image from: ${imageUrl}`);
  const imageResponse = await fetch(imageUrl);
  console.log(`[LINKEDIN] Image download response status: ${imageResponse.status} ${imageResponse.statusText}`);
  
  if (!imageResponse.ok) {
    const errorMsg = `Failed to download image from ${imageUrl} (${imageResponse.status})`;
    console.error(`[LINKEDIN] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  const imageBuffer = await imageResponse.arrayBuffer();
  console.log(`[LINKEDIN] Image downloaded successfully, size: ${imageBuffer.byteLength} bytes`);

  // Upload the image to LinkedIn's upload URL
  const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
    .uploadUrl;
  const uploadHeaders = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
    .headers;

  console.log(`[LINKEDIN] Uploading image to LinkedIn at: ${uploadUrl}`);

  // Convert headers object to Headers instance if needed
  const uploadHeadersObj: Record<string, string> = {};
  if (uploadHeaders) {
    Object.entries(uploadHeaders).forEach(([key, value]) => {
      uploadHeadersObj[key] = String(value);
    });
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      ...uploadHeadersObj,
      'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
    },
    body: imageBuffer,
  });

  console.log(`[LINKEDIN] Image upload response status: ${uploadResponse.status} ${uploadResponse.statusText}`);

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error(`[LINKEDIN] Failed to upload image to LinkedIn: ${error}`);
    throw new Error(`Failed to upload image to LinkedIn (${uploadResponse.status}): ${error}`);
  }

  console.log(`[LINKEDIN] Image uploaded successfully, asset URN: ${registerData.value.asset}`);
  return registerData.value.asset;
}

/**
 * Publish a post to LinkedIn with multiple media assets
 */
export async function publishToLinkedIn(
  accessToken: string,
  content: string,
  mediaAssets?: Array<{ type: 'image' | 'video'; url: string }> | null
): Promise<{ postId: string; urn: string }> {
  const assets = mediaAssets || [];

  console.log(`[LINKEDIN] publishToLinkedIn called - content length: ${content.length}, media assets: ${assets.length}`);
  console.log(`[LINKEDIN] Access token prefix: ${accessToken.substring(0, 20)}...`);
  
  // Get person URN
  console.log(`[LINKEDIN] Fetching person URN...`);
  const personUrn = await getLinkedInPersonUrn(accessToken);
  console.log(`[LINKEDIN] Person URN: ${personUrn}`);

  // Determine media category
  const images = assets.filter(a => a.type === 'image');
  const videos = assets.filter(a => a.type === 'video');
  const hasImages = images.length > 0;
  const hasVideos = videos.length > 0;
  
  // LinkedIn allows either images OR videos, not both mixed
  let shareMediaCategory: 'IMAGE' | 'VIDEO' | 'NONE' = 'NONE';
  if (hasVideos) {
    shareMediaCategory = 'VIDEO';
  } else if (hasImages) {
    shareMediaCategory = 'IMAGE';
  }

  // Prepare the post content
  const postContent: any = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory,
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  // Upload and attach media assets
  if (assets.length > 0) {
    console.log(`[LINKEDIN] Uploading ${assets.length} media asset(s)...`);
    const mediaArray: Array<{ status: string; media: string; description?: { text: string } }> = [];
    const errors: string[] = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      try {
        let assetUrn: string;
        
        if (asset.type === 'video') {
          console.log(`[LINKEDIN] Uploading video ${i + 1}/${assets.length} from URL: ${asset.url}`);
          assetUrn = await uploadLinkedInVideo(accessToken, asset.url, personUrn);
          console.log(`[LINKEDIN] Video ${i + 1} uploaded successfully, asset URN: ${assetUrn}`);
        } else {
          console.log(`[LINKEDIN] Uploading image ${i + 1}/${assets.length} from URL: ${asset.url}`);
          assetUrn = await uploadLinkedInImage(accessToken, asset.url, personUrn);
          console.log(`[LINKEDIN] Image ${i + 1} uploaded successfully, asset URN: ${assetUrn}`);
        }

        mediaArray.push({
          status: 'READY',
          media: assetUrn,
        });
      } catch (error) {
        const errorMsg = `Failed to upload ${asset.type} ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[LINKEDIN] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    if (mediaArray.length > 0) {
      console.log(`[LINKEDIN] Successfully uploaded ${mediaArray.length}/${assets.length} media assets`);
      postContent.specificContent['com.linkedin.ugc.ShareContent'].media = mediaArray;
      
      if (errors.length > 0) {
        console.warn(`[LINKEDIN] Some media assets failed to upload: ${errors.join('; ')}`);
      }
    } else {
      console.error(`[LINKEDIN] All media assets failed to upload: ${errors.join('; ')}`);
      // Continue without media if all uploads failed
      postContent.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE';
    }
  }

  console.log(`[LINKEDIN] Publishing post to LinkedIn API...`);
  console.log(`[LINKEDIN] Post content preview: ${JSON.stringify(postContent, null, 2).substring(0, 500)}...`);

  // Publish the post
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postContent),
  });

  console.log(`[LINKEDIN] LinkedIn API response status: ${response.status} ${response.statusText}`);
  console.log(`[LINKEDIN] Response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[LINKEDIN] LinkedIn API error response: ${errorText}`);
    throw new Error(`Failed to publish to LinkedIn (${response.status}): ${errorText}`);
  }

  let data: any = {};
  try {
    const responseText = await response.text();
    console.log(`[LINKEDIN] LinkedIn API response body (raw): ${responseText}`);
    
    if (responseText && responseText.trim() !== '') {
      data = JSON.parse(responseText);
      console.log(`[LINKEDIN] LinkedIn API success response (parsed):`, JSON.stringify(data, null, 2));
    } else {
      console.log(`[LINKEDIN] LinkedIn API returned empty response body`);
    }
  } catch (parseError) {
    console.error(`[LINKEDIN] Error parsing LinkedIn API response:`, parseError);
    throw new Error(`Failed to parse LinkedIn API response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
  
  // LinkedIn returns the URN in the Location header or in the response
  const location = response.headers.get('Location') || '';
  const locationUrn = location ? location.split('/').pop() || location : '';
  const responseId = data?.id || data?.value?.id || '';
  const urn = locationUrn || responseId || '';

  console.log(`[LINKEDIN] Extracted values - Location header: "${location}", Location URN: "${locationUrn}", Response ID: "${responseId}", Final URN: "${urn}"`);

  if (!urn || urn.trim() === '') {
    console.error(`[LINKEDIN] ERROR: No URN or post ID found in response!`);
    console.error(`[LINKEDIN] Full response details:`);
    console.error(`[LINKEDIN] - Status: ${response.status}`);
    console.error(`[LINKEDIN] - Headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.error(`[LINKEDIN] - Body:`, JSON.stringify(data, null, 2));
    throw new Error('LinkedIn API returned success but no post ID or URN in response');
  }

  const finalUrn = urn.startsWith('urn:li:') ? urn : `urn:li:ugcPost:${urn}`;
  console.log(`[LINKEDIN] ✓ Post published successfully - Final URN: ${finalUrn}`);

  return {
    postId: urn,
    urn: finalUrn,
  };
}

/**
 * Check if LinkedIn token is expired or about to expire
 */
export function isLinkedInTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  // Consider token expired if it expires in less than 5 minutes
  return expiresAt.getTime() < Date.now() + 5 * 60 * 1000;
}
