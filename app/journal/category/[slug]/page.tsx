import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { getBlogs } from '@/lib/data';
import { toCategorySlug, titleFromCategorySlug } from '@/lib/category-slug';

// Rendered per request — see app/journal/page.tsx for why ISR is not used.
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
    return createMetadata({
      title: `${displayName} | Field Notes`,
      description: `Articles in the ${displayName} category — tech entrepreneurship and software development insights by Engjell Rraklli.`,
      path: `/journal/category/${resolved.slug}`,
    });
  }

  return createMetadata({
    title: `${displayName} — Articles by Engjell Rraklli`,
    description: `${posts.length} article${posts.length === 1 ? '' : 's'} on ${displayName}. Field notes on tech, entrepreneurship, and building startups in Albania.`,
    path: `/journal/category/${resolved.slug}`,
  });
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const resolved = await Promise.resolve(params);
  const { posts, displayName } = await getCategoryPosts(resolved.slug);

  if (posts.length === 0) {
    notFound();
  }

  const collectionData = {
    name: `${displayName} — Field Notes`,
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Journal', url: '/journal' },
          { name: displayName, url: `/journal/category/${resolved.slug}` },
        ]}
      />
      <StructuredData type="CollectionPage" data={collectionData} />
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh] order-2 md:order-1">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link href="/journal" className="hover:text-[var(--primary-mint)] transition-colors">
              <span className="text-[var(--primary-mint)] font-bold">/</span>
              <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Journal</span>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">{displayName}</span>
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
                <span className="page-label mb-3 block">Category</span>
                <h1 className="text-5xl md:text-6xl text-white font-bebas uppercase">{displayName}</h1>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
                  {posts.length} article{posts.length === 1 ? '' : 's'}
                </p>
              </div>
              <Link
                href="/journal"
                className="text-[10px] text-gray-400 hover:text-[var(--primary-mint)] uppercase tracking-widest"
              >
                ← All articles
              </Link>
            </div>

            <div className="grid gap-6">
              {posts.map((blog, idx) => (
                <article key={blog.id}>
                  <Link
                    href={`/journal/${blog.slug}`}
                    className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-all cursor-pointer group flex flex-col md:flex-row gap-8"
                  >
                    <div className="w-full md:w-56 h-36 bg-black shrink-0 overflow-hidden border border-[var(--border-color)]/30 relative">
                      <Image
                        src={blog.imageUrl}
                        alt={`${blog.title} - ${blog.category} article`}
                        fill
                        sizes="(min-width: 768px) 224px, 100vw"
                        className="object-cover img-classic"
                        priority={idx === 0}
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <div className="flex items-center gap-3 mb-3">
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
                      <h2 className="text-3xl text-white font-bebas mb-3 group-hover:text-[var(--primary-mint)] transition-colors">
                        {blog.title}
                      </h2>
                      <p className="text-sm text-gray-400 leading-relaxed font-light">
                        {blog.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
