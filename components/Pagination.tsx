import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Numbered pagination for the journal listing. Page 1 links to the bare path
// so the canonical URL never gains a redundant ?page=1.
export default function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (n: number) => (n <= 1 ? basePath : `${basePath}?page=${n}`);

  // Window of at most 5 page numbers centred on the current page.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const box = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 border px-3 text-[13px] font-semibold transition-colors';
  const idle = `${box} border-[var(--line)] text-[var(--ink)] hover:border-[var(--primary-mint)] hover:text-[var(--accent-text)]`;
  const off = `${box} border-transparent text-[var(--muted)] opacity-50`;

  return (
    <nav aria-label="Journal pages" className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={idle}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Newer
        </Link>
      ) : (
        <span className={off} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
          Newer
        </span>
      )}

      <ul className="flex items-center gap-2">
        {pages.map((n) => (
          <li key={n}>
            {n === page ? (
              <span aria-current="page" className={`${box} border-[var(--primary-mint)] bg-[var(--primary-mint)] text-[var(--rich-black)]`}>
                {n}
              </span>
            ) : (
              <Link href={href(n)} className={idle}>
                {n}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={idle}>
          Older
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={off} aria-hidden="true">
          Older
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
