import Image from 'next/image';
import Link from 'next/link';
import { readingTimeMinutes } from '@/lib/reading-time';
import { formatDateShort } from '@/lib/format';

interface BlogCardBlog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content?: string;
  imageUrl: string;
  publishedAt: string | null;
}

// Shared listing card for /journal and /journal/category/[slug]. Previously
// each page had its own copy and they had already drifted, the category
// listing was missing the reading-time stamp.
export default function BlogCard({ blog, priority = false }: { blog: BlogCardBlog; priority?: boolean }) {
  const minutes = blog.content ? readingTimeMinutes(blog.content) : null;

  return (
    <article>
      <Link
        href={`/journal/${blog.slug}`}
        className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-all cursor-pointer group flex flex-col md:flex-row gap-8"
      >
        {blog.imageUrl && (
          <div className="w-full md:w-56 h-36 bg-black shrink-0 overflow-hidden border border-[var(--border-color)]/30 relative">
            <Image
              src={blog.imageUrl}
              alt={`${blog.title}, a ${blog.category} article`}
              fill
              sizes="(min-width: 768px) 224px, 100vw"
              className="object-cover img-classic"
              priority={priority}
            />
          </div>
        )}
        <div className="flex-1 py-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-bold text-[var(--text-meta)] uppercase tracking-widest border border-[var(--border-color)] px-2 py-0.5">
              {blog.category}
            </span>
            {blog.publishedAt && (
              <time
                dateTime={new Date(blog.publishedAt).toISOString()}
                className="text-[10px] text-[var(--text-meta)] uppercase tracking-widest"
              >
                {formatDateShort(blog.publishedAt)}
              </time>
            )}
            {minutes !== null && (
              <span className="text-[10px] text-[var(--text-meta)] uppercase tracking-widest">
                {minutes} min read
              </span>
            )}
          </div>
          <h2 className="text-3xl text-white font-bebas mb-3 group-hover:text-[var(--primary-mint)] transition-colors">
            {blog.title}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light">
            {blog.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
