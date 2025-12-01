import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Tech Podcast Albania | Engjell Rraklli Media',
  description: 'Engjell Rraklli\'s tech podcast and videos on entrepreneurship, technology, and startups in Albania. YouTube channel with Albanian tech entrepreneur insights.',
  path: '/media',
  keywords: [
    'Engjell Rraklli Podcast',
    'Tech Podcast Albania',
    'Albanian Tech Podcast',
    'Entrepreneurship Podcast Albania',
    'YouTube Channel Albania',
    'Tech Videos Albania',
    'Business Podcast Albania',
    'Albania Tech Media',
    'Startup Podcast Albania',
  ],
});

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
