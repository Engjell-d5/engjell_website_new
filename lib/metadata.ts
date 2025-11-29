import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';
const siteName = 'Engjell Rraklli';
const defaultTitle = 'Engjell Rraklli | Tech Entrepreneur Building the Future in Albania';
const defaultDescription = 'Building scalable tech and human potential in Tirana. Creative at heart, resilient by practice. Valuing discipline, persistence, kindness, and patience above all.';

export function createMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageUrl = `${siteUrl}${path}`;
  
  // Ensure image URL is absolute
  let pageImage: string;
  if (image) {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      pageImage = image;
    } else if (image.startsWith('/')) {
      pageImage = `${siteUrl}${image}`;
    } else {
      pageImage = `${siteUrl}/${image}`;
    }
  } else {
    pageImage = `${siteUrl}/IMG_0425.JPG`;
  }

  return {
    metadataBase: new URL(siteUrl),
    title: pageTitle,
    description: pageDescription,
    keywords: [
      'Engjell Rraklli',
      'Tech Entrepreneur',
      'Albania',
      'Tirana',
      'Technology',
      'Startups',
      'division5',
      'Software Development',
      'Entrepreneurship',
    ],
    authors: [{ name: 'Engjell Rraklli' }],
    creator: 'Engjell Rraklli',
    publisher: 'Engjell Rraklli',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: title || 'Engjell Rraklli',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: '@RraklliEngjell',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: pageUrl,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  };
}
