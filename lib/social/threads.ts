import 'server-only';

// Threads API uses separate App ID and Secret (different from Facebook App ID/Secret)
// When creating a Meta app with Threads use case, there are 2 app IDs:
// 1. Facebook App ID (for Facebook/Instagram integration)
// 2. Threads App ID (for Threads API - use this one)
const THREADS_APP_ID = process.env.THREADS_APP_ID || process.env.FACEBOOK_APP_ID; // Fallback to Facebook App ID for backward compatibility
const THREADS_APP_SECRET = process.env.THREADS_APP_SECRET || process.env.FACEBOOK_APP_SECRET; // Fallback to Facebook App Secret for backward compatibility
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Normalize redirect URI to ensure it matches Facebook's requirements
 * - Removes trailing slashes
 * - Ensures proper protocol (https for production, http for localhost)
 * - Validates format
 */
function normalizeRedirectUri(baseUrl: string, path: string): string {
  // Remove trailing slashes from base URL
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slashes from path
  const cleanPath = normalizedPath.replace(/\/+$/, '');
  
  const redirectUri = `${normalizedBase}${cleanPath}`;
  
  // Validate it's a proper URL
  try {
    new URL(redirectUri);
  } catch (e) {
    throw new Error(`Invalid redirect URI format: ${redirectUri}. BASE_URL: ${baseUrl}`);
  }
  
  return redirectUri;
}

/**
 * Get Threads OAuth authorization URL
 * Threads API uses threads.net OAuth endpoints (separate from Facebook OAuth)
 */
