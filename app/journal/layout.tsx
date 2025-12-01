import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Tech Blog Albania | Entrepreneurship & Technology Journal',
  description: 'Engjell Rraklli\'s tech blog on entrepreneurship, technology, and startups in Albania. Software development insights, tech innovation, and Albanian tech ecosystem articles.',
  path: '/journal',
  keywords: [
    'Tech Blog Albania',
    'Albanian Tech Blog',
    'Entrepreneurship Articles Albania',
    'Albania Tech Journal',
    'Startup Insights Albania',
    'Technology Blog Tirana',
    'Business Strategy Albania',
    'Tech Innovation Albania',
    'Software Development Blog Albania',
  ],
});

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
