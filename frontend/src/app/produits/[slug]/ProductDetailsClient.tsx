'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Product, Review } from '../../lib/api';
import { useWishlist } from '../../context/WishlistContext';

import { useCart } from '../../context/CartContext';
import { generateWhatsAppLink } from '../../lib/whatsapp';
import {
    Heart, ShoppingCart, Star, Truck, ShieldCheck, CreditCard,
    HelpCircle, Headphones, ChevronRight, Minus, Plus, Share2,
    Facebook, Linkedin, MessageCircleWarning, Copy as CopyIcon,
    MessageCircle, Ruler, Box, Euro, Palette, Hammer, Droplets, Maximize2
} from 'lucide-react';
import RelatedProducts from '../../components/RelatedProducts';
import { useNotification } from '../../context/NotificationContext';
import ProductImageZoom from '../../components/ProductImageZoom';

const cleanText = (html: string) => {
    if (!html) return '';
    return html
        .replace(/<[^>]*>?/gm, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
};

export default function ProductDetailsClient({ slug }: { slug: string }) {
    const { showToast } = useNotification();
    const [product, setProduct] = useState<Product | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [height, setHeight] = useState('');
    const [width, setWidth] = useState('');
    const [heightErr, setHeightErr] = useState('');
    const [widthErr, setWidthErr] = useState('');
    const [calcError, setCalcError] = useState('');
    const [activeTab, setActiveTab] = useState<'description' | 'specification' | 'avis'>('description');
    const [reviewName, setReviewName] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                let currentSlug = slug;
                let data: Product | null = null;

                try {
                    data = await api.getProductBySlug(currentSlug);
                } catch (err) {
                    if (/^\d+$/.test(currentSlug)) {
                        try {
                            const productById = await api.getProductById(currentSlug);
                            if (productById && productById.slug) {
                                window.location.href = `/produits/${productById.slug}`;
                                return;
                            }
                            data = productById;
                        } catch (idErr) {
                            throw err;
                        }
                    } else {
                        throw err;
                    }
                }

                setProduct(data);

                if (data) {
                    setActiveImage(data.imageUrl);
                    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const updated = [data.id, ...recentlyViewed.filter((rid: number) => rid !== data.id)].slice(0, 12);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updated));

                    const approvedReviews = await api.getProductReviews(data.id);
                    setReviews(approvedReviews);
                }

                const storeSettings = await api.getSettings();
                setSettings(storeSettings);

            } catch (err) {
                console.error('Failed to load product or reviews:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [slug]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        if (!reviewName || !reviewComment || reviewRating === 0) {
            showToast('Veuillez remplir tous les champs et donner une note.', 'error');
            return;
        }

        try {
            await api.submitReview({
                productId: Number(product.id),
                name: reviewName,
                rating: reviewRating,
                comment: reviewComment,
            });

            showToast('Votre avis a été soumis avec succès et est en attente de modération.', 'success');

            setReviewName('');
            setReviewComment('');
            setReviewRating(0);
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast('Une erreur est survenue lors de la soumission de votre avis.', 'error');
        }
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
        const rating = Math.floor(r.rating);
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating as keyof typeof ratingCounts]++;
        }
    });

    const isPerM2 = product?.pricingUnit === 'per_square_meter';

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-canvas">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas">
                <h1 className="text-2xl font-bold text-charcoal">Produit non trouvé</h1>
                <Link href="/produits" className="text-primary hover:underline">Retour à la boutique</Link>
            </div>
        );
    }

    const inWishlist = isInWishlist(product.id);

    const handleShare = (platform: string) => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = product.name;
        const urls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        };
        if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    const specRows = [
        { label: 'Référence (SKU)', value: product.sku || 'N/A' },
        { label: 'Catégorie', value: product.category?.name || 'N/A' },
        { label: 'Type de vente', value: isPerM2 ? 'Au mètre carré' : 'À l\'unité' },
        ...(product.finishing ? [{ label: 'Finition', value: product.finishing }] : []),
        ...(product.shape ? [{ label: 'Forme', value: product.shape }] : []),
        ...(product.thickness ? [{ label: 'Épaisseur', value: `${product.thickness} cm` }] : []),
        ...(product.formatWidth && product.formatHeight ? [{ label: 'Format carreau', value: `${product.formatWidth} × ${product.formatHeight} cm` }] : []),
        ...(product.boxCoverageM2 ? [{ label: 'Couverture par carton', value: `${Number(product.boxCoverageM2)} m²` }] : []),
        ...(product.boxWeight ? [{ label: 'Poids par carton', value: `${Number(product.boxWeight)} kg` }] : []),
        ...(isPerM2 && product.pricePerM2 ? [{ label: 'Prix au m²', value: `${Number(product.pricePerM2).toFixed(2).replace('.', ',')} MAD` }] : []),
        ...(isPerM2 && product.minOrderM2 ? [{ label: 'Commande minimum', value: `${Number(product.minOrderM2)} m²` }] : []),
        ...(isPerM2 && product.stockM2 ? [{ label: 'Stock disponible', value: `${Number(product.stockM2).toFixed(2)} m²` }] : []),
        { label: 'Stock (unités)', value: `${product.stock} unités` },
        { label: 'État', value: product.stock > 0 ? 'Disponible' : 'Indisponible' },
        { label: 'En promotion', value: product.onSale ? 'Oui' : 'Non' },
        { label: 'Éco-responsable', value: product.ecoFriendly ? 'Oui' : 'Non' },
    ];

    return (
        <div className="flex-1 flex flex-col bg-canvas overflow-x-hidden">
            <div className="max-w-[1200px] mx-auto px-3 sm:px-6">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-[11px] sm:text-[13px] text-charcoal-muted py-3 sm:py-4 border-b border-border mb-4 sm:mb-8 flex-wrap min-w-0">
                    <Link href="/" className="hover:text-primary transition-colors shrink-0">Accueil</Link>
                    {product.category && (
                        <>
                            <ChevronRight className="w-3 h-3 text-charcoal-muted/40 shrink-0" />
                            <Link
                                href={`/produits?categoryId=${product.categoryId}`}
                                className="hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-none"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3 h-3 text-charcoal-muted/40 shrink-0" />
                    <span className="text-charcoal font-medium truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                </nav>

                {/* Product Main Section */}
                <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 mb-8 sm:mb-16">

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">

                        {/* LEFT: Product Image */}
                        <div className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0">
                            <div className="border border-border rounded-2xl relative bg-white shadow-sm overflow-hidden">
                                <div className="aspect-square flex items-center justify-center p-4 sm:p-8">
                                    {activeImage ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ProductImageZoom src={activeImage} alt={product.name} />
                                        </div>
                                    ) : (
                                        <div className="text-charcoal-muted flex flex-col items-center gap-4">
                                            <MessageCircleWarning size={64} strokeWidth={1} />
                                            <p className="text-sm font-medium">Aucune image disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {product.imageUrls && product.imageUrls.length > 1 && (
                                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2 no-scrollbar">
                                    {product.imageUrls.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={`w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] flex-shrink-0 rounded-xl border-2 transition-all p-1 bg-white overflow-hidden hover:shadow-md ${activeImage === img
                                                ? 'border-primary shadow-sm shadow-primary/10'
                                                : 'border-border hover:border-gray-300'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {(!product.imageUrls || product.imageUrls.length <= 1) && product.imageUrl && (
                                <div className="flex gap-2 mt-4">
                                    <div className="w-[72px] h-[72px] border-2 border-primary rounded-xl overflow-hidden p-1 bg-white shadow-sm">
                                        <img src={product.imageUrl} alt="" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CENTER: Product Info */}
                        <div className="flex-1 min-w-0">
                            {isPerM2 && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3">
                                    <Ruler className="w-3 h-3" />
                                    Vendu au mètre carré
                                </div>
                            )}

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal leading-tight mb-2">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4 relative group cursor-pointer w-fit">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-4 h-4 ${Math.round(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-charcoal-muted hover:text-primary hover:underline transition-colors">{reviews.length} Avis</span>

                                <div className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-border shadow-xl rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto origin-top-left transform scale-95 group-hover:scale-100 z-50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={`tooltip-${s}`} className={`w-[18px] h-[18px] ${Math.round(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-base font-bold text-charcoal">{averageRating.toFixed(1)} sur 5</span>
                                    </div>
                                    <p className="text-sm text-charcoal-muted mb-4">{reviews.length} évaluations globales</p>
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = ratingCounts[star as keyof typeof ratingCounts];
                                            const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-3 text-sm text-charcoal-muted">
                                                    <button className="min-w-[55px] text-primary hover:text-primary-light hover:underline text-left font-medium">
                                                        {star} {star === 1 ? 'étoile' : 'étoiles'}
                                                    </button>
                                                    <div className="flex-1 h-[14px] bg-gray-100 border border-gray-200 rounded-sm overflow-hidden">
                                                        <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <span className="min-w-[40px] text-right text-primary font-medium">{percentage}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Stock Status */}
                            <p className={`text-sm font-semibold mb-3 ${product.stock > 0 ? 'text-accent-dark' : 'text-red-500'}`}>
                                {product.stock > 0 ? (isPerM2 ? 'En stock (m²)' : 'En stock') : 'Rupture de stock'}
                            </p>

                            {/* Short Description */}
                            {product.description ? (
                                <div className="mb-4">
                                    <p className="text-sm sm:text-base text-charcoal-soft leading-relaxed line-clamp-3 break-words">
                                        {cleanText(product.description).slice(0, 200)}
                                        {cleanText(product.description).length > 200 ? '...' : ''}
                                    </p>
                                    {cleanText(product.description).length > 120 && (
                                        <button
                                            onClick={() => {
                                                setActiveTab('description');
                                                document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="text-xs text-primary font-bold mt-1.5 hover:underline flex items-center gap-1"
                                        >
                                            En savoir plus <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm sm:text-base text-charcoal-soft leading-relaxed mb-4">
                                    {product.name}. Livraison Maroc.
                                </p>
                            )}

                            {/* Format info for per m² */}
                            {isPerM2 && product.formatWidth && product.formatHeight && (
                                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl border border-border">
                                    <Maximize2 className="w-4 h-4 text-primary shrink-0" />
                                    <span className="text-sm text-charcoal-soft font-medium">
                                        Format carreau : <strong className="text-charcoal">{product.formatWidth} × {product.formatHeight} cm</strong>
                                        {product.boxCoverageM2 && <> · {Number(product.boxCoverageM2)} m²/carton</>}
                                    </span>
                                </div>
                            )}

                            {/* Wishlist */}
                            <div className="flex items-center gap-6 mb-4 pb-4 border-b border-border">
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className={`flex items-center gap-1.5 text-xs sm:text-sm transition-colors ${inWishlist ? 'text-primary' : 'text-charcoal-muted hover:text-primary'}`}
                                >
                                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                                    Souhaits
                                </button>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline flex-wrap gap-2 mb-4">
                                {isPerM2 && product.pricePerM2 ? (
                                    <>
                                        <span className="text-2xl sm:text-3xl font-bold text-primary">
                                            {Number(product.pricePerM2).toFixed(2).replace('.', ',')} MAD
                                        </span>
                                        <span className="text-sm text-charcoal-muted font-medium">/ m²</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl sm:text-3xl font-bold text-primary">
                                            {Number(product.price).toFixed(2).replace('.', ',')} MAD
                                        </span>
                                        {product.oldPrice && product.oldPrice > product.price && (
                                            <span className="text-sm sm:text-base text-charcoal-muted line-through">
                                                {Number(product.oldPrice).toFixed(2).replace('.', ',')} MAD
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Height & Width inputs */}
                            <div className="mb-4">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-1.5">
                                            Hauteur (m)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={height}
                                            onChange={(e) => { setHeight(e.target.value); setHeightErr(''); setCalcError(''); }}
                                            placeholder="ex: 2.5"
                                            className="w-full h-[44px] border border-border rounded-xl px-3.5 text-sm font-medium text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary-10 transition-all bg-white"
                                        />
                                        {heightErr && <p className="text-xs text-red-500 mt-1 font-medium">{heightErr}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-1.5">
                                            Largeur (m)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={width}
                                            onChange={(e) => { setWidth(e.target.value); setWidthErr(''); setCalcError(''); }}
                                            placeholder="ex: 4.5"
                                            className="w-full h-[44px] border border-border rounded-xl px-3.5 text-sm font-medium text-charcoal outline-none focus:border-primary focus:ring-2 focus:ring-primary-10 transition-all bg-white"
                                        />
                                        {widthErr && <p className="text-xs text-red-500 mt-1 font-medium">{widthErr}</p>}
                                    </div>
                                </div>
                                {calcError && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3">
                                        <span className="text-sm text-red-700 font-medium">{calcError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 mb-6">
                                <button
                                    disabled={product.stock === 0}
                                    onClick={() => {
                                        const h = parseFloat(height);
                                        const w = parseFloat(width);
                                        let hasError = false;
                                        setHeightErr(''); setWidthErr(''); setCalcError('');

                                        if (!height || isNaN(h) || h <= 0) {
                                            setHeightErr('Hauteur invalide');
                                            hasError = true;
                                        }
                                        if (h > 50) {
                                            setHeightErr('Max 50 m');
                                            hasError = true;
                                        }
                                        if (!width || isNaN(w) || w <= 0) {
                                            setWidthErr('Largeur invalide');
                                            hasError = true;
                                        }
                                        if (w > 50) {
                                            setWidthErr('Max 50 m');
                                            hasError = true;
                                        }
                                        if (hasError) return;

                                        const area = h * w;
                                        if (area <= 0) {
                                            setCalcError('La surface doit être supérieure à 0.');
                                            return;
                                        }

                                        const coverage = Number(product.boxCoverageM2) || 1;
                                        const boxes = Math.ceil(area / coverage);
                                        const finalArea = boxes * coverage;
                                        const unitPrice = Number(product.pricePerM2 || product.price);
                                        const totalPrice = area * unitPrice;

                                        addToCart(
                                            {
                                                productId: Number(product.id),
                                                name: product.name,
                                                price: totalPrice,
                                                imageUrl: product.imageUrl,
                                                slug: product.slug || undefined,
                                            },
                                            area,
                                            boxes,
                                            {
                                                width: w,
                                                height: h,
                                                numberOfAreas: 1,
                                                totalAreaM2: area,
                                                wastageApplied: false,
                                                finalAreaM2: finalArea,
                                                boxesNeeded: boxes,
                                            },
                                        );
                                    }}
                                    className="w-full h-[48px] bg-primary text-white rounded-xl hover:bg-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                                >
                                    <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                                    <span className="text-sm font-bold uppercase tracking-wider">
                                        Ajouter au panier
                                    </span>
                                </button>

                                    <button
                                        onClick={() => {
                                            const h = parseFloat(height);
                                            const w = parseFloat(width);
                                            let hasError = false;
                                            setHeightErr(''); setWidthErr(''); setCalcError('');

                                            if (!height || isNaN(h) || h <= 0) {
                                                setHeightErr('Hauteur invalide');
                                                hasError = true;
                                            }
                                            if (h > 50) {
                                                setHeightErr('Max 50 m');
                                                hasError = true;
                                            }
                                            if (!width || isNaN(w) || w <= 0) {
                                                setWidthErr('Largeur invalide');
                                                hasError = true;
                                            }
                                            if (w > 50) {
                                                setWidthErr('Max 50 m');
                                                hasError = true;
                                            }
                                            if (hasError) return;

                                            const area = h * w;
                                            if (area <= 0) {
                                                setCalcError('La surface doit être supérieure à 0.');
                                                return;
                                            }
                                            const coverage = Number(product.boxCoverageM2) || 1;
                                            const boxes = Math.ceil(area / coverage);
                                            if (!settings?.phoneNumber && !process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
                                                showToast('Numéro WhatsApp non configuré.', 'error');
                                                return;
                                            }
                                            const unitPrice = Number(product.pricePerM2 || product.price);
                                            const totalPrice = area * unitPrice;
                                            const now = new Date();
                                            const invoiceRef = `DEV-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                                            const whatsappLink = generateWhatsAppLink({
                                                items: [{ name: product.name, quantity: area, price: totalPrice, width: w, height: h, areaM2: area, boxes, isPerM2: true }],
                                                totalPrice,
                                                invoiceReference: invoiceRef,
                                            }, settings?.phoneNumber);
                                            window.open(whatsappLink, '_blank');
                                        }}
                                        className="w-full h-[48px] bg-accent text-white rounded-xl hover:bg-accent-light transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm font-bold uppercase tracking-wider">
                                            Commander via WhatsApp
                                        </span>
                                    </button>
                                </div>

                            {/* Product Meta */}
                            <div className="space-y-2 pt-4 border-t border-border text-sm text-charcoal-muted">
                                {product.sku && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">SKU :</span>
                                        <span className="text-charcoal-soft">{product.sku}</span>
                                    </div>
                                )}
                                {product.category && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Catégorie :</span>
                                        <Link href={`/produits?categoryId=${product.categoryId}`} className="text-primary hover:underline">
                                            {product.category.name}
                                        </Link>
                                    </div>
                                )}
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium whitespace-nowrap">Tags :</span>
                                        {product.tags.map((tag, i) => (
                                            <span key={tag} className="flex items-center">
                                                <Link href={`/produits?search=${encodeURIComponent(tag)}`} className="text-primary hover:underline">
                                                    {tag}
                                                </Link>
                                                {i < product.tags!.length - 1 && <span className="ml-1 mr-2">,</span>}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-3 pt-2">
                                    <span className="font-medium">Partager :</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleShare('facebook')} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-charcoal-muted hover:bg-primary hover:text-white transition-colors">
                                            <Facebook className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleShare('twitter')} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-charcoal-muted hover:bg-primary hover:text-white transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                        </button>
                                        <button onClick={() => handleShare('linkedin')} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-charcoal-muted hover:bg-primary hover:text-white transition-colors">
                                            <Linkedin className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="w-full xl:w-[300px] flex-shrink-0 xl:sticky xl:top-24 self-start space-y-4">
                        {/* Trust Badges */}
                        <div className="space-y-2">
                            {[
                                { icon: <ShieldCheck className="w-4 h-4" />, title: 'QUALITÉ ARTISANALE', desc: 'Fait main à Fès' },
                                { icon: <Ruler className="w-4 h-4" />, title: 'VENTE AU M²', desc: 'Paiement à la surface' },
                                { icon: <Truck className="w-4 h-4" />, title: 'LIVRAISON NATIONALE', desc: 'Partout au Maroc' },
                                { icon: <HelpCircle className="w-4 h-4" />, title: 'CONSEIL EXPERT', desc: 'Devis personnalisé' },
                                { icon: <Headphones className="w-4 h-4" />, title: 'SERVICE CLIENT', desc: 'À votre écoute 7j/7' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border shadow-sm">
                                    <div className="text-primary shrink-0">{badge.icon}</div>
                                    <div>
                                        <div className="text-xs font-bold text-charcoal leading-tight">{badge.title}</div>
                                        <div className="text-xs text-primary leading-tight mt-0.5">{badge.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TABS SECTION */}
                <div id="product-tabs" className="mb-8 sm:mb-16 scroll-mt-20">
                    {/* Tab Headers */}
                    <div className="flex border-b border-border overflow-x-auto no-scrollbar">
                        {[
                            { key: 'description' as const, label: 'Description' },
                            { key: 'specification' as const, label: 'Spécifications' },
                            { key: 'avis' as const, label: `Avis (${reviews.length})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors whitespace-nowrap ${activeTab === tab.key
                                    ? 'text-primary'
                                    : 'text-charcoal-muted hover:text-charcoal-soft'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="py-6 sm:py-10">
                        {activeTab === 'description' && (
                            <div className="max-w-3xl mx-auto w-full px-4">
                                {product.description ? (
                                    <div
                                        className="text-sm sm:text-base text-charcoal-soft leading-relaxed w-full break-words
                                        [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:font-bold [&_h1]:text-charcoal [&_h1]:mb-3
                                        [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-charcoal [&_h2]:mb-2 [&_h2]:mt-6
                                        [&_p]:mb-4
                                        [&_table]:w-full [&_table]:min-w-full [&_table]:block [&_table]:overflow-x-auto [&_table]:mb-6 [&_table]:border-collapse [&_table]:border [&_table]:border-border
                                        [&_td]:p-2 [&_td]:border [&_td]:border-border [&_th]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-gray-50
                                        [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4
                                        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-4 [&_img]:block
                                        [&_iframe]:max-w-full [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                ) : (
                                    <p className="text-sm sm:text-base text-charcoal-soft leading-relaxed text-center">
                                        {product.name}. Zellige artisanal marocain de haute qualité, taillé à la main par nos maâlems. Livraison disponible partout au Maroc.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === 'specification' && (
                            <div className="max-w-3xl mx-auto w-full px-4 overflow-x-auto">
                                <table className="w-full text-sm sm:text-base">
                                    <tbody className="divide-y divide-border">
                                        {specRows.map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-2.5 sm:py-3 pr-4 text-charcoal-muted font-medium w-[140px] sm:w-[200px] align-top">{row.label}</td>
                                                <td className="py-2.5 sm:py-3 text-charcoal font-medium break-words">{row.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'avis' && (
                            <div className="max-w-6xl mx-auto flex gap-6 sm:gap-12 lg:gap-20 flex-col sm:flex-row justify-between items-start">
                                <div className="w-full sm:flex-1 sm:max-w-[450px] bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
                                    <h3 className="text-lg font-bold text-charcoal mb-6">Ajouter un avis</h3>
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="mb-5">
                                            <label className="text-sm font-semibold text-charcoal mb-2 block">
                                                Votre note <span className="text-primary">*</span>
                                            </label>
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onMouseEnter={() => setHoverRating(s)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setReviewRating(s)}
                                                        className="transition-transform active:scale-95"
                                                    >
                                                        <Star className={`w-6 h-6 ${(hoverRating || reviewRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-5">
                                            <label className="text-sm font-semibold text-charcoal mb-2 block">
                                                Nom <span className="text-primary">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Votre nom complet"
                                                value={reviewName}
                                                onChange={(e) => setReviewName(e.target.value)}
                                                className="w-full h-[45px] border border-border rounded-xl px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-10 transition-all bg-white text-charcoal"
                                            />
                                        </div>
                                        <div className="mb-6">
                                            <label className="text-sm font-semibold text-charcoal mb-2 block">
                                                Commentaire <span className="text-primary">*</span>
                                            </label>
                                            <textarea
                                                required
                                                placeholder="Partagez votre expérience avec ce produit..."
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                rows={5}
                                                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-10 transition-all resize-vertical bg-white text-charcoal"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full h-[48px] bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light active:scale-[0.98] transition-all shadow-sm"
                                        >
                                            Soumettre l'avis
                                        </button>
                                    </form>
                                </div>

                                <div className="w-full sm:flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-charcoal">
                                            Avis clients ({reviews.length})
                                        </h3>
                                        {reviews.length > 0 && (
                                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={`w-3.5 h-3.5 ${Math.floor(averageRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-amber-700">{averageRating.toFixed(1)}/5</span>
                                            </div>
                                        )}
                                    </div>

                                    {reviews.length > 0 ? (
                                        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
                                            {reviews.map((rev, i) => (
                                                <div key={i} className="bg-white p-5 rounded-xl border border-border shadow-sm">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-bold text-charcoal">{rev.name}</h4>
                                                            <div className="flex gap-1 mt-1">
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <Star key={s} className={`w-3 h-3 ${rev.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-charcoal-muted font-medium">{new Date(rev.createdAt).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <p className="text-sm text-charcoal-soft leading-relaxed italic">
                                                        &quot;{rev.comment}&quot;
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-border rounded-2xl">
                                            <div className="w-16 h-16 mb-4 text-gray-300">
                                                <MessageCircleWarning size={64} strokeWidth={1} />
                                            </div>
                                            <p className="text-base text-charcoal-muted text-center font-medium">
                                                Soyez le premier à évaluer ce produit.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <RelatedProducts categoryId={product.categoryId} currentProductId={Number(product.id)} />
            </div>
        </div>
    );
}
