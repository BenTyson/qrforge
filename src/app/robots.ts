import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/qr-codes/',
          '/analytics/',
          '/settings/',
          '/callback/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
