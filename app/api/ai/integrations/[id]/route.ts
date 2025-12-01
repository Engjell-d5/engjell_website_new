import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { name, provider, apiKey, model, isActive } = await request.json();
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (provider !== undefined) {
      const validProviders = ['openai', 'google', 'anthropic'];
      if (!validProviders.includes(provider)) {
        return NextResponse.json(
          { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.provider = provider;
    }
    // Only update API key if it's provided and not empty (to allow keeping existing key)
    if (apiKey !== undefined && apiKey !== null && apiKey.trim() !== '') {
      updateData.apiKey = apiKey.trim(); // TODO: Encrypt
    }
    if (model !== undefined) updateData.model = model || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const integration = await prisma.aiIntegration.update({
      where: { id: params.id },
      data: updateData,
    });
    
    return NextResponse.json({ 
      integration: {
        id: integration.id,
        name: integration.name,
        provider: integration.provider,
        model: integration.model,
        isActive: integration.isActive,
        apiKeyPreview: `****${integration.apiKey.slice(-4)}`,
      }
    });
  } catch (error) {
    console.error('Error updating AI integration:', error);
    return NextResponse.json(
      { error: 'Failed to update AI integration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await prisma.aiIntegration.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI integration:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI integration' },
      { status: 500 }
    );
  }
}
