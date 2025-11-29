import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, markSubscriberSynced } from '@/lib/data';

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
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add subscriber to local database
    const subscriber = addSubscriber(email);

    // Try to sync to Sender.net (non-blocking)
    try {
      const synced = await addToSenderNet(email);
      if (synced) {
        markSubscriberSynced(email);
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to sync to Sender.net:', error);
    }

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

