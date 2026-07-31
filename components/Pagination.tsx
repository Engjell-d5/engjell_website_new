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

  const stepClass =
    'flex items-center gap-1 px-3 py-2 border border-[var(--border-color)] meta font-semibold transition-colors';

  return (
    <nav aria-label="Journal pages" className="mt-12 pt-8 border-t border-[var(--rule-faint)] flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={`${stepClass} text-[var(--text-meta)] hover:text-[var(--primary-mint)] hover:border-[var(--primary-mint)]`}>
          <ChevronLeft className="w-3.5 h-3.5" />
          Newer
        </Link>
      ) : (
        <span className={`${stepClass} text-gray-700 border-transparent`} aria-hidden="true">
          <ChevronLeft className="w-3.5 h-3.5" />
          Newer
        </span>
      )}

      <ul className="flex items-center gap-2">
        {pages.map((n) => (
          <li key={n}>
            {n === page ? (
              <span
                aria-current="page"
                className="block px-3 py-2 border border-[var(--primary-mint)] text-[var(--primary-mint)] meta font-semibold"
              >
                {n}
              </span>
            ) : (
              <Link
                href={href(n)}
                className="block px-3 py-2 border border-[var(--border-color)] text-[var(--text-meta)] hover:text-[var(--primary-mint)] hover:border-[var(--primary-mint)] meta font-semibold transition-colors"
              >
                {n}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={`${stepClass} text-[var(--text-meta)] hover:text-[var(--primary-mint)] hover:border-[var(--primary-mint)]`}>
          Older
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <span className={`${stepClass} text-gray-700 border-transparent`} aria-hidden="true">
          Older
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </nav>
  );
}
