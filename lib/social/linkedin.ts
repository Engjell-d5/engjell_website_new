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
 * Search for people to mention in LinkedIn posts using People Typeahead API
 * Returns up to 10 profiles matching the keyword
 */
export async function searchLinkedInPeople(
  accessToken: string,
  keywords: string,
  organizationUrn: string
): Promise<Array<{
  member: string; // Person URN
  photo?: string; // Image URN
  firstName: string;
  lastName: string;
  headline: string;
}>> {
  console.log(`[LINKEDIN] Searching for people with keywords: "${keywords}", organization: ${organizationUrn}`);
  
  // Validate keywords according to LinkedIn requirements
  if (keywords.length < 3) {
    throw new Error('Keywords must be at least 3 characters long');
  }
  
  // Check for invalid characters (only alphabet, space, apostrophe, hyphen, dot allowed)
  const invalidCharRegex = /[^a-zA-Z\s'\-.]/;
  if (invalidCharRegex.test(keywords)) {
    throw new Error('Keywords contain invalid characters. Only letters, spaces, apostrophes, hyphens, and dots are allowed.');
  }
  
  // Check for consecutive special characters
  if (/[. ]{2,}|['-]{2,}/.test(keywords)) {
    throw new Error('Consecutive special characters are not allowed');
  }
  
  // Check space count (only one space allowed)
  const spaceCount = (keywords.match(/ /g) || []).length;
  if (spaceCount > 1) {
    throw new Error('Only one space character is allowed');
  }
  
  // If space or dot present, minimum 6 characters required
  if ((keywords.includes(' ') || keywords.includes('.')) && keywords.length < 6) {
    throw new Error('Keywords must be at least 6 characters long if they contain spaces or dots');
  }
  
  // URL encode the keywords
  const encodedKeywords = encodeURIComponent(keywords);
  const encodedOrgUrn = encodeURIComponent(organizationUrn);
  
  const url = `https://api.linkedin.com/rest/peopleTypeahead?q=organizationFollowers&keywords=${encodedKeywords}&organization=${encodedOrgUrn}`;
  
  console.log(`[LINKEDIN] Calling People Typeahead API: ${url}`);
  
  const linkedInVersion = '202411';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': linkedInVersion,
    },
  });
  
  console.log(`[LINKEDIN] People Typeahead API response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[LINKEDIN] People Typeahead API error: ${errorText}`);
    
    // Parse error if possible
    try {
      const errorData = JSON.parse(errorText);
      const errorMessage = errorData.message || errorText;
      
      // Check if it's a permission error (403)
      if (response.status === 403) {
        console.warn(`[LINKEDIN] People Typeahead API requires Partner API access or additional permissions. Error: ${errorMessage}`);
        // Return empty array instead of throwing - allows the feature to degrade gracefully
        // The frontend will just not show people search results
        return [];
      }
      
      throw new Error(`Failed to search LinkedIn people (${response.status}): ${errorMessage}`);
    } catch (parseError) {
      // If it's already an Error object, re-throw it
      if (parseError instanceof Error && parseError.message.includes('Failed to search LinkedIn people')) {
        throw parseError;
      }
      
      // If it's a 403, return empty array for graceful degradation
      if (response.status === 403) {
        console.warn(`[LINKEDIN] People Typeahead API access denied. Returning empty results.`);
        return [];
      }
      
      throw new Error(`Failed to search LinkedIn people (${response.status}): ${errorText}`);
    }
  }
  
  const data = await response.json();
  console.log(`[LINKEDIN] People Typeahead API response:`, JSON.stringify(data, null, 2));
  
  const elements = data.elements || [];
  console.log(`[LINKEDIN] Found ${elements.length} people matching "${keywords}"`);
  
  return elements.map((element: any) => ({
    member: element.member, // Person URN
    photo: element.photo,
    firstName: element.firstName || '',
    lastName: element.lastName || '',
    headline: element.headline || '',
  }));
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

  // Convert relative URLs to absolute URLs
  let absoluteVideoUrl: string;
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    absoluteVideoUrl = videoUrl;
  } else {
    // Normalize BASE_URL to remove trailing slashes
    const normalizedBase = BASE_URL.replace(/\/+$/, '');
    
    if (videoUrl.startsWith('/')) {
      // Relative URL starting with / - prepend normalized base URL
      absoluteVideoUrl = `${normalizedBase}${videoUrl}`;
    } else {
      // Relative URL without leading / - treat as relative to base
      absoluteVideoUrl = `${normalizedBase}/${videoUrl}`;
    }
  }
  
  console.log(`[LINKEDIN] Resolved video URL: ${absoluteVideoUrl}`);
  
  // Download the video from the URL
  console.log(`[LINKEDIN] Downloading video from: ${absoluteVideoUrl}`);
  const videoResponse = await fetch(absoluteVideoUrl);
  console.log(`[LINKEDIN] Video download response status: ${videoResponse.status} ${videoResponse.statusText}`);
  
  if (!videoResponse.ok) {
    const errorMsg = `Failed to download video from ${absoluteVideoUrl} (${videoResponse.status})`;
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
  
  // Convert digitalmediaAsset URN to video URN format required by Posts API
  // LinkedIn returns urn:li:digitalmediaAsset:ABC123 but Posts API expects urn:li:video:ABC123
  const assetUrn = registerData.value.asset;
  if (assetUrn.startsWith('urn:li:digitalmediaAsset:')) {
    const videoId = assetUrn.replace('urn:li:digitalmediaAsset:', '');
    const videoUrn = `urn:li:video:${videoId}`;
    console.log(`[LINKEDIN] Converted digitalmediaAsset URN to video URN: ${videoUrn}`);
    return videoUrn;
  }
  
  return assetUrn;
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

  // Convert relative URLs to absolute URLs
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
  
  console.log(`[LINKEDIN] Resolved image URL: ${absoluteImageUrl}`);

  // Download the image from the URL
  console.log(`[LINKEDIN] Downloading image from: ${absoluteImageUrl}`);
  const imageResponse = await fetch(absoluteImageUrl);
  console.log(`[LINKEDIN] Image download response status: ${imageResponse.status} ${imageResponse.statusText}`);
  
  if (!imageResponse.ok) {
    const errorMsg = `Failed to download image from ${absoluteImageUrl} (${imageResponse.status})`;
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
  
  // Convert digitalmediaAsset URN to image URN format required by Posts API
  // LinkedIn returns urn:li:digitalmediaAsset:ABC123 but Posts API expects urn:li:image:ABC123
  const assetUrn = registerData.value.asset;
  if (assetUrn.startsWith('urn:li:digitalmediaAsset:')) {
    const imageId = assetUrn.replace('urn:li:digitalmediaAsset:', '');
    const imageUrn = `urn:li:image:${imageId}`;
    console.log(`[LINKEDIN] Converted digitalmediaAsset URN to image URN: ${imageUrn}`);
    return imageUrn;
  }
  
  return assetUrn;
}

/**
 * Publish a post to LinkedIn with multiple media assets
 */
export async function publishToLinkedIn(
  accessToken: string,
  content: string,
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
): Promise<{ postId: string; urn: string }> {
  const assets = mediaAssets || [];

  console.log(`[LINKEDIN] publishToLinkedIn called - content length: ${content.length}, media assets: ${assets.length}, mentions: ${mentions?.length || 0}`);
  console.log(`[LINKEDIN] Access token prefix: ${accessToken.substring(0, 20)}...`);
  
  // Process mentions: Convert @PersonName to @[PersonName](urn:li:person:12345) format
  // and @OrganizationName to @[OrganizationName](urn:li:organization:12345) format
  // According to LinkedIn docs: The text must match the name exactly (case sensitive)
  // For person mentions, can match on first name, last name, or full name
  // For organization mentions, must match the full organization name
  let processedContent = content;
  if (mentions && mentions.length > 0) {
    console.log(`[LINKEDIN] Processing ${mentions.length} mention(s)...`);
    for (const mention of mentions) {
      // Escape special regex characters in names
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Handle both new format (with type) and old format (without type) for backward compatibility
      const mentionType = mention.type || (mention.member ? 'person' : mention.organization ? 'organization' : null);
      
      if (mentionType === 'person' && mention.member && mention.firstName && mention.lastName) {
        const fullName = `${mention.firstName} ${mention.lastName}`;
        const firstName = mention.firstName;
        const lastName = mention.lastName;
        
        const escapedFullName = escapeRegex(fullName);
        const escapedFirstName = escapeRegex(firstName);
        const escapedLastName = escapeRegex(lastName);
        
        // Try to match in order: full name first, then first name, then last name
        // Use negative lookahead to avoid matching if followed by word characters or spaces (to avoid partial matches)
        const fullNamePattern = new RegExp(`@${escapedFullName}(?![\\w\\s])`, 'g');
        const firstNamePattern = new RegExp(`@${escapedFirstName}(?![\\w\\s])`, 'g');
        const lastNamePattern = new RegExp(`@${escapedLastName}(?![\\w\\s])`, 'g');
        
        // Replace with LinkedIn annotation format: @[FullName](urn:li:person:12345)
        // Always use full name in the annotation text as per LinkedIn requirements
        const originalContent = processedContent;
        
        // Try full name first (most specific)
        if (fullNamePattern.test(processedContent)) {
          fullNamePattern.lastIndex = 0; // Reset regex
          processedContent = processedContent.replace(fullNamePattern, `@[${fullName}](${mention.member})`);
          console.log(`[LINKEDIN] Converted full name mention: @${fullName} -> @[${fullName}](${mention.member})`);
        } else if (firstNamePattern.test(processedContent)) {
          firstNamePattern.lastIndex = 0; // Reset regex
          processedContent = processedContent.replace(firstNamePattern, `@[${fullName}](${mention.member})`);
          console.log(`[LINKEDIN] Converted first name mention: @${firstName} -> @[${fullName}](${mention.member})`);
        } else if (lastNamePattern.test(processedContent)) {
          lastNamePattern.lastIndex = 0; // Reset regex
          processedContent = processedContent.replace(lastNamePattern, `@[${fullName}](${mention.member})`);
          console.log(`[LINKEDIN] Converted last name mention: @${lastName} -> @[${fullName}](${mention.member})`);
        }
        
        if (processedContent !== originalContent) {
          console.log(`[LINKEDIN] Content after person mention processing: ${processedContent.substring(0, 200)}...`);
        }
      } else if (mention.type === 'organization' && mention.organization && mention.name) {
        const orgName = mention.name;
        const escapedOrgName = escapeRegex(orgName);
        
        // Organization mentions must match the full name exactly
        const orgPattern = new RegExp(`@${escapedOrgName}(?![\\w\\s])`, 'g');
        
        // Replace with LinkedIn annotation format: @[OrgName](urn:li:organization:12345)
        const originalContent = processedContent;
        
        if (orgPattern.test(processedContent)) {
          orgPattern.lastIndex = 0; // Reset regex
          processedContent = processedContent.replace(orgPattern, `@[${orgName}](${mention.organization})`);
          console.log(`[LINKEDIN] Converted organization mention: @${orgName} -> @[${orgName}](${mention.organization})`);
        }
        
        if (processedContent !== originalContent) {
          console.log(`[LINKEDIN] Content after organization mention processing: ${processedContent.substring(0, 200)}...`);
        }
      } else if (!mentionType) {
        // Old format mention without type - try to infer from structure
        if (mention.member && (mention as any).firstName && (mention as any).lastName) {
          // Old person format
          const fullName = `${(mention as any).firstName} ${(mention as any).lastName}`;
          const firstName = (mention as any).firstName;
          const lastName = (mention as any).lastName;
          
          const escapedFullName = escapeRegex(fullName);
          const escapedFirstName = escapeRegex(firstName);
          const escapedLastName = escapeRegex(lastName);
          
          const fullNamePattern = new RegExp(`@${escapedFullName}(?![\\w\\s])`, 'g');
          const firstNamePattern = new RegExp(`@${escapedFirstName}(?![\\w\\s])`, 'g');
          const lastNamePattern = new RegExp(`@${escapedLastName}(?![\\w\\s])`, 'g');
          
          const originalContent = processedContent;
          
          if (fullNamePattern.test(processedContent)) {
            fullNamePattern.lastIndex = 0;
            processedContent = processedContent.replace(fullNamePattern, `@[${fullName}](${mention.member})`);
            console.log(`[LINKEDIN] Converted old format person mention: @${fullName} -> @[${fullName}](${mention.member})`);
          } else if (firstNamePattern.test(processedContent)) {
            firstNamePattern.lastIndex = 0;
            processedContent = processedContent.replace(firstNamePattern, `@[${fullName}](${mention.member})`);
            console.log(`[LINKEDIN] Converted old format person mention: @${firstName} -> @[${fullName}](${mention.member})`);
          } else if (lastNamePattern.test(processedContent)) {
            lastNamePattern.lastIndex = 0;
            processedContent = processedContent.replace(lastNamePattern, `@[${fullName}](${mention.member})`);
            console.log(`[LINKEDIN] Converted old format person mention: @${lastName} -> @[${fullName}](${mention.member})`);
          }
          
          if (processedContent !== originalContent) {
            console.log(`[LINKEDIN] Content after old format mention processing: ${processedContent.substring(0, 200)}...`);
          }
        }
      }
    }
  }
  
  // LinkedIn Posts API requires special characters to be escaped to prevent content truncation
  // Characters that need escaping: ( ) * [ ] { } < > @ | ~ _
  // BUT: We should NOT escape @ symbols that are part of mention annotations (@[...](...))
  // See: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/little-text-format
  const escapeLinkedInContent = (text: string): string => {
    // First, protect mention annotations by temporarily replacing them
    const mentionPlaceholders: string[] = [];
    const mentionPattern = /@\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let placeholderIndex = 0;
    
    // Replace mention annotations with placeholders
    let protectedText = text.replace(mentionPattern, (match) => {
      const placeholder = `__MENTION_${placeholderIndex}__`;
      mentionPlaceholders[placeholderIndex] = match;
      placeholderIndex++;
      return placeholder;
    });
    
    // Escape special characters (but not @ in hashtags - hashtags are handled automatically by LinkedIn)
    // Escape: ( ) * [ ] { } < > | ~ _ (but NOT @ since we've protected mentions)
    protectedText = protectedText.replace(/[\(*\)\[\]\{\}<>|~_]/gm, (x) => "\\" + x);
    
    // Restore mention annotations (they should not be escaped)
    let escapedText = protectedText;
    mentionPlaceholders.forEach((placeholder, index) => {
      escapedText = escapedText.replace(`__MENTION_${index}__`, placeholder);
    });
    
    return escapedText;
  };
  
  // Escape the content before sending to LinkedIn
  const escapedContent = escapeLinkedInContent(processedContent);
  
  // LinkedIn Posts API has a 3000 character limit for commentary field
  const LINKEDIN_MAX_LENGTH = 3000;
  if (escapedContent.length > LINKEDIN_MAX_LENGTH) {
    console.warn(`[LINKEDIN] WARNING: Escaped content length (${escapedContent.length}) exceeds LinkedIn's limit (${LINKEDIN_MAX_LENGTH}). Content will be truncated.`);
    console.warn(`[LINKEDIN] Original content length: ${content.length}`);
    console.warn(`[LINKEDIN] Content preview (first 500 chars): ${content.substring(0, 500)}...`);
    console.warn(`[LINKEDIN] Content preview (last 500 chars): ...${content.substring(content.length - 500)}`);
    throw new Error(`Content length (${escapedContent.length} characters after escaping) exceeds LinkedIn's maximum limit of ${LINKEDIN_MAX_LENGTH} characters. Please shorten your post.`);
  }
  
  // Log full content for debugging (first and last 200 chars to avoid huge logs)
  console.log(`[LINKEDIN] Original content length: ${content.length}, Escaped content length: ${escapedContent.length}`);
  console.log(`[LINKEDIN] First 200 chars (original): ${content.substring(0, 200)}`);
  console.log(`[LINKEDIN] First 200 chars (escaped): ${escapedContent.substring(0, 200)}`);
  if (content.length > 400) {
    console.log(`[LINKEDIN] ... (${content.length - 400} chars in between) ...`);
    console.log(`[LINKEDIN] Last 200 chars (original): ${content.substring(content.length - 200)}`);
    console.log(`[LINKEDIN] Last 200 chars (escaped): ${escapedContent.substring(escapedContent.length - 200)}`);
  } else {
    console.log(`[LINKEDIN] Full content (original): ${content}`);
    console.log(`[LINKEDIN] Full content (escaped): ${escapedContent}`);
  }
  
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
  // For new Posts API, we handle single image/video or use MultiImage for multiple images

  // Prepare the post content using new Posts API format
  // Ensure content is properly trimmed and use escaped content
  const trimmedContent = escapedContent.trim();
  const postContent: any = {
    author: personUrn,
    commentary: trimmedContent,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  // Upload and attach media assets
  if (assets.length > 0) {
    console.log(`[LINKEDIN] Uploading ${assets.length} media asset(s)...`);
    const errors: string[] = [];

    // For single image or video
    if (assets.length === 1) {
      const asset = assets[0];
      try {
        let assetUrn: string;
        
        if (asset.type === 'video') {
          console.log(`[LINKEDIN] Uploading video from URL: ${asset.url}`);
          assetUrn = await uploadLinkedInVideo(accessToken, asset.url, personUrn);
          console.log(`[LINKEDIN] Video uploaded successfully, asset URN: ${assetUrn}`);
          
          // Add video to content
          postContent.content = {
            media: {
              id: assetUrn,
              title: 'Video post',
            },
          };
        } else {
          console.log(`[LINKEDIN] Uploading image from URL: ${asset.url}`);
          assetUrn = await uploadLinkedInImage(accessToken, asset.url, personUrn);
          console.log(`[LINKEDIN] Image uploaded successfully, asset URN: ${assetUrn}`);
          
          // Add image to content
          postContent.content = {
            media: {
              id: assetUrn,
              title: 'Image post',
            },
          };
        }
      } catch (error) {
        const errorMsg = `Failed to upload ${asset.type}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[LINKEDIN] ${errorMsg}`);
        errors.push(errorMsg);
      }
    } else if (hasImages && images.length > 1) {
      // Multiple images - use MultiImage API (only for non-sponsored posts)
      console.log(`[LINKEDIN] Uploading ${images.length} images for multi-image post...`);
      const imageUrns: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        try {
          const assetUrn = await uploadLinkedInImage(accessToken, images[i].url, personUrn);
          imageUrns.push(assetUrn);
          console.log(`[LINKEDIN] Image ${i + 1}/${images.length} uploaded successfully`);
      } catch (error) {
          const errorMsg = `Failed to upload image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[LINKEDIN] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

      if (imageUrns.length > 0) {
        // Use MultiImage format
        postContent.content = {
          multiImage: {
            images: imageUrns.map(urn => ({ id: urn })),
          },
        };
      }
    } else {
      // Multiple videos or mixed content - LinkedIn doesn't support this
      console.warn(`[LINKEDIN] Multiple videos or mixed content not supported. Using first asset only.`);
      const asset = assets[0];
      try {
        if (asset.type === 'video') {
          const assetUrn = await uploadLinkedInVideo(accessToken, asset.url, personUrn);
          postContent.content = {
            media: {
              id: assetUrn,
              title: 'Video post',
            },
          };
        } else {
          const assetUrn = await uploadLinkedInImage(accessToken, asset.url, personUrn);
          postContent.content = {
            media: {
              id: assetUrn,
              title: 'Image post',
            },
          };
        }
      } catch (error) {
        console.error(`[LINKEDIN] Failed to upload first asset: ${error}`);
      }
    }
      
      if (errors.length > 0) {
        console.warn(`[LINKEDIN] Some media assets failed to upload: ${errors.join('; ')}`);
    }
  }

  console.log(`[LINKEDIN] Publishing post to LinkedIn API...`);
  console.log(`[LINKEDIN] Post content preview: ${JSON.stringify(postContent, null, 2).substring(0, 500)}...`);

  // Use the new Posts API (replaces deprecated ugcPosts API)
  // LinkedIn-Version header is required (using active version: 202411)
  // Note: 202412 may not be active yet, using 202411 which should be active
  const linkedInVersion = '202411'; // November 2024 - update as needed when newer versions become active
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': linkedInVersion,
    },
    body: JSON.stringify(postContent),
  });

  console.log(`[LINKEDIN] LinkedIn API response status: ${response.status} ${response.statusText}`);
  console.log(`[LINKEDIN] Response headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[LINKEDIN] LinkedIn API error response: ${errorText}`);
    console.error(`[LINKEDIN] Content that was sent (length: ${trimmedContent.length}): ${trimmedContent.substring(0, 500)}${trimmedContent.length > 500 ? '...' : ''}`);
    throw new Error(`Failed to publish to LinkedIn (${response.status}): ${errorText}`);
  }

  let data: any = {};
  try {
    const responseText = await response.text();
    console.log(`[LINKEDIN] LinkedIn API response body (raw): ${responseText}`);
    
    if (responseText && responseText.trim() !== '') {
      data = JSON.parse(responseText);
      console.log(`[LINKEDIN] LinkedIn API success response (parsed):`, JSON.stringify(data, null, 2));
      
      // Check if LinkedIn returned a truncated version in the response
      if (data.commentary && data.commentary.length < trimmedContent.length) {
        console.warn(`[LINKEDIN] WARNING: LinkedIn response contains shorter commentary (${data.commentary.length} chars) than what was sent (${trimmedContent.length} chars). Content may have been truncated by LinkedIn.`);
        console.warn(`[LINKEDIN] Sent content length: ${trimmedContent.length}`);
        console.warn(`[LINKEDIN] Received content length: ${data.commentary.length}`);
      }
    } else {
      console.log(`[LINKEDIN] LinkedIn API returned empty response body`);
    }
  } catch (parseError) {
    console.error(`[LINKEDIN] Error parsing LinkedIn API response:`, parseError);
    throw new Error(`Failed to parse LinkedIn API response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
  
  // New Posts API returns the URN in the x-restli-id header or in the response body
  const restliId = response.headers.get('x-restli-id') || '';
  const responseId = data?.id || '';
  const urn = restliId || responseId || '';

  console.log(`[LINKEDIN] Extracted values - x-restli-id header: "${restliId}", Response ID: "${responseId}", Final URN: "${urn}"`);

  if (!urn || urn.trim() === '') {
    console.error(`[LINKEDIN] ERROR: No URN or post ID found in response!`);
    console.error(`[LINKEDIN] Full response details:`);
    console.error(`[LINKEDIN] - Status: ${response.status}`);
    console.error(`[LINKEDIN] - Headers:`, JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.error(`[LINKEDIN] - Body:`, JSON.stringify(data, null, 2));
    throw new Error('LinkedIn API returned success but no post ID or URN in response');
  }

  // The URN from new Posts API can be either urn:li:share:{id} or urn:li:ugcPost:{id}
  const finalUrn = urn.startsWith('urn:li:') ? urn : `urn:li:ugcPost:${urn}`;
  // Extract just the ID part for postId (for backward compatibility)
  const postIdMatch = finalUrn.match(/urn:li:(?:share|ugcPost):(.+)/);
  const postId = postIdMatch ? postIdMatch[1] : finalUrn;
  
  console.log(`[LINKEDIN] ✓ Post published successfully - Final URN: ${finalUrn}, Post ID: ${postId}`);

  return {
    postId: postId,
    urn: finalUrn,
  };
}

/**
 * Post a comment on a LinkedIn post
 * Uses the v2 legacy API: POST /v2/socialActions/{target}/comments
 */
export async function commentOnLinkedInPost(
  accessToken: string,
  postUrn: string,
  commentText: string
): Promise<{ commentId: string }> {
  console.log(`[LINKEDIN] Posting comment on post ${postUrn}, comment length: ${commentText.length}`);
  
  // Get person URN
  const personUrn = await getLinkedInPersonUrn(accessToken);
  
  // Ensure post URN is in correct format
  // v2 API typically uses share URNs (urn:li:share:{id}) or activity URNs (urn:li:activity:{id})
  let formattedPostUrn = postUrn;
  if (!postUrn.startsWith('urn:li:')) {
    // If just an ID, assume it's a share
    formattedPostUrn = `urn:li:share:${postUrn}`;
  }
  
  // For v2 API, convert ugcPost to share/activity format if needed
  // v2 API typically expects share or activity URNs
  if (formattedPostUrn.startsWith('urn:li:ugcPost:')) {
    // Convert ugcPost to share format for v2 API
    const postId = formattedPostUrn.replace('urn:li:ugcPost:', '');
    formattedPostUrn = `urn:li:share:${postId}`;
    console.log(`[LINKEDIN] Converted ugcPost URN to share URN for v2 API: ${formattedPostUrn}`);
  }
  
  // v2 API uses the post URN as both the target in URL and object in body
  // The object field should be the share/activity URN
  let objectUrn = formattedPostUrn;
  
  // If it's a share URN, we can use it directly, or convert to activity if needed
  // v2 API typically accepts share URNs as-is
  if (formattedPostUrn.startsWith('urn:li:share:')) {
    // For v2 API, we can use share URN directly or convert to activity
    // Let's try using share URN directly first
    objectUrn = formattedPostUrn;
  }
  
  // LinkedIn v2 Social Actions API for comments
  // Endpoint format: POST /v2/socialActions/{shareUrn|activityUrn}/comments
  const commentPayload = {
    actor: personUrn,
    object: objectUrn, // The share or activity URN
    message: {
      text: commentText,
    },
  };

  console.log(`[LINKEDIN] Posting comment to LinkedIn v2 Social Actions API...`);
  console.log(`[LINKEDIN] Post URN (URL): ${formattedPostUrn}`);
  console.log(`[LINKEDIN] Object URN: ${objectUrn}`);
  
  const response = await fetch(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(formattedPostUrn)}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(commentPayload),
  });

  console.log(`[LINKEDIN] Comment API response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[LINKEDIN] Failed to post comment: ${errorText}`);
    throw new Error(`Failed to post comment on LinkedIn (${response.status}): ${errorText}`);
  }

  let data: any = {};
  try {
    const responseText = await response.text();
    if (responseText && responseText.trim() !== '') {
      data = JSON.parse(responseText);
      console.log(`[LINKEDIN] Comment response:`, JSON.stringify(data, null, 2));
    }
  } catch (parseError) {
    console.error(`[LINKEDIN] Error parsing comment response:`, parseError);
  }

  // v2 API returns the comment ID in Location header or x-restli-id header or response body
  const location = response.headers.get('Location') || '';
  const locationId = location ? location.split('/').pop() || location : '';
  const restliId = response.headers.get('x-restli-id') || '';
  const responseId = data?.id || '';
  const commentId = locationId || restliId || responseId || 'comment_' + Date.now();

  console.log(`[LINKEDIN] ✓ Comment posted successfully - Comment ID: ${commentId}`);
  return {
    commentId,
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
