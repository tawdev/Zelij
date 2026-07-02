'use client';

import { usePageTitle } from '@/app/lib/utils';
import { useEffect, useState } from 'react';
import { api, type Brand } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBrandsPage() {
    usePageTitle('Brands');
    const { showToast, showConfirm } = useNotification();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({ name: '', logoUrl: '', isActive: true });
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedBrands = brands.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(brands.length / itemsPerPage);

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

    const loadBrands = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getBrands();
            setBrands(data);
        } catch (err) {
            console.error('Failed to load brands:', err);
            setError('Unable to load brands. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBrands(); }, []);

    const resetForm = () => {
        setFormData({ name: '', logoUrl: '', isActive: true });
        setEditingBrand(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBrand) {
                await api.updateBrand(editingBrand.id, formData);
                showToast('Marque mise à jour avec succès !', 'success');
            } else {
                await api.createBrand(formData);
                showToast('Marque ajoutée avec succès !', 'success');
            }
            resetForm();
            loadBrands();
        } catch (err: any) {
            console.error('Failed to save brand:', err);
            showToast(err.message || 'Échec de l\'enregistrement de la marque', 'error');
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({ name: brand.name, logoUrl: brand.logoUrl || '', isActive: brand.isActive });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        showConfirm({
            title: 'Supprimer la marque',
            message: 'Êtes-vous sûr de vouloir supprimer cette marque ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteBrand(id);
                    showToast('Marque supprimée avec succès !', 'success');
                    loadBrands();
                } catch (err: any) {
                    console.error('Failed to delete brand:', err);
                    showToast(err.message || 'Échec de la suppression de la marque', 'error');
                }
            }
        });
    };

    const handleToggleActive = async (brand: Brand) => {
        try {
            await api.updateBrand(brand.id, { isActive: !brand.isActive });
            loadBrands();
        } catch (err) {
            console.error('Failed to toggle brand:', err);
            showToast(err instanceof Error ? err.message : 'Échec de la mise à jour du statut', 'error');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const result = await api.uploadImage(file);
            setFormData((prev) => ({ ...prev, logoUrl: result.url }));
        } catch (err) {
            console.error('Failed to upload image:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex-1 h-full min-h-0 flex flex-col overflow-y-auto no-scrollbar p-8 bg-slate-50/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Marques</h1>
                    <p className="text-sm text-slate-500 mt-1">{brands.length} marque(s) enregistrée(s)</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nouvelle Marque
                </button>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetForm}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingBrand ? 'Modifier la Marque' : 'Ajouter une Marque'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la marque</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Bosch, Makita..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Logo de la marque</label>
                                    <div className="flex items-center gap-5 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                        {formData.logoUrl && (
                                            <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
                                                <img
                                                    src={formData.logoUrl.startsWith('http') ? formData.logoUrl : `${process.env.NEXT_PUBLIC_API_URL}${formData.logoUrl}`}
                                                    alt="Logo preview"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <label className="cursor-pointer flex flex-col items-center justify-center w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-primary hover:text-primary hover:bg-white transition-all">
                                                <span className="material-symbols-outlined text-[24px] mb-1">cloud_upload</span>
                                                <span className="font-semibold">{uploading ? 'Téléchargement...' : 'Choisir une image'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-1">
                                    <div 
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${formData.isActive ? 'bg-primary' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                                    </div>
                                    <label className="text-sm font-semibold text-slate-700 cursor-pointer" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                        Visible sur le site
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 disabled:opacity-50 transition-all uppercase tracking-wider"
                                    >
                                        {editingBrand ? 'Enregistrer les modifications' : 'Créer la marque'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all uppercase tracking-wider"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Brands Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20 flex-1">
                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary border-t-transparent"></div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[40px] text-red-500">error_outline</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Erreur de chargement</h3>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button onClick={loadBrands} className="px-6 py-3 bg-[#BF1737] text-white text-[13px] font-black rounded-2xl hover:bg-[#A3142F] transition-all shadow-lg shadow-[#BF1737]/20 flex items-center gap-2 uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Réessayer
                    </button>
                </div>
            ) : brands.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300">verified</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">Aucune marque enregistrée</p>
                    <p className="text-slate-500 mt-1">Commencez par ajouter une nouvelle marque à votre catalogue.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Logo</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                                <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                                <th className="text-right px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBrands.map((brand) => (
                                <tr key={brand.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-12 rounded-lg bg-white border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden">
                                            {brand.logoUrl ? (
                                                <img
                                                    src={brand.logoUrl.startsWith('http') ? brand.logoUrl : `${process.env.NEXT_PUBLIC_API_URL}${brand.logoUrl}`}
                                                    alt={brand.name}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-slate-800 text-sm">{brand.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(brand)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${brand.isActive
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(brand)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Modifier"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-medium">{brands.length} marque{brands.length !== 1 ? 's' : ''}</span>
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
                </div>
            )}
        </div>
    );
}