export function getThreadsAuthUrl(state?: string): string {
  if (!THREADS_APP_ID) {
    throw new Error('Threads OAuth not configured. Please set THREADS_APP_ID environment variable (or FACEBOOK_APP_ID as fallback).');
  }

  // Normalize the redirect URI to ensure exact match with Threads app settings
  const redirectUri = normalizeRedirectUri(BASE_URL, '/api/social/callback/threads');
  
  // Threads API requires these permissions:
  // - threads_basic: Basic access to Threads account (required for all Threads API calls)
  // - threads_content_publish: Permission to publish content to Threads
  // - threads_manage_insights: Access to Threads profile and post insights/analytics
  // Note: Threads.net OAuth does NOT accept Facebook Page scopes (pages_read_engagement, pages_show_list)
  // We'll use the /me endpoint to get the Threads user ID directly
  const scopes = [
    'threads_basic',
    'threads_content_publish',
    'threads_manage_insights',
  ];
  
  // Normalize base URL for display (remove trailing slashes)
  const normalizedBaseUrl = BASE_URL.replace(/\/+$/, '');
  
  console.log('[THREADS] Generating OAuth URL:', {
    redirectUri,
    baseUrl: normalizedBaseUrl,
    appId: THREADS_APP_ID?.substring(0, 10) + '...',
    scopes: scopes.join(','),
  });
  
  // Log a helpful message about Threads configuration
  if (BASE_URL.includes('ngrok')) {
    const domain = normalizedBaseUrl.replace(/^https?:\/\//, '');
    console.log('[THREADS] ⚠️  Using ngrok URL. Make sure you have:');
    console.log('[THREADS]    1. Added App Domain:', domain);
    console.log('[THREADS]    2. Added Valid OAuth Redirect URI in Threads settings:', redirectUri);
    console.log('[THREADS]    3. Both must match EXACTLY (including https:// and no trailing slashes)');
  }
  
  // Threads API uses threads.net OAuth endpoint (not Facebook's)
  const params = new URLSearchParams({
    client_id: THREADS_APP_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    response_type: 'code',
    state: state || 'threads_oauth',
  });

  const authUrl = `https://threads.net/oauth/authorize?${params.toString()}`;
  console.log('[THREADS] Generated auth URL (first 200 chars):', authUrl.substring(0, 200));

  return authUrl;
}

/**
 * Exchange authorization code for access token
 * Threads API uses graph.threads.net endpoints (separate from Facebook Graph API)
 */
export async function getThreadsAccessToken(code: string): Promise<{
  access_token: string;
  expires_in?: number;
  token_type?: string;
}> {
  if (!THREADS_APP_ID || !THREADS_APP_SECRET) {
    throw new Error('Threads OAuth credentials not configured. Please set THREADS_APP_ID and THREADS_APP_SECRET (or FACEBOOK_APP_ID/FACEBOOK_APP_SECRET as fallback).');
  }

  // Use the same normalization function to ensure exact match
  const redirectUri = normalizeRedirectUri(BASE_URL, '/api/social/callback/threads');
  
  // Exchange code for short-lived access token using Threads API endpoint
  const params = new URLSearchParams({
    client_id: THREADS_APP_ID,
    client_secret: THREADS_APP_SECRET,
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code',
  });

  console.log('[THREADS] Exchanging authorization code for access token...');
  const response = await fetch(
    `https://graph.threads.net/oauth/access_token?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[THREADS] Token exchange error:', error);
    throw new Error(`Failed to get Threads access token: ${error}`);
  }

  const tokenData = await response.json();
  console.log('[THREADS] Short-lived token obtained, exchanging for long-lived token...');

  // Exchange short-lived token for long-lived token (60 days)
  // Threads API uses a different endpoint for token exchange
  const longLivedParams = new URLSearchParams({
    grant_type: 'th_exchange_token',
    client_secret: THREADS_APP_SECRET,
    access_token: tokenData.access_token,
  });

  const longLivedResponse = await fetch(
    `https://graph.threads.net/access_token?${longLivedParams.toString()}`,
    {
      method: 'GET',
    }
  );

  if (!longLivedResponse.ok) {
    const error = await longLivedResponse.text();
    console.error('[THREADS] Long-lived token exchange error:', error);
    // Fall back to short-lived token if long-lived exchange fails
    console.warn('[THREADS] Falling back to short-lived token');
    return tokenData;
  }

  const longLivedData = await longLivedResponse.json();
  console.log('[THREADS] Long-lived token obtained successfully');
  return longLivedData;
}

/**
 * Refresh Threads access token
 * Threads API uses graph.threads.net/access_token endpoint for refreshing
 */
export async function refreshThreadsToken(accessToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  console.log('[THREADS] Attempting to refresh access token...');
  
  if (!THREADS_APP_ID || !THREADS_APP_SECRET) {
    console.error('[THREADS] OAuth credentials not configured');
    throw new Error('Threads OAuth credentials not configured. Please set THREADS_APP_ID and THREADS_APP_SECRET.');
  }

  // Threads API uses th_exchange_token grant type for refreshing
  const params = new URLSearchParams({
    grant_type: 'th_exchange_token',
    client_secret: THREADS_APP_SECRET,
    access_token: accessToken,
  });

  console.log('[THREADS] Sending token refresh request to Threads API...');
  const response = await fetch(
    `https://graph.threads.net/access_token?${params.toString()}`,
    {
      method: 'GET',
    }
  );

  console.log('[THREADS] Token refresh response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[THREADS] Token refresh failed:', error);
    throw new Error(`Failed to refresh Threads token (${response.status}): ${error}`);
  }

  const tokenData = await response.json();
  console.log('[THREADS] Token refresh successful - expires_in:', tokenData.expires_in, 'seconds');
  return tokenData;
}

/**
 * Get Threads user profile information
 * Threads API uses graph.threads.net endpoints
 * Try to get additional fields to check account type
 */
export async function getThreadsUser(accessToken: string): Promise<{
  id: string;
  username?: string;
  [key: string]: any;
}> {
  console.log('[THREADS] Fetching Threads user profile...');
  // Try to get more fields to understand account type
  // Note: Threads API might not support all these fields, but we'll try
  const url = `https://graph.threads.net/v1.0/me?fields=id,username`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  console.log('[THREADS] Profile API response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[THREADS] Profile API error:', error);
    throw new Error(`Failed to get Threads user (${response.status}): ${error}`);
  }

  const user = await response.json();
  console.log('[THREADS] User profile fetched successfully:', user);
  
  // Verify the user ID is valid (should be numeric)
  if (!user.id || !/^\d+$/.test(String(user.id))) {
    throw new Error(`Invalid Threads user ID format: ${user.id}. Expected numeric string.`);
  }
  
  // Log a warning if this might be a personal account (not Business)
  // We can't definitively check this via API, but we can note it
  console.log('[THREADS] Note: For publishing, Threads account must be linked to Instagram Business/Creator account');
  
  return user;
}

