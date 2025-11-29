'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import SubscribeForm from '@/components/SubscribeForm';
import SubscribeFormInline from '@/components/SubscribeFormInline';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
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

  useEffect(() => {
    if (params.slug) {
      fetchBlog();
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <main className="classic-panel md:col-span-9 flex flex-col bg-[#02141d] min-h-[80vh]">
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <main className="classic-panel md:col-span-9 flex flex-col bg-[#02141d] min-h-[80vh]">
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <main className="classic-panel md:col-span-9 flex flex-col bg-[#02141d] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[#1a3a4a] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link href="/journal" className="hover:text-[var(--primary-mint)] transition-colors">
              <span className="text-[var(--primary-mint)] font-bold">/</span>
              <span className="text-white font-medium uppercase tracking-widest font-montserrat text-[11px]">Journal</span>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-white font-medium uppercase tracking-widest font-montserrat text-[11px]">{blog.slug}</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            A KIND WORLD IS A BETTER WORLD.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10 md:p-16 lg:p-20">
          <article className="animate-slide-up">
            {/* Header */}
            <div className="mb-8 border-b border-[#1a3a4a] pb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-gray-600 px-2 py-0.5">
                  {blog.category}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                  {formatDate(blog.publishedAt)}
                </span>
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
              <div className="relative w-full aspect-video mb-8 border border-[#1a3a4a] overflow-hidden">
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover img-classic"
                />
              </div>
            )}

            {/* Content */}
            <BlogContentWithSubscribe content={blog.content || ''} />
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
    return <div className="blog-content" dangerouslySetInnerHTML={{ __html: content || '' }} />;
  }

  // Decode HTML entities if needed (server-safe approach)
  const decodeHtml = (html: string) => {
    if (typeof window === 'undefined') {
      // Server-side: use a simple regex-based approach
      return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    }
    // Client-side: use DOM API
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
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
    <div className="blog-content">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.type === 'content' && (
            <div dangerouslySetInnerHTML={{ __html: segment.content }} />
          )}
          {segment.type === 'inline' && <SubscribeFormInline />}
          {segment.type === 'full' && <SubscribeForm />}
        </React.Fragment>
      ))}
    </div>
  );
}

