import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Media',
  description: 'Podcast episodes, videos, and media appearances. Small steps everyday beats 1 big step a year.',
  path: '/media',
  keywords: [
    'Engjell Rraklli Podcast',
    'Tech Podcast',
    'Entrepreneurship Podcast',
    'YouTube Channel',
    'Tech Videos',
    'Business Podcast',
    'Albania Tech Media',
    'Startup Podcast',
  ],
});

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