/**
 * Verify Threads account can be accessed and is ready for publishing
 * This checks if we can query the account details
 */
export async function verifyThreadsAccount(
  accessToken: string,
  threadsAccountId: string
): Promise<boolean> {
  console.log('[THREADS] Verifying Threads account access...');
  try {
    // Try to get account details to verify access
    const url = `https://graph.threads.net/v1.0/${threadsAccountId}?fields=id,username`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[THREADS] Account verification failed:', error);
      return false;
    }

    const account = await response.json();
    console.log('[THREADS] Account verified successfully:', account);
    return true;
  } catch (error) {
    console.error('[THREADS] Account verification error:', error);
    return false;
  }
}

/**
 * Get Facebook user profile information (for Pages access)
 * Still need Facebook Graph API to access Pages/Instagram accounts
 */
export async function getFacebookUser(accessToken: string): Promise<{
  id: string;
  name?: string;
  email?: string;
  [key: string]: any;
}> {
  console.log('[THREADS] Fetching Facebook user profile for Pages access...');
  // Note: This might need a separate Facebook access token if Threads token doesn't work
  // For now, we'll try with the Threads token, but may need to adjust based on actual API behavior
  const url = `https://graph.facebook.com/v19.0/me?fields=id,name,email`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  console.log('[THREADS] Facebook Profile API response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[THREADS] Facebook Profile API error:', error);
    // Threads token might not work with Facebook Graph API - this is expected
    // We may need to use a different approach or get Facebook token separately
    throw new Error(`Failed to get Facebook user (${response.status}): ${error}`);
  }

  const user = await response.json();
  console.log('[THREADS] Facebook user profile fetched successfully');
  return user;
}

/**
 * Get user's Facebook Pages (Threads accounts are linked via Instagram accounts)
 * Threads accounts are linked to Instagram Business Accounts, which are linked to Facebook Pages
 * Returns pages with Instagram accounts, which we'll use to find Threads accounts
 */
