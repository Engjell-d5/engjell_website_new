import { prisma } from '../prisma';
import type { Blog } from './types';

/**
 * Blogs now live in the d5 management system (tenant: engjell-rraklli) and
 * this site PULLS them from d5's public, company-scoped blog API. The local
 * `blogs` table is legacy: it was migrated into d5 on 2026-08-24 and is no
 * longer the source of truth. Writing happens in the d5 admin, where
 * content generation, translations and GA metric snapshots already work.
 *
 * Design constraints, in order:
 *  - The site must NEVER 500 because d5 is unreachable: every fetch is
 *    wrapped, list pages degrade to empty, article pages to 404. With ISR
 *    (revalidate below) a failed refresh keeps serving the last good page.
 *  - Slugs are preserved exactly from the migration, so every existing
 *    /journal/<slug> URL keeps resolving. Do not "clean up" slugs in d5.
 *  - Images stayed as absolute URLs on this domain, so /api/uploads and the
 *    static assets keep being served by this app unchanged.
 */

const D5_API_URL = (process.env.D5_API_URL || 'https://app.division5.co/api/v1').replace(/\/+$/, '');
const D5_API_KEY = process.env.D5_API_KEY || '';
// The engjell-rraklli company in d5. Scopes every call so another tenant's
// blog can never appear here, whatever its slug.
const D5_COMPANY_ID = process.env.D5_COMPANY_ID || 'cc640cdd-4a92-412b-ba9a-4ad48ae6e9cf';

/** How stale a rendered page may get before Next revalidates against d5. */
const REVALIDATE_SECONDS = 300;

interface D5Translation {
  slug: string;
  title: string;
  excerpt: string | null;
  hook: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface D5Blog {
  id: string;
  featuredImage: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  category: string | null;
  translations: D5Translation[];
}

function mapBlog(row: D5Blog): Blog | null {
  const t = row.translations?.[0];
  if (!t) return null;
  return {
    id: row.id,
    title: t.title,
    slug: t.slug,
    category: row.category ?? '',
    excerpt: t.excerpt ?? '',
    hook: t.hook ?? null,
    content: t.content ?? '',
    imageUrl: row.featuredImage ?? '',
    published: row.status === 'PUBLISHED',
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    authorId: row.authorId,
    seo: {
      metaTitle: t.metaTitle || undefined,
      metaDescription: t.metaDescription || undefined,
    },
  };
}

async function fetchD5(path: string): Promise<unknown | null> {
  if (!D5_API_KEY) {
    console.error('[blogs] D5_API_KEY is not set; blog content cannot load');
    return null;
  }
  try {
    const res = await fetch(`${D5_API_URL}${path}`, {
      headers: { 'X-API-Key': D5_API_KEY },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error(`[blogs] d5 responded ${res.status} for ${path}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[blogs] d5 fetch failed for ${path}:`, err);
    return null;
  }
}

/**
 * Every published blog for this site, newest first. The public endpoint
 * only returns PUBLISHED rows; drafts stay in the d5 admin.
 */
export async function getBlogs(): Promise<Blog[]> {
  const payload = (await fetchD5(
    `/content/blogs/public?companyId=${D5_COMPANY_ID}&pageSize=100&language=EN`,
  )) as { data?: D5Blog[] } | null;
  const rows = payload?.data ?? [];
  return rows
    .map(mapBlog)
    .filter((b): b is Blog => b !== null)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export interface RelatedBlog {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageUrl: string;
  publishedAt: string | null;
}

/**
 * Posts to show under "Keep reading" on an article page. Same-category
 * first, topped up with the most recent from any category. Computed over
 * the cached list: the whole catalogue is a few dozen rows, so a filtered
 * fetch would cost more than it saves.
 */
export async function getRelatedBlogs(
  slug: string,
  category: string,
  limit: number = 2,
): Promise<RelatedBlog[]> {
  const all = (await getBlogs()).filter((b) => b.slug !== slug);
  const sameCategory = all.filter((b) => b.category === category).slice(0, limit);
  const filler = all
    .filter((b) => b.category !== category)
    .slice(0, Math.max(0, limit - sameCategory.length));
  return [...sameCategory, ...filler].map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    category: b.category,
    imageUrl: b.imageUrl,
    publishedAt: b.publishedAt,
  }));
}

export async function getBlog(id: string): Promise<Blog | null> {
  const all = await getBlogs();
  return all.find((b) => b.id === id) ?? null;
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const payload = (await fetchD5(
    `/content/blogs/public/${encodeURIComponent(slug)}?companyId=${D5_COMPANY_ID}&language=EN`,
  )) as D5Blog | null;
  if (!payload || !payload.id) return null;
  return mapBlog(payload);
}

/**
 * Campaigns stayed local: they are this site's newsletter machinery, keyed
 * by the legacy blog ids. New d5-authored blogs have no campaign rows,
 * which findFirst answers with null — exactly what callers expect for
 * "no campaign yet".
 */
export async function getBlogCampaign(
  blogId: string,
): Promise<{ id: string; subject: string; status: string } | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { blogId },
    select: { id: true, subject: true, status: true },
  });
  return campaign;
}

/**
 * LEGACY writer for the local table. The d5 admin is the authoring surface
 * now; this remains only so the old site admin does not crash if opened,
 * and it no longer influences what visitors see.
 */
export async function saveBlogs(blogs: Blog[]): Promise<void> {
  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {
        title: blog.title,
        category: blog.category,
        excerpt: blog.excerpt,
        content: blog.content,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        authorId: blog.authorId,
        updatedAt: new Date(blog.updatedAt),
      },
      create: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        excerpt: blog.excerpt,
        content: blog.content,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        authorId: blog.authorId,
        createdAt: new Date(blog.createdAt),
        updatedAt: new Date(blog.updatedAt),
      },
    });
  }
}
