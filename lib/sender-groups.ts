import 'server-only';

const SENDER_API_KEY = process.env.SENDER_API_KEY || '';

interface SenderGroup {
  id: string;
  title: string;
  recipient_count: number;
  active_subscribers: number;
  unsubscribed_count: number;
  bounced_count: number;
  phone_count: number;
  active_phone_count: number;
  account_id: string;
  user_id: string;
  created: string;
  modified: string | null;
  is_recalculating_subscribers?: boolean;
  opens_rate?: number;
  click_rate?: number;
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
}

interface CreateGroupParams {
  title: string;
}

interface UpdateGroupParams {
  title: string;
}

/**
 * Get all groups from Sender.net
 */
export async function getAllSenderGroups(): Promise<SenderGroup[]> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const allGroups: SenderGroup[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      page: page.toString(),
    });

    const response = await fetch(
      `https://api.sender.net/v2/groups?${params.toString()}`,
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

    const data: SenderResponse<SenderGroup[]> = await response.json();
    
    if (Array.isArray(data.data)) {
      allGroups.push(...data.data);
    }

    if (data.meta) {
      hasMore = page < data.meta.last_page;
      page++;
    } else if (data.links?.next) {
      hasMore = !!data.links.next;
      page++;
    } else {
      hasMore = false;
    }

    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return allGroups;
}

/**
 * Create a group in Sender.net
 */
export async function createSenderGroup(params: CreateGroupParams): Promise<SenderGroup> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch('https://api.sender.net/v2/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      title: params.title,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  
  if (result.success && result.data) {
    return result.data as SenderGroup;
  }
  
  throw new Error('Failed to create group: Invalid response from Sender.net');
}

/**
 * Update a group in Sender.net
 */
export async function updateSenderGroup(
  groupId: string,
  params: UpdateGroupParams
): Promise<{ success: boolean; message: string }> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch(`https://api.sender.net/v2/groups/${groupId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      title: params.title,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Delete a group from Sender.net
 */
export async function deleteSenderGroup(
  groupId: string,
  deleteSubscribers: boolean = false
): Promise<{ success: boolean; message: string }> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const params = new URLSearchParams();
  if (deleteSubscribers) {
    params.append('delete_subscribers', 'true');
  }

  const url = params.toString()
    ? `https://api.sender.net/v2/groups/${groupId}?${params.toString()}`
    : `https://api.sender.net/v2/groups/${groupId}`;

  const response = await fetch(url, {
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