export async function getFacebookPages(accessToken: string, userId?: string): Promise<Array<{
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username: string;
  };
}>> {
  console.log('[THREADS] Fetching Facebook Pages with Instagram accounts...');
  // Facebook Graph API: /me/accounts or /{user-id}/accounts endpoint
  // Get pages that the user manages with their access token
  // Requesting: id, name, access_token (page token), and instagram_business_account info
  // Threads accounts are linked to Instagram accounts, so we need Instagram accounts first
  const fields = 'id,name,access_token,instagram_business_account{id,username}';
  const endpoint = userId ? `https://graph.facebook.com/v19.0/${userId}/accounts` : `https://graph.facebook.com/v19.0/me/accounts`;
  const url = `${endpoint}?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`;
  console.log('[THREADS] Request URL (without token):', `${endpoint}?fields=${fields}&access_token=[REDACTED]`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('[THREADS] Pages API response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[THREADS] Pages API error:', errorText);
    let errorMessage = `Failed to get Facebook Pages (${response.status}): ${errorText}`;
    
    // Check for permission errors
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error) {
        const fbError = errorJson.error;
        if (fbError.code === 200 || fbError.message?.includes('permission')) {
          errorMessage = `Missing permissions to access Facebook Pages. Please ensure the 'pages_show_list' permission is granted. Error: ${fbError.message || errorText}`;
        }
      }
    } catch (e) {
      // Not JSON, use original error
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Enhanced logging for debugging
  console.log('[THREADS] Full API response:', JSON.stringify(data, null, 2));
  console.log('[THREADS] Response data type:', typeof data.data);
  console.log('[THREADS] Response has data array:', Array.isArray(data.data));
  
  // Check for error in response even if status is 200
  if (data.error) {
    console.error('[THREADS] API returned error in response body:', data.error);
    throw new Error(`Facebook Graph API error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  
  const pages = data.data || [];
  console.log('[THREADS] Found', pages.length, 'Facebook Page(s) total');
  
  // Log which pages have Instagram accounts (needed for Threads)
  pages.forEach((page: any) => {
    console.log(`[THREADS] - Page details:`, {
      id: page.id,
      name: page.name,
      hasAccessToken: !!page.access_token,
      hasInstagramAccount: !!page.instagram_business_account,
      instagramAccountId: page.instagram_business_account?.id,
      instagramUsername: page.instagram_business_account?.username,
    });
    
    if (page.instagram_business_account) {
      console.log(`[THREADS] ✓ Page "${page.name}" (${page.id}) has Instagram account: ${page.instagram_business_account.username}`);
    } else {
      console.log(`[THREADS] ✗ Page "${page.name}" (${page.id}) does NOT have an Instagram account linked`);
    }
  });
  
  // Return ALL pages (not filtered) - let the caller decide what to do
  return pages;
}

/**
 * Get a specific Facebook Page by ID with its access token
 * Returns page with Instagram account (needed to find Threads account)
 */
export async function getFacebookPageById(
  userAccessToken: string,
  pageId: string
): Promise<{
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username: string;
  };
} | null> {
  console.log('[THREADS] Fetching Facebook Page by ID:', pageId);
  
  const url = `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(userAccessToken)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[THREADS] Failed to get page by ID:', errorText);
      return null;
    }

    const pageData = await response.json();
    console.log('[THREADS] Page data retrieved:', { id: pageData.id, name: pageData.name, hasAccessToken: !!pageData.access_token, hasInstagram: !!pageData.instagram_business_account });
    
    return pageData;
  } catch (error) {
    console.error('[THREADS] Error getting page by ID:', error);
    return null;
  }
}

/**
 * Get Threads Business Account from Instagram Business Account
 * Threads accounts are linked to Instagram accounts
 */
export async function getThreadsAccountFromInstagram(
  pageAccessToken: string,
  instagramAccountId: string
): Promise<{
  id: string;
  username: string;
  [key: string]: any;
} | null> {
  console.log('[THREADS] Fetching Threads account from Instagram account:', instagramAccountId);
  
  // Query the Instagram account to get its associated Threads account
  // The threads_business_account field should be available on the Instagram account
  const url = `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=id,username,threads_business_account{id,username}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${pageAccessToken}`,
    },
  });

  console.log('[THREADS] Instagram account API response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[THREADS] Failed to get Instagram account with Threads info:', error);
    return null;
  }

  const instagramAccount = await response.json();
  
  if (instagramAccount.threads_business_account) {
    console.log('[THREADS] Threads account found:', instagramAccount.threads_business_account.username);
    return {
      id: instagramAccount.threads_business_account.id,
      username: instagramAccount.threads_business_account.username,
    };
  }
  
  console.log('[THREADS] No Threads account linked to this Instagram account');
  return null;
}

/**
 * Get Threads Business Account details directly (if we have the Threads account ID)
 */
