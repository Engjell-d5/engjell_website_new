import 'server-only';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Get Instagram/Facebook OAuth authorization URL
 * Instagram uses Facebook OAuth
 */
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

export function getInstagramAuthUrl(state?: string): string {
  if (!FACEBOOK_APP_ID) {
    throw new Error('Instagram OAuth not configured. Please set FACEBOOK_APP_ID environment variable.');
  }

  // Normalize the redirect URI to ensure exact match with Facebook settings
  const redirectUri = normalizeRedirectUri(BASE_URL, '/api/social/callback/instagram');
  
  // Instagram Graph API requires these permissions:
  // - instagram_basic: Basic access to Instagram account
  // - instagram_content_publish: Permission to publish content
  // - pages_read_engagement: Read access to Facebook Page (required since Instagram must be linked to a Page)
  // - pages_show_list: List Facebook Pages (to select the connected Instagram account)
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_read_engagement',
    'pages_show_list',
  ];
  
  // Normalize base URL for display (remove trailing slashes)
  const normalizedBaseUrl = BASE_URL.replace(/\/+$/, '');
  
  console.log('[INSTAGRAM] Generating OAuth URL:', {
    redirectUri,
    baseUrl: normalizedBaseUrl,
    appId: FACEBOOK_APP_ID?.substring(0, 10) + '...',
    scopes: scopes.join(','),
  });
  
  // Log a helpful message about Facebook configuration
  if (BASE_URL.includes('ngrok')) {
    const domain = normalizedBaseUrl.replace(/^https?:\/\//, '');
    console.log('[INSTAGRAM] ⚠️  Using ngrok URL. Make sure you have:');
    console.log('[INSTAGRAM]    1. Added App Domain:', domain);
    console.log('[INSTAGRAM]    2. Added Valid OAuth Redirect URI in Facebook Login settings:', redirectUri);
    console.log('[INSTAGRAM]    3. Both must match EXACTLY (including https:// and no trailing slashes)');
  }
  
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(','),
    response_type: 'code',
    state: state || 'instagram_oauth',
  });

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  console.log('[INSTAGRAM] Generated auth URL (first 200 chars):', authUrl.substring(0, 200));

  return authUrl;
}

/**
 * Exchange authorization code for access token
 * Returns both user access token and long-lived token info
 */
export async function getInstagramAccessToken(code: string): Promise<{
  access_token: string;
  expires_in?: number;
  token_type?: string;
}> {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new Error('Instagram OAuth credentials not configured');
  }

  // Use the same normalization function to ensure exact match
  const redirectUri = normalizeRedirectUri(BASE_URL, '/api/social/callback/instagram');
  
  // First, exchange code for short-lived access token
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[INSTAGRAM] Token exchange error:', error);
    throw new Error(`Failed to get Instagram access token: ${error}`);
  }

  const tokenData = await response.json();
  console.log('[INSTAGRAM] Short-lived token obtained, exchanging for long-lived token...');

  // Exchange short-lived token for long-lived token (60 days)
  const longLivedParams = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    fb_exchange_token: tokenData.access_token,
  });

  const longLivedResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${longLivedParams.toString()}`,
    {
      method: 'GET',
    }
  );

  if (!longLivedResponse.ok) {
    const error = await longLivedResponse.text();
    console.error('[INSTAGRAM] Long-lived token exchange error:', error);
    // Fall back to short-lived token if long-lived exchange fails
    console.warn('[INSTAGRAM] Falling back to short-lived token');
    return tokenData;
  }

  const longLivedData = await longLivedResponse.json();
  console.log('[INSTAGRAM] Long-lived token obtained successfully');
  return longLivedData;
}

/**
 * Refresh Instagram access token (Facebook tokens can be refreshed)
 */
export async function refreshInstagramToken(accessToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  console.log('[INSTAGRAM] Attempting to refresh access token...');
  
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    console.error('[INSTAGRAM] OAuth credentials not configured');
    throw new Error('Instagram OAuth credentials not configured');
  }

  // Exchange current token for a new long-lived token
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    fb_exchange_token: accessToken,
  });

  console.log('[INSTAGRAM] Sending token refresh request to Facebook...');
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`,
    {
      method: 'GET',
    }
  );

  console.log('[INSTAGRAM] Token refresh response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[INSTAGRAM] Token refresh failed:', error);
    throw new Error(`Failed to refresh Instagram token (${response.status}): ${error}`);
  }

  const tokenData = await response.json();
  console.log('[INSTAGRAM] Token refresh successful - expires_in:', tokenData.expires_in, 'seconds');
  return tokenData;
}

