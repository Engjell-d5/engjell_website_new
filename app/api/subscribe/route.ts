import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, markSubscriberSynced } from '@/lib/data';
import { checkSpam } from '@/lib/spam-protection';
import { syncSubscriberToCrm } from '@/lib/crm-sync';
import { canonicalizeEmail, looksLikeBotAddress } from '@/lib/email-normalize';

const SENDER_API_KEY = process.env.SENDER_API_KEY || '';
const SENDER_LIST_ID = process.env.SENDER_LIST_ID || '';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, website, formStartTime } = body;

    const verdict = checkSpam(request, body, formStartTime, 'subscribe');
    if (verdict.action === 'drop') {
      console.warn('Spam detected in subscribe form:', verdict.reason);
      // Answer success so bots learn nothing about the filter.
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed!'
      });
    }
    if (verdict.action === 'rate-limited') {
      return NextResponse.json(
        { error: 'Too many attempts from this connection. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(verdict.retryAfterSeconds) } }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // A signup bot exploiting gmail's dot handling put 35 disposable aliases on
    // this list, just under half of every subscriber ever collected. The
    // honeypot and timing check never saw it, because it was neither fast nor
    // touching hidden fields. Answer success so it learns nothing, exactly as
    // the spam path above does.
    if (looksLikeBotAddress(email)) {
      console.warn('Bot-shaped address rejected at subscribe');
      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed!',
      });
    }

    // Store the mailbox the address actually reaches, so the unique constraint
    // stops one gmail account from occupying many rows. Dots are ignored by
    // gmail, so delivery is unaffected.
    const canonicalEmail = canonicalizeEmail(email);

    // Add subscriber to local database
    const subscriber = await addSubscriber(canonicalEmail);

    // Everything downstream uses the canonical address too. markSubscriberSynced
    // looks the row up by email, so passing the raw form here would silently
    // fail to find the row that was just written, and Sender.net and the CRM
    // would each hold a different spelling of the same mailbox.
    try {
      const synced = await addToSenderNet(canonicalEmail);
      if (synced) {
        await markSubscriberSynced(canonicalEmail);
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to sync to Sender.net:', error);
    }

    // Mirror into the D5 CRM. No-ops until D5_SUBSCRIBER_SYNC_PATH is set, and
    // swallows its own failures, so neither a missing endpoint nor a downstream
    // outage can turn a successful signup into an error for the reader.
    await syncSubscriberToCrm(canonicalEmail);

    return NextResponse.json({ 
      success: true,
      message: 'Successfully subscribed!',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
      }
    });
  } catch (error: any) {
    if (error.message === 'Email already subscribed') {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

