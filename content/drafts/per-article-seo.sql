-- Per-article SEO metadata.
--
-- Why these go in seoMetaTitle / seoMetaDescription rather than into title and
-- excerpt: those two fields do double duty. `title` is the on-page <h1> and
-- `excerpt` is the card summary AND the meta description. Several headlines are
-- deliberately un-searchable but good writing ("Mirror mirror on the wall"), and
-- nine excerpts run 178-238 characters, which reads fine on a card but gets
-- truncated in a search result around 160.
--
-- Setting the seo* fields lets Google show a descriptive title and a complete
-- description while the article keeps the voice it was written in. Nothing the
-- author wrote is overwritten.
--
-- Budget: createMetadata() appends " | Engjell Rraklli" (18 chars) unless the
-- title already contains the name, so seoMetaTitle is kept at or under 45 to
-- land inside the ~60 char SERP limit. Descriptions target 130-145.
--
--   ssh root@division5.co 'docker exec -i engjell-website-db psql -U engjell -d engjell_website -v ON_ERROR_STOP=1' < content/drafts/per-article-seo.sql

BEGIN;

UPDATE blogs b SET
  "seoMetaTitle"       = v.mt,
  "seoMetaDescription" = v.md,
  "updatedAt"          = CURRENT_TIMESTAMP
FROM (VALUES
  ('service-vs-product',
   'Service vs Product: Why I Was Wrong',
   'I spent years trying to pivot from services to product. The three reasons I believed services could not scale, and why each was really about me.'),

  ('your-service-is-your-brand',
   'Your Service Is Your Brand',
   'Your brand is not your logo, name or font. It is the experience clients have with your service. What a decade of B2B services taught me.'),

  ('provide-a-service-people-love-to-share',
   'Growing on Word of Mouth Alone',
   'For four years division5 grew with zero marketing or sales spend, entirely on referrals. Why that is slow, and what it forces you to get right.'),

  ('challenges-running-a-service-based-business',
   'Challenges of a Service Business',
   'Founding division5 at 23 with no money, connections or experience. The real challenges of a service business, starting with finding customers.'),

  ('culture-starts-at-the-top',
   'Culture Starts at the Top',
   'Scaling past 15 people I wrote our values and got them wrong. Why culture has to be built around what clients value, not office atmosphere.'),

  ('kindness-as-the-ultimate-business-hack',
   'Kindness as a Business Advantage',
   'Business gets called a shark tank. After 11 years building companies I disagree. How kindness builds the client trust that actually compounds.'),

  ('make-your-journey-purposeful',
   'Purpose in a B2B Service Business',
   'A B2B service company will never claim it is changing the world. But creating careers that keep young Albanians home is a purpose worth having.'),

  ('entrepreneurship-is-a-rollercoaster',
   'Entrepreneurship Is a Rollercoaster',
   'Be humble in the highs and do not despair in the lows. What building division5 taught me about surviving the swings that come with every year.'),

  ('mirror-mirror-on-the-wall-who-is-the-most-successful-of-them-all',
   'Stop Measuring Success Against Others',
   'The comparison economy is a trap. Why impact beats vanity metrics, and the four questions I ask myself instead of ranking against anyone else.'),

  ('the-silicon-valley-illusion',
   'The Silicon Valley Illusion',
   'Founders in emerging ecosystems keep importing a culture built for unlimited venture capital. Why Albania needs mechanics, not rockstars.'),

  ('when-intelligence-becomes-a-commodity',
   'When Intelligence Becomes a Commodity',
   'AI made raw cognitive power a utility. The three human skills that gained value once being the smartest in the room stopped being the edge.'),

  ('put-yourself-out-of-business-with-ai',
   'Put Yourself Out of Business With AI',
   'I was an AI skeptic until I actually used the tools. Why the first thing I did afterwards was work out how to disrupt my own business.'),

  ('ai-just-flipped-the-script-on-scaling',
   'AI Flipped the Script on Scaling',
   'AI makes services easier to scale and software products less defensible. What the inversion means for founders on both sides of it.'),

  ('how-to-scale-a-service-business-in-the-ai-era',
   'How to Scale a Service Business With AI',
   'Services do not scale because of the founder, not the model. A decade of lessons from division5, and what AI changed for service businesses.')
) AS v(slug, mt, md)
WHERE b.slug = v.slug;

-- Title casing, visible in every search result.
UPDATE blogs SET title = 'The Silicon Valley Illusion', "updatedAt" = CURRENT_TIMESTAMP
WHERE slug = 'the-silicon-valley-illusion' AND title <> 'The Silicon Valley Illusion';

UPDATE blogs SET title = 'Service vs Product', "updatedAt" = CURRENT_TIMESTAMP
WHERE slug = 'service-vs-product' AND title <> 'Service vs Product';

-- The only two excerpts too short to fill a card or a snippet.
UPDATE blogs SET excerpt = 'I spent years trying to pivot away from services, for three reasons I now know were wrong. Every business scales, most founders just cannot scale theirs yet.', "updatedAt" = CURRENT_TIMESTAMP
WHERE slug = 'service-vs-product';

UPDATE blogs SET excerpt = 'A B2B service business will never claim it is changing the world. But providing careers that let young Albanians build their future here is a purpose worth having.', "updatedAt" = CURRENT_TIMESTAMP
WHERE slug = 'make-your-journey-purposeful';

SELECT slug,
       length("seoMetaTitle") + 18 AS serp_title_len,
       length("seoMetaDescription") AS desc_len,
       length(excerpt) AS excerpt_len
FROM blogs WHERE published ORDER BY slug;

COMMIT;
