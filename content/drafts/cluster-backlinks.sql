-- Back-links: point the service-business cluster at the pillar.
--
-- RUN THIS ONLY AFTER THE PILLAR IS PUBLISHED.
-- While it is a draft, /journal/how-to-scale-a-service-business-in-the-ai-era
-- renders the not-found page, so these links would send readers and Googlebot
-- to a dead URL from ten live articles.
--
-- Appends one line to the end of each post's body. Deliberately additive: it
-- does not touch a single existing sentence, so nothing you wrote can be
-- mangled by a bad regex.
--
--   ssh root@division5.co 'docker exec -i engjell-website-db psql -U engjell -d engjell_website -v ON_ERROR_STOP=1' < content/drafts/cluster-backlinks.sql
--
-- Undo (removes only the appended paragraph):
--   UPDATE blogs SET content = regexp_replace(content, '<p class="cluster-link">.*?</p>', '', 'g')
--   WHERE content LIKE '%cluster-link%';

BEGIN;

UPDATE blogs SET
  content = content || '<p class="cluster-link"><em>This is one piece of a longer argument. The full playbook is in <a href="/journal/how-to-scale-a-service-business-in-the-ai-era">How to Scale a Service Business in the AI Era</a>.</em></p>',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE published
  AND slug IN (
    'service-vs-product',
    'your-service-is-your-brand',
    'provide-a-service-people-love-to-share',
    'challenges-running-a-service-based-business',
    'culture-starts-at-the-top',
    'kindness-as-the-ultimate-business-hack',
    'make-your-journey-purposeful',
    'ai-just-flipped-the-script-on-scaling',
    'put-yourself-out-of-business-with-ai',
    'when-intelligence-becomes-a-commodity',
    'the-silicon-valley-illusion'
  )
  AND content NOT LIKE '%cluster-link%';   -- idempotent: safe to re-run

SELECT slug,
       (length(content) - length(replace(content, 'how-to-scale-a-service', ''))) / 22 AS links_to_pillar
FROM blogs
WHERE published AND content LIKE '%cluster-link%'
ORDER BY slug;

COMMIT;
