import { MetadataRoute } from 'next';
import { getBlogs } from '@/lib/data';
import { toCategorySlug } from '@/lib/category-slug';
import { journalPageCount } from '@/lib/site';

// The Docker build runs without DATABASE_URL, so a build-time sitemap would
// have no blog routes, and ISR revalidation is wedged in the deployed
// environment (see app/journal/page.tsx). Generate per request instead;
// sitemap traffic is rare enough that the DB cost is negligible.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

  // Static routes, omit lastModified so the timestamp doesn't churn on every build.
  // For /journal and /podcast we derive lastModified from real content below.
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
      url: `${baseUrl}/speaking`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/playbook`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sprint`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/invest`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic blog routes, derive lastModified from real content
  // Skip database queries during build if DATABASE_URL is not available
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set during build, skipping dynamic blog routes in sitemap');
    return [
      ...staticRoutes,
      { url: `${baseUrl}/journal`, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/podcast`, changeFrequency: 'weekly', priority: 0.8 },
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

    // Most-recent blog timestamp drives lastModified for /journal and /podcast listings
    const latestBlogDate = publishedBlogs.reduce<Date | undefined>((latest, b: any) => {
      const candidate = b.updatedAt ? new Date(b.updatedAt) : b.publishedAt ? new Date(b.publishedAt) : null;
      if (!candidate) return latest;
      if (!latest || candidate > latest) return candidate;
      return latest;
    }, undefined);

    // /journal is paginated (see app/journal/page.tsx). Each page canonicalises
    // to itself, so every one belongs in the sitemap, otherwise older posts are
    // only reachable by crawling forward. journalPageCount accounts for the
    // pinned "Start here" post being lifted out of the paginated feed.
    const journalPages = journalPageCount(publishedBlogs.map((b: any) => b.slug));

    const dynamicListingRoutes: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/journal`,
        lastModified: latestBlogDate,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      ...Array.from({ length: journalPages - 1 }, (_, i) => ({
        url: `${baseUrl}/journal?page=${i + 2}`,
        lastModified: latestBlogDate,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
      {
        url: `${baseUrl}/podcast`,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];

    // Category pages, derived from published blog categories, deduplicated by slug.
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
      { url: `${baseUrl}/podcast`, changeFrequency: 'weekly', priority: 0.8 },
    ];
  }
}
