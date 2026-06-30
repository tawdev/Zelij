'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, type BlogPost } from '../lib/api';
import { Search, Grid, List as ListIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import BlogHero from '../components/BlogHero';
import BlogCard from '../components/BlogCard';
import BlogTicker from '../components/BlogTicker';
import BlogListingSidebar from '../components/BlogSidebar';

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(['Tous']);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await api.getUniqueCategories();
        if (categories && categories.length > 0) {
          setDynamicCategories(['Tous', ...categories]);
        }
      } catch (error) {
        console.error('Failed to fetch blog categories', error);
      }
    };
    fetchCategories();
  }, []);

  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedTag, selectedCategory, sortBy]);

  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);

      const allRes = await api.getPosts(1, 500);
      const allPublished = allRes.data.filter(p => p.status === 'Published');
      setAllPosts(allPublished);

      const paginatedRes = await api.getPosts(page, limit, debouncedSearch || undefined, selectedTag || undefined, selectedCategory, sortBy);
      const currentPublished = paginatedRes.data.filter(p => p.status === 'Published');
      setPosts(currentPublished);
      
      const filteredTotal = debouncedSearch || selectedTag || selectedCategory !== 'Tous' 
        ? allPublished.filter(p => {
            const matchesSearch = !debouncedSearch || p.title.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesTag = !selectedTag || p.tags?.includes(selectedTag);
            const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
            return matchesSearch && matchesTag && matchesCategory;
          }).length
        : allPublished.length;

      setTotal(filteredTotal);
      setTotalPages(Math.ceil(filteredTotal / limit));
    } catch (error) {
      console.error('Failed to load posts', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedTag, selectedCategory, sortBy, dynamicCategories.length]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav className="flex items-center gap-2 mt-20 justify-center pb-20 animate-fade-in">
        <button
          onClick={() => {
            setPage(p => Math.max(1, p - 1));
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          disabled={page === 1}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gray-50 text-charcoal hover:border-primary hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
            <button
              key={i}
              onClick={() => {
                setPage(i);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-[14px] font-black transition-all ${page === i
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                : 'border border-border bg-gray-50 text-charcoal-muted hover:border-primary hover:text-primary'
                }`}
            >
              {i}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setPage(p => Math.min(totalPages, p + 1));
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          disabled={page === totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-gray-50 text-charcoal hover:border-primary hover:text-primary transition-all disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    );
  };

  const recentPosts = [...allPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="flex-1 flex flex-col bg-canvas font-sans text-charcoal selection:bg-primary/20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BlogHero search={search} setSearch={setSearch} />
        <BlogTicker />
      </motion.div>

      {/* Category & Sort Sub-Navbar */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white border-b border-border transition-all duration-300"
      >
          <div className="mx-auto max-w-[1600px] px-6 lg:px-12 h-16 flex items-center justify-between">
              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar scroll-smooth pb-1 -mb-1">
                  {dynamicCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                            selectedCategory === cat 
                            ? 'bg-primary text-white' 
                            : 'text-charcoal-muted hover:text-primary hover:bg-gray-50'
                        }`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>

              {/* Custom Sort Dropdown */}
              <div className="flex items-center gap-3 shrink-0 ml-8 border-l border-border pl-8">
                  <span className="text-[13px] font-bold text-charcoal-muted uppercase tracking-widest hidden sm:block">Trier par:</span>
                  <div className="relative">
                      <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-[11px] font-black text-charcoal uppercase tracking-widest hover:border-primary hover:text-primary transition-all bg-gray-50"
                      >
                          {sortBy === 'recent' ? 'Plus récent' : 'Plus ancien'}
                          <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-primary' : 'text-charcoal-muted'}`}>
                              keyboard_arrow_down
                          </span>
                      </button>

                      {/* Dropdown Menu */}
                      {isSortOpen && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-border rounded-xl shadow-2xl shadow-black/5 overflow-hidden z-50 animate-fade-in py-1">
                              {[
                                  { label: 'Plus récent', value: 'recent' },
                                  { label: 'Plus ancien', value: 'oldest' }
                              ].map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => {
                                        setSortBy(option.value as any);
                                        setIsSortOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                        sortBy === option.value 
                                        ? 'bg-gray-50 text-primary' 
                                        : 'text-charcoal-soft hover:bg-gray-50 hover:text-primary'
                                    }`}
                                  >
                                      {option.label}
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </motion.section>
      
      <main className="mx-auto w-full max-w-[1400px] px-6 lg:px-12 py-20 pb-40">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10 mb-12"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-[2.5px] bg-primary" />
              <span className="text-[13px] font-black uppercase tracking-[0.3em] text-primary">ARTICLES RECENTS</span>
            </div>
            <h2 className="text-[42px] font-black text-charcoal leading-tight uppercase tracking-tight italic">
              {selectedTag ? `#${selectedTag}` : (debouncedSearch ? `RESULTATS POUR "${debouncedSearch}"` : 'TOUT SAVOIR SUR LE ZELLIGE')}
            </h2>
            {selectedTag && (
                <button 
                  onClick={() => setSelectedTag(null)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-50 text-charcoal-muted rounded-lg text-[12px] font-bold uppercase tracking-wider hover:bg-gray-100 transition-all border border-border"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  EFFACER LE FILTRE
                </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20 rotate-[-12deg]' : 'border border-border bg-gray-50 text-charcoal-muted hover:bg-gray-100'}`}
            >
              <Grid size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20 rotate-[12deg]' : 'border border-border bg-gray-50 text-charcoal-muted hover:bg-gray-100'}`}
            >
              <ListIcon size={22} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>

        {/* Two-column layout: Blog Cards + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Blog Cards */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-[32px] overflow-hidden border border-border">
                    <div className="aspect-[1.5] w-full bg-gray-50 mb-8" />
                    <div className="px-10 pb-10 space-y-6">
                      <div className="h-8 w-3/4 bg-gray-50 rounded-lg mb-4"></div>
                      <div className="h-20 w-full bg-gray-50 rounded-xl mb-4"></div>
                      <div className="h-14 w-full bg-gray-50 rounded-2xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center max-w-xl mx-auto">
                <div className="h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center mb-8 border border-border shadow-sm">
                  <Search className="text-charcoal-soft/40" size={40} />
                </div>
                <h3 className="text-[28px] font-black text-charcoal mb-4 uppercase">Aucun article trouvé</h3>
                <p className="text-[16px] font-medium text-charcoal-muted leading-relaxed">
                  Désolé, nous n'avons trouvé aucun article correspondant à votre recherche. Essayez d'autres mots-clés ou explorez nos guides populaires.
                </p>
                <button onClick={() => setSearch('')} className="mt-10 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/10 transition-all hover:-translate-y-1 active:scale-95">
                  VOIR TOUS LES ARTICLES
                </button>
              </div>
            ) : (
              <div className={`grid gap-7 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {posts.map((post: BlogPost, idx) => (
                  <BlogCard key={post.id} post={post} priority={idx < 3} layout={viewMode} />
                ))}
              </div>
            )}

            {renderPagination()}
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:w-[380px] shrink-0">
            <div className="sticky top-32 self-start space-y-8">
              <BlogListingSidebar 
                recentPosts={recentPosts} 
                activeTag={selectedTag}
                onTagClick={(tag: string) => setSelectedTag(tag === selectedTag ? null : tag)}
                hideTip={false}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
