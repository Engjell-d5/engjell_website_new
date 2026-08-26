import { NextRequest, NextResponse } from 'next/server';
import { addPodcastApplication } from '@/lib/data';
import { checkSpam } from '@/lib/spam-protection';
import { forwardContactToD5, splitName } from '@/lib/d5-forward';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, about, businesses, industry, vision, biggestChallenge, whyPodcast, website, formStartTime } = body;

    const verdict = checkSpam(request, body, formStartTime, 'podcast');
    if (verdict.action === 'drop') {
      console.warn('Spam detected in podcast application:', verdict.reason);
      // Answer success so bots learn nothing about the filter.
      return NextResponse.json({
        success: true,
        message: 'Application submitted successfully!'
      });
    }
    if (verdict.action === 'rate-limited') {
      return NextResponse.json(
        { error: 'Too many applications from this connection. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(verdict.retryAfterSeconds) } }
      );
    }

    // Validate required fields
    if (!name || !email || !about || !businesses || !industry || !vision || !biggestChallenge || !whyPodcast) {
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

    // Add application to database
    const application = await addPodcastApplication({
      name,
      email: email.toLowerCase(),
      about,
      businesses,
      industry,
      vision,
      biggestChallenge,
      whyPodcast,
    });

    // Mirror into d5, where the recruitment-adjacent inbox lives. The
    // application fields become a structured message so the d5 queue
    // reads like the form did. Best-effort by design: a d5 outage must
    // not fail the applicant, and the local row above is the fallback.
    await forwardContactToD5({
      ...splitName(name),
      email: email.toLowerCase(),
      message: [
        `About: ${about}`,
        `Businesses: ${businesses}`,
        `Industry: ${industry}`,
        `Vision: ${vision}`,
        `Biggest challenge: ${biggestChallenge}`,
        `Why the podcast: ${whyPodcast}`,
      ].join('\n\n'),
      source: 'engjellrraklli.com podcast application',
    });

    return NextResponse.json({ 
      success: true,
      message: 'Application submitted successfully!',
      application: {
        id: application.id,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}

