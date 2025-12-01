import 'server-only';

const SENDER_API_KEY = process.env.SENDER_API_KEY || '';

interface AddSubscriberToGroupParams {
  groupId: string;
  subscribers: string[];
  triggerAutomation?: boolean;
}

interface RemoveSubscriberFromGroupParams {
  groupId: string;
  subscribers: string[];
}

interface UpdateSubscriberParams {
  email: string;
  firstname?: string;
  lastname?: string;
  groups?: string[];
  subscriber_status?: 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED' | 'SPAM_REPORTED';
  trigger_automation?: boolean;
}

/**
 * Add subscribers to a group in Sender.net
 */
export async function addSubscribersToGroup(params: AddSubscriberToGroupParams): Promise<{
  success: boolean;
  message: {
    subscribers_added_to_group?: string[];
    non_existing_subscribers?: string[];
  };
}> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch(`https://api.sender.net/v2/subscribers/groups/${params.groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      subscribers: params.subscribers,
      trigger_automation: params.triggerAutomation !== false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return {
    success: result.success || true,
    message: result.message || {},
  };
}

/**
 * Remove subscribers from a group in Sender.net
 */
export async function removeSubscribersFromGroup(params: RemoveSubscriberFromGroupParams): Promise<{
  success: boolean;
  message: string;
}> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch(`https://api.sender.net/v2/subscribers/groups/${params.groupId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      subscribers: params.subscribers,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return {
    success: result.success || true,
    message: result.message || 'Removed tag',
  };
}

/**
 * Update subscriber in Sender.net (including groups)
 */
export async function updateSenderSubscriber(params: UpdateSubscriberParams): Promise<{
  success: boolean;
  message: string;
  data: any[];
}> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const body: any = {};
  if (params.firstname !== undefined) body.firstname = params.firstname;
  if (params.lastname !== undefined) body.lastname = params.lastname;
  if (params.groups !== undefined) body.groups = params.groups;
  if (params.subscriber_status !== undefined) body.subscriber_status = params.subscriber_status;
  if (params.trigger_automation !== undefined) body.trigger_automation = params.trigger_automation;

  const response = await fetch(`https://api.sender.net/v2/subscribers/${encodeURIComponent(params.email)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDER_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Sender.net API error: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  return {
    success: result.success || true,
    message: result.message || 'Success',
    data: result.data || [],
  };
}

/**
 * Get subscriber data from Sender.net
 */
export async function getSenderSubscriber(emailOrId: string): Promise<{
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  created: string;
  status: {
    email: string;
    temail?: string;
  };
  subscriber_tags?: Array<{
    id: string;
    title: string;
  }>;
}> {
  if (!SENDER_API_KEY) {
    throw new Error('Sender.net API key not configured');
  }

  const response = await fetch(`https://api.sender.net/v2/subscribers/${encodeURIComponent(emailOrId)}`, {
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

  const result = await response.json();
  return result.data;
}
