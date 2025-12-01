import 'server-only';

const SENDER_API_KEY = process.env.SENDER_API_KEY || '';
const SENDER_LIST_ID = process.env.SENDER_LIST_ID || '';
const SENDER_REPLY_TO = process.env.SENDER_REPLY_TO || '';
const SENDER_FROM_NAME = process.env.SENDER_FROM_NAME || 'Engjell Rraklli';

interface SenderCampaign {
  id: string;
  subject: string;
  reply_to: string;
  language: string;
  recipient_count: number;
  from: string;
  schedule_time: string | null;
  last_action: string;
  sent_time: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT';
  created: string;
  modified: string;
  title: string;
  domain_id: string;
  preheader: string;
  auto_followup_active: number;
  auto_followup_subject: string | null;
  auto_followup_delay: number | null;
  editor: string;
  opens: number;
  clicks: number;
  bounces_count: number;
  send_to_all: number;
  html?: {
    id: string;
    thumbnail_url: string;
    has_preview: boolean;
    html_content: string;
    html_body: string | null;
  };
  sent_count: number;
  campaign_groups: string[];
  segments: string[];
}

interface CreateCampaignParams {
  title?: string;
  subject: string;
  from?: string;
  preheader?: string;
  replyTo?: string;
  contentType: 'editor' | 'html' | 'text';
  content: string;
  googleAnalytics?: boolean;
  autoFollowupActive?: boolean;
  autoFollowupSubject?: string;
  autoFollowupDelay?: number;
  groups?: string[];
  segments?: string[];
}

interface SenderResponse<T> {
  data: T;
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    links: any[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  has_more_resources?: boolean;
}

/**
 * Ensures unsubscribe link is present in email content
 * Sender.net requires this for all campaigns
 */
function ensureUnsubscribeLink(content: string): string {
  // Check if unsubscribe link already exists
  if (content.includes('{{unsubscribe_link}}') || content.includes('{{unsubscribe_text}}')) {
    return content;
  }

  // Add unsubscribe link at the end of the body, before closing </body> tag
  const unsubscribeHtml = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
      <a href="{{unsubscribe_link}}" style="color: #666; text-decoration: underline;">{{unsubscribe_text}}</a>
    </div>`;

  // Try to insert before </body>
  if (content.includes('</body>')) {
    return content.replace('</body>', `${unsubscribeHtml}\n    </body>`);
  }

  // If no </body> tag, append before closing </html> or at the end
  if (content.includes('</html>')) {
    return content.replace('</html>', `${unsubscribeHtml}\n      </html>`);
  }

  // If no HTML structure, append at the end
  return content + unsubscribeHtml;
}

/**
 * Create a campaign in Sender.net
 */
export async function createSenderCampaign(params: CreateCampaignParams): Promise<SenderCampaign> {
  if (!SENDER_API_KEY || !SENDER_LIST_ID) {
    throw new Error('Sender.net API key or List ID not configured');
  }

  // Ensure unsubscribe link is present in content
  const contentWithUnsubscribe = params.contentType === 'html' 
    ? ensureUnsubscribeLink(params.content)
    : params.content;

  const response = await fetch('https://api.sender.net/v2/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      title: params.title,
      subject: params.subject,
      from: params.from || SENDER_FROM_NAME,
      preheader: params.preheader,
      reply_to: params.replyTo || SENDER_REPLY_TO,
      content_type: params.contentType,
      content: contentWithUnsubscribe,
      google_analytics: params.googleAnalytics ? 1 : 0,
      auto_followup_active: params.autoFollowupActive ? 1 : 0,
      auto_followup_subject: params.autoFollowupSubject,
      auto_followup_delay: params.autoFollowupDelay,
      groups: params.groups || [SENDER_LIST_ID],
      segments: params.segments || [],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  const result: SenderResponse<SenderCampaign> | { data: SenderCampaign } = await response.json();
  // Handle both paginated response and single campaign response
  if ('data' in result) {
    if (Array.isArray(result.data)) {
      return (result.data as SenderCampaign[])[0];
    }
    return result.data as SenderCampaign;
  }
  return (result as any).data;
}

/**
 * Get all campaigns from Sender.net
 */
export async function getAllSenderCampaigns(
  limit: number = 100,
  status?: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT'
): Promise<SenderCampaign[]> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const allCampaigns: SenderCampaign[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await fetch(
      `https://api.sender.net/v2/campaigns?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SENDER_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
    }

