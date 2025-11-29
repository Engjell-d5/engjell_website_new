import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getConfig, saveConfig, Config } from '@/lib/data';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const config = getConfig();
    // Don't expose API key in response
    const { youtubeApiKey, ...safeConfig } = config;
    return NextResponse.json({ config: safeConfig });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { cronSchedule } = await request.json();
    const config = getConfig();
    
    if (cronSchedule) {
      config.cronSchedule = cronSchedule;
      saveConfig(config);
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

