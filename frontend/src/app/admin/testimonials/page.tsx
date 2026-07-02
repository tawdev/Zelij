'use client';

import { usePageTitle } from '@/app/lib/utils';
import React, { useState, useEffect } from 'react';
import { api, Testimonial } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTestimonialsPage() {
    usePageTitle('Testimonials');
    const { showToast, showConfirm } = useNotification();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedTestimonials = testimonials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(testimonials.length / itemsPerPage);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 2) { pages.push(1, 2, 3); }
            else if (currentPage >= totalPages - 1) { pages.push(totalPages - 2, totalPages - 1, totalPages); }
            else { pages.push(currentPage - 1, currentPage, currentPage + 1); }
        }
        return pages;
    };

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminTestimonials();
            setTestimonials(data);
        } catch (error) {
            console.error('Failed to load testimonials:', error);
            showToast('Erreur lors du chargement des témoignages.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTestimonial) return;

        try {
            if (editingTestimonial.id) {
                await api.updateTestimonial(editingTestimonial.id, editingTestimonial);
                showToast('Témoignage mis à jour avec succès.', 'success');
            } else {
                await api.createTestimonial(editingTestimonial);
                showToast('Témoignage créé avec succès.', 'success');
            }
            setIsModalOpen(false);
            setEditingTestimonial(null);
            loadTestimonials();
        } catch (error) {
            showToast('Erreur lors de l\'enregistrement.', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm({
            title: 'Suppression',
            message: 'Êtes-vous sûr de vouloir supprimer ce témoignage ?',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteTestimonial(id);
                    showToast('Témoignage supprimé.', 'success');
                    setTestimonials(prev => prev.filter((t) => t.id !== id));
                } catch (error) {
                    showToast('Erreur lors de la suppression.', 'error');
                }
            }
        });
    };

    const toggleActive = async (testimonial: Testimonial) => {
        try {
            await api.updateTestimonial(testimonial.id, { active: !testimonial.active });
            loadTestimonials();
        } catch (error) {
            showToast('Erreur lors de la mise à jour.', 'error');
        }
    };

    if (loading && testimonials.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-20">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[28px]">format_quote</span>
                        Témoignages
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Gérez les témoignages affichés sur la page d'accueil.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingTestimonial({ name: '', role: '', content: '', initial: '', tag: '', date: 'Il y a quelques jours', active: true });
                        setIsModalOpen(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nouveau Témoignage
                </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 min-h-0">
                <div className="max-w-[1200px] mx-auto">
                    {testimonials.length > 0 ? (
                        <><div className="grid grid-cols-1 gap-6">
                            {paginatedTestimonials.map((testimonial) => (
                                <div key={testimonial.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all hover:shadow-md">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {testimonial.initial}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{testimonial.name}</h3>
                                                <p className="text-[11px] text-slate-500 font-medium">{testimonial.role}</p>
                                            </div>
                                            <span className={`ml-auto md:ml-4 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${testimonial.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {testimonial.active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                        <p className="text-[14px] text-slate-600 italic mt-3 leading-relaxed">
                                            "{testimonial.content}"
                                        </p>
                                        <div className="mt-3 flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Tag: {testimonial.tag}</span>
                                            <span>•</span>
                                            <span>Date: {testimonial.date}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 justify-center md:justify-end">
                                        <button
                                            onClick={() => toggleActive(testimonial)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${testimonial.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                            title={testimonial.active ? 'Désactiver' : 'Activer'}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{testimonial.active ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingTestimonial(testimonial);
                                                setIsModalOpen(true);
                                            }}
                                            className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Modifier"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(testimonial.id)}
                                            className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                            title="Supprimer"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-6">
                                <span className="text-xs text-slate-500 font-medium">{testimonials.length} témoignage{testimonials.length !== 1 ? 's' : ''}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-all">
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                    </button>
                                    {getPageNumbers().map((page, i) => (
                                        <button key={i} onClick={() => setCurrentPage(page as number)} className={`size-8 rounded-lg font-bold text-xs transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-slate-500 hover:bg-slate-100'}`}>
                                            {page}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-all">
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">format_quote</span>
                            <p className="text-slate-500 font-medium text-lg">Aucun témoignage trouvé.</p>
                            <button
                                onClick={() => {
                                    setEditingTestimonial({ name: '', role: '', content: '', initial: '', tag: '', date: 'Il y a quelques jours', active: true });
                                    setIsModalOpen(true);
                                }}
                                className="mt-4 text-primary font-bold hover:underline"
                            >
                                Créer le premier témoignage
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
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
                            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden z-10"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                        {editingTestimonial?.id ? 'Modifier le Témoignage' : 'Nouveau Témoignage'}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium italic">
                                        Gérez les retours clients affichés sur la boutique.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="p-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Nom Complet</label>
                                            <input
                                                required
                                                value={editingTestimonial?.name || ''}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Ex: Mohammed Alami"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Initiale (2 lettres)</label>
                                            <input
                                                required
                                                maxLength={2}
                                                value={editingTestimonial?.initial || ''}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, initial: e.target.value.toUpperCase() })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-center"
                                                placeholder="MA"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Rôle / Ville</label>
                                            <input
                                                required
                                                value={editingTestimonial?.role || ''}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Ex: Chef de chantier — Casablanca"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Contenu du Témoignage</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={editingTestimonial?.content || ''}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none leading-relaxed"
                                                placeholder="Saisissez le texte du témoignage..."
                                            ></textarea>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tag (Badge)</label>
                                            <input
                                                required
                                                value={editingTestimonial?.tag || ''}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, tag: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Ex: Qualité Professionnelle"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Date (Texte)</label>
                                            <input
                                                required
                                                value={editingTestimonial?.date || ''}
                                                onChange={e => setEditingTestimonial({ ...editingTestimonial, date: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                                placeholder="Ex: Il y a 2 jours"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-50 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-white transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
