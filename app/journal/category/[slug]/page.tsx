import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import JournalList from '@/components/site/JournalList';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { getBlogs } from '@/lib/data';
import { toCategorySlug, titleFromCategorySlug } from '@/lib/category-slug';

// Rendered per request, see app/journal/page.tsx for why ISR is not used.
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

async function getCategoryPosts(slug: string) {
  if (!process.env.DATABASE_URL) {
    return { posts: [], displayName: titleFromCategorySlug(slug) };
  }
  let all: Awaited<ReturnType<typeof getBlogs>>;
  try {
    all = await getBlogs();
  } catch (err) {
    console.error('[journal/category] getBlogs failed:', err);
    return { posts: [], displayName: titleFromCategorySlug(slug) };
  }
  const published = all
    .filter((b) => b.published)
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  const matching = published.filter((b) => toCategorySlug(b.category) === slug);
  // Resolve display name: use the actual category string from a matching post if found,
  // otherwise fall back to a prettified slug.
  const displayName = matching[0]?.category ?? titleFromCategorySlug(slug);
  return { posts: matching, displayName };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const { posts, displayName } = await getCategoryPosts(resolved.slug);

  if (posts.length === 0) {
    // This branch 404s below, so it must not advertise itself as indexable.
    return createMetadata({
      title: `${displayName}: Field Notes`,
      description: `Articles in the ${displayName} category. Tech entrepreneurship and software development insights by Engjell Rraklli.`,
      path: `/journal/category/${resolved.slug}`,
      noindex: true,
    });
  }

  return createMetadata({
    title: `${displayName}: Articles by Engjell Rraklli`,
    description: `${posts.length} article${posts.length === 1 ? '' : 's'} on ${displayName}. Field notes on building and scaling a service business in Albania.`,
    path: `/journal/category/${resolved.slug}`,
  });
}

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const resolved = await Promise.resolve(params);
  const { posts, displayName } = await getCategoryPosts(resolved.slug);

  if (posts.length === 0) {
    notFound();
  }

  const collectionData = {
    name: `${displayName}: Field Notes`,
    description: `Articles in the ${displayName} category by Engjell Rraklli.`,
    url: `${siteUrl}/journal/category/${resolved.slug}`,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Engjell Rraklli' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 20).map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/journal/${b.slug}`,
        name: b.title,
      })),
    },
  };

  return (
    <main id="main-content">
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Journal', url: '/journal' },
          { name: displayName, url: `/journal/category/${resolved.slug}` },
        ]}
      />
      <StructuredData type="CollectionPage" data={collectionData} />

      <section className="sec-dark">
        <div className="wrap pb-[clamp(48px,5vw,80px)] pt-[clamp(40px,6vw,96px)]">
          <p className="label">
            <span className="slash" aria-hidden="true">/</span>
            <Link href="/journal" className="hover:text-[var(--primary-mint)]">
              Journal
            </Link>
            <span aria-hidden="true"> · </span>Topic
          </p>
          <h1 className="mt-5 text-[clamp(56px,6.4vw,100px)] leading-[0.92]">{displayName}</h1>
          <p className="lede mt-5">
            {posts.length} essay{posts.length === 1 ? '' : 's'}.{' '}
            <Link href="/journal" className="text-link">
              See every topic
            </Link>
          </p>
        </div>
      </section>

      <section className="sec-light" aria-label={`${displayName} essays`}>
        <div className="wrap pad-y">
          <JournalList items={posts} priorityFirst />
        </div>
      </section>

    </main>
  );
}
