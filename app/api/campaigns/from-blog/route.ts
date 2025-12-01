import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBlog } from '@/lib/data';
import { createCampaign } from '@/lib/data';
import { createSenderCampaign } from '@/lib/sender-campaigns';

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
    const { blogId, subject, from, preheader, replyTo, createInSender, groups } = body;

    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    // Get blog post
    const blog = await getBlog(blogId);
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Convert blog content to HTML email format
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';
    const journalUrl = `${siteUrl}/journal`; // Link to blog page, not specific article
    
    // Clean blog content: remove subscribe snippet placeholders
    let cleanedContent = blog.content || '';
    
    // Remove all subscribe snippet placeholders (both inline and full, regular and HTML-encoded)
    const subscribePlaceholderPatterns = [
      // Inline placeholders
      /<div\s+class=["']subscribe-snippet-placeholder-inline["'][^>]*><\/div>/gi,
      /<div\s+data-subscribe-snippet=["']inline["'][^>]*><\/div>/gi,
      /&lt;div\s+class=["']subscribe-snippet-placeholder-inline["'][^&]*&gt;&lt;\/div&gt;/gi,
      // Full placeholders
      /<div\s+class=["']subscribe-snippet-placeholder["'][^>]*><\/div>/gi,
      /<div\s+data-subscribe-snippet=["']full["'][^>]*><\/div>/gi,
      /&lt;div\s+class=["']subscribe-snippet-placeholder["'][^&]*&gt;&lt;\/div&gt;/gi,
      // Markers used in BlogContentWithSubscribe
      /___SUBSCRIBE_INLINE_MARKER___/g,
      /___SUBSCRIBE_FULL_MARKER___/g,
    ];
    
    subscribePlaceholderPatterns.forEach(pattern => {
      cleanedContent = cleanedContent.replace(pattern, '');
    });

    // Convert all relative image URLs to absolute URLs
    // Match img tags with src attributes that are relative URLs
    // This handles various formats: src="...", src='...', src=...
    cleanedContent = cleanedContent.replace(
      /<img([^>]*?)\s+src=(["']?)([^"'\s>]+)\2([^>]*)>/gi,
      (match, before, quote, src, after) => {
        // If src is already absolute (starts with http:// or https://), keep it as is
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
          return match;
        }
        
        // Convert relative URL to absolute
        // Handle both /api/uploads/... and api/uploads/... (with or without leading slash)
        let absoluteSrc = src;
        if (src.startsWith('/')) {
          absoluteSrc = `${siteUrl}${src}`;
        } else {
          absoluteSrc = `${siteUrl}/${src}`;
        }
        
        // Use the same quote style as original, or default to double quotes
        const quoteChar = quote || '"';
        return `<img${before} src=${quoteChar}${absoluteSrc}${quoteChar}${after}>`;
      }
    );
    
    // Create HTML email content from blog post
    // Note: Title and excerpt are NOT included in the body - they're in subject and preheader
    // Button uses brand colors: mint background (#23C18C), black text, no border-radius
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${blog.imageUrl ? `<img src="${blog.imageUrl.startsWith('http') ? blog.imageUrl : `${siteUrl}${blog.imageUrl}`}" alt="${blog.title}" style="max-width: 100%; height: auto; margin-bottom: 20px;">` : ''}
          <div style="margin: 30px 0;">
            ${cleanedContent}
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <a href="${journalUrl}" style="display: inline-block; background-color: #23C18C; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Check Out Other Articles</a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
            <a href="{{unsubscribe_link}}" style="color: #666; text-decoration: underline;">{{unsubscribe_text}}</a>
          </div>
        </body>
      </html>
    `;

    let senderCampaignId: string | undefined;

    // Use blog excerpt as preheader (Email Preview text) if not provided
    const campaignPreheader = preheader || blog.excerpt || '';
    
    // Create campaign in Sender.net if requested
    if (createInSender) {
      try {
        const senderCampaign = await createSenderCampaign({
          title: blog.title,
          subject: subject || blog.title,
          from: from || 'Engjell Rraklli',
          preheader: campaignPreheader,
          replyTo: replyTo || process.env.SENDER_REPLY_TO || '',
          contentType: 'html',
          content: emailContent,
          groups: groups && groups.length > 0 ? groups : [process.env.SENDER_LIST_ID || ''],
        });
        senderCampaignId = senderCampaign.id;
      } catch (error: any) {
        console.error('Error creating campaign in Sender.net:', error);
        return NextResponse.json(
          { error: `Failed to create campaign in Sender.net: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Create campaign in local database
    const campaign = await createCampaign({
      senderCampaignId,
      blogId: blog.id,
      title: blog.title,
      subject: subject || blog.title,
      from: from || 'Engjell Rraklli',
      preheader: campaignPreheader,
      replyTo: replyTo || process.env.SENDER_REPLY_TO || '',
      contentType: 'html',
      content: emailContent,
      groups: groups && groups.length > 0 ? groups : [process.env.SENDER_LIST_ID || ''],
      status: 'DRAFT',
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign from blog' },
      { status: 500 }
    );
  }
}
