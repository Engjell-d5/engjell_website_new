import 'server-only';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state?: string): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not set in environment variables');
  }

  const redirectUri = `${BASE_URL}/api/email/callback`;
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  
  console.log('[Google OAuth] Redirect URI:', redirectUri);
  console.log('[Google OAuth] Client ID present:', !!GOOGLE_CLIENT_ID);
  console.log('[Google OAuth] Base URL:', BASE_URL);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state || 'google_oauth',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getGoogleAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
}> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  const redirectUri = `${BASE_URL}/api/email/callback`;
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to get Google access token: ${errorText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.error === 'invalid_client') {
        errorMessage = `Invalid OAuth client. Please check:
1. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly in .env.local
2. The redirect URI in Google Cloud Console matches: ${redirectUri}
3. The OAuth client is enabled in Google Cloud Console
4. You've restarted the server after adding environment variables

Error details: ${errorText}`;
      }
    } catch {
      // If error is not JSON, use the text as-is
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
}> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh Google token: ${error}`);
  }

  return await response.json();
}

/**
 * Get Google user profile information
 */
export async function getGoogleProfile(accessToken: string): Promise<{
  id: string;
  email: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Google profile: ${error}`);
  }

  return await response.json();
}

/**
 * Get unread emails from Gmail
 */
export async function getUnreadEmails(accessToken: string, maxResults: number = 50): Promise<any[]> {
  // First, get list of message IDs
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listResponse.ok) {
    const error = await listResponse.text();
    throw new Error(`Failed to get email list: ${error}`);
  }

  const listData = await listResponse.json();
  const messages = listData.messages || [];

  // Fetch full details for each message
  const emailPromises = messages.map(async (msg: { id: string; threadId: string }) => {
    const messageResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!messageResponse.ok) {
      console.error(`Failed to fetch message ${msg.id}`);
      return null;
    }

    return await messageResponse.json();
  });

  const emails = await Promise.all(emailPromises);
  return emails.filter((email): email is any => email !== null);
}

/**
 * Get all emails (read and unread) from Gmail
 */
export async function getAllEmails(accessToken: string, maxResults: number = 100): Promise<any[]> {
  // Get all messages
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listResponse.ok) {
    const error = await listResponse.text();
    throw new Error(`Failed to get email list: ${error}`);
  }

  const listData = await listResponse.json();
  const messages = listData.messages || [];

  // Fetch full details for each message
  // IMPORTANT: Store threadId from list response since it might not be in full message
  const emailPromises = messages.map(async (msg: { id: string; threadId: string }) => {
    const messageResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!messageResponse.ok) {
      console.error(`Failed to fetch message ${msg.id}`);
      return null;
    }

    const fullMessage = await messageResponse.json();
    // Ensure threadId is set from the list response (it's guaranteed to be there)
    if (msg.threadId && !fullMessage.threadId) {
      fullMessage.threadId = msg.threadId;
    }
    return fullMessage;
  });

  const emails = await Promise.all(emailPromises);
  return emails.filter((email): email is any => email !== null);
}

/**
 * Get thread details to check for follow-ups
 */
export async function getThreadDetails(accessToken: string, threadId: string): Promise<any> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get thread details: ${error}`);
  }

  return await response.json();
}

/**
 * Parse Gmail message into a structured format
 */
export function parseGmailMessage(message: any): {
  gmailId: string;
  threadId: string;
  subject: string;
  from: string;
  to?: string;
  snippet?: string;
  body?: string;
  bodyText?: string;
  receivedAt: Date;
  isRead: boolean;
} {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string) => 
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('subject');
  const from = getHeader('from');
  const to = getHeader('to');
  const dateHeader = getHeader('date');
  const receivedAt = dateHeader ? new Date(dateHeader) : new Date(parseInt(message.internalDate));

  // Check if email is read (label 'UNREAD' not present means it's read)
  const isRead = !message.labelIds?.includes('UNREAD');

  // Extract body
  let body = '';
  let bodyText = '';

  const extractBody = (part: any): void => {
    if (part.body?.data) {
      const text = Buffer.from(part.body.data, 'base64').toString('utf-8');
      if (part.mimeType === 'text/html') {
        body = text;
      } else if (part.mimeType === 'text/plain') {
        bodyText = text;
      }
    }
    if (part.parts) {
      part.parts.forEach(extractBody);
    }
  };

  if (message.payload) {
    extractBody(message.payload);
  }

  return {
    gmailId: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    snippet: message.snippet,
    body: body || undefined,
    bodyText: bodyText || undefined,
    receivedAt,
    isRead,
  };
}

/**
 * Check if Google token is expired or about to expire
 */
export function isGoogleTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  // Consider token expired if it expires in less than 5 minutes
  return expiresAt.getTime() < Date.now() + 5 * 60 * 1000;
}