/**
 * Get Facebook user profile information
 */
export async function getFacebookUser(accessToken: string): Promise<{
  id: string;
  name?: string;
  email?: string;
  [key: string]: any;
}> {
  console.log('[INSTAGRAM] Fetching Facebook user profile...');
  const url = `https://graph.facebook.com/v19.0/me?fields=id,name,email`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  console.log('[INSTAGRAM] Profile API response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[INSTAGRAM] Profile API error:', error);
    throw new Error(`Failed to get Facebook user (${response.status}): ${error}`);
  }

  const user = await response.json();
  console.log('[INSTAGRAM] User profile fetched successfully');
  return user;
}

/**
 * Get user's Facebook Pages (Instagram accounts are linked to Pages)
 * Returns ALL pages, not just those with Instagram accounts
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
  console.log('[INSTAGRAM] Fetching Facebook Pages...');
  // Facebook Graph API: /me/accounts or /{user-id}/accounts endpoint
  // Get pages that the user manages with their access token
  // Requesting: id, name, access_token (page token), and instagram_business_account info
  // Note: Using access token in both header (recommended) and query param (some APIs require it)
  const fields = 'id,name,access_token,instagram_business_account{id,username}';
  const endpoint = userId ? `https://graph.facebook.com/v19.0/${userId}/accounts` : `https://graph.facebook.com/v19.0/me/accounts`;
  const url = `${endpoint}?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`;
  console.log('[INSTAGRAM] Request URL (without token):', `${endpoint}?fields=${fields}&access_token=[REDACTED]`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('[INSTAGRAM] Pages API response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[INSTAGRAM] Pages API error:', errorText);
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
  console.log('[INSTAGRAM] Full API response:', JSON.stringify(data, null, 2));
  console.log('[INSTAGRAM] Response data type:', typeof data.data);
  console.log('[INSTAGRAM] Response has data array:', Array.isArray(data.data));
  
  // Check for error in response even if status is 200
  if (data.error) {
    console.error('[INSTAGRAM] API returned error in response body:', data.error);
    throw new Error(`Facebook Graph API error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  
  const pages = data.data || [];
  console.log('[INSTAGRAM] Found', pages.length, 'Facebook Page(s) total');
  
  // If empty, try a simpler query as fallback
  if (pages.length === 0) {
    console.warn('[INSTAGRAM] No pages returned, trying simpler query...');
    const simpleUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${encodeURIComponent(accessToken)}`;
    try {
      const simpleResponse = await fetch(simpleUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.json();
        console.log('[INSTAGRAM] Simple query response:', JSON.stringify(simpleData, null, 2));
        if (simpleData.data && simpleData.data.length > 0) {
          console.log('[INSTAGRAM] Simple query found', simpleData.data.length, 'pages - the issue may be with the fields parameter');
        }
      }
    } catch (e) {
      console.error('[INSTAGRAM] Fallback query failed:', e);
    }
  }
  
  // Log which pages have Instagram accounts
  pages.forEach((page: any) => {
    console.log(`[INSTAGRAM] - Page details:`, {
      id: page.id,
      name: page.name,
      hasAccessToken: !!page.access_token,
      hasInstagramAccount: !!page.instagram_business_account,
      instagramAccountId: page.instagram_business_account?.id,
      instagramUsername: page.instagram_business_account?.username,
    });
    
    if (page.instagram_business_account) {
      console.log(`[INSTAGRAM] ✓ Page "${page.name}" (${page.id}) has Instagram account: ${page.instagram_business_account.username}`);
    } else {
      console.log(`[INSTAGRAM] ✗ Page "${page.name}" (${page.id}) does NOT have an Instagram account linked`);
    }
  });
  
  // Return ALL pages (not filtered) - let the caller decide what to do
  return pages;
}

/**
 * Get a specific Facebook Page by ID with its access token
 * This is used when we have the Page ID from granular_scopes
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
  console.log('[INSTAGRAM] Fetching Facebook Page by ID:', pageId);
  
  // First, get a page access token for this specific page
  // We need to use /me/accounts to get the page access token
  // But since /me/accounts returns empty, we'll try to get page info directly
  // and request the access_token field
  
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
      console.error('[INSTAGRAM] Failed to get page by ID:', errorText);
      
      // If direct query fails, try using /{page-id}?fields=access_token first
      // Then use that token to get page info
      const tokenUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${encodeURIComponent(userAccessToken)}`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userAccessToken}`,
        },
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.access_token) {
          // Now get full page info with the page access token
          const pageUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(tokenData.access_token)}`;
          const pageResponse = await fetch(pageUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
          });
          
          if (pageResponse.ok) {
            const pageData = await pageResponse.json();
            return {
              ...pageData,
              access_token: tokenData.access_token,
            };
          }
        }
      }
      
      return null;
    }

    const pageData = await response.json();
    console.log('[INSTAGRAM] Page data retrieved:', { id: pageData.id, name: pageData.name, hasAccessToken: !!pageData.access_token });
    
    // If we don't have access_token in the response, we need to get it differently
    // For granular permissions, we can try to get page access token by querying the page with proper permissions
    if (!pageData.access_token) {
      console.warn('[INSTAGRAM] Page data missing access_token, trying alternative method...');
      
      // Try querying just the access_token field for this specific page
      const tokenUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${encodeURIComponent(userAccessToken)}`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userAccessToken}`,
        },
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.access_token) {
          console.log('[INSTAGRAM] Successfully retrieved page access token');
          pageData.access_token = tokenData.access_token;
        } else {
          console.warn('[INSTAGRAM] Token query returned no access_token field');
        }
      } else {
        const tokenError = await tokenResponse.text();
        console.warn('[INSTAGRAM] Failed to get page access token:', tokenError);
      }
    }
    
    return pageData;
  } catch (error) {
    console.error('[INSTAGRAM] Error getting page by ID:', error);
    return null;
  }
}

/**
 * Get Instagram Business Account details
 */