    const data: SenderResponse<SenderCampaign> | { data: SenderCampaign } = await response.json();
    
    // Handle paginated response
    if (Array.isArray(data.data)) {
      allCampaigns.push(...data.data);
    } else if (data.data && typeof data.data === 'object' && 'id' in data.data) {
      // Single campaign object
      allCampaigns.push(data.data as SenderCampaign);
    }

    if ('meta' in data && data.meta) {
      hasMore = page < data.meta.last_page;
      page++;
    } else if ('links' in data && data.links?.next) {
      hasMore = !!data.links.next;
      page++;
    } else {
      hasMore = false;
    }

    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return allCampaigns;
}

/**
 * Get a specific campaign from Sender.net
 */
export async function getSenderCampaign(campaignId: string): Promise<SenderCampaign> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch(`https://api.sender.net/v2/campaigns/${campaignId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  const result: SenderResponse<SenderCampaign> | { data: SenderCampaign } = await response.json();
  // Handle both paginated response and single campaign response
  if ('data' in result) {
    if (Array.isArray(result.data)) {
      return (result.data as SenderCampaign[])[0];
    }
    return result.data as SenderCampaign;
  }
  return (result as any).data;
}

/**
 * Send a campaign
 */
export async function sendSenderCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch(`https://api.sender.net/v2/campaigns/${campaignId}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Schedule a campaign
 */
export async function scheduleSenderCampaign(
  campaignId: string,
  scheduleTime: Date
): Promise<{ success: boolean; message: string }> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const formattedTime = scheduleTime.toISOString().replace('T', ' ').slice(0, 19);

  const response = await fetch(`https://api.sender.net/v2/campaigns/${campaignId}/schedule`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      schedule_time: formattedTime,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Cancel a scheduled campaign
 */
export async function cancelScheduledSenderCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch(`https://api.sender.net/v2/campaigns/${campaignId}/schedule`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Delete campaigns from Sender.net
 */
export async function deleteSenderCampaigns(
  campaignIds: string[],
  options?: { status?: 'DRAFT' | 'SENT' | 'PENDING' | 'PREPARING'; title?: string }
): Promise<{ success: boolean; message: string }> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  // Format IDs as array in query string
  // API expects: ids=[eE0x14] for single, or ids=[id1,id2] for multiple
  // The API documentation shows the literal format: ?ids=[eE0x14]
  // Format: [id] for single, [id1,id2] for multiple (brackets included in value)
  // Only encode the ID values, keep brackets unencoded as shown in API docs
  const encodedCampaignIds = campaignIds.map(id => encodeURIComponent(id));
  const idsParam = campaignIds.length === 1 
    ? `[${encodedCampaignIds[0]}]` 
    : `[${encodedCampaignIds.join(',')}]`;
  
  // Construct URL - API expects brackets in query parameter value
  // The format should be: ?ids=[eE0x14] (brackets are part of the value)
  // We encode the IDs but keep brackets literal as per API documentation
  const url = `https://api.sender.net/v2/campaigns?ids=${idsParam}`;

  // Build request body with optional filters
  const body: { status?: string; title?: string } = {};
  if (options?.status) {
    body.status = options.status;
  }
  if (options?.title) {
    body.title = options.title;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Only include body if we have filters
    ...(Object.keys(body).length > 0 && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  
  // If Sender.net returns success: false, it might mean the campaign doesn't exist
  // or is already deleted. We'll still return the result but log a warning.
  if (result.success === false) {
    console.warn(`Sender.net delete warning: ${result.message || 'Campaign may not exist or already deleted'}`);
  }
  
  return result;
}
