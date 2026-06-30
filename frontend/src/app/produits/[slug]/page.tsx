import { Metadata } from 'next';
import { api } from '../../lib/api';
import ProductDetailsClient from './ProductDetailsClient';
import { redirect } from 'next/navigation';
import JsonLd from '../../components/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // If numeric, it might be an ID, try to get the real slug
  let productSlug = slug;
  if (/^\d+$/.test(slug)) {
    try {
      const product = await api.getProductById(slug);
      if (product && product.slug) {
        productSlug = product.slug;
      }
    } catch (e) { }
  }

  try {
    const product = await api.getProductBySlug(productSlug);
    if (!product) return { title: 'Produit non trouvé' };

    return {
      title: `${product.name} | MOL Trottinettes`,
      description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || `Découvrez ${product.name} chez MOL Trottinettes.`,
      alternates: {
        canonical: `/produits/${product.slug}`,
      },
      openGraph: {
        title: product.name,
        description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160),
        images: product.imageUrl ? [product.imageUrl] : [],
      }
    };
  } catch (e) {
    return { title: 'Produit' };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let product = null;

  // Handle old ID-based URLs and fetch product for JSON-LD
  try {
    if (/^\d+$/.test(slug)) {
      product = await api.getProductById(slug);
      if (product && product.slug) {
        redirect(`/produits/${product.slug}`);
      }
    } else {
      product = await api.getProductBySlug(slug);
    }
  } catch (e) { }

  const productSchema = (product && product.name) ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl ? [product.imageUrl] : [],
    "description": product.description?.replace(/<[^>]*>?/gm, '') || "",
    "sku": product.id?.toString() || "",
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name || "MOL Trottinette"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://moltrottinette.ma/produits/${product.slug || slug}`,
      "priceCurrency": "MAD",
      "price": product.price || 0,
      "availability": (product.stock && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    ...(product.ratingAvg && product.ratingAvg > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.ratingAvg,
        "reviewCount": product.reviewCount || 1
      }
    })
  } : null;

  return (
    <>
      {productSchema && <JsonLd data={productSchema} />}
      <ProductDetailsClient slug={slug} />
    </>
  );
}
