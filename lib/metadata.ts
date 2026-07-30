import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';
const siteName = 'Engjell Rraklli';
const defaultTitle = 'Engjell Rraklli — Tech Entrepreneur in Tirana, Albania';
const defaultDescription = 'Albanian tech entrepreneur building scalable technology in Tirana. Software development, startups, and tech innovation in Albania.';

export function createMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  noindex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}): Metadata {
  // Append the brand suffix only when the title doesn't already carry the
  // name — avoids "About Engjell Rraklli | ... | Engjell Rraklli". Keep page
  // titles short: Google truncates around 60 characters.
  const pageTitle = title
    ? title.includes(siteName)
      ? title
      : `${title} | ${siteName}`
    : defaultTitle;
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
    pageImage = `${siteUrl}/og-image.jpg`;
  }

  return {
    metadataBase: new URL(siteUrl),
    title: pageTitle,
    description: pageDescription,
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
      site: '@RraklliEngjell',
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
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
    // A noindex page should not declare a canonical. Explicit null is required
    // to unset the value inherited from the root layout's metadata.
    alternates: noindex ? null : { canonical: pageUrl },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
        { url: '/android-launchericon-192-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/android-launchericon-512-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
        { url: '/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
      ],
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: siteName,
    },
  };
}