export async function getInstagramAccount(
  pageAccessToken: string,
  instagramAccountId: string
): Promise<{
  id: string;
  username: string;
  [key: string]: any;
}> {
  console.log('[INSTAGRAM] Fetching Instagram account details for:', instagramAccountId);
  // Only request fields that exist on IGUser node type
  const url = `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=id,username`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${pageAccessToken}`,
    },
  });

  console.log('[INSTAGRAM] Instagram account API response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[INSTAGRAM] Instagram account API error:', error);
    throw new Error(`Failed to get Instagram account (${response.status}): ${error}`);
  }

  const account = await response.json();
  console.log('[INSTAGRAM] Instagram account fetched successfully:', account.username);
  return account;
}

/**
 * Get Instagram Business Account ID from a page access token
 * This retrieves the Instagram account associated with the Facebook Page
 */
export async function getInstagramAccountIdFromPageToken(
  pageAccessToken: string,
  pageId: string
): Promise<string> {
  console.log('[INSTAGRAM] Getting Instagram account ID from page:', pageId);
  const url = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account{id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${pageAccessToken}`,
    },
  });

  console.log('[INSTAGRAM] Page API response status:', response.status, response.statusText);

  if (!response.ok) {
    const error = await response.text();
    console.error('[INSTAGRAM] Failed to get page:', error);
    throw new Error(`Failed to get Facebook Page (${response.status}): ${error}`);
  }

  const page = await response.json();
  const instagramAccountId = page.instagram_business_account?.id;

  if (!instagramAccountId) {
    throw new Error('Facebook Page does not have an associated Instagram Business account');
  }

  console.log('[INSTAGRAM] Instagram account ID retrieved:', instagramAccountId);
  return instagramAccountId;
}

/**
 * Get Instagram Business Account ID and Page ID from page access token
 * This is useful when we only have the page access token
 */
