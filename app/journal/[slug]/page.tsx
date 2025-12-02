'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PenTool } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import SubscribeForm from '@/components/SubscribeForm';
import SubscribeFormInline from '@/components/SubscribeFormInline';
import StructuredData from '@/components/StructuredData';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  hook?: string | null;
  content: string;
  imageUrl: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
}

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loadingRelatedBlogs, setLoadingRelatedBlogs] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (params.slug) {
      fetchBlog();
      fetchRelatedBlogs();
    }
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/slug/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setBlog(data.blog);
      } else if (response.status === 404) {
        router.push('/journal');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      router.push('/journal');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        // Get current blog slug from params
        const currentSlug = params.slug as string;
        
        // Filter published blogs, exclude current blog, and sort by publishedAt, most recent first
        const publishedBlogs = (data.blogs || [])
          .filter((blog: Blog) => blog.published && blog.slug !== currentSlug)
          .sort((a: Blog, b: Blog) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          });
        
        // Take first 2
        setRelatedBlogs(publishedBlogs.slice(0, 2));
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    } finally {
      setLoadingRelatedBlogs(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!mounted || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
          <div className="p-10 text-center">
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
        <Sidebar />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
          <div className="p-10 text-center">
            <p className="text-gray-400 mb-4">Blog post not found</p>
            <Link href="/journal" className="text-[var(--primary-mint)] hover:underline">
              Back to Journal
            </Link>
          </div>
        </main>
        <Sidebar />
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';
  
  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(words / 200);
  };

  const readingTime = blog.content ? calculateReadingTime(blog.content) : 5;

  // Article structured data
  const articleData = {
    headline: blog.title,
    description: blog.excerpt || '',
    image: blog.imageUrl ? (blog.imageUrl.startsWith('http') ? blog.imageUrl : `${siteUrl}${blog.imageUrl}`) : `${siteUrl}/IMG_0425.JPG`,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Person',
      name: 'Engjell Rraklli',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <StructuredData type="Article" data={articleData} />
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh] order-2 md:order-1">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link href="/journal" className="hover:text-[var(--primary-mint)] transition-colors">
              <span className="text-[var(--primary-mint)] font-bold">/</span>
              <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Journal</span>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">{blog.slug}</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            A KIND WORLD IS A BETTER WORLD.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10 md:p-16 lg:p-20">
          <article className="animate-slide-up">
            {/* Header */}
            <div className="mb-8 border-b border-[var(--border-color)] pb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-[var(--border-color)] px-2 py-0.5">
                  {blog.category}
                </span>
                {blog.publishedAt && (
                  <time 
                    dateTime={new Date(blog.publishedAt).toISOString()}
                    className="text-[10px] text-gray-500 uppercase tracking-widest"
                  >
                  {formatDate(blog.publishedAt)}
                  </time>
                )}
              </div>
              <h1 className="text-5xl md:text-6xl text-white font-bebas tracking-wide mb-4">
                {blog.title}
              </h1>
              {blog.excerpt && (
                <p className="text-lg text-gray-300 leading-relaxed font-light">
                  {blog.excerpt}
                </p>
              )}
            </div>

            {/* Featured Image */}
            {blog.imageUrl && (
              <div className="relative w-full aspect-video mb-8 border border-[var(--border-color)] overflow-hidden">
                <Image
                  src={blog.imageUrl}
                  alt={`${blog.title} - Featured image`}
                  fill
                  className="object-cover img-classic"
                />
              </div>
            )}

            {/* Hook Sentence */}
            {blog.hook && (
              <div className="mb-8">
                <p className="text-xl md:text-2xl text-white font-bold leading-relaxed italic border-l-4 border-[var(--primary-mint)] pl-6">
                  {blog.hook}
                </p>
              </div>
            )}

            {/* Content */}
            <BlogContentWithSubscribe content={blog.content || ''} />

            {/* Related Articles - Only render after mount to avoid hydration issues */}
            {mounted && relatedBlogs.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Keep reading</span>
                  <PenTool className="w-4 h-4 text-gray-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBlogs.map((relatedBlog) => (
                    <Link
                      key={relatedBlog.id}
                      href={`/journal/${relatedBlog.slug}`}
                      className="group block"
                    >
                      <div className="aspect-[2/1] bg-black border border-[var(--border-color)] mb-3 overflow-hidden relative group-hover:border-[var(--primary-mint)] transition-colors">
                        <Image 
                          src={relatedBlog.imageUrl} 
                          alt={relatedBlog.title} 
                          fill
                          className="object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <p className="text-sm text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2 mb-1">
                        {relatedBlog.title}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {relatedBlog.publishedAt && (
                          <time dateTime={new Date(relatedBlog.publishedAt).toISOString()}>
                            {formatDateShort(relatedBlog.publishedAt)}
                          </time>
                        )} • {relatedBlog.category}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}

// Component to render blog content with subscribe snippets
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

  let decodedContent = content;
  const needsDecoding = content.includes('&lt;');
  if (needsDecoding) {
    decodedContent = decodeHtml(content);
  }

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
          {segment.type === 'inline' && <SubscribeFormInline />}
          {segment.type === 'full' && <SubscribeForm />}
        </React.Fragment>
      ))}
    </div>
  );
}

