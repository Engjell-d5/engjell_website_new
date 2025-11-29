import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Contact',
  description: 'Open for speaking engagements, technical consultation, and partnership opportunities. Get in touch to discuss building in Albania or potential ventures.',
  path: '/contact',
  keywords: [
    'Contact Engjell Rraklli',
    'Speaking Engagements',
    'Technical Consultation',
    'Business Partnership',
    'Albania Business',
    'Tech Consulting',
    'Entrepreneurship Advice',
    'Startup Consulting',
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