export async function getInstagramAccountInfoFromToken(
  pageAccessToken: string
): Promise<{
  instagramAccountId: string;
  pageId: string;
}> {
  console.log('[INSTAGRAM] Getting Instagram account info from page token...');
  
  // First, get the page that this token belongs to
  const url = `https://graph.facebook.com/v19.0/me?fields=id,instagram_business_account{id}`;
  const pageResponse = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${pageAccessToken}`,
    },
  });

  console.log('[INSTAGRAM] Page info API response status:', pageResponse.status, pageResponse.statusText);

  if (!pageResponse.ok) {
    const error = await pageResponse.text();
    console.error('[INSTAGRAM] Failed to get page info:', error);
    throw new Error(`Failed to get Facebook Page info (${pageResponse.status}): ${error}`);
  }

  const pageData = await pageResponse.json();
  const pageId = pageData.id;
  const instagramAccountId = pageData.instagram_business_account?.id;

  if (!pageId) {
    throw new Error('Could not retrieve Facebook Page ID from token');
  }

  if (!instagramAccountId) {
    throw new Error('Facebook Page does not have an associated Instagram Business account');
  }

  console.log('[INSTAGRAM] Retrieved page ID:', pageId, 'Instagram account ID:', instagramAccountId);
  return {
    pageId,
    instagramAccountId,
  };
}

/**
 * Validate image meets Instagram requirements
 * Instagram Image Specifications:
 * - Format: JPEG only
 * - File size: 8 MB maximum
 * - Aspect ratio: 4:5 to 1.91:1 range
 * - Minimum width: 320px
 * - Maximum width: 1440px
 * - Color space: sRGB (will be converted by Instagram if not)
 */
interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  width?: number;
  height?: number;
  fileSize?: number;
  format?: string;
  aspectRatio?: number;
}

async function validateInstagramImage(imageUrl: string): Promise<ImageValidationResult> {
  const result: ImageValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Fetch image to get metadata
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      result.valid = false;
      result.errors.push(`Image URL returned ${response.status} status`);
      return result;
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Check file size (8 MB = 8 * 1024 * 1024 bytes)
    const maxSizeBytes = 8 * 1024 * 1024;
    if (contentLength) {
      const fileSize = parseInt(contentLength, 10);
      result.fileSize = fileSize;
      
      if (fileSize > maxSizeBytes) {
        result.valid = false;
        result.errors.push(`Image file size (${(fileSize / 1024 / 1024).toFixed(2)} MB) exceeds Instagram's maximum of 8 MB`);
      }
    }

    // Check format (Instagram only accepts JPEG for images)
    if (contentType) {
      if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        result.format = 'JPEG';
      } else if (contentType.includes('image/png')) {
        result.format = 'PNG';
        result.valid = false;
        result.errors.push(`Image format is PNG. Instagram only accepts JPEG format for images. Please convert to JPEG.`);
      } else if (contentType.includes('image/webp')) {
        result.format = 'WebP';
        result.valid = false;
        result.errors.push(`Image format is WebP. Instagram only accepts JPEG format for images. Please convert to JPEG.`);
      } else if (contentType.includes('image/')) {
        result.format = contentType.split('/')[1]?.toUpperCase();
        result.valid = false;
        result.errors.push(`Image format (${result.format}) is not supported. Instagram only accepts JPEG format for images.`);
      }
    }

    // For dimensions and aspect ratio, we need to decode the image
    // This is a basic validation - full validation would require image decoding library
    // Instagram will validate dimensions on their end, but we can warn about common issues
    
    result.warnings.push('Image dimensions and aspect ratio validation requires image processing. Please ensure:');
    result.warnings.push('- Width: 320px minimum, 1440px maximum');
    result.warnings.push('- Aspect ratio: between 4:5 (0.8) and 1.91:1');

    return result;
  } catch (error) {
    result.valid = false;
    result.errors.push(`Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Upload an image to Instagram
 * Returns the media container ID
 */
async function createInstagramMediaContainer(
  pageAccessToken: string,
  instagramAccountId: string,
  imageUrl: string,
  caption?: string
): Promise<string> {
  console.log('[INSTAGRAM] Creating media container for image:', imageUrl);
  
  // Convert relative URLs to absolute URLs - Instagram requires publicly accessible URLs
  // Keep using /api/uploads/ route as it's reliable and properly configured
  let absoluteImageUrl: string;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    absoluteImageUrl = imageUrl;
  } else {
    // Normalize BASE_URL to remove trailing slashes
    const normalizedBase = BASE_URL.replace(/\/+$/, '');
    
    if (imageUrl.startsWith('/')) {
      // Relative URL starting with / - prepend normalized base URL
      absoluteImageUrl = `${normalizedBase}${imageUrl}`;
    } else {
      // Relative URL without leading / - treat as relative to base
      absoluteImageUrl = `${normalizedBase}/${imageUrl}`;
    }
  }
  
  console.log('[INSTAGRAM] Resolved image URL:', absoluteImageUrl);
  
  // Validate image meets Instagram requirements before sending
  console.log('[INSTAGRAM] Validating image meets Instagram requirements...');
  const validation = await validateInstagramImage(absoluteImageUrl);
  
  if (!validation.valid) {
    const errorMessage = `Image does not meet Instagram requirements:\n${validation.errors.join('\n')}`;
    if (validation.warnings.length > 0) {
      console.warn('[INSTAGRAM] Validation warnings:', validation.warnings.join('; '));
    }
    console.error('[INSTAGRAM] Validation failed:', validation.errors);
    throw new Error(errorMessage);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('[INSTAGRAM] Validation warnings:', validation.warnings.join('; '));
  }
  
  if (validation.format) {
    console.log('[INSTAGRAM] Image format:', validation.format);
  }
  if (validation.fileSize) {
    console.log('[INSTAGRAM] Image file size:', (validation.fileSize / 1024 / 1024).toFixed(2), 'MB');
  }
  
  // Verify image URL is accessible before sending to Instagram
  // Use a standard browser user agent to avoid ngrok interstitial
  try {
    console.log('[INSTAGRAM] Verifying image URL is accessible...');
    const verifyResponse = await fetch(absoluteImageUrl, {
      method: 'GET',
      headers: {
        // Use a standard browser user agent to avoid ngrok interstitial page
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });
    
    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text().catch(() => '');
      console.error('[INSTAGRAM] Image URL verification failed:', verifyResponse.status, errorText.substring(0, 200));
      throw new Error(`Image URL returned ${verifyResponse.status} status. The image may not be publicly accessible. Test URL: ${absoluteImageUrl}`);
    }
    
    const contentType = verifyResponse.headers.get('content-type');
    
    // Check if response is HTML (likely ngrok interstitial page)
    if (contentType && contentType.includes('text/html')) {
      // Only read a small portion to check for ngrok warning
      const responseText = await verifyResponse.text();
      // Check for ngrok warning page indicators
      if (responseText.includes('ngrok') || responseText.includes('browser warning') || responseText.includes('You are about to visit')) {
        console.warn('[INSTAGRAM] ⚠️  Detected ngrok interstitial page during verification');
        console.warn('[INSTAGRAM] Note: Instagram servers may still be able to access the image if ngrok allows bot access');
        // Don't throw - let Instagram try to fetch it
        // Instagram's servers might have different access than our verification
      } else {
        // If it's HTML but not ngrok warning, still error
        throw new Error(`Image URL returns HTML instead of an image (content-type: ${contentType}). The URL may be incorrect or blocked. Test URL: ${absoluteImageUrl}`);
      }
    }
    
    // Verify it's actually an image and is JPEG
    if (!contentType || !contentType.startsWith('image/')) {
      console.warn('[INSTAGRAM] Image URL content-type may be incorrect:', contentType);
      // If we got HTML (ngrok page), warn but continue
      if (contentType && contentType.includes('text/html')) {
        console.warn('[INSTAGRAM] Got HTML response - may be ngrok interstitial. Will attempt to publish anyway.');
      } else {
        throw new Error(`Image URL does not return an image content-type (got: ${contentType}). The URL may be blocked or incorrect. Test URL: ${absoluteImageUrl}`);
      }
    } else {
      // Double-check format is JPEG
      if (!contentType.includes('jpeg') && !contentType.includes('jpg')) {
        throw new Error(`Image format is ${contentType}. Instagram only accepts JPEG format. Please convert your image to JPEG before uploading.`);
      }
      console.log('[INSTAGRAM] ✓ Image URL verified and accessible (content-type:', contentType, ')');
    }
  } catch (verifyError) {
    // If verification fails with a clear error, throw it
    // But if it's just a warning about ngrok, log and continue
    if (verifyError instanceof Error && verifyError.message.includes('ngrok interstitial')) {
      console.warn('[INSTAGRAM] Verification warning (continuing anyway):', verifyError.message);
    } else if (verifyError instanceof Error) {
      throw verifyError;
    } else {
      console.warn('[INSTAGRAM] Verification error (continuing anyway):', verifyError);
    }
  }
  
  // Build request body as JSON per Instagram API documentation
  const requestBody: { image_url: string; caption?: string } = {
    image_url: absoluteImageUrl,
  };
  if (caption && caption.trim().length > 0) {
    requestBody.caption = caption;
  }

  console.log('[INSTAGRAM] Sending media container creation request to Instagram Graph API...');
  console.log('[INSTAGRAM] Request URL:', `https://graph.facebook.com/v24.0/${instagramAccountId}/media`);
  console.log('[INSTAGRAM] Request body:', JSON.stringify(requestBody, null, 2));
  console.log('[INSTAGRAM] Image URL being sent:', absoluteImageUrl);
  
  const response = await fetch(
    `https://graph.facebook.com/v24.0/${instagramAccountId}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pageAccessToken}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log('[INSTAGRAM] Media container creation response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to create Instagram media container (${response.status})`;
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        const apiError = errorData.error;
        errorMessage = `Failed to create Instagram media container (${response.status}): ${apiError.error_user_msg || apiError.message || errorText}`;
        
        // Provide helpful guidance for common errors
        if (apiError.message?.includes('media URI doesn\'t meet our requirements') || apiError.code === 9004) {
          errorMessage += '\n\nThis usually means:\n';
          errorMessage += '1. Image format must be JPEG (not PNG, WebP, etc.)\n';
          errorMessage += '2. Image file size must be 8 MB or less\n';
          errorMessage += '3. Image dimensions: width 320-1440px, aspect ratio 4:5 to 1.91:1\n';
          errorMessage += '4. Image URL must be publicly accessible\n';
          errorMessage += '5. Image must be properly encoded (not corrupted)\n\n';
          errorMessage += `Test the URL: ${absoluteImageUrl}`;
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, use the raw error text
      errorMessage += `: ${errorText}`;
    }
    
    console.error('[INSTAGRAM] Failed to create media container:', errorText);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const containerId = data.id;
  if (!containerId) {
    throw new Error('Instagram API returned no container ID');
  }

  console.log('[INSTAGRAM] Media container created successfully, ID:', containerId);
  return containerId;
}

/**
 * Publish a post to Instagram
 */
export async function publishToInstagram(
  pageAccessToken: string,
  instagramAccountId: string,
  content: string,
  mediaAssets?: Array<{ type: 'image' | 'video'; url: string }> | null
): Promise<{ postId: string }> {
  console.log('[INSTAGRAM] publishToInstagram called - content length:', content.length, 'media assets:', mediaAssets?.length || 0);
  
  // Instagram requires at least one image
  const assets = mediaAssets || [];
  const images = assets.filter(a => a.type === 'image');
  
  if (images.length === 0) {
    throw new Error('Instagram requires at least one image per post');
  }

  // Instagram currently only supports single image posts via Graph API
  // For carousel posts, you need to create multiple media containers and publish them together
  const imageUrl = images[0].url;
  const caption = content.substring(0, 2200); // Instagram caption limit is 2200 characters

  console.log('[INSTAGRAM] Creating media container...');
  
  // Step 1: Create media container
  const containerId = await createInstagramMediaContainer(
    pageAccessToken,
    instagramAccountId,
    imageUrl,
    caption
  );

  // Step 2: Publish the media container
  console.log('[INSTAGRAM] Publishing media container:', containerId);
  
  // Build request body as JSON per Instagram API documentation
  const publishBody = {
    creation_id: containerId,
  };

  const publishResponse = await fetch(
    `https://graph.facebook.com/v24.0/${instagramAccountId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pageAccessToken}`,
      },
      body: JSON.stringify(publishBody),
    }
  );

  console.log('[INSTAGRAM] Publish response status:', publishResponse.status, publishResponse.statusText);

  if (!publishResponse.ok) {
    const error = await publishResponse.text();
    console.error('[INSTAGRAM] Failed to publish post:', error);
    throw new Error(`Failed to publish Instagram post (${publishResponse.status}): ${error}`);
  }

  const publishData = await publishResponse.json();
  const postId = publishData.id;

  if (!postId) {
    console.error('[INSTAGRAM] ERROR: No post ID found in response!');
    throw new Error('Instagram API returned success but no post ID in response');
  }

  console.log('[INSTAGRAM] ✓ Post published successfully - Post ID:', postId);
  return {
    postId: postId,
  };
}

/**
 * Check if Instagram token is expired or about to expire
 */
export function isInstagramTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  // Consider token expired if it expires in less than 7 days (tokens last 60 days)
  return expiresAt.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000;
}