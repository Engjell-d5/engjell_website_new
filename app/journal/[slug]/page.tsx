import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import ShareRow from '@/components/ShareRow';
import SubscribeForm from '@/components/SubscribeForm';
import PlaybookCta from '@/components/PlaybookCta';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { getBlogBySlug, getRelatedBlogs } from '@/lib/data';
import { toCategorySlug } from '@/lib/category-slug';
import { readingTimeMinutes } from '@/lib/reading-time';
import { formatDateLong, formatDateShort } from '@/lib/format';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const blog = await getBlogBySlug(resolved.slug);

  if (!blog || !blog.published) {
    return createMetadata({
      title: 'Article Not Found',
      description: 'The article you are looking for could not be found.',
      path: `/journal/${resolved.slug}`,
      noindex: true,
    });
  }

  const seo = blog.seo || {};
  const title = seo.metaTitle || blog.title;
  const description = seo.metaDescription || blog.excerpt;
  // Default to the branded share card; an admin-set seo.ogImage still wins.
  const ogImage = seo.ogImage || `/og/journal/${blog.slug}`;

  return createMetadata({
    title,
    description,
    path: `/journal/${blog.slug}`,
    image: ogImage,
    type: 'article',
    publishedTime: blog.publishedAt || undefined,
    modifiedTime: blog.updatedAt || undefined,
  });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Handle both sync and async params (Next.js 14 vs 15)
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  // Fetch blog data server-side
  const blog = await getBlogBySlug(slug);

  // If blog doesn't exist or isn't published, show 404
  if (!blog || !blog.published) {
    notFound();
  }

  // Same-category posts first, and only the columns the cards render, this
  // previously loaded every blog row (content included) to pick two.
  const relatedBlogs = await getRelatedBlogs(slug, blog.category, 2);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

  // Shared with the listing cards so the two never disagree about a post's length.
  const readingTime = blog.content ? readingTimeMinutes(blog.content) : 1;

  // BlogPosting structured data; @id ties author/publisher to the site-wide
  // Person node declared in the root layout so Google merges them.
  const articleData = {
    headline: blog.title,
    description: blog.excerpt || '',
    image: blog.imageUrl ? (blog.imageUrl.startsWith('http') ? blog.imageUrl : `${siteUrl}${blog.imageUrl}`) : `${siteUrl}/IMG_0425.JPG`,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    inLanguage: 'en',
    articleSection: blog.category || undefined,
    author: {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Engjell Rraklli',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Engjell Rraklli',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/journal/${blog.slug}`,
    },
    timeRequired: `PT${readingTime}M`,
  };

  return (
    <main id="main-content">
      <StructuredData type="BlogPosting" data={articleData} />
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Journal', url: '/journal' },
          { name: blog.title, url: `/journal/${blog.slug}` },
        ]}
      />

      {/* Header on the dark ground, the reading below on light. */}
      <section className="sec-dark">
        <div className="wrap pb-[clamp(40px,4vw,64px)] pt-[clamp(40px,6vw,88px)]">
          <div className="mx-auto max-w-[56rem]">
            <p className="label">
              <span className="slash" aria-hidden="true">/</span>
              <Link href="/journal" className="hover:text-[var(--primary-mint)]">
                Journal
              </Link>
              {blog.category && (
                <>
                  <span aria-hidden="true"> · </span>
                  <Link href={`/journal/category/${toCategorySlug(blog.category)}`} className="hover:text-[var(--primary-mint)]">
                    {blog.category}
                  </Link>
                </>
              )}
            </p>
            <h1 className="mt-5 text-balance text-[clamp(46px,5.4vw,84px)] leading-[0.94]">{blog.title}</h1>
            {blog.excerpt && <p className="lede mt-6 max-w-[40em] !text-[18px]">{blog.excerpt}</p>}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[var(--line)] pt-6">
              <div className="flex items-center gap-3.5">
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--deep)]">
                  <Image src="/IMG_0466.JPG" alt="" fill sizes="48px" className="origin-[50%_33%] scale-[2.4] object-cover" style={{ objectPosition: "50% 24%" }} />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[var(--ink)]">Engjell Rraklli</p>
                  <p className="meta">
                    {blog.publishedAt && (
                      <time dateTime={new Date(blog.publishedAt).toISOString()}>{formatDateLong(blog.publishedAt)}</time>
                    )}
                    <span className="meta-sep" aria-hidden="true"> · </span>
                    {readingTime} min read
                  </p>
                </div>
              </div>
              <ShareRow url={`${siteUrl}/journal/${blog.slug}`} title={blog.title} />
            </div>
          </div>
        </div>
      </section>

      {/* The featured image straddles the two surfaces. */}
      {blog.imageUrl && (
        <div className="bg-[linear-gradient(to_bottom,var(--rich-black)_50%,var(--platinum)_50%)]">
          <div className="wrap">
            <div className="relative mx-auto aspect-video max-w-[64rem] overflow-hidden bg-[var(--deep)]">
              <Image
                src={blog.imageUrl}
                alt={`${blog.title}, featured image`}
                fill
                priority
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}

      <section className="sec-light">
        <div className="wrap pb-[clamp(56px,6vw,96px)] pt-[clamp(48px,5vw,80px)]">
          <article className="mx-auto max-w-[44rem]">
            {blog.hook && (
              <p className="mb-10 text-balance font-bebas text-[clamp(32px,3vw,44px)] leading-[1.02] tracking-[0.02em] text-[var(--ink)]">
                {blog.hook}
              </p>
            )}

            <BlogContentWithSubscribe content={blog.content || ''} />

            {/* At the end is where a reader who finished the piece is actually
                ready for it. The playbook rather than a bare subscribe box: it
                lands the same subscriber, but gives a reason to hand over an
                address. */}
            <PlaybookCta />

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
              <p className="meta">Found it useful? Send it to someone running a service business.</p>
              <ShareRow url={`${siteUrl}/journal/${blog.slug}`} title={blog.title} />
            </div>
          </article>
        </div>
      </section>

      {relatedBlogs.length > 0 && (
        <section className="sec-dark" aria-labelledby="keep-reading">
          <div className="wrap pad-y">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionLabel as="h2" id="keep-reading">
                Keep reading
              </SectionLabel>
              <Link href="/journal" className="link-rule">
                All essays
              </Link>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {relatedBlogs.map((relatedBlog) => (
                <Link key={relatedBlog.id} href={`/journal/${relatedBlog.slug}`} className="group block">
                  <div className="relative mb-5 aspect-[2/1] overflow-hidden bg-[var(--deep)]">
                    {relatedBlog.imageUrl && (
                      <Image
                        src={relatedBlog.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="meta">
                    {relatedBlog.publishedAt && (
                      <time dateTime={new Date(relatedBlog.publishedAt).toISOString()}>{formatDateShort(relatedBlog.publishedAt)}</time>
                    )}
                    <span className="meta-sep" aria-hidden="true"> · </span>
                    {relatedBlog.category}
                  </p>
                  <h3 className="mt-1.5 text-[clamp(30px,2.6vw,38px)] leading-[1.02] tracking-[0.03em] transition-colors group-hover:text-[var(--primary-mint)]">
                    {relatedBlog.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

// Component to render blog content with subscribe snippets
// This can remain a regular component since it doesn't need client-side state
function BlogContentWithSubscribe({ content }: { content: string }) {
  if (!content || typeof content !== 'string') {
    return (
      <div 
        className="blog-content" 
        dangerouslySetInnerHTML={{ __html: content || '' }}
        style={{ background: 'transparent', color: 'var(--text-secondary)' }}
      />
    );
  }

  // Decode HTML entities if needed (server-safe approach)
  const decodeHtml = (html: string) => {
    // Use consistent regex-based approach for both server and client
    return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  };

  // Add lazy loading and async decoding to blog content images for faster page load
  const optimizeContentImages = (html: string) => {
    return html.replace(/<img(\s)/gi, '<img loading="lazy" decoding="async"$1');
  };

  let decodedContent = content;
  const needsDecoding = content.includes('&lt;');
  if (needsDecoding) {
    decodedContent = decodeHtml(content);
  }
  decodedContent = optimizeContentImages(decodedContent);

  // Define all possible placeholder formats (both regular and HTML-encoded)
  const inlinePlaceholderVariants = [
    '<div class="subscribe-snippet-placeholder-inline"></div>',
    '<div class=\'subscribe-snippet-placeholder-inline\'></div>',
    '<div class=subscribe-snippet-placeholder-inline></div>',
    '<div class="subscribe-snippet-placeholder-inline" data-subscribe-snippet="inline"></div>',
    '<div data-subscribe-snippet="inline" class="subscribe-snippet-placeholder-inline"></div>',
    '&lt;div class="subscribe-snippet-placeholder-inline"&gt;&lt;/div&gt;',
    '&lt;div class=\'subscribe-snippet-placeholder-inline\'&gt;&lt;/div&gt;',
  ];

  const fullPlaceholderVariants = [
    '<div class="subscribe-snippet-placeholder"></div>',
    '<div class=\'subscribe-snippet-placeholder\'></div>',
    '<div class=subscribe-snippet-placeholder></div>',
    '<div class="subscribe-snippet-placeholder" data-subscribe-snippet="full"></div>',
    '<div data-subscribe-snippet="full" class="subscribe-snippet-placeholder"></div>',
    '&lt;div class="subscribe-snippet-placeholder"&gt;&lt;/div&gt;',
    '&lt;div class=\'subscribe-snippet-placeholder\'&gt;&lt;/div&gt;',
  ];

  // Check both original content and decoded content for placeholders
  const contentToSearch = needsDecoding ? content : decodedContent;

  // Find which inline placeholder format is used (check in original first if encoded)
  let inlinePlaceholder: string | null = null;
  for (const variant of inlinePlaceholderVariants) {
    const searchContent = variant.includes('&lt;') ? contentToSearch : decodedContent;
    if (searchContent.includes(variant)) {
      inlinePlaceholder = variant.includes('&lt;') ? variant : variant;
      break;
    }
  }

  // Find which full placeholder format is used
  let fullPlaceholder: string | null = null;
  for (const variant of fullPlaceholderVariants) {
    const searchContent = variant.includes('&lt;') ? contentToSearch : decodedContent;
    if (searchContent.includes(variant)) {
      fullPlaceholder = variant.includes('&lt;') ? variant : variant;
      break;
    }
  }

  // If no placeholders found, render normally
  if (!inlinePlaceholder && !fullPlaceholder) {
    return <div className="blog-content" dangerouslySetInnerHTML={{ __html: decodedContent }} />;
  }

  // Create an array to store content segments and form types
  type Segment = { type: 'content' | 'inline' | 'full'; content: string };
  const segments: Segment[] = [];

  // Replace placeholders with unique markers to split on
  // Always use decoded content for replacements
  let workingContent = decodedContent;

  const inlineMarker = '___SUBSCRIBE_INLINE_MARKER___';
  const fullMarker = '___SUBSCRIBE_FULL_MARKER___';

  // Escape special regex characters in placeholders
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Normalize placeholders to decoded versions for replacement
  const normalizedInlinePlaceholder = inlinePlaceholder?.includes('&lt;')
    ? '<div class="subscribe-snippet-placeholder-inline"></div>'
    : inlinePlaceholder;
  const normalizedFullPlaceholder = fullPlaceholder?.includes('&lt;')
    ? '<div class="subscribe-snippet-placeholder"></div>'
    : fullPlaceholder;

  if (normalizedInlinePlaceholder) {
    workingContent = workingContent.replace(new RegExp(escapeRegex(normalizedInlinePlaceholder), 'g'), inlineMarker);
  }

  if (normalizedFullPlaceholder) {
    workingContent = workingContent.replace(new RegExp(escapeRegex(normalizedFullPlaceholder), 'g'), fullMarker);
  }

  // Split by both markers, keeping the markers in the result
  const parts = workingContent.split(/(___SUBSCRIBE_INLINE_MARKER___|___SUBSCRIBE_FULL_MARKER___)/);

  // Build segments array
  for (const part of parts) {
    if (part === inlineMarker) {
      segments.push({ type: 'inline', content: '' });
    } else if (part === fullMarker) {
      segments.push({ type: 'full', content: '' });
    } else if (part) {
      // Only add non-empty content segments
      segments.push({ type: 'content', content: part });
    }
  }

  // Render segments
  return (
    <div className="blog-content" style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.type === 'content' && (
            <div 
              dangerouslySetInnerHTML={{ __html: segment.content }}
              style={{ background: 'transparent', color: 'inherit' }}
            />
          )}
          {segment.type === 'inline' && <SubscribeForm variant="inline" />}
          {segment.type === 'full' && <SubscribeForm />}
        </React.Fragment>
      ))}
    </div>
  );
}
