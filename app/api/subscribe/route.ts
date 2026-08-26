import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, markSubscriberSynced } from '@/lib/data';
import { checkSpam } from '@/lib/spam-protection';
import { syncSubscriberToCrm } from '@/lib/crm-sync';
import { canonicalizeEmail, looksLikeBotAddress } from '@/lib/email-normalize';

/**
 * Since the d5 cutover the audience lives in d5: this forward records the
 * subscriber there with consent evidence (timestamp, source, IP), and d5
 * pushes to the Sender.net group itself. The site no longer holds Sender
 * credentials for subscribing; one writer owns the list.
 */
const D5_API_URL = (process.env.D5_API_URL || 'https://app.division5.co/api/v1').replace(/\/+$/, '');
const D5_API_KEY = process.env.D5_API_KEY || '';
const D5_COMPANY_ID = process.env.D5_COMPANY_ID || 'cc640cdd-4a92-412b-ba9a-4ad48ae6e9cf';

async function addToD5Newsletter(email: string, ip: string | undefined): Promise<boolean> {
  if (!D5_API_KEY) {
    console.warn('D5_API_KEY not configured; subscriber stays local only');
    return false;
  }
  try {
    const response = await fetch(`${D5_API_URL}/content/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': D5_API_KEY,
        ...(ip ? { 'X-Forwarded-For': ip } : {}),
      },
      body: JSON.stringify({
        companyId: D5_COMPANY_ID,
        email,
        source: 'engjellrraklli.com newsletter form',
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error('d5 newsletter subscribe answered', response.status);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error('Error forwarding subscriber to d5:', error?.message || error);
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
      const clientIp = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || undefined;
      const synced = await addToD5Newsletter(canonicalEmail, clientIp);
      if (synced) {
        await markSubscriberSynced(canonicalEmail);
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to forward subscriber to d5:', error);
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

