# SEO Status — engjellrraklli.com

**Last updated:** July 30, 2026 (replaces the stale `SEO-AUDIT-REPORT.md`, which
misreported several items in both directions).

## What is implemented and verified

- **Metadata:** every public page sets title/description/canonical/OG/Twitter via
  `lib/metadata.ts` (`createMetadata`). Titles are ≤60 chars; the brand suffix is
  skipped when the title already contains "Engjell Rraklli". `noindex` option
  exists and is applied to the 404 page and the missing-post branch.
- **Robots:** `/api/uploads/` is allowed for all crawlers (blog images + OG
  images are crawlable); `/admin/` and the rest of `/api/` are disallowed.
  Admin routes additionally send `X-Robots-Tag: noindex, nofollow` (middleware).
- **Sitemap:** DB-driven, generated per request (`app/sitemap.ts`,
  `dynamic = 'force-dynamic'`) so it always reflects the database.
- **Structured data:** Person + WebSite (root layout), ProfilePage (about),
  Organization ×3 (ventures), BlogPosting with `inLanguage`/`articleSection`
  (posts), VideoObject + ItemList (media), CollectionPage (journal/category),
  BreadcrumbList (all pages). Person nodes share `@id: <siteUrl>/#person`.
- **Rendering:** home, journal, media, category pages, blog posts, and the
  sitemap render per request (`force-dynamic`). The homepage fetches the latest
  video/blog server-side so they're in the initial HTML.
  **Known issue — do not reintroduce ISR blindly:** with `revalidate` set,
  pages prerendered empty in CI (no `DATABASE_URL`) served their empty
  fallback forever in the deployed standalone/Apache environment —
  `x-nextjs-cache: HIT` never went stale, so /journal and /media showed
  "No blog posts yet"/"No videos available" in production. If ISR is wanted
  later, deploy to staging first and check `docker compose logs app` for
  revalidation errors.
- **Redirects:** www → non-www single-hop 301 built explicitly in
  `middleware.ts` (never reuse `request.nextUrl` for this — it carries the
  internal port behind the reverse proxy).
- **Media:** uploads are compressed on ingest (`app/api/upload/route.ts`,
  sharp: max 1600px wide, EXIF rotation applied, JPEG q82 / lossless-alpha PNG)
  so OG images stay under X's 5MB and Facebook's 8MB limits.
- **Icons:** `/icon.png` (32), `/apple-icon.png` (180), `favicon.ico` (4.7KB,
  16/32/48 PNG-packed) generated from the ER logo mark.
- **Categories:** normalized at save time (`lib/category-normalize.ts`) onto
  the canonical set AI / Entrepreneurship / Business / Culture.

## Operational checklist (not code)

- [ ] Set the GitHub Actions **repository variable** `NEXT_PUBLIC_GA_ID`
      (GA4 `G-…` id) — analytics is fully wired but off until this is set.
- [ ] Run `npm run db:normalize-categories` once on the server to collapse the
      pre-existing duplicate categories in the database.
- [ ] In the admin panel: fix the post titled "The Silicon valley illusion"
      (→ "The Silicon Valley Illusion") and fill in its excerpt/meta
      description (it currently ships without one). Optionally re-upload its
      8.7MB featured PNG so it gets compressed.
- [ ] Resubmit `sitemap.xml` in Google Search Console after each major change.
