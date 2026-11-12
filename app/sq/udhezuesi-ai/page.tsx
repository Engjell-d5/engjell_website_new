import type { Metadata } from 'next';
import AiGuidePage from '@/components/AiGuidePage';
import { createMetadata } from '@/lib/metadata';
import { AI_GUIDE_COPY, AI_GUIDE_PATHS } from '@/lib/ai-guide';

// The Albanian counterpart of /ai-guide. See lib/ai-guide.ts.
export const metadata: Metadata = createMetadata({
  title: AI_GUIDE_COPY.sq.metaTitle,
  description: AI_GUIDE_COPY.sq.metaDescription,
  path: AI_GUIDE_PATHS.sq,
  locale: 'sq_AL',
  languages: { en: AI_GUIDE_PATHS.en, sq: AI_GUIDE_PATHS.sq },
});

export default function AiGuideSq() {
  return <AiGuidePage locale="sq" />;
}
