import 'server-only';
import { getUnsyncedSubscribers, markSubscriberSynced, getSubscribers, addSubscriber, updateSubscriber } from './data';

const SENDER_API_KEY = process.env.SENDER_API_KEY || '';
const SENDER_LIST_ID = process.env.SENDER_LIST_ID || '';

interface SenderSubscriber {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  created: string;
  status: {
    email: string; // 'active' | 'unsubscribed' | 'bounced'
    temail?: string;
  };
  bounced_at?: string | null;
  unsubscribed_at?: string | null;
}

interface SenderResponse {
  data: SenderSubscriber[];
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Map Sender.net status to local status
 * unsubscribed, bounced -> churned
 * active -> active
 */
function mapSenderStatusToLocal(senderStatus: string): 'active' | 'churned' {
  if (senderStatus === 'active') {
    return 'active';
  }
  // unsubscribed, bounced, or any other status -> churned
  return 'churned';
}

/**
 * Add a subscriber to Sender.net
 */
async function addToSenderNet(email: string): Promise<boolean> {
  if (!SENDER_API_KEY || !SENDER_LIST_ID) {
    console.warn('Sender.net API key or List ID not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.sender.net/v2/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDER_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        list_ids: [SENDER_LIST_ID],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Sender.net API error:', errorData);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error adding subscriber to Sender.net:', error.message || error);
    return false;
  }
}

/**
 * Fetch all subscribers from Sender.net (with pagination)
 */
async function fetchAllSenderSubscribers(): Promise<SenderSubscriber[]> {
  if (!SENDER_API_KEY) {
    console.warn('Sender.net API key not configured');
    return [];
  }

  const allSubscribers: SenderSubscriber[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetch(
        `https://api.sender.net/v2/subscribers?page=${page}&per_page=100`,
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
        console.error('Sender.net API error:', errorData);
        break;
      }

      const data: SenderResponse = await response.json();
      
      if (data.data && data.data.length > 0) {
        allSubscribers.push(...data.data);
      }

      // Check if there are more pages
      if (data.meta) {
        hasMore = page < data.meta.last_page;
        page++;
      } else if (data.links?.next) {
        hasMore = !!data.links.next;
        page++;
      } else {
        hasMore = false;
      }

      // Small delay to avoid rate limiting
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error: any) {
      console.error(`Error fetching page ${page} from Sender.net:`, error.message || error);
      hasMore = false;
    }
  }

  return allSubscribers;
}

/**
 * Sync subscribers bidirectionally:
 * 1. Push local unsynced subscribers to Sender.net
 * 2. Pull subscribers from Sender.net and update local database
 */
export async function syncSubscribersWithSender(): Promise<{
  success: boolean;
  pushed: { synced: number; failed: number };
  pulled: { updated: number; created: number; errors: number };
  errors: string[];
}> {
  const errors: string[] = [];
  let pushedSynced = 0;
  let pushedFailed = 0;
  let pulledUpdated = 0;
  let pulledCreated = 0;
  let pulledErrors = 0;

  // Step 1: Push local unsynced subscribers to Sender.net
  const unsyncedSubscribers = await getUnsyncedSubscribers();
  const hadUnsyncedToPush = unsyncedSubscribers.length > 0;
  
  try {
    for (const subscriber of unsyncedSubscribers) {
      try {
        const synced = await addToSenderNet(subscriber.email);
        if (synced) {
          await markSubscriberSynced(subscriber.email);
          pushedSynced++;
        } else {
          pushedFailed++;
          errors.push(`Failed to sync ${subscriber.email} to Sender.net`);
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        pushedFailed++;
        errors.push(`Error syncing ${subscriber.email}: ${error.message}`);
      }
    }
  } catch (error: any) {
    errors.push(`Error in push sync: ${error.message}`);
  }

  // Step 2: Pull subscribers from Sender.net and update local database
  // Only pull if there were no unsynced subscribers to push (i.e., only retrieve if nothing to send)
  if (!hadUnsyncedToPush) {
    try {
      const senderSubscribers = await fetchAllSenderSubscribers();
      const localSubscribers = await getSubscribers();
      const localSubscribersMap = new Map(localSubscribers.map(s => [s.email.toLowerCase(), s]));

      for (const senderSub of senderSubscribers) {
        try {
          const email = senderSub.email.toLowerCase();
          const localStatus = mapSenderStatusToLocal(senderSub.status.email);
          const localSub = localSubscribersMap.get(email);

          if (localSub) {
            // Update existing subscriber
            const needsUpdate = 
              localSub.status !== localStatus || 
              !localSub.syncedToSender;

            if (needsUpdate) {
              await updateSubscriber(localSub.id, {
                status: localStatus,
              });
              
              // Mark as synced if not already
              if (!localSub.syncedToSender) {
                await markSubscriberSynced(email);
              }
              
              pulledUpdated++;
            }
          } else {
            // Create new subscriber (subscribed via Sender.net directly)
            try {
              await addSubscriber(email, localStatus);
              await markSubscriberSynced(email);
              pulledCreated++;
            } catch (error: any) {
              // Email might already exist (race condition), try to update instead
              if (error.message?.includes('already subscribed')) {
                const existing = localSubscribers.find(s => s.email.toLowerCase() === email);
                if (existing) {
                  await updateSubscriber(existing.id, { status: localStatus });
                  await markSubscriberSynced(email);
                  pulledUpdated++;
                } else {
                  pulledErrors++;
                  errors.push(`Failed to create subscriber ${email}: ${error.message}`);
                }
              } else {
                pulledErrors++;
                errors.push(`Failed to create subscriber ${email}: ${error.message}`);
              }
            }
          }
        } catch (error: any) {
          pulledErrors++;
          errors.push(`Error processing ${senderSub.email}: ${error.message}`);
        }
      }
    } catch (error: any) {
      errors.push(`Error in pull sync: ${error.message}`);
    }
  }

  return {
    success: errors.length === 0 || (pushedSynced > 0 || pulledUpdated > 0 || pulledCreated > 0),
    pushed: {
      synced: pushedSynced,
      failed: pushedFailed,
    },
    pulled: {
      updated: pulledUpdated,
      created: pulledCreated,
      errors: pulledErrors,
    },
    errors: errors.slice(0, 20), // Limit to first 20 errors
  };
}
