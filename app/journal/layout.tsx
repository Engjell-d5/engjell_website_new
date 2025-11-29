import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Journal',
  description: 'Articles, thoughts, and insights on technology, entrepreneurship, and building in Albania. A kind world is a better world.',
  path: '/journal',
});

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
