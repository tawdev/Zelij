import { MetadataRoute } from 'next';
import { api } from './lib/api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://moltrottinette.com';

  // 1. Static Routes — pages li khssek itla3o f Google ghir
  const staticRoutes = [
    { route: '',                      priority: 1.0, freq: 'daily'   },
    { route: '/produits',             priority: 0.9, freq: 'daily'   },
    { route: '/marques',              priority: 0.8, freq: 'weekly'  },
    { route: '/about',                priority: 0.6, freq: 'monthly' },
    { route: '/contact',              priority: 0.7, freq: 'monthly' },
    { route: '/faqs',                 priority: 0.6, freq: 'monthly' },
    { route: '/livraison',            priority: 0.6, freq: 'monthly' },
    { route: '/retours',              priority: 0.5, freq: 'monthly' },
    { route: '/confidentialite',      priority: 0.3, freq: 'yearly'  },
    { route: '/conditions-generales', priority: 0.3, freq: 'yearly'  },
  ].map(({ route, priority, freq }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: freq as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }));

  // 2. Dynamic Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await api.getProducts({ limit: 1000, active: true });
    productRoutes = products.data.map((product: any) => ({
      url: `${baseUrl}/produits/${product.slug || product.id}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap: Failed to fetch products', error);
  }

  // 3. Dynamic Brands
  let brandRoutes: MetadataRoute.Sitemap = [];
  try {
    const brands = await api.getBrands();
    brandRoutes = brands
      .filter((b: any) => b.isActive)
      .map((brand: any) => ({
        url: `${baseUrl}/marques/${brand.slug || brand.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error('Sitemap: Failed to fetch brands', error);
  }

  return [...staticRoutes, ...productRoutes, ...brandRoutes];
}