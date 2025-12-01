import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await prisma.googleConnection.findFirst({
      where: { isActive: true },
    });

    if (!connection) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      email: connection.email,
      connectedAt: connection.connectedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching Google connection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connection status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await prisma.googleConnection.findFirst({
      where: { isActive: true },
    });

    if (connection) {
      await prisma.googleConnection.update({
        where: { id: connection.id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting Google account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