export async function getThreadsAccount(
  pageAccessToken: string,
  threadsAccountId: string
): Promise<{
  id: string;
  username: string;
  [key: string]: any;
}> {
  console.log('[THREADS] Fetching Threads account details for:', threadsAccountId);
  const url = `https://graph.facebook.com/v19.0/${threadsAccountId}?fields=id,username`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${pageAccessToken}`,
    },
  });

  console.log('[THREADS] Threads account API response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[THREADS] Threads account API error:', error);
    throw new Error(`Failed to get Threads account (${response.status}): ${error}`);
  }

  const account = await response.json();
  console.log('[THREADS] Threads account fetched successfully:', account.username);
  return account;
}

/**
 * Publish a post to Threads
 * Threads API uses a two-step process:
 * 1. Create a media container (POST /{threads-user-id}/media)
 * 2. Publish the container (POST /{threads-user-id}/threads_publish)
 * Uses graph.threads.net endpoints with Threads user access token
 */
/**
 * Debug Threads access token to check permissions and account type
 */
async function debugThreadsToken(accessToken: string, accountId: string): Promise<void> {
  try {
    // Get user info
    const meUrl = `https://graph.threads.net/v1.0/me?fields=id,username&access_token=${accessToken}`;
    const meResponse = await fetch(meUrl, { method: 'GET' });
    
    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('[THREADS] Token debug - /me endpoint:', meData);
    }
    
    // Try to get account details by ID to check if it's accessible
    const accountUrl = `https://graph.threads.net/v1.0/${accountId}?fields=id,username&access_token=${accessToken}`;
    const accountResponse = await fetch(accountUrl, { method: 'GET' });
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log('[THREADS] Token debug - Account by ID:', accountData);
    } else {
      const accountError = await accountResponse.text();
      console.warn('[THREADS] Token debug - Cannot access account by ID:', accountError);
    }
    
    // Try a test media container creation with minimal data to check permissions
    // This will fail but give us more info about what's wrong
    const testUrl = `https://graph.threads.net/v1.0/${accountId}/media?media_type=TEXT&text=test&access_token=${accessToken}`;
    const testResponse = await fetch(testUrl, { method: 'POST' });
    
    if (!testResponse.ok) {
      const testError = await testResponse.text();
      console.log('[THREADS] Token debug - Test publish attempt error:', testError);
      
      // Parse error to provide helpful info
      try {
        const errorJson = JSON.parse(testError);
        if (errorJson.error) {
          console.log('[THREADS] Token debug - Error details:', {
            message: errorJson.error.message,
            code: errorJson.error.code,
            subcode: errorJson.error.error_subcode,
            type: errorJson.error.type,
          });
        }
      } catch (e) {
        // Not JSON, that's okay
      }
    }
  } catch (error) {
    console.warn('[THREADS] Token debug error:', error);
  }
}

