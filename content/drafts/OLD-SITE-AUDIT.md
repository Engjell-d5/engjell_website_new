# Old WordPress site vs new site: full reconciliation

Source: `/var/www/html/engjellrraklli_old.com`, database `wp_engjell_website`.

Checked **every post status**, not just published, and every content-bearing
post type. The old site used a custom post type (`scaling-unscalable`), which is
why a standard WordPress `post` query returns zero rows.

## Result: one published article missing, one unpublished draft found

| # | Old title | Date | Status | On new site? |
|---|---|---|---|---|
| 1 | A Service-based business sucks! Products are cool. | 2024-07-22 | publish | yes, `/journal/service-vs-product` |
| 2 | Entrepreneurship is a rollercoaster | 2024-08-06 | publish | yes |
| 3 | Challenges running a service-based business. | 2024-08-14 | publish | yes |
| 4 | Your service is your brand. | 2024-08-21 | publish | yes |
| 5 | Provide a service people love to share. | 2024-08-29 | publish | yes |
| 6 | Culture starts at the top | 2024-09-15 | publish | yes |
| 7 | **Control the growth** | 2024-09-22 | publish | **NO — recovered** |
| 8 | **Great service is built on clarity** | 2024-10-09 | **draft** | **NO — never published anywhere** |
| 9 | Scaling the Unscalable \| with Kevin Riedl | 2025-04-07 | publish | podcast episode, not an article |
| 10 | Scaling the Unscalable \| The Pirate's Compass, with Manuel Koelman | 2025-04-07 | publish | podcast episode, not an article |

Plus one false positive:

- **ID 170, "Services suck. Products are cool!"** sits under a separate,
  truncated post type (`scaling-the-unscalab`). Reading it confirms it is an
  earlier draft of #1, same opening ("Service-based businesses are not sexy.
  They are boring!"). Not a missing article, and not worth migrating.

Items 9 and 10 are podcast episodes. Video lives on `/podcast` via YouTube on the
new site, so there is nothing to migrate unless you want written show notes.

## 1. Control the growth (published, 936 words)

Recovered to `control-the-growth.recovered.html`. Full notes in
`control-the-growth-RECOVERY.md`. The only genuinely lost published article.

## 2. Great service is built on clarity (draft, 370 words)

Recovered to `great-service-is-built-on-clarity.recovered.html`.

Never published, on either site. It reads as finished rather than abandoned: a
complete argument with five numbered sections (clarity in process,
communication, expectations, problem-solving, and how clarity builds trust),
and a closing line. It is short at 370 words, which is roughly half your typical
post.

It also overlaps heavily with ground you have since covered. "Clarity builds
trust, and trust is the currency of long-term relationships" is close to the
argument in `kindness-as-the-ultimate-business-hack`, and the process/systems
material is now in the pillar.

Two sensible options:

- **Publish as-is** for completeness, category Business, and accept the overlap.
- **Fold it into the pillar** instead. "What growth actually came from" argues
  that word of mouth only works if the service is genuinely good, but never says
  what *good* consists of. Clarity in process, communication and expectations is
  a concrete answer, and it would strengthen a section that currently asserts
  quality without defining it.

The second is the better use of it. It is the stronger material inside a strong
piece rather than a thin standalone post competing with the pillar for the same
search intent.

## Not checked

The old install also hosts `page` content (10 published: Entrepreneur, The 3d
guy, Scaling The Unscalable, Contact, Privacy Policy, Podcast, Podcast Apply,
Link in Bio, 404, Engjell Rraklli). These are site furniture rather than
articles, and all have equivalents or deliberate replacements on the new site.
Worth a look only if you want the old "Link in Bio" or "The 3d guy" copy back.
