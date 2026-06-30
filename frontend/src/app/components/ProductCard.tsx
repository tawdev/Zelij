'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import ProductRating from './ProductRating';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';
import { type Product } from '../lib/api';

interface ProductCardProps {
  product: Product;
  className?: string;
  imageClassName?: string;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, className = '', imageClassName = '', viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const productNumId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
  const isWishlisted = isInWishlist(productNumId);

  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : (product.onSale ? price * 1.2 : null);
  const isOnSale = product.onSale || (oldPrice && oldPrice > price);
  const isPerM2 = product.pricingUnit === 'per_square_meter';

  const allImages = useMemo(() => {
    const images = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach(url => {
        if (url && url !== product.imageUrl) images.push(url);
      });
    }
    return images.slice(0, 5);
  }, [product.imageUrl, product.imageUrls]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && allImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }, 1500);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, allImages.length]);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
    return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const isList = viewMode === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.4 }
      }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`h-full min-w-0 ${className}`}
    >
      <Link
        href={`/produits/${product.slug || product.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group/card flex transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] relative h-full bg-white border border-border rounded-xl min-w-0 ${isList
          ? 'flex-row w-full gap-4 sm:gap-6 items-start'
          : 'flex-col w-full'
          }`}
      >
        {/* Media Wrapper */}
        <div className={`relative flex flex-col ${isList ? 'shrink-0 pr-8' : 'w-full'}`}>

          {/* Image Container */}
          <div
            className={`relative transition-all duration-500 overflow-hidden bg-gray-50 shrink-0 grid aspect-square ${isList
              ? 'w-[100px] sm:w-[140px]'
              : 'w-full'
              } ${imageClassName}`}
            style={{ position: 'relative', transform: 'translateZ(0)' }}
          >

            <div
              className="col-start-1 row-start-1 flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {allImages.length > 0 ? (
                allImages.map((url, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-full h-full transition-all duration-300 overflow-hidden">
                    <Image
                      src={getImageUrl(url)}
                      alt={`${product.name} - image ${idx + 1}`}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain transition-transform duration-500 lg:group-hover/card:scale-110"
                      style={{ willChange: 'transform' }}
                    />
                  </div>
                ))
              ) : (
                <div className="relative flex-shrink-0 w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80"
                    alt={product.name}
                    fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons (Heart & Compare) */}
          {isList && (
            <div className="absolute right-0 top-0 z-30 flex gap-1 flex-col">
              <button
                className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300 shadow-sm opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 ${isWishlisted ? 'bg-primary text-white border border-primary' : 'bg-white border border-border text-charcoal-muted hover:bg-primary hover:text-white hover:border-primary'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(productNumId);
                }}
                aria-label={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
              >
                <Heart size={14} strokeWidth={isWishlisted ? 0 : 1.5} className={isWishlisted ? "fill-white" : ""} />
              </button>

            </div>
          )}
        </div>

        {/* Info Container */}
        <div className={`flex flex-col flex-1 min-w-0 ${isList ? 'h-full pt-0.5' : 'h-full p-3 sm:p-4 pt-3 sm:pt-4'}`}>
          <h3 className={`font-medium text-charcoal line-clamp-2 leading-[1.4] transition-colors group-hover/card:text-primary mb-1 pb-0.5 break-words ${isList ? 'text-sm sm:text-base' : 'text-xs sm:text-sm min-h-[32px] sm:min-h-[42px]'}`}>
            {product.name}
          </h3>

          {/* Rating Area */}
          <div className="mb-1.5 opacity-70">
            <ProductRating
              productId={product.id}
              starSize={isList ? 12 : 10}
              textSize={isList ? "text-[11px] sm:text-[13px] ml-1.5" : "text-[10px] sm:text-[12px] ml-1.5 text-charcoal-muted"}
              initialAvg={product.ratingAvg}
              initialCount={product.reviewCount}
            />
          </div>

          {/* Price & Cart Area */}
          {isList ? (
            <>
              <div className="flex flex-wrap items-baseline gap-1.5 mb-2">
                <span className="font-bold text-primary leading-none text-sm sm:text-base">
                  {price.toLocaleString('fr-MA', { minimumFractionDigits: 2 }) + ' MAD'}
                </span>
                {isOnSale && oldPrice && (
                  <span className="text-charcoal-muted line-through leading-none font-normal text-xs">
                    {oldPrice.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                  </span>
                )}
                {isPerM2 && (
                  <span className="text-[9px] text-accent font-bold uppercase tracking-wider">/ m²</span>
                )}
              </div>

              <div className="mt-auto flex justify-start">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/produits/${product.slug || product.id}`);
                  }}
                  className="rounded-md bg-primary text-white px-3 py-1.5 text-xs font-bold hover:bg-primary-light transition-colors shadow-sm"
                >
                  Ajouter au panier
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-end justify-between mt-auto gap-2">
              {/* Price Area Grid */}
              <div className="flex flex-col justify-end min-w-0">
                {isOnSale && oldPrice ? (
                  <span className="text-charcoal-muted line-through leading-none font-normal text-[11px] mb-1 truncate">
                    {oldPrice.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                  </span>
                ) : (
                  <span className="leading-none text-[11px] mb-1 opacity-0 select-none">0</span>
                )}
                <span className="font-bold text-primary leading-none text-sm sm:text-base truncate">
                  {price.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD
                  {isPerM2 && <span className="text-[9px] text-accent font-bold uppercase tracking-wider ml-0.5">/m²</span>}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/produits/${product.slug || product.id}`);
                }}
                aria-label={`Ajouter ${product.name} au panier`}
                className="rounded-lg flex items-center justify-center transition-colors duration-300 w-8 h-8 bg-primary-10 text-primary lg:group-hover/card:bg-primary lg:group-hover/card:text-white shrink-0"
              >
                <ShoppingCart size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons (Grid Mode Only) */}
        {!isList && (
          <div className="absolute right-2 top-2 z-30 flex gap-1.5 flex-col">
            <button
              className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-300 shadow-sm opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 ${isWishlisted ? 'bg-primary text-white border border-primary' : 'bg-white/90 backdrop-blur-sm border border-border text-charcoal-muted hover:bg-primary hover:text-white hover:border-primary'}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(productNumId);
              }}
              aria-label={isWishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            >
              <Heart size={14} strokeWidth={isWishlisted ? 0 : 1.5} className={isWishlisted ? "fill-white" : ""} />
            </button>

          </div>
        )}
      </Link>
    </motion.div>
  );
}
