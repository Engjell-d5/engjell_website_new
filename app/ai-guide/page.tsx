import type { Metadata } from 'next';
import AiGuidePage from '@/components/AiGuidePage';
import { createMetadata } from '@/lib/metadata';
import { AI_GUIDE_COPY, AI_GUIDE_PATHS } from '@/lib/ai-guide';

// See lib/ai-guide.ts. The Albanian page is /sq/udhezuesi-ai.
export const metadata: Metadata = createMetadata({
  title: AI_GUIDE_COPY.en.metaTitle,
  description: AI_GUIDE_COPY.en.metaDescription,
  path: AI_GUIDE_PATHS.en,
  languages: { en: AI_GUIDE_PATHS.en, sq: AI_GUIDE_PATHS.sq },
});

export default function AiGuide() {
  return <AiGuidePage locale="en" />;
}
