import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Podcast & Media',
  description: 'Podcast episodes, videos, and media appearances. Small steps everyday beats 1 big step a year.',
  path: '/media',
});

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
