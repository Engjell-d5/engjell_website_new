import { NextRequest, NextResponse } from 'next/server';
import { addPodcastApplication } from '@/lib/data';
import { checkSpam } from '@/lib/spam-protection';
import { forwardContactToD5, splitName } from '@/lib/d5-forward';

const FORMATS: Record<string, string> = { conversation: 'Conversation', teardown: 'Teardown' };

/** Accept "yourcompany.com" as well as full URLs, and keep it short. */
function normaliseLink(raw: string): string {
  const v = raw.trim().slice(0, 300);
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, link, format, story, formStartTime } = body;

    const verdict = checkSpam(request, body, formStartTime, 'podcast');
    if (verdict.action === 'drop') {
      console.warn('Spam detected in podcast application:', verdict.reason);
      // Answer success so bots learn nothing about the filter.
      return NextResponse.json({ success: true, message: 'Application submitted successfully!' });
    }
    if (verdict.action === 'rate-limited') {
      return NextResponse.json(
        { error: 'Too many applications from this connection. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(verdict.retryAfterSeconds) } }
      );
    }

    if (!name?.trim() || !email?.trim() || !link?.trim() || !story?.trim()) {
      return NextResponse.json({ error: 'Please fill in every field.' }, { status: 400 });
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const formatLabel = FORMATS[format];
    if (!formatLabel) {
      return NextResponse.json({ error: 'Please choose an episode format.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanLink = normaliseLink(link);
    const cleanStory = String(story).trim().slice(0, 4000);

    // The table predates the 2026-11-10 form. Rather than a hand-applied
    // migration (migrations don't run on this deploy), the new fields go into
    // the existing columns: businesses = link, industry = format, about = the
    // answer. The rest stay empty. See the note on PodcastApplication in
    // prisma/schema.prisma.
    const application = await addPodcastApplication({
      name: name.trim(),
      email: cleanEmail,
      about: cleanStory,
      businesses: cleanLink,
      industry: formatLabel,
      vision: '',
      biggestChallenge: '',
      whyPodcast: '',
    });

    // Mirror into d5, which notifies admins ("New Contact Request" with this
    // source). Best-effort: a d5 outage must not fail the applicant, and the
    // local row above is the fallback.
    await forwardContactToD5({
      ...splitName(name.trim()),
      email: cleanEmail,
      company: cleanLink,
      message: [`Format: ${formatLabel}`, `Link: ${cleanLink}`, '', cleanStory].join('\n'),
      source: 'engjellrraklli.com podcast application',
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      application: { id: application.id },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
