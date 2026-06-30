'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    Search, 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ArrowRight,
    Calendar,
    Hash,
    User,
    CreditCard
} from 'lucide-react';
import { api, type Order } from '../lib/api';

export default function TrackOrderPage() {
    const [reference, setReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Auto-track if ref is provided in URL
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const ref = searchParams.get('ref');
        
        if (ref) {
            setReference(ref);
            const track = async () => {
                try {
                    setLoading(true);
                    const data = await api.trackOrder(ref);
                    setOrder(data);
                } catch (err: any) {
                    setError(err.message || 'Impossible de trouver cette commande.');
                } finally {
                    setLoading(false);
                }
            };
            track();
        }
    }, []);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reference.trim()) return;

        try {
            setLoading(true);
            setError(null);
            // Update URL without refreshing to keep it clean
            const newUrl = `${window.location.pathname}?ref=${reference.trim()}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            
            const data = await api.trackOrder(reference.trim());
            setOrder(data);
        } catch (err: any) {
            console.error('Tracking error:', err);
            setError(err.message || 'Impossible de trouver cette commande. Vérifiez votre référence.');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 1;
            case 'confirmed': return 2;
            case 'processing': return 3;
            case 'completed': return 4;
            case 'cancelled': return 0;
            default: return 1;
        }
    };

    const steps = [
        { id: 1, label: 'En attente', icon: <Clock className="w-5 h-5" />, status: 'pending' },
        { id: 2, label: 'Confirmée', icon: <CheckCircle2 className="w-5 h-5" />, status: 'confirmed' },
        { id: 3, label: 'En préparation', icon: <Package className="w-5 h-5" />, status: 'processing' },
        { id: 4, label: 'Livrée', icon: <Truck className="w-5 h-5" />, status: 'completed' },
    ];

    const currentStep = order ? getStatusStep(order.status) : 0;

    return (
        <div className="flex-1 bg-canvas min-h-screen pt-32 pb-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-black text-charcoal mb-4 italic uppercase">
                        Suivi de <span className="text-primary">Commande</span>
                    </h1>
                    <p className="text-charcoal-soft max-w-xl mx-auto font-medium italic">
                        Entrez votre référence de devis pour connaître l'état d'avancement de votre livraison en temps réel.
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-[32px] p-8 border border-border shadow-2xl mb-12">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-muted" />
                            <input
                                type="text"
                                aria-label="Référence de commande"
                                value={reference}
                                onChange={(e) => setReference(e.target.value.toUpperCase())}
                                placeholder="Ex: DEV-20260629-A7X3"
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-border text-charcoal font-bold placeholder:text-charcoal-muted focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !reference.trim()}
                            className="h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-wider hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Rechercher
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Order Status Display */}
                {order && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {/* Timeline */}
                        <div className="bg-white rounded-[32px] p-8 md:p-12 border border-border shadow-2xl mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative">
                                {/* Connecting line */}
                                <div className="absolute top-[26px] left-6 right-6 h-[2px] bg-border hidden md:block" />
                                <div 
                                    className="absolute top-[26px] left-6 h-[2px] bg-primary transition-all duration-1000 hidden md:block" 
                                    style={{ width: `${(Math.max(0, currentStep - 1) / 3) * 100}%` }}
                                />

                                {steps.map((step) => {
                                    const isCompleted = currentStep >= step.id;
                                    const isActive = currentStep === step.id;
                                    
                                    return (
                                        <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-4 group">
                                            <div className={`
                                                w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                                ${isCompleted ? 'bg-primary text-white scale-110 shadow-[0_0_20px_rgba(30,58,138,0.3)]' : 'bg-white text-charcoal-muted border border-border'}
                                                ${isActive ? 'ring-4 ring-primary/20' : ''}
                                            `}>
                                                {step.icon}
                                            </div>
                                            <div className="text-left md:text-center">
                                                <p className={`text-[13px] font-black uppercase tracking-widest ${isCompleted ? 'text-charcoal' : 'text-charcoal-soft'}`}>
                                                    {step.label}
                                                </p>
                                                {isActive && (
                                                    <span className="text-[10px] text-primary font-black uppercase">En cours</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-border">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <Hash className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Référence</span>
                                    </div>
                                    <p className="text-charcoal font-bold">{order.invoiceReference}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <User className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Client</span>
                                    </div>
                                    <p className="text-charcoal font-bold">{order.customerName}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Date Commande</span>
                                    </div>
                                    <p className="text-charcoal font-bold">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Total</span>
                                    </div>
                                    <p className="text-charcoal font-bold">{order.totalPrice.toLocaleString()} MAD</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Message */}
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-charcoal font-bold mb-1 italic">
                                    {order.status === 'pending' && "Votre commande a été reçue et est en attente de confirmation."}
                                    {order.status === 'confirmed' && "Votre commande a été confirmée ! Nous préparons vos articles."}
                                    {order.status === 'processing' && "Votre colis est en cours de préparation dans notre entrepôt."}
                                    {order.status === 'completed' && "Votre commande a été livrée avec succès. Merci de votre confiance !"}
                                    {order.status === 'cancelled' && "Cette commande a été annulée."}
                                </p>
                                <p className="text-charcoal-muted text-sm font-medium italic">
                                    Besoin d'aide ? Contactez notre support WhatsApp au +212 6 XX XX XX XX
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* FAQ/Help */}
                <div className="mt-16 text-center">
                    <p className="text-charcoal-muted text-[13px] font-black uppercase tracking-widest mb-6">Vous ne trouvez pas votre référence ?</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/contact" className="px-6 py-3 rounded-xl bg-white border border-border text-charcoal text-xs font-black uppercase tracking-widest hover:bg-charcoal/5 transition-all">
                            Contacter le support
                        </Link>
                        <Link href="/produits" className="px-6 py-3 rounded-xl bg-primary-10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all">
                            Continuer mes achats
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
