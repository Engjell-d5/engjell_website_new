'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string | null;
}

export default function Journal() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        // Sort by publishedAt, most recent first
        const sortedBlogs = (data.blogs || [])
          .filter((blog: any) => blog.published)
          .sort((a: any, b: any) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          });
        setBlogs(sortedBlogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Journal</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            A KIND WORLD IS A BETTER WORLD.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="flex items-end justify-between mb-8 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="page-label">Journal</span>
                <h2 className="text-5xl text-white mt-1">FIELD NOTES</h2>
              </div>
            </div>
            
            {loading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] flex flex-col md:flex-row gap-8 animate-pulse">
                    <div className="w-full md:w-56 h-36 bg-gray-800 shrink-0 border border-[var(--border-color)]/30"></div>
                    <div className="flex-1 py-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-16 bg-gray-800 rounded"></div>
                        <div className="h-4 w-24 bg-gray-800 rounded"></div>
                      </div>
                      <div className="h-8 w-3/4 bg-gray-800 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-800 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/journal/${blog.slug}`}
                    className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-all cursor-pointer group flex flex-col md:flex-row gap-8"
                  >
                    <div className="w-full md:w-56 h-36 bg-black shrink-0 overflow-hidden border border-[var(--border-color)]/30 relative">
                      <Image 
                        src={blog.imageUrl} 
                        alt={blog.title} 
                        fill
                        className="object-cover img-classic"
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-[var(--border-color)] px-2 py-0.5">
                          {blog.category}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                          {formatDate(blog.publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-3xl text-white font-bebas mb-3 group-hover:text-[var(--primary-mint)] transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed font-light">
                        {blog.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}