export async function publishToThreads(
  threadsAccessToken: string,
  threadsAccountId: string,
  content: string,
  mediaAssets?: Array<{ type: 'image' | 'video'; url: string }> | null
): Promise<{ postId: string }> {
  console.log('[THREADS] publishToThreads called - content length:', content.length, 'media assets:', mediaAssets?.length || 0);
  console.log('[THREADS] Using Threads account ID:', threadsAccountId);
  
  // Validate Threads account ID format (should be numeric string)
  if (!threadsAccountId || !/^\d+$/.test(threadsAccountId)) {
    throw new Error(`Invalid Threads account ID format: ${threadsAccountId}. Expected numeric string.`);
  }
  
  // Debug token before attempting to publish
  await debugThreadsToken(threadsAccessToken, threadsAccountId);
  
  // Threads supports text-only posts or posts with media
  const assets = mediaAssets || [];
  const images = assets.filter(a => a.type === 'image');
  const videos = assets.filter(a => a.type === 'video');
  
  // Step 1: Create a media container
  // Threads API requires creating a media container first, even for text-only posts
  let creationId: string;
  
  if (images.length > 0 || videos.length > 0) {
    // Post with media
    const mediaUrl = images.length > 0 ? images[0].url : videos[0].url;
    const mediaType = images.length > 0 ? 'IMAGE' : 'VIDEO';
    
    // Convert relative URLs to absolute URLs
    let absoluteMediaUrl: string;
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      absoluteMediaUrl = mediaUrl;
    } else {
      const normalizedBase = BASE_URL.replace(/\/+$/, '');
      if (mediaUrl.startsWith('/')) {
        absoluteMediaUrl = `${normalizedBase}${mediaUrl}`;
      } else {
        absoluteMediaUrl = `${normalizedBase}/${mediaUrl}`;
      }
    }
    
    console.log('[THREADS] Creating media container for:', mediaType, absoluteMediaUrl);
    
    // Create media container with media
    const mediaParams = new URLSearchParams({
      media_type: mediaType,
      image_url: mediaType === 'IMAGE' ? absoluteMediaUrl : '',
      video_url: mediaType === 'VIDEO' ? absoluteMediaUrl : '',
      caption: content.substring(0, 500), // Threads text limit is 500 characters
    });
    
    const mediaResponse = await fetch(
      `https://graph.threads.net/v1.0/${threadsAccountId}/media?${mediaParams.toString()}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${threadsAccessToken}`,
        },
      }
    );
    
    if (!mediaResponse.ok) {
      const error = await mediaResponse.text();
      console.error('[THREADS] Failed to create media container:', error);
      throw new Error(`Failed to create Threads media container (${mediaResponse.status}): ${error}`);
    }
    
    const mediaData = await mediaResponse.json();
    creationId = mediaData.id;
    console.log('[THREADS] Media container created, creation_id:', creationId);
  } else {
    // Text-only post
    console.log('[THREADS] Creating text-only media container...');
    console.log('[THREADS] Using endpoint: https://graph.threads.net/v1.0/' + threadsAccountId + '/media');
    console.log('[THREADS] Account ID type check:', typeof threadsAccountId, 'Value:', threadsAccountId);
    
    const mediaParams = new URLSearchParams({
      media_type: 'TEXT',
      text: content.substring(0, 500), // Threads text limit is 500 characters
    });
    
    const mediaUrl = `https://graph.threads.net/v1.0/${threadsAccountId}/media?${mediaParams.toString()}`;
    console.log('[THREADS] Media container URL:', mediaUrl.replace(threadsAccessToken.substring(0, 20) + '...', 'TOKEN'));
    
    const mediaResponse = await fetch(mediaUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${threadsAccessToken}`,
      },
    });
    
    console.log('[THREADS] Media container response status:', mediaResponse.status, mediaResponse.statusText);
    
    if (!mediaResponse.ok) {
      const error = await mediaResponse.text();
      console.error('[THREADS] Failed to create text media container:', error);
      console.error('[THREADS] Account ID used:', threadsAccountId);
      console.error('[THREADS] Token preview:', threadsAccessToken.substring(0, 20) + '...');
      
      // Provide more helpful error message
      let errorMessage = `Failed to create Threads text media container (${mediaResponse.status}): ${error}`;
      if (error.includes('does not exist') || error.includes('cannot be loaded')) {
        errorMessage += `\n\nPossible causes:\n` +
          `1. The Threads account ID (${threadsAccountId}) might be incorrect\n` +
          `2. The access token might not have permission to publish to this account\n` +
          `3. The account might not be properly linked to Instagram\n` +
          `4. Try disconnecting and reconnecting your Threads account`;
      }
      throw new Error(errorMessage);
    }
    
    const mediaData = await mediaResponse.json();
    creationId = mediaData.id;
    console.log('[THREADS] Text media container created, creation_id:', creationId);
  }
  
  if (!creationId) {
    throw new Error('Threads API returned no creation_id from media container');
  }
  
  // Step 2: Publish the media container
  console.log('[THREADS] Publishing media container to Threads...');
  const publishParams = new URLSearchParams({
    creation_id: creationId,
  });
  
  const publishResponse = await fetch(
    `https://graph.threads.net/v1.0/${threadsAccountId}/threads_publish?${publishParams.toString()}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${threadsAccessToken}`,
      },
    }
  );

  console.log('[THREADS] Publish response status:', publishResponse.status, publishResponse.statusText);

  if (!publishResponse.ok) {
    const error = await publishResponse.text();
    console.error('[THREADS] Failed to publish post:', error);
    throw new Error(`Failed to publish Threads post (${publishResponse.status}): ${error}`);
  }

  const publishData = await publishResponse.json();
  const postId = publishData.id;

  if (!postId) {
    console.error('[THREADS] ERROR: No post ID found in response!');
    throw new Error('Threads API returned success but no post ID in response');
  }

  console.log('[THREADS] ✓ Post published successfully - Post ID:', postId);
  return {
    postId: postId,
  };
}

/**
 * Check if Threads token is expired or about to expire
 */
export function isThreadsTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  // Consider token expired if it expires in less than 7 days (tokens last 60 days)
  return expiresAt.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000;
}
