// Single source of truth for converting a free-text blog category
// (e.g. "Tech & AI", "Startup Life") into a URL slug.
// Used by app/journal/page.tsx pills, app/journal/category/[slug]/page.tsx,
// and app/sitemap.ts so all three agree on what the canonical URL is.
export function toCategorySlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleFromCategorySlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
