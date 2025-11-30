import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
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
