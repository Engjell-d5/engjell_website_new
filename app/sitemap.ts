import { MetadataRoute } from 'next';
import { getBlogs } from '@/lib/data';
import { toCategorySlug } from '@/lib/category-slug';

// The Docker build runs without DATABASE_URL, so the build-time sitemap has no
// blog routes. Revalidate hourly so it regenerates at runtime with DB access.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

  // Static routes — omit lastModified so the timestamp doesn't churn on every build.
  // For /journal and /media we derive lastModified from real content below.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ventures`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic blog routes — derive lastModified from real content
  // Skip database queries during build if DATABASE_URL is not available
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set during build, skipping dynamic blog routes in sitemap');
    return [
      ...staticRoutes,
      { url: `${baseUrl}/journal`, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/media`, changeFrequency: 'weekly', priority: 0.8 },
    ];
  }

  try {
    const blogs = await getBlogs();
    const publishedBlogs = blogs.filter((blog: any) => blog.published);

    const blogRoutes: MetadataRoute.Sitemap = publishedBlogs.map((blog: any) => ({
      url: `${baseUrl}/journal/${blog.slug}`,
      lastModified: blog.updatedAt ? new Date(blog.updatedAt) : blog.publishedAt ? new Date(blog.publishedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Most-recent blog timestamp drives lastModified for /journal and /media listings
    const latestBlogDate = publishedBlogs.reduce<Date | undefined>((latest, b: any) => {
      const candidate = b.updatedAt ? new Date(b.updatedAt) : b.publishedAt ? new Date(b.publishedAt) : null;
      if (!candidate) return latest;
      if (!latest || candidate > latest) return candidate;
      return latest;
    }, undefined);

    const dynamicListingRoutes: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/journal`,
        lastModified: latestBlogDate,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/media`,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];

    // Category pages — derived from published blog categories, deduplicated by slug.
    // Each category's lastModified is its most recent post's update time.
    const categoryMap = new Map<string, Date | undefined>();
    for (const b of publishedBlogs) {
      if (!b.category) continue;
      const slug = toCategorySlug(b.category);
      if (!slug) continue;
      const candidate = b.updatedAt ? new Date(b.updatedAt) : b.publishedAt ? new Date(b.publishedAt) : undefined;
      const existing = categoryMap.get(slug);
      if (!existing || (candidate && candidate > existing)) {
        categoryMap.set(slug, candidate);
      }
    }
    const categoryRoutes: MetadataRoute.Sitemap = Array.from(categoryMap.entries()).map(([slug, lastModified]) => ({
      url: `${baseUrl}/journal/category/${slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...dynamicListingRoutes, ...categoryRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      ...staticRoutes,
      { url: `${baseUrl}/journal`, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/media`, changeFrequency: 'weekly', priority: 0.8 },
    ];
  }
}
