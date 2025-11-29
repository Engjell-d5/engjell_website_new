import { NextRequest, NextResponse } from 'next/server';
import { addPodcastApplication } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const { name, email, about, businesses, industry, vision, biggestChallenge, whyPodcast } = await request.json();

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
    const application = addPodcastApplication({
      name,
      email: email.toLowerCase(),
      about,
      businesses,
      industry,
      vision,
      biggestChallenge,
      whyPodcast,
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

