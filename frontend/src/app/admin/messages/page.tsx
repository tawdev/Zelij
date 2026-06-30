'use client';

import React, { useState, useEffect } from 'react';
import { api, ContactMessage } from '../../lib/api';
import { useNotification } from '../../context/NotificationContext';

const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
};

export default function AdminMessagesPage() {
    const { showToast, showConfirm } = useNotification();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await api.getContactMessages();
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
            showToast('Erreur lors du chargement des messages.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: ContactMessage['status']) => {
        try {
            await api.updateContactStatus(id, status, adminNote);
            showToast('Statut mis à jour.', 'success');
            loadMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status, adminNote });
            }
        } catch (error) {
            showToast('Erreur lors de la mise à jour.', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm({
            title: 'Suppression',
            message: 'Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteContactMessage(id);
                    showToast('Message supprimé.', 'success');
                    setMessages(prev => prev.filter((m) => m.id !== id));
                    if (selectedMessage?.id === id) setSelectedMessage(null);
                } catch (error) {
                    showToast('Erreur lors de la suppression.', 'error');
                }
            }
        });
    };

    const filteredMessages = messages.filter(m => 
        statusFilter === 'all' || m.status === statusFilter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'read': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'replied': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'archived': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-50 text-slate-400';
        }
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-20">
                <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[24px] md:text-[28px]">mail</span>
                        Messages Clients
                    </h1>
                    <p className="text-[11px] md:text-sm text-slate-500 mt-1 font-medium">
                        Consultez et répondez aux messages du formulaire de contact.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="read">Lu</option>
                        <option value="replied">Répondu</option>
                        <option value="archived">Archivé</option>
                    </select>
                    <button
                        onClick={loadMessages}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                        title="Rafraîchir"
                    >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* List View */}
                <div className={`w-full md:w-1/3 border-r border-slate-200 bg-white overflow-y-auto no-scrollbar transition-all duration-300 ${selectedMessage ? 'hidden md:block' : 'block'}`}>
                    {filteredMessages.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredMessages.map((msg) => (
                                <div 
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        setAdminNote(msg.adminNote || '');
                                        if (msg.status === 'pending') {
                                            handleUpdateStatus(msg.id, 'read');
                                        }
                                    }}
                                    className={`p-5 cursor-pointer transition-all hover:bg-slate-50 ${selectedMessage?.id === msg.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(msg.status)}`}>
                                            {msg.status === 'pending' ? 'En attente' : msg.status === 'read' ? 'Lu' : msg.status === 'replied' ? 'Répondu' : 'Archivé'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {formatDate(msg.createdAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className={`text-sm font-bold truncate ${selectedMessage?.id === msg.id ? 'text-primary' : 'text-slate-800'}`}>
                                        {msg.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium truncate mt-1">
                                        {msg.subject}
                                    </p>
                                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                                        {msg.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-3">inbox</span>
                            <p className="text-slate-400 font-medium text-sm">Aucun message trouvé.</p>
                        </div>
                    )}
                </div>

                {/* Detail View */}
                <div className={`flex-1 bg-slate-50 overflow-y-auto no-scrollbar p-4 md:p-8 transition-all duration-300 ${selectedMessage ? 'block' : 'hidden md:block'}`}>
                    {selectedMessage ? (
                        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Back Button for mobile */}
                            <button 
                                onClick={() => setSelectedMessage(null)}
                                className="md:hidden flex items-center gap-2 text-slate-500 font-bold text-sm mb-4"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                Retour à la liste
                            </button>

                            <div className="bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-8 shadow-sm border border-slate-200">
                                <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 pb-6 border-b border-slate-100 gap-4">
                                    <div className="w-full md:w-auto">
                                        <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight mb-2 md:mb-1">{selectedMessage.subject}</h2>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-primary">{selectedMessage.name}</span>
                                            <span className="hidden md:inline text-slate-300">•</span>
                                            <a href={`mailto:${selectedMessage.email}`} className="text-xs md:text-sm font-medium text-slate-500 hover:text-primary underline break-all">
                                                {selectedMessage.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reçu le</p>
                                        <p className="text-xs md:text-sm font-black text-slate-700">
                                            {formatDate(selectedMessage.createdAt, { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                            à {formatDate(selectedMessage.createdAt, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-8">
                                    <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                                        "{selectedMessage.message}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Notes Internes / Actions</label>
                                    <textarea 
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Ajoutez une note sur ce message..."
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    ></textarea>
                                    
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                                        <button 
                                            onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">reply</span>
                                            Marquer comme Répondu
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                                            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">archive</span>
                                            Archiver
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 md:py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all w-full sm:ml-auto"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Help box */}
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 md:p-6 flex gap-4 items-start">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-1">Conseil de réponse</h4>
                                    <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">
                                        Vous pouvez cliquer sur l'email du client pour ouvrir votre logiciel de messagerie par défaut. N'oubliez pas de marquer le message comme "Répondu" une fois votre mail envoyé.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-slate-200 mb-6">
                                <span className="material-symbols-outlined text-[40px] text-slate-300">mail</span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Sélectionnez un message</h2>
                            <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
                                Choisissez un message dans la liste de gauche pour voir les détails et interagir avec le client.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
