import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCampaign, updateCampaign } from '@/lib/data';
import { getBlog } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { blogId, campaignId } = body;

    if (!blogId || !campaignId) {
      return NextResponse.json(
        { error: 'Blog ID and Campaign ID are required' },
        { status: 400 }
      );
    }

    // Check if blog exists
    const blog = await getBlog(blogId);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Check if campaign exists
    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if blog is already linked to a campaign
    const existingCampaign = await prisma.campaign.findFirst({
      where: { blogId: blogId },
    });

    if (existingCampaign) {
      return NextResponse.json(
        { error: `This blog is already linked to campaign: ${existingCampaign.subject || existingCampaign.id}` },
        { status: 400 }
      );
    }

    // Check if campaign is already linked to a blog
    if (campaign.blogId) {
      return NextResponse.json(
        { error: 'This campaign is already linked to a blog' },
        { status: 400 }
      );
    }

    // Link blog to campaign
    const updatedCampaign = await updateCampaign(campaignId, {
      blogId: blogId,
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: 'Blog linked to campaign successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to link blog to campaign' },
      { status: 500 }
    );
  }
}
