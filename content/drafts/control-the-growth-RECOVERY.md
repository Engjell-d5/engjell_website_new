# Recovered: "Control the growth"

Found in the old WordPress install still on the server at
`/var/www/html/engjellrraklli_old.com`, database `wp_engjell_website`,
post ID **1641**, published **2024-09-22**, slug `control-the-growth`.

It is not a standard WordPress `post`. The old site used a custom post type
called `scaling-unscalable`, which is why a normal post query returns nothing.

**936 words.** Body HTML is in `control-the-growth.recovered.html`, already
cleaned: WordPress block comments stripped, shortcodes removed, and the
`[contact-form-7]` inline signup swapped for this site's own
`<div class="subscribe-snippet-placeholder-inline"></div>` so the subscribe
form renders in the same spot it did originally.

## Why it is missing from the new site

The old site had seven articles. Six were migrated:

| Old title | Now at |
|---|---|
| A Service-based business sucks! Products are cool. | `/journal/service-vs-product` |
| Entrepreneurship is a rollercoaster | `/journal/entrepreneurship-is-a-rollercoaster` |
| Challenges running a service-based business. | `/journal/challenges-running-a-service-based-business` |
| Your service is your brand. | `/journal/your-service-is-your-brand` |
| Provide a service people love to share. | `/journal/provide-a-service-people-love-to-share` |
| Culture starts at the top | `/journal/culture-starts-at-the-top` |
| **Control the growth** | **never migrated** |

It is the only one that was dropped.

## What it covers

Hitting a growth ceiling at division5 after four years, and the three routes
out of it:

1. **Partnerships** for entering new markets. The Pirate deal in Germany, why
   local partners work (connections, language, trust, pricing knowledge), why
   they fail (values mismatch, misaligned expectations, communication), and the
   warning that partnerships hand control of your growth to a third party.
2. **Networking**, written by someone who was bad at it and treats it as a
   learnable skill rather than a personality trait.
3. **Marketing and sales** as the only route that gives you real control:
   marketing gets people to the door, sales gets them in the building.

Closing line: there is no silver bullet.

## Suggested fields for the migration

- **Title:** Control the Growth
- **Slug:** `control-the-growth` (matches the old URL, so any surviving inbound
  link or old index entry resolves instead of 404ing)
- **Category:** Entrepreneurship
- **Excerpt:** After four years division5 hit a ceiling we did not know how to
  break. Partnerships, networking and sales are the three ways out, and only one
  of them leaves you in control.
- **seoMetaTitle:** Control the Growth of a Service Business
- **seoMetaDescription:** We hit a growth ceiling at division5 after four years.
  Partnerships, networking, and marketing and sales, and why only the last one
  puts you in control of the outcome.
- **publishedAt:** keep the original 2024-09-22 rather than backdating to today.
  It predates every post currently on the site, so it will land at the bottom of
  the journal, which is correct.

## Images

Two images are referenced and both still exist on disk:

- `wp-content/uploads/2024/09/1700824355812.jpeg` (513 KB)
- `wp-content/uploads/2024/09/DSC0065-scaled.jpg` (431 KB)

Their `src` attributes point at `https://engjellrraklli.com/wp-content/...`,
which the Next.js site does not serve, so **both are broken links as written**.
They need re-uploading through the admin panel and the `src` values swapped for
the resulting `/api/uploads/...` paths, or the `<img>` tags removed.

## Fits the cluster

This is a service-business growth article, so it belongs in the cluster with the
pillar. Once published, add it to `cluster-backlinks.sql` and add an outbound
link from the pillar, most naturally in "What growth actually came from", which
currently ends at word of mouth and never addresses what to do when word of
mouth runs out. This article is the answer to that.
