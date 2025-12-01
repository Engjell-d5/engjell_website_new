import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Contact Engjell Rraklli | Tech Entrepreneur Albania',
  description: 'Contact Engjell Rraklli - Albanian tech entrepreneur. Speaking engagements, technical consultation, and partnership opportunities in Albania. Tech consulting and startup advice.',
  path: '/contact',
  keywords: [
    'Contact Engjell Rraklli',
    'Tech Entrepreneur Albania Contact',
    'Speaking Engagements Albania',
    'Technical Consultation Albania',
    'Business Partnership Albania',
    'Albania Tech Consulting',
    'Entrepreneurship Advice Albania',
    'Startup Consulting Albania',
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
