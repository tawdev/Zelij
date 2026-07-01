'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  ShoppingCart,
  Heart,
  Eye,
  Plus,
  Truck,
  Ruler,
  Paintbrush,
  Hammer,
  Droplets,
  Sparkles,
  Quote,
  ScrollText,
  Search,
  Menu,
  Gem,
  Palette,
  Building2,
  Compass,
  Leaf,
  Clock,
  Handshake,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Category, type Product, type Brand, type Testimonial } from './lib/api';
import ProductRating from './components/ProductRating';
import ProductCard from './components/ProductCard';
import { useCart } from './context/CartContext';

const easeInOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: easeInOut },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 },
};

const childFade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: easeInOut },
};

export default function HomePage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [direction, setDirection] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeTab, setActiveTab] = useState('Populaires');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [featuredTotalPages, setFeaturedTotalPages] = useState(1);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [heroFeatured, setHeroFeatured] = useState<Product[]>([]);

  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCategories(true).then(res => {
      const active = res.filter(c => c.isActive);
      setCategories(active);
      if (active.length > 0) {
        const zellige = active.find(c => c.name.toLowerCase().includes('zellige') || c.name.toLowerCase().includes('classique'));
        setActiveCategoryId(zellige?.id || active[0].id);
      }
    }).catch(console.error);

    api.getProducts({ limit: 12, active: true }).then(res => setFeaturedProducts(res.data)).catch(console.error);
    api.getProducts({ isFeatured: true, active: true, limit: 6 }).then(res => setHeroFeatured(res.data)).catch(console.error);
    api.getBrands().then(res => setBrands(res.filter(b => b.isActive))).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoadingFeatured(true);
    const query: any = { page: 1, limit: 12, active: true };
    if (activeTab === 'Populaires') query.sort = 'popularity';
    if (activeTab === 'Promotions') query.onSale = true;
    if (activeTab === 'Nouveautés') query.sort = 'createdAt';
    api.getProducts(query).then(res => {
      setFeaturedProducts(res.data);
      setFeaturedTotalPages(res.totalPages);
      setIsLoadingFeatured(false);
    }).catch(err => { console.error(err); setIsLoadingFeatured(false); });
  }, [activeTab]);

  useEffect(() => { setFeaturedPage(1); }, [activeTab]);

  useEffect(() => {
    if (activeCategoryId) {
      setIsLoadingProducts(true);
      api.getProducts({ categoryId: activeCategoryId, limit: 12, active: true })
        .then(res => { setCategoryProducts(res.data); setIsLoadingProducts(false); })
        .catch(err => { console.error(err); setIsLoadingProducts(false); });
    }
  }, [activeCategoryId]);

  useEffect(() => {
    setIsLoadingTestimonials(true);
    api.getTestimonials().then(res => {
      if (res?.length > 0) setTestimonials(res);
      setIsLoadingTestimonials(false);
    }).catch(err => { console.error(err); setIsLoadingTestimonials(false); });
  }, []);

  const scrollToPage = (ref: React.RefObject<HTMLDivElement | null>, pageIndex: number) => {
    if (!ref.current) return;
    ref.current.scrollTo({ left: pageIndex * ref.current.clientWidth, behavior: 'smooth' });
  };

  const handleFeaturedScroll = () => {
    if (!featuredScrollRef.current) return;
    const { scrollLeft, clientWidth } = featuredScrollRef.current;
    if (clientWidth === 0) return;
    setFeaturedPage(Math.round(scrollLeft / clientWidth) + 1);
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas font-display overflow-x-hidden">

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[85vh] lg:min-h-[95vh] flex items-center overflow-hidden bg-charcoal">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(http://localhost:3002/uploads/herozelij.png)',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/20" />

        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-[3]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px),
              repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)
            `,
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 lg:px-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="flex h-6 w-px bg-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent-light font-serif italic">
                Artisanat Marocain depuis toujours
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-4">
                L'Art du Zellige
                <br />
                <span className="text-accent-light">Depuis des générations</span>
              </h1>

              <p className="max-w-lg text-base md:text-lg text-white/60 leading-relaxed font-medium mb-8">
                Chaque carreau est taillé à la main par nos maâlems de Fès. Une tradition séculaire au service de vos espaces les plus prestigieux.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/produits"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-primary/20"
                >
                  Découvrir notre collection
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/produits"
                  className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-white/10 hover:border-white/20 text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all"
                >
                  <Ruler size={16} />
                  Calculer ma surface
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-charcoal/80 backdrop-blur-md">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-4">
            <div className="flex items-center justify-around">
              {[
                { label: "Années d'artisanat", value: '50+' },
                { label: 'Maâlems artisans', value: '30+' },
                { label: 'Projets réalisés', value: '2000+' },
                { label: 'Références', value: '150+' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="font-serif text-xl md:text-2xl text-accent-light font-bold">{stat.value}</p>
                  <p className="text-[10px] md:text-xs text-white/40 font-medium uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES BANNER ─── */}
      <section className="py-10 bg-white border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Gem className="w-5 h-5" />, title: 'Artisanat Authentique', desc: 'Taillé à la main à Fès' },
              { icon: <Ruler className="w-5 h-5" />, title: 'Vente au m²', desc: 'Paiement à la surface réelle' },
              { icon: <Truck className="w-5 h-5" />, title: 'Livraison Nationale', desc: 'Partout au Maroc' },
              { icon: <Handshake className="w-5 h-5" />, title: 'Conseil sur Mesure', desc: 'Experts à votre écoute' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-10 flex items-center justify-center text-primary shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-charcoal">{item.title}</h4>
                  <p className="text-xs text-charcoal-muted font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CRAFTMANSHIP STORY ─── */}
      <section className="py-20 lg:py-28 bg-canvas">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp}>
              <div className="relative">
                <img
                  src="http://localhost:3002/uploads/zelijworker1.jpg"
                  alt="Artisan zellige"
                  className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-primary/30 rounded-br-2xl hidden lg:block" />
                <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl hidden lg:block" />
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-xl px-5 py-4 shadow-lg border border-border max-w-[200px]">
                  <p className="text-2xl font-serif font-bold text-primary">50+</p>
                  <p className="text-xs text-charcoal-muted font-medium">Années de savoir-faire transmis</p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Notre Histoire</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-[1.1] mb-6">
                L'Excellence du <span className="text-primary">Zellige Artisanal</span>
              </h2>
              <p className="text-charcoal-soft/80 leading-relaxed mb-6">
                Depuis plus d'un demi-siècle, nos maâlems perpétuent l'art ancestral du zellige dans les ateliers de Fès. Chaque carreau est taillé à la main, émaillé avec des pigments naturels et cuit dans nos fours traditionnels.
              </p>
              <p className="text-charcoal-soft/80 leading-relaxed mb-8">
                Du bejmat rustique aux compositions les plus sophistiquées, nous sélectionnons pour vous le meilleur de l'artisanat marocain. Chaque pièce est unique, chaque motif raconte une histoire.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/about" className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:bg-primary-light">
                  Notre Atelier
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/produits" className="group inline-flex items-center gap-2 px-6 py-3 border border-border text-charcoal rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:border-primary hover:text-primary">
                  Voir la Collection
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section id="categories" className="py-20 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="w-8 h-px bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Nos Collections</span>
              <span className="w-8 h-px bg-accent" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
              Un Art pour <span className="text-primary">Chaque Espace</span>
            </h2>
            <p className="text-charcoal-muted mt-3 max-w-lg mx-auto">
              Du sol au mur, du traditionnel au contemporain, trouvez le zellige qui habillera votre intérieur
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div {...stagger} className="flex items-center justify-center gap-3 flex-wrap mb-10">
            {categories.filter(c => c.parentId === null).map((cat) => {
              const isActive = activeCategoryId === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  {...childFade}
                  onClick={() => {
                    const mainCats = categories.filter(c => c.parentId === null);
                    const ci = mainCats.findIndex(c => c.id === activeCategoryId);
                    const ni = mainCats.findIndex(c => c.id === cat.id);
                    setDirection(ni > ci ? 1 : -1);
                    setActiveCategoryId(cat.id);
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-canvas-alt text-charcoal-soft hover:bg-primary-10 hover:text-primary border border-border'
                  }`}
                >
                  {cat.name}
                </motion.button>
              );
            })}
            {categories.length === 0 && (
              <>
                {['Zellige Classique', 'Bejmat', 'Mosaïque', 'Créations'].map((name, i) => (
                  <button key={i} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-canvas-alt text-charcoal-soft border border-border">
                    {name}
                  </button>
                ))}
              </>
            )}
          </motion.div>

          {/* Products */}
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeCategoryId}
                custom={direction}
                initial={{ opacity: 0, x: direction * 120 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -120 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-4"
                ref={categoryScrollRef}
              >
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="w-[180px] sm:w-[220px] shrink-0 snap-start"
                  />
                ))}
                {!isLoadingProducts && categoryProducts.length === 0 && (
                  <div className="w-full py-16 text-center">
                    <p className="text-charcoal-muted font-medium">Aucun produit trouvé dans cette catégorie.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {isLoadingProducts && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10 rounded-2xl">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Category dots */}
          {categories.filter(c => c.parentId === null).length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              {categories.filter(c => c.parentId === null).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const mainCats = categories.filter(c => c.parentId === null);
                    const ci = mainCats.findIndex(c => c.id === activeCategoryId);
                    const ni = mainCats.findIndex(c => c.id === cat.id);
                    setDirection(ni > ci ? 1 : -1);
                    setActiveCategoryId(cat.id);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${activeCategoryId === cat.id ? 'bg-primary w-6' : 'bg-border w-1.5'}`}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/produits"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:bg-primary-light"
            >
              Voir Toute la Collection
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── AREA CALCULATOR CTA ─── */}
      <section className="py-20 bg-primary">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-accent-light/50" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-light">Outil Exclusif</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-[1.1] mb-6">
                Calculez Vos <span className="text-accent-light">Besoins au m²</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Plus besoin de deviner. Entrez les dimensions de votre mur ou sol, notre calculateur détermine instantanément le nombre de cartons nécessaires, inclut une marge de 10% pour les découpes, et vous donne le prix exact.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Surface exacte', desc: 'Calcul précis au m²' },
                  { label: 'Marge chutes 10%', desc: 'Option ajustable' },
                  { label: 'Cartons nécessaires', desc: 'Arrondi à l\'unité' },
                  { label: 'Prix immédiat', desc: 'Sans engagement' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-accent-light mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white font-bold text-sm">{item.label}</p>
                      <p className="text-white/50 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/produits"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-light text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-accent/20"
              >
                <Ruler size={16} />
                Essayer le Calculateur
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/80">
                    <Ruler className="w-5 h-5 text-accent-light" />
                    <span className="text-sm font-bold uppercase tracking-wider">Calculateur de surface</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">Largeur</p>
                      <p className="text-white font-bold font-mono">4.50 m</p>
                    </div>
                    <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">Hauteur</p>
                      <p className="text-white font-bold font-mono">2.50 m</p>
                    </div>
                  </div>
                  <div className="bg-accent/20 rounded-xl px-4 py-4 border border-accent/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-accent-light uppercase tracking-wider font-semibold">Surface totale</p>
                        <p className="text-2xl font-serif font-bold text-white">12.38 m²</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-accent-light uppercase tracking-wider font-semibold">Prix estimé</p>
                        <p className="text-lg font-bold text-accent-light">1 855 MAD</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-white/40 italic">*Exemple illustratif basé sur un zellige à 150 MAD/m²</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="py-20 bg-canvas">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div {...fadeUp} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-px bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Sélection</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
                Nos <span className="text-primary">Meilleures Ventes</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {['Populaires', 'Nouveautés', 'Promotions'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/20'
                        : 'bg-white text-charcoal-soft border border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <div className="relative">
            <div
              ref={featuredScrollRef}
              onScroll={handleFeaturedScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-4 transition-opacity"
            >
              {featuredProducts.map((product, idx) => (
                <ProductCard
                  key={`featured-${product.id}-${idx}`}
                  product={product}
                  className="w-[180px] sm:w-[220px] shrink-0 snap-start"
                />
              ))}
            </div>

            {/* Navigation arrows */}
            {featuredProducts.length > 4 && (
              <div className="hidden lg:flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none">
                <button
                  onClick={() => scrollToPage(featuredScrollRef, featuredPage - 2)}
                  disabled={featuredPage <= 1}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-charcoal hover:text-primary transition-colors disabled:opacity-30 -ml-5"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollToPage(featuredScrollRef, featuredPage)}
                  disabled={featuredPage >= Math.ceil(featuredProducts.length / 4)}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-charcoal hover:text-primary transition-colors disabled:opacity-30 -mr-5"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── VALUES / WHY ZELIJ ─── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="w-8 h-px bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Pourquoi Zelij Maroc</span>
              <span className="w-8 h-px bg-accent" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
              L'Excellence <span className="text-primary">Artisanale</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Hammer className="w-6 h-6" />,
                title: 'Fait Main',
                desc: 'Chaque carreau est taillé et émaillé individuellement par nos artisans.',
                num: '01',
              },
              {
                icon: <Palette className="w-6 h-6" />,
                title: 'Pigments Naturels',
                desc: 'Nos émaux sont fabriqués à partir d\'oxydes minéraux et de terres locales.',
                num: '02',
              },
              {
                icon: <Leaf className="w-6 h-6" />,
                title: 'Matériaux Nobles',
                desc: 'Terre cuite naturelle, émail sans plomb, respect des traditions.',
                num: '03',
              },
              {
                icon: <Compass className="w-6 h-6" />,
                title: 'Livraison Nationale',
                desc: 'Expédition soignée partout au Maroc avec suivi de commande.',
                num: '04',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...childFade}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group bg-canvas p-7 rounded-xl border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden"
              >
                <span className="absolute top-4 right-5 text-4xl font-serif font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                  {item.num}
                </span>
                <div className="w-12 h-12 rounded-xl bg-primary-10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-charcoal-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DUAL PROMO BANNERS ─── */}
      <section className="py-12 bg-canvas">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/produits?categoryId=1"
              className="group relative h-[300px] rounded-2xl overflow-hidden bg-charcoal"
            >
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80"
                alt="Zellige Traditionnel"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-light">Collection</span>
                <h3 className="font-serif text-2xl text-white mt-1">Zellige Traditionnel</h3>
                <p className="text-white/60 text-sm mt-1">Formes géométriques et couleurs authentiques</p>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-accent-light uppercase tracking-wider mt-3 group-hover:gap-3 transition-all">
                  Découvrir <ArrowRight size={12} />
                </span>
              </div>
            </Link>

            <Link
              href="/produits?categoryId=2"
              className="group relative h-[300px] rounded-2xl overflow-hidden bg-charcoal"
            >
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80"
                alt="Bejmat Moderne"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-light">Collection</span>
                <h3 className="font-serif text-2xl text-white mt-1">Bejmat Contemporain</h3>
                <p className="text-white/60 text-sm mt-1">Lignes épurées pour intérieurs modernes</p>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-accent-light uppercase tracking-wider mt-3 group-hover:gap-3 transition-all">
                  Découvrir <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="w-8 h-px bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Témoignages</span>
              <span className="w-8 h-px bg-accent" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
              Ils Nous <span className="text-primary">Font Confiance</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-canvas border border-border rounded-2xl p-8 md:p-12 relative min-h-[280px] flex flex-col justify-center">
              <div className="absolute top-6 right-6 opacity-5">
                <Quote size={80} className="text-primary" />
              </div>

              {testimonials.length > 0 ? (
                <div key={activeTestimonial} className="relative z-10 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                    {testimonials[activeTestimonial]?.date}
                  </span>
                  <p className="text-lg md:text-xl text-charcoal-soft leading-relaxed italic font-serif">
                    "{testimonials[activeTestimonial]?.content}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {testimonials[activeTestimonial]?.initial}
                    </div>
                    <div>
                      <h4 className="text-charcoal font-bold">{testimonials[activeTestimonial]?.name}</h4>
                      <p className="text-charcoal-muted text-sm">{testimonials[activeTestimonial]?.role}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Mai 2026</span>
                  <p className="text-lg md:text-xl text-charcoal-soft leading-relaxed italic font-serif">
                    "Un service exceptionnel et un zellige d'une qualité rare. Notre riad a été entièrement rénové avec leurs carreaux faits main. Les conseils de l'équipe ont été précieux pour choisir les motifs et les couleurs."
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">K</div>
                    <div>
                      <h4 className="text-charcoal font-bold">Karim B.</h4>
                      <p className="text-charcoal-muted text-sm">Propriétaire Riad, Marrakech</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-10">
              <button
                onClick={() => setActiveTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-charcoal-muted hover:border-primary hover:text-primary transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-2">
                {(testimonials.length > 0 ? testimonials : [1, 2, 3]).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${activeTestimonial === i ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-charcoal-muted hover:border-primary hover:text-primary transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER / CONTACT CTA ─── */}
      <section className="py-16 bg-primary">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-3">
                Prêt à Concrétiser <span className="text-accent-light">Votre Projet ?</span>
              </h2>
              <p className="text-white/60 leading-relaxed">
                Notre équipe d'experts vous accompagne du choix des matériaux à la livraison. Contactez-nous pour un devis personnalisé.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <Link
                href="/contact"
                className="px-8 py-4 bg-white text-primary rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:bg-gray-100 shadow-lg"
              >
                Nous Contacter
              </Link>
              <Link
                href="/produits"
                className="px-8 py-4 border-2 border-white/20 text-white rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:border-white/40"
              >
                Voir la Boutique
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
