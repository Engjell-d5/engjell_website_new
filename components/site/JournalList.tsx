import Image from 'next/image';
import Link from 'next/link';
import { formatDateShort } from '@/lib/format';
import { readingTimeMinutes } from '@/lib/reading-time';

export interface JournalItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  publishedAt: string | null;
}

/**
 * The journal as a ruled list: date and topic in the margin, the headline in
 * Bebas, the excerpt underneath, a small picture on the right on wide
 * screens. Shared by the homepage, /journal and the category pages so the
 * three can never drift apart again.
 */
export default function JournalList({
  items,
  showImages = true,
  priorityFirst = false,
}: {
  items: JournalItem[];
  showImages?: boolean;
  priorityFirst?: boolean;
}) {
  return (
    <ul className="border-b border-[var(--line)]">
      {items.map((b, i) => {
        const minutes = b.content ? readingTimeMinutes(b.content) : null;
        return (
          <li key={b.id}>
            <Link
              href={`/journal/${b.slug}`}
              className="group flex flex-wrap items-start gap-x-10 gap-y-2 border-t border-[var(--line)] py-7"
            >
              <p className="meta mt-1.5 flex-[0_0_170px] leading-relaxed">
                {b.publishedAt && (
                  <time dateTime={new Date(b.publishedAt).toISOString()} className="block">
                    {formatDateShort(b.publishedAt)}
                  </time>
                )}
                <span className="block font-semibold text-[var(--accent-text)]">{b.category}</span>
                {minutes !== null && <span className="block">{minutes} min read</span>}
              </p>
              <div className="min-w-0 flex-[1_1_440px]">
                <h3 className="text-[clamp(28px,2.4vw,36px)] leading-[1.04] tracking-[0.03em] transition-colors group-hover:text-[var(--accent-text)]">
                  {b.title}
                </h3>
                {b.excerpt && (
                  <p className="mt-2 max-w-[44em] text-[15px] leading-relaxed text-[var(--text)]">{b.excerpt}</p>
                )}
              </div>
              {showImages && b.imageUrl && (
                <div className="relative hidden aspect-[3/2] w-[180px] shrink-0 overflow-hidden bg-[var(--deep)] lg:block">
                  <Image
                    src={b.imageUrl}
                    alt=""
                    fill
                    sizes="180px"
                    priority={priorityFirst && i === 0}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
