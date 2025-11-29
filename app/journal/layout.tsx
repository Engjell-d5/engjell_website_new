import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Journal',
  description: 'Articles, thoughts, and insights on technology, entrepreneurship, and building in Albania. A kind world is a better world.',
  path: '/journal',
  keywords: [
    'Tech Blog',
    'Entrepreneurship Articles',
    'Albania Tech Blog',
    'Startup Insights',
    'Technology Thoughts',
    'Business Strategy',
    'Tech Innovation',
    'Software Development Blog',
  ],
});

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
