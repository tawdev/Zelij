'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Product } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { X, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function WishlistPage() {
    const { wishlistIds, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { showToast } = useNotification();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

    const scrollRecentlyViewed = (direction: 'left' | 'right') => {
        const container = document.getElementById('recently-viewed-container');
        if (container) {
            const scrollAmount = direction === 'left' ? -280 : 280;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await api.getProducts({ page: 1, limit: 200 });
                const wishlisted = res.data.filter((p) => wishlistIds.includes(p.id));
                setProducts(wishlisted);

                const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const viewedProducts = viewedIds
                    .map((id: number) => res.data.find(p => p.id === id))
                    .filter(Boolean)
                    .slice(0, 12) as Product[];
                setRecentlyViewed(viewedProducts);
            } catch (err) {
                console.error('Failed to fetch wishlist products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [wishlistIds]);

    const handleAddAllToCart = () => {
        if (products.length === 0) return;
        products.forEach(p => {
            addToCart({
                productId: p.id,
                name: p.name,
                price: Number(p.price),
                imageUrl: p.imageUrl
            });
        });
        showToast(`${products.length} articles ajoutés au panier !`, 'success');
    };

    return (
        <div className="flex-1 flex flex-col bg-canvas overflow-x-hidden">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-5 mb-8 sm:mb-12 md:flex-row md:items-center md:justify-between">

                    {/* Title block */}
                    <div className="min-w-0">
                        <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 2.25rem)' }}
                            className="font-black text-charcoal tracking-tight uppercase italic leading-tight break-words">
                            Ma Liste de Souhaits
                        </h1>
                        <p style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                            className="text-charcoal-soft mt-1 font-medium flex flex-wrap gap-1 items-center">
                            Vous avez
                            <span className="font-black text-primary tracking-wider">{wishlistIds.length} articles</span>
                            précieusement conservés
                        </p>
                    </div>

                    {/* Action buttons — stack on mobile, row on md+ */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:shrink-0">
                        <button
                            onClick={handleAddAllToCart}
                            className="flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 w-full sm:w-auto"
                            style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)' }}
                        >
                            <ShoppingCart size={16} className="shrink-0" strokeWidth={2.5} />
                            Tout ajouter au panier
                        </button>
                    </div>
                </div>

                {/* ── Product Grid ─────────────────────────────────────────── */}
                {loading ? (
                    /* Skeleton */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white border border-border rounded-2xl animate-pulse overflow-hidden">
                                <div className="aspect-square w-full bg-canvas-alt" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 w-16 bg-canvas-alt rounded" />
                                    <div className="h-4 w-3/4 bg-canvas-alt rounded" />
                                    <div className="h-8 w-full bg-canvas-alt rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>

                ) : products.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-6 text-center bg-white border border-border rounded-2xl shadow-2xl">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-canvas-alt flex items-center justify-center mb-6 relative">
                            <Heart size={36} className="text-charcoal/10" strokeWidth={1} />
                            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                        </div>
                        <h3 style={{ fontSize: 'clamp(1.125rem, 3vw, 1.75rem)' }}
                            className="font-black text-charcoal mb-3 uppercase italic tracking-tight">
                            Votre liste est vide
                        </h3>
                        <p className="text-charcoal-soft font-medium mb-8 max-w-sm leading-relaxed text-sm sm:text-base">
                            Coup de foudre ? Ajoutez vos produits préférés ici pour les retrouver plus tard.
                        </p>
                        <Link
                            href="/produits"
                            className="w-full sm:w-auto flex items-center justify-center min-h-[44px] px-10 py-3 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-lg hover:bg-primary transition-all active:scale-95"
                        >
                            Découvrir la Boutique
                        </Link>
                    </div>

                ) : (
                    <>
                        {/* Product cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {products.map((product) => {
                                const price = Number(product.price);
                                const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
                                const isSale = product.onSale || (oldPrice !== null && oldPrice > price);

                                return (
                                    <div
                                        key={product.id}
                                        className="group relative flex flex-col rounded-2xl bg-white border border-border overflow-hidden transition-all hover:border-primary/25 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                                    >
                                        {/* Remove Button — top-right, always 44×44 touch target */}
                                        <button
                                            onClick={() => removeFromWishlist(product.id)}
                                            className="absolute top-3 right-3 z-20 flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white/50 border border-border hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                                            title="Retirer de la wishlist"
                                            aria-label="Retirer de la wishlist"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>

                                        {/* Product Image */}
                                        <Link
                                            href={`/produits/${product.slug || product.id}`}
                                            className="relative w-full aspect-square bg-canvas-alt flex items-center justify-center overflow-hidden"
                                        >
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <ShoppingCart size={48} className="text-charcoal/5" strokeWidth={1} />
                                            )}

                                            {isSale && (
                                                <span className="absolute top-3 left-3 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-black text-white uppercase tracking-wider shadow-lg">
                                                    -{Math.round(((oldPrice || price * 1.3) - price) / (oldPrice || price * 1.3) * 100)}%
                                                </span>
                                            )}
                                        </Link>

                                        {/* Card body */}
                                        <div className="flex flex-1 flex-col p-4">
                                            <Link href={`/produits/${product.slug || product.id}`}>
                                                <h3
                                                    style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)' }}
                                                    className="font-bold text-charcoal leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors"
                                                >
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {/* Price row — always at card bottom */}
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border gap-2">
                                                <div className="flex flex-col min-w-0">
                                                    <span
                                                        style={{ fontSize: 'clamp(0.9rem, 2vw, 1.15rem)' }}
                                                        className="font-black text-primary tracking-tight leading-none"
                                                    >
                                                        {price.toLocaleString('fr-MA')}
                                                        <span className="text-[10px] opacity-60 font-bold ml-1">MAD</span>
                                                    </span>
                                                    {isSale && oldPrice && (
                                                        <span className="text-[11px] font-medium text-charcoal-soft line-through mt-0.5">
                                                            {oldPrice.toLocaleString('fr-MA')}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        addToCart({
                                                            productId: product.id,
                                                            name: product.name,
                                                            price: Number(product.price),
                                                            imageUrl: product.imageUrl
                                                        });
                                                        showToast('Produit ajouté au panier !', 'success');
                                                    }}
                                                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-primary-10 text-primary transition-all hover:bg-primary hover:text-white active:scale-90"
                                                    title="Ajouter au panier"
                                                    aria-label="Ajouter au panier"
                                                >
                                                    <ShoppingCart size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom CTA */}
                        <div className="flex justify-center mt-10 sm:mt-16">
                            <Link
                                href="/produits"
                                className="w-full sm:w-auto flex items-center justify-center min-h-[44px] px-10 py-3 border border-border rounded-xl font-black uppercase tracking-widest text-charcoal bg-canvas-alt hover:bg-charcoal/5 hover:border-primary/30 transition-all text-sm text-center"
                            >
                                Explorer plus de produits
                            </Link>
                        </div>
                    </>
                )}

                {/* ── Recently Viewed ──────────────────────────────────────── */}
                {recentlyViewed.length > 0 && (
                    <div className="mt-12 sm:mt-20">
                        <div className="border-t border-border pt-8 sm:pt-12">

                            {/* Section header + arrows (always visible) */}
                            <div className="flex items-center justify-between mb-5">
                                <h2
                                    style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
                                    className="font-black text-charcoal uppercase italic tracking-tight"
                                >
                                    Consultés Récemment
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => scrollRecentlyViewed('left')}
                                        className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-canvas-alt border border-border text-charcoal hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
                                        aria-label="Précédent"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => scrollRecentlyViewed('right')}
                                        className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-canvas-alt border border-border text-charcoal hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
                                        aria-label="Suivant"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Horizontal scroll carousel with snap */}
                            <div
                                id="recently-viewed-container"
                                className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth"
                                style={{
                                    scrollSnapType: 'x mandatory',
                                    WebkitOverflowScrolling: 'touch',
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                }}
                            >
                                {recentlyViewed.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/produits/${product.slug || product.id}`}
                                        className="shrink-0 group flex flex-col"
                                        style={{
                                            scrollSnapAlign: 'start',
                                            width: 'clamp(140px, 22vw, 200px)',
                                        }}
                                    >
                                        {/* Image */}
                                        <div className="aspect-square w-full rounded-xl overflow-hidden bg-white border border-border mb-2 transition-all group-hover:border-primary/30 group-hover:-translate-y-0.5">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover p-2 transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-charcoal/5">
                                                    <ShoppingCart size={24} strokeWidth={1} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Name — truncate single line */}
                                        <h4 className="text-[12px] sm:text-[13px] font-bold text-charcoal truncate group-hover:text-primary transition-colors px-0.5">
                                            {product.name}
                                        </h4>
                                        <span className="text-[12px] sm:text-[14px] font-black text-primary px-0.5">
                                            {Number(product.price).toLocaleString('fr-MA')}
                                            <span className="text-[9px] opacity-60 ml-1">MAD</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
