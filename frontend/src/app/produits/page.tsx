'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Product, type Category, type Brand } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { ShoppingCart, ChevronRight, ChevronDown, ChevronLeft, MessageCircle, Filter, SlidersHorizontal, Sliders, X, ArrowUpDown, LayoutGrid, List, Check, Package, Image as ImageIcon } from 'lucide-react';
import ProductRating from '../components/ProductRating';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Sub-Components ─────────────────────────────────────────────────────────────────

function CategoryTreeItem({
  category,
  selectedId,
  onSelect,
  level = 0
}: {
  category: Category;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  const handleToggle = () => {
    onSelect(category.id);
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center group">
        <button
          onClick={handleToggle}
          className={`flex-1 flex items-center gap-3 py-2 text-[15px] transition-all text-left ${isSelected
            ? 'font-black text-primary italic'
            : 'font-medium text-charcoal-muted hover:text-primary focus:text-primary'
            }`}
          style={{ paddingLeft: `${level * 20}px` }}
        >
          <span className={`transition-colors flex items-center justify-center shrink-0 ${isSelected ? 'text-primary' : 'text-charcoal-soft group-hover:text-charcoal-muted'}`}>
            {hasChildren && isOpen ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />}
          </span>
          <span className="truncate uppercase tracking-wider text-[13px]">{category.name}</span>
        </button>
      </div>

      {/* Animated subcategories wrapper */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${hasChildren && isOpen
          ? 'grid-rows-[1fr] opacity-100 mt-1'
          : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
      >
        <div className="overflow-hidden">
          {hasChildren && category.children!.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
const FALLBACK_MAX_PRICE = 20000;

function ProductListingContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
  const initialBrandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : null;
  const initialOnSale = searchParams.get('onSale') === 'true';
  const initialSort = searchParams.get('sort') || 'newest';
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [brandId, setBrandId] = useState<number | null>(initialBrandId);
  const [sort, setSort] = useState(initialSort);

  // Advanced Filters
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(initialOnSale);
  const [ecoFriendly, setEcoFriendly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [maxPriceLimit, setMaxPriceLimit] = useState(FALLBACK_MAX_PRICE);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync with URL params (e.g. from Header search)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
    const urlBrand = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : null;
    const urlOnSale = searchParams.get('onSale') === 'true';
    const urlSort = searchParams.get('sort') || 'newest';

    if (urlSearch !== search) setSearch(urlSearch);
    if (urlCategory !== categoryId) setCategoryId(urlCategory);
    if (urlBrand !== brandId) setBrandId(urlBrand);
    if (urlOnSale !== onSale) setOnSale(urlOnSale);
    if (urlSort !== sort) setSort(urlSort);
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, brandId, sort, minPrice, maxPrice, inStock, onSale, ecoFriendly, limit]);

  // Load Categories & Brands
  useEffect(() => {
    api.getCategoriesWithProducts().then(setCategories).catch(console.error);
    api.getBrandsWithProducts().then(setBrands).catch(console.error);
    api.getProductStats().then(stats => {
      if (stats.maxPrice) {
        setMaxPriceLimit(Math.ceil(stats.maxPrice / 100) * 100);
      }
    }).catch(console.error);
  }, []);

  // Load Products
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        page,
        limit,
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        minPrice: (minPrice !== null && minPrice !== undefined) ? minPrice : undefined,
        maxPrice: (maxPrice !== null && maxPrice !== undefined) ? maxPrice : undefined,
        inStock: inStock || undefined,
        onSale: onSale || undefined,
        ecoFriendly: ecoFriendly || undefined,
        sort: sort || undefined,
        active: true,
      });
      setProducts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages || Math.ceil(res.total / limit));

      const cachedCategories = await api.getCategoriesWithProducts();
      setCategories(cachedCategories);

    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryId, brandId, minPrice, maxPrice, inStock, onSale, ecoFriendly, sort, limit]);

  useEffect(() => { loadData(); }, [loadData]);

  // Listen for external filter trigger (from MobileBottomNav)
  useEffect(() => {
    const handleOpenFilter = () => setIsSidebarOpen(true);
    window.addEventListener('open-filter', handleOpenFilter);
    return () => window.removeEventListener('open-filter', handleOpenFilter);
  }, []);

  // Load Latest Products (Sidebar)
  useEffect(() => {
    api.getProducts({ sort: 'newest', limit: 4 })
      .then(res => setLatestProducts(res.data))
      .catch(console.error);
  }, []);

  // Derived hierarchical categories
  const categoryTree = useMemo(() => {
    const buildTree = (items: Category[], parentId: number | null = null): Category[] => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };
    return buildTree(categories);
  }, [categories]);

  // Helper for Pagination Display
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, page + 1);

    if (page === 1) end = Math.min(3, totalPages);
    if (page === totalPages) start = Math.max(1, totalPages - 2);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-[14px] font-black shadow-sm transition-all ${page === i
            ? 'bg-primary text-white shadow-primary/20 scale-110'
            : 'bg-white text-charcoal-muted border border-border hover:text-primary hover:border-primary'
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <nav className="flex items-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gray-50 hover:bg-canvas-alt transition-colors disabled:opacity-30 shadow-sm"
        >
          <ChevronLeft size={18} className="text-charcoal" />
        </button>

        {start > 1 && (
          <>
            <button onClick={() => setPage(1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-[14px] font-black text-charcoal-muted border border-border hover:text-primary transition-colors shadow-sm">1</button>
            {start > 2 && <span className="flex h-10 w-6 items-center justify-center text-charcoal-muted font-bold">...</span>}
          </>
        )}

        {pages}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="flex h-10 w-6 items-center justify-center text-charcoal-muted font-bold">...</span>}
            <button onClick={() => setPage(totalPages)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-[14px] font-black text-charcoal-muted border border-border hover:text-primary transition-colors shadow-sm">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gray-50 hover:bg-canvas-alt transition-colors disabled:opacity-30 shadow-sm"
        >
          <ChevronRight size={18} className="text-charcoal" />
        </button>
      </nav>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas font-sans text-charcoal selection:bg-primary/20 selection:text-primary">

      {/* Mobile Sticky Filter Bar - Visible only on mobile/tablet */}
      <div className="xl:hidden sticky top-[84px] lg:top-[90px] z-50 bg-white/95 backdrop-blur-md border-b border-border py-2 px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-gray-50 border border-border rounded-xl text-[13px] font-bold text-charcoal hover:border-primary transition-all"
          >
            <Filter size={18} className="text-primary" />
            Filtrer
          </button>

          <div className="flex-1 relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex items-center justify-center gap-2 h-11 bg-gray-50 border border-border rounded-xl text-[13px] font-bold text-charcoal hover:border-primary transition-all"
            >
              <ArrowUpDown size={18} className="text-charcoal-muted shrink-0" />
              <span className="truncate">{
                sort === 'newest' ? 'Derniers' :
                  sort === 'priceAsc' ? 'Prix: Min' :
                    sort === 'priceDesc' ? 'Prix: Max' : 'Trier'
              }</span>
            </button>
            {isSortOpen && (
              <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[100] bg-white rounded-xl shadow-lg border border-border py-2 animate-in fade-in slide-in-from-top-2">
                {[
                  { label: 'Derniers', value: 'newest' },
                  { label: 'Prix : décroissant', value: 'priceDesc' },
                  { label: 'Prix : croissant', value: 'priceAsc' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSort(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-[14px] font-medium transition-colors hover:bg-gray-50 ${sort === option.value ? 'text-primary bg-primary-10' : 'text-charcoal-muted'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-2 py-6 sm:py-8 sm:px-4 lg:px-6">
        <div className="flex flex-col xl:flex-row gap-10">

          {/* Sidebar / Filter Drawer */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`
            fixed inset-0 z-[150] bg-canvas transition-transform duration-300 xl:relative xl:z-0 xl:translate-x-0 xl:w-[280px] xl:shrink-0 xl:block xl:sticky xl:top-[120px] xl:h-[calc(100vh-140px)]
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
            overflow-y-auto custom-scrollbar xl:pr-4
          `}>
            {/* Mobile Sidebar Header */}
            <div className="xl:hidden flex items-center justify-between p-5 border-b border-border bg-primary text-white">
              <div className="flex items-center gap-2">
                <Sliders size={20} />
                <span className="text-[17px] font-black uppercase tracking-widest">Filtres</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 xl:p-0 space-y-10">
              {/* Categories */}
              <div>
                <div className="mb-6">
                  <h3 className="text-[20px] font-bold text-charcoal mb-3 font-display">Parcourir les catégories</h3>
                  <div className="h-[1px] w-full bg-border relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-primary"></div>
                  </div>
                </div>
                <div className="relative group/scroll">
                  {/* Top Arrow Indicator */}
                  <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="rotate-180 text-primary" />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                    <div className="space-y-1">
                      <button
                        onClick={() => setCategoryId(null)}
                        className={`w-full flex items-center gap-2 py-2 text-[14px] transition-colors uppercase tracking-widest ${categoryId === null ? 'font-black text-primary' : 'font-medium text-charcoal-soft hover:text-primary'}`}
                      >
                        <LayoutGrid size={18} className={`${categoryId === null ? 'text-primary' : 'text-charcoal-muted'}`} /> Tous les produits
                      </button>
                      {categoryTree.map(cat => (
                        <CategoryTreeItem
                          key={cat.id}
                          category={cat}
                          selectedId={categoryId}
                          onSelect={setCategoryId}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Arrow Indicator */}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Brands Filter */}
              <div>
                <div className="mb-6 mt-10">
                  <h3 className="text-[20px] font-bold text-charcoal mb-3 font-display">Marques</h3>
                  <div className="h-[1px] w-full bg-border relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-primary"></div>
                  </div>
                </div>
                <div className="relative group/scroll">
                  {/* Top Arrow Indicator */}
                  <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="rotate-180 text-primary" />
                  </div>

                  <div className="h-[200px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                    <div className="space-y-1">
                      <button
                        onClick={() => setBrandId(null)}
                        className={`w-full flex items-center gap-2 py-2 text-[14px] transition-colors uppercase tracking-widest ${brandId === null ? 'font-black text-primary' : 'font-medium text-charcoal-muted hover:text-primary'}`}
                      >
                        Toutes les marques
                      </button>
                      {brands.map(brand => (
                        <button
                          key={brand.id}
                          onClick={() => setBrandId(brand.id)}
                          className={`w-full flex items-center gap-2 py-2 text-[14px] transition-colors uppercase tracking-widest ${brandId === brand.id ? 'font-black text-primary' : 'font-medium text-charcoal-muted hover:text-primary'}`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Arrow Indicator */}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Filters / Price Range */}
              <div>
                <div className="mb-8">
                  <h3 className="text-[20px] font-bold text-charcoal mb-3 font-display">Filtres</h3>
                  <div className="h-[1px] w-full bg-border relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-primary"></div>
                  </div>
                </div>

                <div className="relative group/scroll">
                  {/* Top Arrow Indicator */}
                  <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="rotate-180 text-primary" />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar py-2">
                    <div className="px-1">
                      <h4 className="text-[17px] font-bold text-charcoal mb-5 font-display">Prix</h4>

                      <div className="flex items-center gap-3 mb-8">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            aria-label="Prix minimum"
                            placeholder="Min"
                            value={minPrice === null ? '' : minPrice.toLocaleString()}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setMinPrice(val === '' ? null : Number(val));
                            }}
                            className="w-full h-12 rounded-xl border border-border bg-gray-50 text-center text-[15px] font-black text-charcoal outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <span className="text-charcoal-muted font-black">—</span>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            aria-label="Prix maximum"
                            placeholder="Max"
                            value={maxPrice === null ? '' : maxPrice.toLocaleString()}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setMaxPrice(val === '' ? null : Number(val));
                            }}
                            className="w-full h-12 rounded-xl border border-border bg-gray-50 text-center text-[15px] font-black text-charcoal outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div className="relative h-1 w-full bg-gray-50 rounded-full mb-4">
                        <div
                          className="absolute h-full bg-primary rounded-full"
                          style={{
                            left: `${((minPrice || 0) / maxPriceLimit) * 100}%`,
                            right: `${100 - (((maxPrice || maxPriceLimit) / maxPriceLimit) * 100)}%`
                          }}
                        ></div>

                        {/* Min Slider */}
                        <input
                          type="range"
                          min="0"
                          max={maxPriceLimit}
                          aria-label="Prix minimum"
                          value={minPrice || 0}
                          onChange={(e) => setMinPrice(Math.min(Number(e.target.value), (maxPrice || maxPriceLimit)))}
                          className="dual-range-input h-1 opacity-0 cursor-pointer z-40"
                        />

                        {/* Max Slider */}
                        <input
                          type="range"
                          min="0"
                          max={maxPriceLimit}
                          aria-label="Prix maximum"
                          value={maxPrice || maxPriceLimit}
                          onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), (minPrice || 0)))}
                          className="dual-range-input h-1 opacity-0 cursor-pointer z-30"
                        />

                        {/* Visual Thumbs */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -ml-2 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 cursor-pointer shadow-lg pointer-events-none z-20"
                          style={{ left: `${((minPrice || 0) / maxPriceLimit) * 100}%` }}
                        ></div>
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -ml-2 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 cursor-pointer shadow-lg pointer-events-none z-20"
                          style={{ left: `${((maxPrice || maxPriceLimit) / maxPriceLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Arrow Indicator */}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-widest text-charcoal-muted mb-5">Disponibilité</h3>
                <div className="relative group/scroll">
                  {/* Top Arrow Indicator */}
                  <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="rotate-180 text-primary" />
                  </div>

                  <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar py-1">
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                        <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${inStock ? 'border-accent bg-accent' : 'border-border bg-gray-50 group-hover:border-primary'}`}>
                          {inStock && <Check size={14} className="text-white font-black" />}
                        </div>
                        <span className={`text-[13px] font-black uppercase tracking-widest transition-colors ${inStock ? 'text-accent' : 'text-charcoal-muted group-hover:text-primary'}`}>En Stock</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
                        <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${onSale ? 'border-accent bg-accent' : 'border-border bg-gray-50 group-hover:border-primary'}`}>
                          {onSale && <Check size={14} className="text-white font-black" />}
                        </div>
                        <span className={`text-[13px] font-black uppercase tracking-widest transition-colors ${onSale ? 'text-accent' : 'text-charcoal-muted group-hover:text-primary'}`}>En Promotion</span>
                      </label>
                    </div>
                  </div>

                  {/* Bottom Arrow Indicator */}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Latest Products - Sidebar Section */}
              <div className="hidden xl:block">
                <div className="mb-6">
                  <h3 className="text-[20px] font-bold text-charcoal mb-3 font-display">Derniers produits</h3>
                  <div className="h-[1px] w-full bg-border relative">
                    <div className="absolute top-0 left-0 h-[3px] -top-[1px] w-[60px] bg-primary"></div>
                  </div>
                </div>

                <div className="relative group/scroll">
                  {/* Top Arrow Indicator */}
                  <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="rotate-180 text-primary" />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-6">
                      {latestProducts.map(product => {
                        const price = Number(product.price);
                        const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
                        return (
                          <Link key={product.id} href={`/produits/${product.slug || product.id}`} className="flex gap-4 group">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-white p-1 transition-all group-hover:border-primary/20 group-hover:shadow-md">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-charcoal-muted">
                                  <ImageIcon size={32} />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                              <h4 className="text-[14px] font-bold text-charcoal leading-tight mb-1 line-clamp-2 transition-colors group-hover:text-primary">{product.name}</h4>
                              <ProductRating productId={product.id} className="mb-1" starSize={14} textSize="text-[11px]" />
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[14px] font-black text-primary">{price.toFixed(2).replace('.', ',')} MAD</span>
                                {oldPrice && oldPrice > price && (
                                  <span className="text-[12px] font-medium text-charcoal-muted line-through">{(oldPrice).toFixed(2).replace('.', ',')} MAD</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Arrow Indicator */}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover/scroll:opacity-20 transition-opacity pointer-events-none">
                    <ChevronDown size={14} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* Mobile "Apply" Button */}
              <div className="xl:hidden pt-4 pb-10">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest"
                >
                  Afficher les produits
                </button>
              </div>
            </div>
          </motion.aside>

          {/* Grid Area */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-1">
              <div>
                <h2 className="text-[28px] font-black text-charcoal tracking-tight">
                  {categoryId ? (categories.find(c => c.id === categoryId)?.name || 'Boutique') : 'Boutique'}
                </h2>
              </div>

              <div className="hidden xl:flex flex-wrap items-center gap-3">
                {/* View Mode Toggle Pill */}
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-border hover:border-primary shadow-inner mr-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${viewMode === 'grid' ? 'bg-primary shadow-sm text-white' : 'text-charcoal-muted hover:text-charcoal'}`}
                  >
                    <LayoutGrid size={20} className={viewMode === 'grid' ? 'text-white' : ''} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${viewMode === 'list' ? 'bg-primary shadow-sm text-white' : 'text-charcoal-muted hover:text-charcoal'}`}
                  >
                    <List size={20} className={viewMode === 'list' ? 'text-white' : ''} />
                  </button>
                </div>

                {/* Custom Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-gray-50 py-2 pl-4 pr-3 text-[13px] font-bold text-charcoal outline-none hover:border-primary transition-all cursor-pointer min-w-[140px] justify-between focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <span>{
                      sort === 'newest' ? 'Derniers' :
                        sort === 'priceAsc' ? 'Prix: croissant' :
                          sort === 'priceDesc' ? 'Prix: décroissant' :
                            sort === 'alpha' ? 'Alphabétique' :
                              sort === 'relevance' ? 'Pertinence' :
                                sort === 'rating' ? 'Les mieux notés' : 'Derniers'
                    }</span>
                    <ChevronDown size={16} className={`text-charcoal-muted transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute top-[calc(100%+12px)] right-0 z-[100] min-w-[180px] bg-white backdrop-blur-xl rounded-[12px] shadow-lg border border-border py-2 animate-in fade-in zoom-in duration-200 origin-top">
                      {/* Arrow Pointer */}
                      <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white backdrop-blur-xl border-t border-l border-border rotate-45"></div>

                      {[
                        { label: 'Alphabétique', value: 'alpha' },
                        { label: 'Derniers', value: 'newest' },
                        { label: 'Prix : décroissant', value: 'priceDesc' },
                        { label: 'Prix : croissant', value: 'priceAsc' },
                        { label: 'Pertinence', value: 'relevance' },
                        { label: 'Les mieux notés', value: 'rating' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSort(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-50 ${sort === option.value ? 'text-primary bg-primary-10' : 'text-charcoal-muted'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Limit Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLimitOpen(!isLimitOpen)}
                    onBlur={() => setTimeout(() => setIsLimitOpen(false), 200)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-gray-50 py-2 pl-4 pr-3 text-[13px] font-bold text-charcoal outline-none hover:border-primary transition-all cursor-pointer min-w-[70px] justify-between focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <span>{limit}</span>
                    <ChevronDown size={16} className={`text-charcoal-muted transition-transform duration-300 ${isLimitOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLimitOpen && (
                    <div className="absolute top-[calc(100%+12px)] right-0 z-[100] min-w-[80px] bg-white backdrop-blur-xl rounded-[12px] shadow-lg border border-border py-2 animate-in fade-in zoom-in duration-200 origin-top">
                      {/* Arrow Pointer */}
                      <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white backdrop-blur-xl border-t border-l border-border rotate-45"></div>

                      {[10, 20, 30, 40, 50].map((val) => (
                        <button
                          key={val}
                          onClick={() => {
                            setLimit(val);
                            setIsLimitOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-gray-50 ${limit === val ? 'text-primary bg-primary-10' : 'text-charcoal-muted'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid Area ... */}
            {loading ? (
              <div className={`grid gap-3 sm:gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`animate-pulse bg-white p-4 border border-border ${viewMode === 'grid' ? 'h-[250px] sm:h-[380px] flex flex-col' : 'h-[160px] sm:h-[200px] flex gap-4 sm:gap-6'} rounded-[20px] shadow-sm`}>
                    <div className={`${viewMode === 'grid' ? 'w-full h-[60%] mb-4' : 'h-full w-32 sm:w-48'} bg-gray-50 rounded-[12px]`}></div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="h-4 w-3/4 bg-gray-50 rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-50 rounded"></div>
                      <div className="mt-auto flex justify-between items-end">
                        <div className="h-6 w-1/3 bg-gray-50 rounded"></div>
                        <div className="h-10 w-10 bg-gray-50 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center bg-white rounded-[24px] border border-border">
                <Package size={64} className="text-charcoal-muted/30 mb-4" />
                <h3 className="text-lg sm:text-xl font-black text-charcoal mb-2">Aucun produit trouvé</h3>
                <p className="text-[14px] sm:text-[16px] text-charcoal-muted font-medium">Essayez d'ajuster vos filtres ou termes de recherche.</p>
                <button
                  onClick={() => { setCategoryId(null); setBrandId(null); setSearch(''); setMinPrice(null); setMaxPrice(null); setInStock(false); setOnSale(false); setEcoFriendly(false); }}
                  className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary-light transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="h-full"
                  >
                    <ProductCard product={product} viewMode="grid" />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className="h-full"
                  >
                    <ProductCard product={product} viewMode="list" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination Controls */}
            {products.length > 0 && !loading && (
              <div className="mt-10 sm:mt-14 mb-4 flex items-center justify-center -mx-2 sm:mx-0 overflow-x-auto pb-4">
                {renderPagination()}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 bg-canvas min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <ProductListingContent />
    </Suspense>
  );
}
