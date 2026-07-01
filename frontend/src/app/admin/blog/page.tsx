'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api, type BlogPost, type Tip, type NewsletterSubscriber, type TagCount } from '../../lib/api';
import { Mail, Quote, Tag, FileText, Check, AlertCircle, Plus, Eye, Trash2, Edit } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}


export default function AdminBlogPage() {
    const { showToast, showConfirm } = useNotification();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Tabs & New Data
    const [activeTab, setActiveTab] = useState<'articles' | 'tips' | 'newsletter' | 'tags'>('articles');
    const [tips, setTips] = useState<Tip[]>([]);
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [tagStats, setTagStats] = useState<TagCount[]>([]);

    // Editor Refs & State
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const editorImageInputRef = useRef<HTMLInputElement>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Tip Modal State
    const [isTipModalOpen, setIsTipModalOpen] = useState(false);
    const [editingTip, setEditingTip] = useState<Tip | null>(null);
    const [tipForm, setTipForm] = useState({
        content: '',
        authorName: '',
        authorRole: 'Expert Outillage',
        isActive: true
    });

    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        category: '',
        excerpt: '',
        imageUrl: '',
        status: 'Draft',
        author: 'Admin',
        tags: [] as string[],
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        publishDate: new Date().toISOString().split('T')[0]
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setForm(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const insertTag = (tagName: string, placeholder: string = '') => {
        if (!contentRef.current) return;

        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);

        let before = text.substring(0, start);
        let after = text.substring(end);
        let tagStart = `<${tagName}>`;
        let tagEnd = `</${tagName}>`;
        let content = selection || placeholder;

        if (tagName === 'a') {
            const url = prompt('Enter URL:', 'https://');
            if (url === null) return;
            tagStart = `<a href="${url}" class="text-blue-600 hover:underline" target="_blank">`;
        } else if (tagName === 'img') {
            triggerEditorImageUpload();
            return;
        } else if (tagName === 'ul') {
            tagStart = '<ul class="list-disc ml-6 my-4 space-y-2">\n  <li>';
            tagEnd = '</li>\n</ul>';
        }

        const newContent = before + tagStart + content + tagEnd + after;
        setForm(prev => ({ ...prev, content: newContent }));

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            const newPos = start + tagStart.length + content.length + tagEnd.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const triggerEditorImageUpload = () => {
        editorImageInputRef.current?.click();
    };

    const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !contentRef.current) return;

        try {
            setIsUploading(true);
            const result = await api.uploadImage(file);

            const textarea = contentRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;

            let before = text.substring(0, start);
            let after = text.substring(end);
            const imgTag = `<img src="${result.url}" alt="" class="w-full rounded-2xl my-6 shadow-lg" />`;

            const newContent = before + imgTag + after;

            // Use functional update to ensure we have late state
            setForm(prev => ({ ...prev, content: newContent }));

            // Restore focus
            setTimeout(() => {
                textarea.focus();
                const newPos = start + imgTag.length;
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        } catch (err) {
            showToast('Échec du téléchargement de l\'image', 'error');
        } finally {
            setIsUploading(false);
            // Reset input
            if (editorImageInputRef.current) editorImageInputRef.current.value = '';
        }
    };

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            if (activeTab === 'articles') {
                const [postsRes, catsRes] = await Promise.all([
                    api.getPosts(page, 5, searchQuery),
                    api.getCategories()
                ]);
                setPosts(postsRes.data);
                setTotal(postsRes.total);
                setTotalPages(postsRes.totalPages);
                setCategories(catsRes);
            } else if (activeTab === 'tips') {
                const tipsData = await api.getTips();
                setTips(tipsData);
            } else if (activeTab === 'newsletter') {
                const subData = await api.getNewsletterSubscribers();
                setSubscribers(subData);
            } else if (activeTab === 'tags') {
                const tagsData = await api.getPopularTags();
                setTagStats(tagsData);
            }
        } catch (err) {
            showToast('Échec du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery, activeTab]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const result = await api.uploadImage(file);
            setForm(prev => ({ ...prev, imageUrl: result.url }));
        } catch (err) {
            showToast('Image upload failed', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            // Auto-populate SEO fields
            const finalForm = {
                ...form,
                metaTitle: form.title,
                metaDescription: form.excerpt,
                metaKeywords: '' // Not needed
            };

            if (editingPost) {
                await api.updatePost(editingPost.id, finalForm);
                showToast('Article mis à jour avec succès !', 'success');
            } else {
                await api.createPost(finalForm);
                showToast('Article créé avec succès !', 'success');
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to save post';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setForm({
            title: post.title,
            slug: post.slug || '',
            content: post.content,
            category: post.category || '',
            excerpt: post.excerpt || '',
            imageUrl: post.imageUrl || '',
            status: post.status,
            author: post.author,
            tags: post.tags || [],
            metaTitle: post.metaTitle || '',
            metaDescription: post.metaDescription || '',
            metaKeywords: post.metaKeywords || '',
            publishDate: post.publishDate ? post.publishDate.split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (postId: number) => {
        try {
            setIsDeleting(true);
            await api.deletePost(postId);
            showToast('Article supprimé avec succès !', 'success');
            loadData();
        } catch (err) {
            showToast('Échec de la suppression de l\'article', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // New Handlers for Tips & Newsletter
    const handleTipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingTip) {
                await api.updateTip(editingTip.id, tipForm);
                showToast('Astuce mise à jour !', 'success');
            } else {
                await api.createTip(tipForm);
                showToast('Astuce créée !', 'success');
            }
            setIsTipModalOpen(false);
            loadData();
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to save tip';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubscriber = async (id: number) => {
        showConfirm({
            title: 'Supprimer l\'abonné',
            message: 'Êtes-vous sûr de vouloir supprimer cet abonné ?',
            confirmText: 'Supprimer',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteSubscriber(id);
                    showToast('Abonné supprimé', 'success');
                    loadData();
                } catch (err: any) {
                    const errorMessage = err.message || 'Failed to remove subscriber';
                    showToast(errorMessage, 'error');
                }
            }
        });
    };

    const handleToggleTipActive = async (tip: Tip) => {
        try {
            await api.updateTip(tip.id, { isActive: !tip.isActive });
            showToast('Statut de l\'astuce mis à jour', 'success');
            loadData();
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update status';
            showToast(errorMessage, 'error');
        }
    };

    return (
        <main className="flex-1 p-8 overflow-y-auto no-scrollbar bg-white">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Blog Management</h2>
                        <p className="text-[13px] md:text-sm text-slate-500 mt-1 font-medium">Create and manage your articles, news, and updates.</p>
                    </div>
                    {activeTab === 'articles' && (
                        <button
                            onClick={() => {
                                setEditingPost(null);
                                setForm({
                                    title: '',
                                    slug: '',
                                    content: '',
                                    category: '',
                                    excerpt: '',
                                    imageUrl: '',
                                    status: 'Draft',
                                    author: 'Admin',
                                    tags: [],
                                    metaTitle: '',
                                    metaDescription: '',
                                    metaKeywords: '',
                                    publishDate: new Date().toISOString().split('T')[0]
                                });
                                setIsModalOpen(true);
                            }}
                            className="w-full md:w-auto bg-primary hover:opacity-90 text-white px-8 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-wider"
                        >
                            <Plus size={20} />
                            Écrire un article
                        </button>
                    )}
                    {activeTab === 'tips' && (
                        <button
                            onClick={() => {
                                setEditingTip(null);
                                setTipForm({ content: '', authorName: '', authorRole: 'Expert Outillage', isActive: true });
                                setIsTipModalOpen(true);
                            }}
                            className="w-full md:w-auto bg-[#14532D] hover:bg-[#166534] text-white px-8 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-green-900/10 transition-all active:scale-95 uppercase tracking-wider"
                        >
                            <Plus size={20} />
                            Nouvelle Astuce
                        </button>
                    )}
                </header>

                {/* Tabs - Grid on mobile, row on desktop */}
                <div className="mb-8">
                    <div className="grid grid-cols-2 md:flex md:items-center gap-2 p-2 bg-slate-100 w-full md:w-fit rounded-2xl md:rounded-3xl border border-slate-200">
                        {[
                            { id: 'articles', label: 'Articles', icon: <FileText size={18} /> },
                            { id: 'tips', label: 'Astuces Pro', icon: <Quote size={18} /> },
                            { id: 'newsletter', label: 'Newsletter', icon: <Mail size={18} /> },
                            { id: 'tags', label: 'Tags Stats', icon: <Tag size={18} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center justify-center md:justify-start gap-2.5 px-4 md:px-6 py-3.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black uppercase tracking-wider transition-all ${activeTab === tab.id
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {tab.icon}
                                <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'articles' && (
                    <>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                <input
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                    placeholder="Search by title or content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table / Cards Container */}
                        <div className="bg-white md:rounded-2xl md:border md:border-slate-200 md:shadow-sm overflow-hidden min-h-[400px]">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                            <th className="px-8 py-5">Article</th>
                                            <th className="px-8 py-5">Category</th>
                                            <th className="px-8 py-5">Author</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading && posts.length === 0 ? (
                                            [...Array(5)].map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-8 py-6"><div className="flex items-center gap-4"><Skeleton className="size-12 rounded-lg" /><div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-20" /></div></div></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="px-8 py-6"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></td>
                                                </tr>
                                            ))
                                        ) : posts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-20 text-center text-slate-500">
                                                    <span className="material-symbols-outlined text-5xl opacity-20">article</span>
                                                    <p className="font-semibold mt-2">No blog posts yet.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            posts.map((post) => (
                                                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                                                {post.imageUrl ? <img src={post.imageUrl} className="size-full object-cover" /> : <div className="size-full flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[20px]">image</span></div>}
                                                            </div>
                                                            <div className="max-w-[300px]">
                                                                <p className="text-[14px] font-bold text-slate-900 line-clamp-1" title={post.title}>{post.title}</p>
                                                                <p className="text-[12px] font-medium text-slate-500 line-clamp-1 italic">/blog/{post.slug}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold uppercase tracking-tight">
                                                            {post.category || 'General'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">A</div>
                                                            <span className="text-[13px] font-semibold text-slate-700">{post.author}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-2.5 py-1 ${post.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'} rounded-full text-[10px] font-bold uppercase tracking-tight`}>
                                                            {post.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[13px] font-medium text-slate-500">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleEdit(post)} className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-all"><Edit size={18} /></button>
                                                            <button onClick={() => showConfirm({
                                                                title: 'Supprimer l\'article',
                                                                message: 'Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.',
                                                                confirmText: 'Supprimer',
                                                                variant: 'danger',
                                                                onConfirm: () => handleDelete(post.id)
                                                            })} className="size-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards View */}
                            <div className="md:hidden space-y-4 px-1">
                                {loading && posts.length === 0 ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
                                            <div className="flex gap-4">
                                                <Skeleton className="size-16 rounded-xl" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-3/4" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                            </div>
                                        </div>
                                    ))
                                ) : posts.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p>Aucun article trouvé.</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm active:scale-[0.98] transition-all">
                                            <div className="flex gap-4 mb-4">
                                                <div className="size-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                                                    {post.imageUrl ? <img src={post.imageUrl} className="size-full object-cover" /> : <div className="size-full flex items-center justify-center text-slate-300"><FileText size={20} /></div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md text-[10px] font-black uppercase tracking-tight">
                                                            {post.category || 'General'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 ${post.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'} rounded-full text-[9px] font-bold uppercase`}>
                                                            {post.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">{post.title}</h3>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <span className="text-[11px] font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(post)}
                                                        className="px-4 py-2 bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                                                    >
                                                        <Edit size={14} /> Modifier
                                                    </button>
                                                    <button 
                                                        onClick={() => showConfirm({
                                                            title: 'Supprimer',
                                                            message: 'Supprimer cet article ?',
                                                            confirmText: 'Supprimer',
                                                            variant: 'danger',
                                                            onConfirm: () => handleDelete(post.id)
                                                        })}
                                                        className="p-2 bg-rose-50 text-rose-500 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[13px] font-medium text-slate-500">
                                    Showing {(page - 1) * 5 + 1}–{Math.min(page * 5, total)} of {total} posts
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all">Prev</button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all">Next</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'tips' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <th className="px-8 py-5">Contenu de l'astuce</th>
                                        <th className="px-8 py-5">Auteur</th>
                                        <th className="px-8 py-5">Statut</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        [...Array(3)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-full" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-24" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-6 w-16" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-8 w-16 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : tips.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-500">Aucune astuce enregistrée.</td>
                                        </tr>
                                    ) : (
                                        tips.map((tip) => (
                                            <tr key={tip.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <p className="text-[14px] font-medium text-slate-700 line-clamp-2 italic">"{tip.content}"</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-slate-900">{tip.authorName}</span>
                                                        <span className="text-[12px] text-slate-500">{tip.authorRole}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <button
                                                        onClick={() => handleToggleTipActive(tip)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${tip.isActive
                                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm shadow-emerald-200/50'
                                                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                            }`}
                                                    >
                                                        {tip.isActive ? 'Active' : 'Désactivée'}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTip(tip);
                                                                setTipForm({ content: tip.content, authorName: tip.authorName, authorRole: tip.authorRole, isActive: tip.isActive });
                                                                setIsTipModalOpen(true);
                                                            }}
                                                            className="size-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => showConfirm({
                                                                title: 'Supprimer l\'astuce',
                                                                message: 'Voulez-vous vraiment supprimer cette astuce d\'expert ?',
                                                                confirmText: 'Supprimer',
                                                                variant: 'danger',
                                                                onConfirm: async () => {
                                                                    await api.deleteTip(tip.id);
                                                                    showToast('Astuce supprimée', 'success');
                                                                    loadData();
                                                                }
                                                            })}
                                                            className="size-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'newsletter' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <th className="px-8 py-5">Email</th>
                                        <th className="px-8 py-5">Date d'inscription</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-64" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-4 w-32" /></td>
                                                <td className="px-8 py-6"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : subscribers.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-20 text-center text-slate-500">Aucun abonné pour le moment.</td>
                                        </tr>
                                    ) : (
                                        subscribers.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6 font-bold text-slate-900">{sub.email}</td>
                                                <td className="px-8 py-6 text-slate-500 font-medium">{new Date(sub.subscribedAt).toLocaleString()}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDeleteSubscriber(sub.id)}
                                                        className="size-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all font-bold"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'tags' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tagStats.length === 0 ? (
                            <div className="col-span-full bg-white rounded-2xl p-20 text-center border border-slate-200">
                                <Tag size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-500 font-medium">Aucun tag utilisé dans les articles publiés.</p>
                            </div>
                        ) : (
                            tagStats.map((tag) => (
                                <div key={tag.tag} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight">#{tag.tag}</p>
                                            <p className="text-[12px] font-medium text-slate-500">{tag.count} article{tag.count > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${Math.min(100, (tag.count / Math.max(...tagStats.map(t => t.count))) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
              {/* Blog Post Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col relative z-10"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-3">
                                        <FileText className="text-primary" />
                                        {editingPost ? 'Modifier l\'Article' : 'Nouveau Chef-d\'œuvre'}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium italic">Composez et gérez votre contenu éditorial avec précision.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="size-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white">
                                <form onSubmit={handleSubmit} id="blog-post-form">
                                    {/* Section 1: Basic Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-slate-100 pb-12 mb-12">
                                        <div>
                                            <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-wider italic mb-2">1. Informations de base</h4>
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Définissez le titre et l'accroche de votre article pour vos lecteurs.</p>
                                        </div>
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Titre de l'article</label>
                                                <input
                                                    required
                                                    value={form.title}
                                                    onChange={e => handleTitleChange(e.target.value)}
                                                    className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-[15px] font-bold transition-all placeholder:text-slate-300"
                                                    placeholder="Comment choisir sa perceuse..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Slug (URL)</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        value={form.slug}
                                                        onChange={e => setForm({ ...form, slug: e.target.value })}
                                                        className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-[14px] font-medium transition-all font-mono text-slate-500"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px] text-slate-300">link</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Résumé court (Excerpt)</label>
                                                <textarea
                                                    rows={3}
                                                    value={form.excerpt}
                                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                                    className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-[14px] font-medium transition-all resize-none"
                                                    placeholder="Une brève description pour accrocher vos lecteurs..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Content */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-slate-100 pb-12 mb-12">
                                        <div>
                                            <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-wider italic mb-2">2. Contenu Principal</h4>
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Rédigez le corps de votre article. Utilisez des balises HTML pour la mise en forme.</p>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <div className="bg-slate-50 border border-slate-200 rounded-[32px] overflow-hidden">
                                                <div className="flex items-center gap-1 border-b border-slate-200 p-3 bg-white">
                                                    <button type="button" onClick={() => insertTag('b', 'Texte en gras')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                                                    <button type="button" onClick={() => insertTag('i', 'Texte en italique')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                                                    <button type="button" onClick={() => insertTag('ul', 'Élément de liste')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                                                    <button type="button" onClick={() => insertTag('a', 'Lien')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><span className="material-symbols-outlined text-[20px]">link</span></button>
                                                    <button type="button" onClick={() => editorImageInputRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                                        <span className="material-symbols-outlined text-[20px]">image</span>
                                                    </button>
                                                    <input
                                                        type="file"
                                                        ref={editorImageInputRef}
                                                        onChange={handleEditorImageUpload}
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                    <div className="h-6 w-px bg-slate-200 mx-2" />
                                                    <button type="button" onClick={() => setShowPreview(!showPreview)} className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all border shadow-sm ${showPreview ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/20 hover:bg-primary hover:text-white'}`}>
                                                        {showPreview ? 'Éditeur' : 'Aperçu'}
                                                    </button>
                                                </div>
                                                {showPreview ? (
                                                    <div className="w-full px-8 py-8 min-h-[400px] bg-white overflow-y-auto prose max-w-none">
                                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.content || '<p class="text-slate-300 italic">Aucun contenu à prévisualiser...</p>') }} className="blog-content-preview text-[16px] leading-[1.8] font-medium" />
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        ref={contentRef}
                                                        required
                                                        rows={15}
                                                        value={form.content}
                                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                                        className="w-full px-8 py-8 bg-transparent border-none outline-none text-[16px] leading-[1.8] font-medium transition-all resize-none placeholder:text-slate-200"
                                                        placeholder="Commencez à raconter votre histoire..."
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Media */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-slate-100 pb-12 mb-12">
                                        <div>
                                            <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-wider italic mb-2">3. Média à la Une</h4>
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">L'image de couverture qui apparaîtra dans les listes et en haut de l'article.</p>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <div className="relative group aspect-[16/7] rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50 cursor-pointer shadow-inner">
                                                {form.imageUrl ? (
                                                    <>
                                                        <img src={form.imageUrl} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                            <div className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl">Changer l'image</div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center p-8">
                                                        <div className="size-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                                            <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                                        </div>
                                                        <p className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Upload Cover Image</p>
                                                        <p className="text-[11px] text-slate-400 mt-2 font-medium italic">1200x630px recommandé (PNG, JPG, WEBP)</p>
                                                    </div>
                                                )}
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-md z-20 animate-pulse">
                                                        <div className="size-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                                        <p className="text-[12px] font-black uppercase text-primary tracking-widest">Uploading...</p>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Classification */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                                        <div>
                                            <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-wider italic mb-2">4. Classification & État</h4>
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Organisez votre contenu et définissez son état de sortie.</p>
                                        </div>
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Catégorie</label>
                                                    <div className="relative">
                                                        <select
                                                            value={form.category}
                                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                                            className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-[14px] font-bold transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Sélectionner une catégorie</option>
                                                            {categories.map(cat => (
                                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Date de publication</label>
                                                    <input
                                                        type="date"
                                                        value={form.publishDate}
                                                        onChange={e => setForm({ ...form, publishDate: e.target.value })}
                                                        className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-[14px] font-bold transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">État de l'article</label>
                                                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm({ ...form, status: 'Draft' })}
                                                            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${form.status === 'Draft' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
                                                        >
                                                            Brouillon
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm({ ...form, status: 'Published' })}
                                                            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${form.status === 'Published' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
                                                        >
                                                            Publié
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tags (Séparez par Entrée)</label>
                                                    <input
                                                        onKeyDown={(e: any) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const tag = e.target.value.trim();
                                                                if (tag && !form.tags.includes(tag)) {
                                                                    setForm({ ...form, tags: [...form.tags, tag] });
                                                                    e.target.value = '';
                                                                }
                                                            }
                                                        }}
                                                        className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-[14px] font-bold transition-all shadow-sm"
                                                        placeholder="Ajouter un tag..."
                                                    />
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {form.tags.map(tag => (
                                                            <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg">
                                                                {tag}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setForm({ ...form, tags: form.tags.filter(t => t !== tag) })}
                                                                    className="hover:scale-125 transition-transform"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            {/* Modal Footer */}
                            <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-6 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-12 py-4.5 border border-slate-200 rounded-2xl text-[13px] font-black text-slate-500 uppercase tracking-widest hover:bg-white transition-all active:scale-95"
                                >
                                    Annuler
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    onClick={(e: any) => {
                                        const formEl = document.getElementById('blog-post-form') as HTMLFormElement;
                                        formEl.requestSubmit();
                                    }}
                                    className="flex-1 py-4.5 bg-primary text-white rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {isSubmitting ? 'Traitement...' : (editingPost ? 'Mettre à jour l\'Article' : 'Publier Maintenant')}
                                    {!isSubmitting && <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">rocket_launch</span>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Tip Modal */}
            <AnimatePresence>
                {isTipModalOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTipModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col relative z-10"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-3">
                                    <Quote size={24} className="text-emerald-600" />
                                    {editingTip ? 'Modifier l\'Astuce' : 'Nouvelle Astuce Expert'}
                                </h3>
                                <button
                                    onClick={() => setIsTipModalOpen(false)}
                                    className="size-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleTipSubmit} className="p-8 space-y-6 bg-white">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contenu de l'astuce</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={tipForm.content}
                                        onChange={e => setTipForm({ ...tipForm, content: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[15px] font-bold text-slate-700 transition-all resize-none"
                                        placeholder="Partagez un conseil d'expert..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom de l'auteur</label>
                                        <input
                                            required
                                            value={tipForm.authorName}
                                            onChange={e => setTipForm({ ...tipForm, authorName: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-bold text-slate-700 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Rôle/Titre</label>
                                        <input
                                            required
                                            value={tipForm.authorRole}
                                            onChange={e => setTipForm({ ...tipForm, authorRole: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-[14px] font-bold text-slate-700 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <div className={`size-6 rounded-md border-2 flex items-center justify-center transition-all ${tipForm.isActive ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'}`}>
                                        {tipForm.isActive && <span className="material-symbols-outlined text-white text-sm font-black">check</span>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="tip-active"
                                        checked={tipForm.isActive}
                                        onChange={e => setTipForm({ ...tipForm, isActive: e.target.checked })}
                                        className="hidden"
                                    />
                                    <label htmlFor="tip-active" className="text-[13px] font-black text-emerald-900 cursor-pointer uppercase tracking-tight">Activer cette astuce immédiatement</label>
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsTipModalOpen(false)}
                                        className="flex-1 px-8 py-4 border border-slate-200 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                    >Annuler</button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                                    >
                                        {isSubmitting ? (
                                            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (editingTip ? 'Mettre à jour l\'astuce' : 'Lancer l\'astuce')}
                                        {!isSubmitting && <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-12">auto_awesome</span>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
            {/* The global NotificationOverlay handles toasts and confirms now */}
        </main>
    );
}
