import { NextRequest, NextResponse } from 'next/server';
import { addContactMessage, getContactMessages, markContactMessageAsRead, deleteContactMessage, ContactMessage } from '@/lib/data';
import { getAuthUser } from '@/lib/auth';
import { checkSpam } from '@/lib/spam-protection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, website, formStartTime } = body;

    const verdict = checkSpam(request, body, formStartTime, 'contact');
    if (verdict.action === 'drop') {
      console.warn('Spam detected in contact form:', verdict.reason);
      // Answer success so bots learn nothing about the filter.
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully!'
      });
    }
    if (verdict.action === 'rate-limited') {
      // A real person submitting too fast must be told, not silently dropped.
      return NextResponse.json(
        { error: 'Too many messages from this connection. Please try again shortly, or email info@engjellrraklli.com directly.' },
        { status: 429, headers: { 'Retry-After': String(verdict.retryAfterSeconds) } }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add message to database
    const contactMessage = await addContactMessage({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!',
      contactMessage: {
        id: contactMessage.id,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const messages = await getContactMessages();
    // Sort by submittedAt, most recent first
    const sortedMessages = [...messages].sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
    return NextResponse.json({ messages: sortedMessages });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authUser = getAuthUser(request);
  
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id, read } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    if (read !== undefined) {
      if (read) {
        markContactMessageAsRead(id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authUser = getAuthUser(request);
  
  if (!authUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    await deleteContactMessage(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete message' },
      { status: 500 }
    );
  }
}
