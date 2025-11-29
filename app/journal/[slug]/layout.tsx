import { getBlogs } from '@/lib/data';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  try {
    // Handle both sync and async params (Next.js 14 vs 15)
    const resolvedParams = await Promise.resolve(params);
    const blogs = await getBlogs();
    const blog = blogs.find((b: any) => b.slug === resolvedParams.slug && b.published);

    if (!blog) {
      return createMetadata({
        title: 'Blog Post Not Found',
        path: `/journal/${resolvedParams.slug}`,
      });
    }

    const title = blog.seo?.metaTitle || blog.seo?.ogTitle || blog.title;
    const description = blog.seo?.metaDescription || blog.seo?.ogDescription || blog.excerpt || '';
    const image = blog.seo?.ogImage || blog.imageUrl || '';
    
    // Parse keywords from blog SEO or use category-based keywords
    let keywords: string[] | undefined;
    if (blog.seo?.keywords) {
      keywords = blog.seo.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    } else if (blog.category) {
      keywords = [blog.category, 'Tech Blog', 'Entrepreneurship'];
    }

    return createMetadata({
      title,
      description,
      path: `/journal/${blog.slug}`,
      image,
      type: 'article',
      publishedTime: blog.publishedAt || undefined,
      modifiedTime: blog.updatedAt || undefined,
      keywords,
    });
  } catch (error) {
    const resolvedParams = await Promise.resolve(params);
    return createMetadata({
      title: 'Blog Post',
      path: `/journal/${resolvedParams.slug}`,
    });
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
