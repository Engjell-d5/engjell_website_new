import { NextRequest, NextResponse } from 'next/server';
import { addContactMessage, getContactMessages, markContactMessageAsRead, deleteContactMessage, ContactMessage } from '@/lib/data';
import { checkSpam } from '@/lib/spam-protection';
import { canonicalizeEmail, looksLikeBotAddress } from '@/lib/email-normalize';
import { forwardContactToD5, splitName } from '@/lib/d5-forward';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, website, formStartTime, kind, company } = body;

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

    // checkSpam covers the honeypot, submission timing and per-IP rate limits.
    // The dot-trick bot walks through all three: it fills the form slowly, never
    // touches hidden fields, and stays under the rate ceiling. The shape of the
    // address is the only signal left, and it is the one that catches it.
    if (looksLikeBotAddress(email)) {
      console.warn('Bot-shaped address rejected on contact form:', email);
      // Answer success, for the same reason checkSpam does above.
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully!'
      });
    }

    // Add message to database
    const contactMessage = await addContactMessage({
      name: name.trim(),
      email: canonicalizeEmail(email),
      message: message.trim(),
    });

    // Surface it in the D5 app, where the team actually works. Fire and
    // forget: the local row above is the durable copy, and this runs only
    // for submissions that passed every spam check in this route. The
    // invest form marks itself with kind so the app can tell a pitch from
    // a hello.
    void forwardContactToD5({
      ...splitName(name),
      email: canonicalizeEmail(email),
      ...(typeof company === 'string' && company.trim() ? { company: company.trim() } : {}),
      message: message.trim(),
      source: kind === 'invest' ? 'engjellrraklli.com invest' : 'engjellrraklli.com contact',
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
