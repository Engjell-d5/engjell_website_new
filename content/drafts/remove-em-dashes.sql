-- Remove every em dash from article prose.
--
-- All 15 occurrences are the unspaced dramatic-pause form (word—word). A blind
-- swap to commas would create comma splices in six of them, so each is handled
-- on its own: a comma where the second half is a continuation, a full stop where
-- it is an independent clause, a colon where it introduces an explanation.
--
-- Idempotent: each replace() is a no-op once applied.
--
--   ssh root@division5.co 'docker exec -i engjell-website-db psql -U engjell -d engjell_website -v ON_ERROR_STOP=1' < content/drafts/remove-em-dashes.sql

BEGIN;

UPDATE blogs SET content =
  -- continuation, comma is enough
  replace(replace(replace(replace(replace(replace(replace(
  replace(replace(replace(replace(replace(replace(replace(replace(content,
    'them—embrace',                'them, embrace'),
    'myself—and on price',         'myself, and on price'),
    'you—and that’s where',        'you, and that’s where'),
    'suffered—until',              'suffered, until'),
    'do—and I hate',               'do, and I hate'),
    'tough—especially',            'tough, especially'),
    'know—',                       'know, '),
  -- independent clause, needs a full stop
    'possible—it’s to promise',    'possible. It’s to promise'),
    'built—it was just',           'built. It was just'),
    'work—they’re interconnected', 'work. They’re interconnected'),
    'all—they have other',         'all. They have other'),
    'him—everyone can run',        'him. Everyone can run'),
    'you—it’s about your clients', 'you. It’s about your clients'),
  -- introduces an explanation, colon reads best
    'ways—if you don’t trust me',  'ways: if you don’t trust me'),
    'culture—I focused',           'culture: I focused')
WHERE content LIKE '%—%';

UPDATE blogs SET excerpt = replace(excerpt, 'tough—especially', 'tough, especially')
WHERE excerpt LIKE '%—%';

UPDATE blogs SET "updatedAt" = CURRENT_TIMESTAMP
WHERE slug IN ('challenges-running-a-service-based-business','culture-starts-at-the-top',
               'entrepreneurship-is-a-rollercoaster','provide-a-service-people-love-to-share',
               'your-service-is-your-brand');

SELECT count(*) AS rows_with_em_dashes_remaining
FROM blogs
WHERE (content||excerpt||title||coalesce(hook,'')||coalesce("seoMetaTitle",'')||coalesce("seoMetaDescription",'')) LIKE '%—%';

COMMIT;
