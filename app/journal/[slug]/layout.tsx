import { getBlogs } from '@/lib/data';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const blogs = getBlogs();
    const blog = blogs.find((b: any) => b.slug === params.slug && b.published);

    if (!blog) {
      return createMetadata({
        title: 'Blog Post Not Found',
        path: `/journal/${params.slug}`,
      });
    }

    const title = blog.seo?.metaTitle || blog.seo?.ogTitle || blog.title;
    const description = blog.seo?.metaDescription || blog.seo?.ogDescription || blog.excerpt || '';
    const image = blog.seo?.ogImage || blog.imageUrl || '';

    return createMetadata({
      title,
      description,
      path: `/journal/${blog.slug}`,
      image,
      type: 'article',
      publishedTime: blog.publishedAt || undefined,
      modifiedTime: blog.updatedAt || undefined,
    });
  } catch (error) {
    return createMetadata({
      title: 'Blog Post',
      path: `/journal/${params.slug}`,
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
