import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const integrations = await prisma.aiIntegration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Don't expose full API keys in response
    const safeIntegrations = integrations.map(integration => ({
      id: integration.id,
      name: integration.name,
      provider: integration.provider,
      model: integration.model,
      isActive: integration.isActive,
      createdAt: integration.createdAt.toISOString(),
      updatedAt: integration.updatedAt.toISOString(),
      // Only show last 4 characters of API key for verification
      apiKeyPreview: integration.apiKey.length > 4 
        ? `****${integration.apiKey.slice(-4)}` 
        : '****',
    }));
    
    return NextResponse.json({ integrations: safeIntegrations });
  } catch (error) {
    console.error('Error fetching AI integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI integrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { name, provider, apiKey, model, isActive } = await request.json();
    
    if (!name || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'Name, provider, and API key are required' },
        { status: 400 }
      );
    }
    
    // Validate provider
    const validProviders = ['openai', 'google', 'anthropic'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Note: In production, encrypt the API key before storing
    const integration = await prisma.aiIntegration.create({
      data: {
        name,
        provider,
        apiKey, // TODO: Encrypt this
        model: model || null,
        isActive: isActive !== undefined ? isActive : true,
      },
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
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI integration:', error);
    return NextResponse.json(
      { error: 'Failed to create AI integration' },
      { status: 500 }
    );
  }
}
