import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import SectionLabel from '@/components/site/SectionLabel';
import { AI_GUIDE_PATHS, AI_GUIDE_PDFS } from '@/lib/ai-guide';

/**
 * End-of-article card for posts about AI: the free AI guide instead of the
 * service-founder playbook, because a reader who just finished an AI piece is
 * looking at the AI offer. Same dark card as PlaybookCta's inline variant, but
 * ungated like the guide's own page.
 */
export default function AiGuideCta() {
  return (
    <aside className="sec-deep my-12 border-t-[3px] border-[var(--primary-mint)] p-7 md:p-10" aria-labelledby="ai-guide-inline">
      <SectionLabel>Free guide · 10 pages</SectionLabel>
      <h2 id="ai-guide-inline" className="mt-3 text-[clamp(36px,3.4vw,48px)] leading-[0.95]">
        Will AI 10x your business?
      </h2>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-[var(--text)]">
        Five steps to put AI into any business, in the order that works, and the three things that make
        it hard. Each step ends in something you write down for your own company.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={AI_GUIDE_PDFS.en} download className="btn btn-primary">
          <Download size={18} aria-hidden="true" />
          Download the PDF
        </a>
        <Link href={AI_GUIDE_PATHS.en} className="btn btn-secondary">
          What is inside
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <p className="mt-6 max-w-[52ch] border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--muted)]">
        Rather do it with me?{' '}
        <Link href="/ai-sprint" className="text-link">
          The AI Integration Sprint
        </Link>{' '}
        goes through the same steps for your business.
      </p>
    </aside>
  );
}
