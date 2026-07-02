'use client';

import { usePageTitle } from '@/app/lib/utils';
import { useEffect, useState, useCallback, useRef } from 'react';

import { api, type Product, type ProductStats, type Brand, type Category } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

function StockBar({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-24 bg-slate-200 rounded-full" />
        <span className="text-xs font-medium text-rose-600">Out of Stock</span>
      </div>
    );
  }
  const pct = Math.min(100, (stock / 200) * 100);
  const color = stock <= 10 ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor = stock <= 10 ? 'text-amber-600' : 'text-emerald-600';
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium ${textColor}`}>{stock} in stock</span>
    </div>
  );
}


import { useSearchParams } from 'next/navigation';

export default function AdminProductsPage() {
    usePageTitle('Products');
    const { showToast, showConfirm } = useNotification();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search');

  const [stats, setStats] = useState<ProductStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    pricePerM2: '',
    oldPrice: '',
    stock: '',
    categoryId: '' as string | number,
    brandId: '' as string | number,
    imageUrl: '',
    imageUrls: [] as string[],
    tags: [] as string[],
    description: '',
    isFeatured: false,
  });
  const [currentTag, setCurrentTag] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(urlSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch || '');

  // UX States
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page on search
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, p, b, c] = await Promise.all([
        api.getProductStats(),
        api.getProducts({ page, limit: 5, search: debouncedSearch }),
        api.getBrands(),
        api.getCategories(),
      ]);
      setStats(s);
      setProducts(p.data);
      setBrands(b);
      setCategories(c);
      setTotal(p.total);
      setTotalPages(p.totalPages);
    } catch {
      setError('Failed to connect to the backend. Make sure the server is running on port 3002.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const currentDescription = descriptionRef.current ? DOMPurify.sanitize(descriptionRef.current.innerHTML) : newProduct.description;
      const productData = {
        ...newProduct,
        description: currentDescription,
        price: newProduct.pricePerM2 ? parseFloat(newProduct.pricePerM2) : 0,
        pricePerM2: newProduct.pricePerM2 ? parseFloat(newProduct.pricePerM2) : null,
        oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
        stock: parseInt(newProduct.stock),
        categoryId: newProduct.categoryId ? Number(newProduct.categoryId) : null,
        brandId: newProduct.brandId ? Number(newProduct.brandId) : null,
        tags: newProduct.tags,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        showToast('Produit mis à jour avec succès !', 'success');
      } else {
        await api.createProduct(productData);
        showToast('Produit ajouté avec succès !', 'success');
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', sku: '', pricePerM2: '', oldPrice: '', stock: '', categoryId: '', brandId: '', imageUrl: '', imageUrls: [], tags: [], description: '', isFeatured: false });
      setCurrentTag('');
      loadData(); // Refresh list
    } catch (err) {
      showToast(`Échec de la ${editingProduct ? 'mise à jour' : 'création'} du produit`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku || '',
      pricePerM2: product.pricePerM2 ? product.pricePerM2.toString() : product.price.toString(),
      oldPrice: product.oldPrice ? product.oldPrice.toString() : '',
      stock: product.stock.toString(),
      categoryId: product.categoryId || product.category?.id || '',
      brandId: product.brandId || product.brand?.id || '',
      imageUrl: product.imageUrl || '',
      imageUrls: product.imageUrls || [],
      tags: product.tags || [],
      description: product.description || '',
      isFeatured: product.isFeatured || false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: number) => {
    try {
      setIsDeleting(true);
      await api.deleteProduct(productId);
      showToast('Produit supprimé avec succès !', 'success');
      loadData();
    } catch (err) {
      showToast('Échec de la suppression du produit', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      const results = await api.uploadImages(files);
      const newUrls = results.map(r => r.url);
      
      setNewProduct((prev) => {
        const updatedUrls = [...prev.imageUrls, ...newUrls];
        return { 
          ...prev, 
          imageUrls: updatedUrls,
          // Set primary image to the first one if not already set
          imageUrl: prev.imageUrl || updatedUrls[0] || ''
        };
      });
    } catch (err) {
      showToast('Échec du téléchargement des images', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewProduct(prev => {
      const updatedUrls = prev.imageUrls.filter((_, i) => i !== index);
      return {
        ...prev,
        imageUrls: updatedUrls,
        // If we removed the primary image, update it to the next available one or empty
        imageUrl: prev.imageUrl === prev.imageUrls[index] 
          ? (updatedUrls[0] || '') 
          : prev.imageUrl
      };
    });
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto no-scrollbar bg-white">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products Inventory</h2>
          <p className="text-slate-500 mt-1">Manage your catalog, prices, and stock levels effortlessly.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-64"
              placeholder="Search products..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
      setNewProduct({ name: '', sku: '', pricePerM2: '', oldPrice: '', stock: '', categoryId: '', brandId: '', imageUrl: '', imageUrls: [], tags: [], description: '', isFeatured: false });
              setCurrentTag('');
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add New Product
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-6">
          <span className="material-symbols-outlined">error</span>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Products', value: stats?.total, icon: 'inventory', colorClass: 'bg-blue-50 text-blue-600' },
          { label: 'Low Stock', value: stats?.lowStock, icon: 'warning', colorClass: 'bg-amber-50 text-amber-600' },
          { label: 'Active Items', value: stats?.active, icon: 'check_circle', colorClass: 'bg-emerald-50 text-emerald-600' },
          { label: 'Out of Stock', value: stats?.outOfStock, icon: 'block', colorClass: 'bg-rose-50 text-rose-600' },
        ].map(({ label, value, icon, colorClass }) => (
          <div key={label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-full flex items-center justify-center ${colorClass}`}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
                {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-2xl font-bold">{value?.toLocaleString() ?? '—'}</h3>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        {loading && stats && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-xl shadow-xl border border-slate-100">
              <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-600">Fetching products...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Hero</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && products.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="size-12 rounded-lg" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                    <p>No products found. Add products to the database to see them here.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {product.imageUrl ? (
                          <img className="w-full h-full object-cover" src={product.imageUrl} alt={product.name} />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400">image</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="text-sm font-semibold text-slate-900 line-clamp-2" title={product.name}>{product.name}</span>
                        {product.sku && <span className="text-xs text-slate-500">SKU: {product.sku}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit">
                          {product.category?.name ?? 'Uncategorized'}
                        </span>
                        {product.brand && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 w-fit">
                            Marque: {product.brand.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-nowrap gap-1 mt-1 max-w-[150px] overflow-x-auto custom-scrollbar pb-1">
                          {product.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-slate-50 text-[10px] text-slate-400 border border-slate-200 rounded whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No tags</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {Number(product.pricePerM2 || product.price).toFixed(2)} MAD / m²
                    </td>
                    <td className="px-6 py-4">
                      <StockBar stock={product.stock} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={async () => {
                          try {
                            await api.updateProduct(product.id, { isFeatured: !product.isFeatured });
                            showToast(`Produit ${!product.isFeatured ? 'ajouté au' : 'retiré du'} Hero`, 'success');
                            loadData();
                          } catch (err) {
                            showToast('Erreur lors de la mise à jour', 'error');
                          }
                        }}
                         className={`size-8 inline-flex items-center justify-center rounded-full transition-all shadow-sm ${
                           product.isFeatured 
                             ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' 
                             : 'bg-slate-100 text-slate-300 hover:text-slate-400 hover:bg-slate-200'
                         }`}
                        title={product.isFeatured ? 'Retirer du Hero' : 'Mettre en Hero'}
                      >
                        <span 
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: product.isFeatured ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => showConfirm({
                            title: 'Supprimer le produit',
                            message: 'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
                            confirmText: 'Supprimer',
                            onConfirm: () => handleDelete(product.id)
                          })}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : `Showing ${(page - 1) * 5 + 1}–${Math.min(page * 5, total)} of ${total.toLocaleString()} results`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              Prev
            </button>
            <div className="flex items-center gap-1.5 mx-2">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 3) p = i + 1;
                else if (page === 1) p = i + 1;
                else if (page === totalPages) p = totalPages - 2 + i;
                else p = page - 1 + i;

                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`size-10 rounded-xl text-sm font-bold transition-all ${page === p ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'}`}
                  >{p}</button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
            >
              Next
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative z-10"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium italic">
                    {editingProduct ? 'Mettez à jour les informations de votre stock.' : 'Remplissez les détails pour ajouter un nouvel article.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Nom du Produit</label>
                      <input
                        required
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all"
                        placeholder="ex: Paracetamol 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Prix au m² (MAD)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProduct.pricePerM2}
                        onChange={(e) => setNewProduct({ ...newProduct, pricePerM2: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Ancien Prix (MAD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.oldPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all"
                        placeholder="Optionnel"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Quantité en Stock</label>
                      <input
                        required
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Catégorie</label>
                      <div className="relative">
                        <select
                          required
                          value={newProduct.categoryId}
                          onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all appearance-none"
                        >
                          <option value="">-- Sélectionner --</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group">
                        <div className={`size-6 rounded-md border-2 flex items-center justify-center transition-all ${newProduct.isFeatured ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                          {newProduct.isFeatured && <span className="material-symbols-outlined text-white text-sm font-black">check</span>}
                        </div>
                        <input
                          type="checkbox"
                          checked={newProduct.isFeatured}
                          onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                          className="hidden"
                        />
                        <div>
                          <span className="block text-sm font-black text-slate-900 uppercase tracking-tight">Mise en avant (Hero)</span>
                          <p className="text-[11px] text-slate-500 italic font-medium">Afficher ce produit dans le carrousel principal de l'accueil.</p>
                        </div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Marque</label>
                      <div className="relative">
                        <select
                          value={newProduct.brandId}
                          onChange={(e) => setNewProduct({ ...newProduct, brandId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all appearance-none"
                        >
                          <option value="">-- Sans marque --</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Référence (SKU)</label>
                      <input
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all"
                        placeholder="ex: PRD-001"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tags / Étiquettes</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {newProduct.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all group shadow-md"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => setNewProduct(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }))}
                              className="text-white/60 hover:text-white"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">sell</span>
                          <input
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (currentTag.trim() && !newProduct.tags.includes(currentTag.trim())) {
                                  setNewProduct(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
                                  setCurrentTag('');
                                }
                              }
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all"
                            placeholder="Tapez un tag et appuyez sur Entrée..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentTag.trim() && !newProduct.tags.includes(currentTag.trim())) {
                              setNewProduct(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
                              setCurrentTag('');
                            }
                          }}
                          className="px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Description Détaillée</label>
                        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => document.execCommand('formatBlock', false, 'p')}
                            className="px-3 py-1 text-[10px] font-black text-slate-600 hover:bg-white rounded transition-all flex items-center gap-1 uppercase tracking-tighter"
                          >
                            <span className="material-symbols-outlined text-[14px]">text_fields</span>
                            Paragraphe
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => document.execCommand('formatBlock', false, 'H1')}
                            className="px-3 py-1 text-[10px] font-black text-slate-600 hover:bg-white rounded transition-all flex items-center gap-1 border-l border-slate-200 uppercase tracking-tighter"
                          >
                            <span className="material-symbols-outlined text-[14px]">title</span>
                            Titre
                          </button>
                        </div>
                      </div>
                      <div
                        ref={descriptionRef}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setNewProduct({ ...newProduct, description: DOMPurify.sanitize(e.currentTarget.innerHTML) })}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(newProduct.description) }}
                        className="w-full min-h-[150px] max-h-[300px] overflow-y-auto px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-800 [&_h1]:text-lg [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:my-4 [&_p]:my-2 leading-relaxed"
                        data-placeholder="Décrivez les détails du produit, ses avantages..."
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Galerie Photos</label>
                      
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {newProduct.imageUrls.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl border border-slate-200 bg-white overflow-hidden group shadow-sm">
                            <img src={url} className="w-full h-full object-contain p-2" alt={`Preview ${idx + 1}`} />
                            
                            {newProduct.imageUrl === url && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-[9px] font-black text-white uppercase tracking-widest rounded-lg shadow-lg">
                                Principale
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-4">
                              <button 
                                type="button" 
                                onClick={() => setNewProduct(prev => ({ ...prev, imageUrl: url }))}
                                className="w-full text-[9px] bg-white text-slate-900 py-2 rounded-lg font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0"
                              >
                                Définir Principale
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveImage(idx)}
                                className="w-full text-[9px] bg-rose-500 text-white py-2 rounded-lg font-black uppercase tracking-widest hover:bg-rose-600 transition-all transform translate-y-2 group-hover:translate-y-0 delay-75"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <label className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary bg-slate-50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden">
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="size-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Envoi...</span>
                            </div>
                          ) : (
                            <>
                              <div className="size-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 group-hover:text-primary transition-all mb-2">
                                <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajouter</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                      
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3">
                        <span className="material-symbols-outlined text-blue-500 text-[18px]">info</span>
                        <p className="text-[10px] text-blue-600 font-bold leading-relaxed uppercase tracking-tight">
                          Sélectionnez jusqu'à 10 images. La première image sera utilisée par défaut sur la boutique.
                          Formats: JPG, PNG, WEBP (Max 5MB).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 p-8 border-t border-slate-100 bg-slate-50/50 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-white transition-all"
                  >Annuler</button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isSubmitting ? 'Traitement...' : (editingProduct ? 'Mettre à jour' : 'Ajouter le Produit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* The global NotificationOverlay handles toasts and confirms now */}
    </main>
  );
}
