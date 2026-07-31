import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

  return {
    rules: [
      {
        userAgent: '*',
        // Uploaded blog images are served from /api/uploads/, the more
        // specific Allow overrides the /api/ Disallow (longest match wins),
        // so Googlebot/Twitterbot can crawl featured and OG images.
        allow: ['/', '/api/uploads/'],
        disallow: ['/admin/', '/api/'],
      },
      {
        // Allow Instagram/Facebook crawlers to access uploads
        userAgent: ['facebookexternalhit', 'Facebot', 'Instagram'],
        allow: ['/api/uploads/', '/uploads/'],
        disallow: [],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
