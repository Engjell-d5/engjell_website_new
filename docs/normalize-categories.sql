-- Collapse blog categories onto the canonical set.
-- Mirrors normalizeCategory() in lib/category-normalize.ts exactly.
--
-- Why SQL and not the tsx script: the deployed image is a Next.js standalone
-- build, which ships neither scripts/ nor tsx, so the script cannot run there.
--
-- Run on the server:
--   docker exec -i engjell-website-db psql -U engjell -d engjell_website -v ON_ERROR_STOP=1 < docs/normalize-categories.sql
--
-- Back up first (recoverable if anything looks wrong):
--   docker exec -i engjell-website-db psql -U engjell -d engjell_website \
--     -c "\copy (SELECT id, category, title FROM blogs ORDER BY id) TO '/tmp/blogs-category-backup.csv' WITH CSV HEADER"
--
-- Restore from that backup:
--   UPDATE blogs b SET category = t.category FROM (VALUES ('<id>','<old>'), ...) AS t(id, category) WHERE b.id = t.id;
--
-- `updatedAt` is deliberately NOT touched. The article text did not change, and
-- bumping it would push a false freshness signal into the sitemap's lastModified.

BEGIN;

UPDATE blogs SET category =
  CASE lower(btrim(regexp_replace(category, '\s+', ' ', 'g')))
    WHEN 'ai'                      THEN 'AI'
    WHEN 'artificial intelligence' THEN 'AI'
    WHEN 'business'                THEN 'Business'
    WHEN 'branding'                THEN 'Business'
    WHEN 'startup'                 THEN 'Entrepreneurship'
    WHEN 'startups'                THEN 'Entrepreneurship'
    WHEN 'entrepreneurship'        THEN 'Entrepreneurship'
    WHEN 'culture'                 THEN 'Culture'
    ELSE initcap(lower(btrim(category)))
  END
WHERE category IS DISTINCT FROM
  CASE lower(btrim(regexp_replace(category, '\s+', ' ', 'g')))
    WHEN 'ai'                      THEN 'AI'
    WHEN 'artificial intelligence' THEN 'AI'
    WHEN 'business'                THEN 'Business'
    WHEN 'branding'                THEN 'Business'
    WHEN 'startup'                 THEN 'Entrepreneurship'
    WHEN 'startups'                THEN 'Entrepreneurship'
    WHEN 'entrepreneurship'        THEN 'Entrepreneurship'
    WHEN 'culture'                 THEN 'Culture'
    ELSE initcap(lower(btrim(category)))
  END;

SELECT category, count(*) AS total, count(*) FILTER (WHERE published) AS published
FROM blogs GROUP BY category ORDER BY category;

COMMIT;
