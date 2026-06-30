import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moltrottinette.ma';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/checkout',
          '/portal',
          '/api/',
          '/cart',
          '/order-confirmation',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'], // Optional: Prevent AI bots from scraping if you want
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
