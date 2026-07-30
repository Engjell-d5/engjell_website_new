// One-off migration: collapse existing blog categories onto the canonical set
// defined in lib/category-normalize.ts ("AI"/"Artificial Intelligence" -> AI,
// "business"/"Branding" -> Business, "startups" -> Entrepreneurship, etc.).
//
// Run where DATABASE_URL is available (e.g. on the server):
//   docker compose -f docker-compose.prod.yml exec app npx tsx scripts/normalize-categories.ts
// or locally: npx tsx scripts/normalize-categories.ts
import { prisma } from '../lib/prisma';
import { normalizeCategory } from '../lib/category-normalize';

async function main() {
  const blogs = await prisma.blog.findMany({
    select: { id: true, title: true, category: true },
  });

  let changed = 0;
  for (const blog of blogs) {
    const normalized = normalizeCategory(blog.category);
    if (normalized !== blog.category) {
      await prisma.blog.update({
        where: { id: blog.id },
        data: { category: normalized },
      });
      console.log(`✓ "${blog.title}": "${blog.category}" -> "${normalized}"`);
      changed++;
    }
  }

  console.log(`\nDone. ${changed} of ${blogs.length} posts updated.`);
  const remaining = await prisma.blog.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  console.log('Categories now:', remaining.map((r) => r.category).sort().join(', '));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
