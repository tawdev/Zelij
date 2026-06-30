'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, MessageCircle, X, MapPin, User, Phone, CheckCircle2, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { api } from '../lib/api';

export default function ShoppingCartPage() {
    const { cartItems, totalPrice, totalItems, updateQuantity, updateItemDimensions, removeFromCart, clearCart } = useCart();
    const { showToast } = useNotification();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        api.getSettings().then(setSettings).catch(console.error);
    }, []);

    const handleCheckout = async () => {
        setIsLoading(true);

        try {
            // Generate unique invoice number
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const invoiceNumber = `DEV-${datePart}-${randomPart}`;

            // Build full order payload for invoice (local)
            const orderPayload = {
                invoiceNumber,
                date: now.toISOString(),
                items: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.price),
                    imageUrl: item.imageUrl,
                    width: item.area?.width,
                    height: item.area?.height,
                    areaM2: item.area?.totalAreaM2,
                    boxes: item.boxes,
                    isPerM2: !!item.area,
                })),
                totalPrice: Number(totalPrice),
                customerInfo,
            };

            // Prepare backend data
            const backendOrderData = {
                customerName: customerInfo.name || 'Client WhatsApp',
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                invoiceReference: invoiceNumber,
                totalPrice: Number(totalPrice),
                items: orderPayload.items
            };

            // 1. Persist to Backend
            await api.createOrder(backendOrderData as any);

            // 2. Persist to localStorage for immediate invoice page view
            try {
                localStorage.setItem('zelij_last_order', JSON.stringify(orderPayload));
            } catch (e) {
                console.error('Could not save order to localStorage', e);
            }

            const whatsappLink = generateWhatsAppLink({
                items: orderPayload.items,
                totalPrice: orderPayload.totalPrice,
                invoiceReference: invoiceNumber,
                customerInfo,
            }, settings?.phoneNumber);

            // 3. Small delay for UX transition
            setTimeout(() => {
                window.open(whatsappLink, '_blank');
                setIsLoading(false);
                setIsConfirmed(true);
                clearCart();
            }, 1000);

        } catch (error: any) {
            console.error('Order creation failed:', error);
            const errorMsg = error.message || 'Une erreur est survenue lors de la création de la commande.';
            showToast(`${errorMsg} Veuillez réessayer.`, 'error');
            setIsLoading(false);
        }
    };

    if (totalItems === 0 && !isConfirmed) {
        return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-canvas">
                <div className="w-24 h-24 bg-canvas-alt rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart size={40} className="text-charcoal-muted" />
                </div>
                <h1 className="text-3xl font-black text-charcoal mb-4 uppercase tracking-tighter">Votre panier est vide</h1>
                <p className="text-charcoal-muted mb-8 max-w-md text-center font-medium">Découvrez nos produits et commencez vos achats dès maintenant.</p>
                <Link
                    href="/produits"
                    className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20"
                >
                    Voir la boutique <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    if (isConfirmed) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-canvas">
                <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} className="text-accent" />
                </div>
                <h1 className="text-3xl font-black text-charcoal mb-3 uppercase tracking-tighter text-center">Commande Envoyée !</h1>
                <p className="text-charcoal-muted mb-2 max-w-md text-center font-medium">
                    Votre commande a été envoyée sur WhatsApp. Nous vous contacterons très prochainement.
                </p>
                <p className="text-accent font-bold text-sm mb-8 text-center">
                    Votre devis a été généré automatiquement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Link
                        href="/invoice"
                        className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex-1"
                    >
                        <FileText size={16} />
                        Voir mon Devis
                    </Link>
                    <button
                        onClick={() => { setIsConfirmed(false); clearCart(); }}
                        className="flex items-center justify-center gap-2 bg-canvas-alt border border-border text-charcoal px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-border transition-colors flex-1"
                    >
                        Nouvelle Commande
                    </button>
                </div>
                <Link
                    href="/"
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-charcoal-muted hover:text-charcoal transition-colors"
                >
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-canvas py-12">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12 border-b border-border pb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-charcoal uppercase tracking-tighter">
                        Votre <span className="text-primary">Panier</span>
                    </h1>
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-charcoal-muted font-bold uppercase tracking-widest text-xs hidden md:inline">
                        {totalItems} Article{totalItems > 1 ? 's' : ''}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.cartItemId} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-border rounded-[24px] hover:shadow-xl hover:shadow-black/10 transition-all group overflow-hidden relative">
                                {/* Delete Hover Overlay (Mobile/Desktop friendly) */}
                                <button
                                    onClick={() => removeFromCart(item.cartItemId)}
                                    className="absolute top-4 right-4 text-charcoal-muted hover:text-primary transition-colors p-2"
                                >
                                    <Trash2 size={20} />
                                </button>

                                {/* Image */}
                                <div className="w-full sm:w-32 h-32 relative bg-canvas-alt rounded-2xl overflow-hidden shrink-0 border border-border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.imageUrl || '/mol.jpeg'}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <Link href={`/produits/${item.productId}`} className="text-xl font-bold text-charcoal hover:text-primary transition-colors block mb-2 truncate">
                                        {item.name}
                                    </Link>
                                    <div className="flex items-center gap-6 mb-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-primary font-black text-lg">
                                                {Number(item.price).toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-primary text-xs font-black">MAD</span>
                                        </div>
                                    </div>

                                    {/* Action row */}
                                    <div className="flex items-center justify-between mt-auto">
                                        {/* Dimensions (area-based items) */}
                                        {item.area ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center bg-canvas-alt rounded-xl p-1">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-charcoal-muted pl-2">Width</span>
                                                    <button
                                                        onClick={() => updateItemDimensions(item.cartItemId, Math.max(0.5, item.area!.width - 0.5), item.area!.height)}
                                                        className="w-8 h-8 flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0.5"
                                                        step="0.5"
                                                        value={item.area.width}
                                                        onChange={(e) => {
                                                            const w = parseFloat(e.target.value);
                                                            if (!isNaN(w) && w > 0) {
                                                                updateItemDimensions(item.cartItemId, w, item.area!.height);
                                                            }
                                                        }}
                                                        className="w-20 text-center font-black text-charcoal text-sm bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    />
                                                    <button
                                                        onClick={() => updateItemDimensions(item.cartItemId, item.area!.width + 0.5, item.area!.height)}
                                                        className="w-8 h-8 flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span className="text-charcoal-muted font-bold text-xs">×</span>
                                                <div className="flex items-center bg-canvas-alt rounded-xl p-1">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-charcoal-muted pl-2">Height</span>
                                                    <button
                                                        onClick={() => updateItemDimensions(item.cartItemId, item.area!.width, Math.max(0.5, item.area!.height - 0.5))}
                                                        className="w-8 h-8 flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="0.5"
                                                        step="0.5"
                                                        value={item.area.height}
                                                        onChange={(e) => {
                                                            const h = parseFloat(e.target.value);
                                                            if (!isNaN(h) && h > 0) {
                                                                updateItemDimensions(item.cartItemId, item.area!.width, h);
                                                            }
                                                        }}
                                                        className="w-20 text-center font-black text-charcoal text-sm bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    />
                                                    <button
                                                        onClick={() => updateItemDimensions(item.cartItemId, item.area!.width, item.area!.height + 0.5)}
                                                        className="w-8 h-8 flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center bg-canvas-alt rounded-xl p-1 border border-border">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-12 text-center font-black text-charcoal text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal-muted mb-0.5">Sous-total</p>
                                            <p className="text-base font-black text-charcoal">{Number(item.price).toFixed(2).replace('.', ',')} MAD</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-8 border-t border-border flex items-center justify-between">
                            <Link href="/produits" className="text-xs font-black uppercase tracking-widest text-charcoal-muted hover:text-primary flex items-center gap-2 transition-colors">
                                <ArrowRight size={14} className="rotate-180" /> Continuer vos achats
                            </Link>
                            <button
                                onClick={clearCart}
                                className="text-xs font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
                            >
                                Vider le panier
                            </button>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-28 h-fit">
                        <div className="bg-white border border-border rounded-[32px] p-8 text-charcoal shadow-2xl shadow-black/10 relative overflow-hidden">
                            {/* Decorative Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20 pointer-events-none" />

                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 relative z-10">Récapitulatif</h2>

                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex justify-between items-center text-charcoal-muted font-bold uppercase tracking-widest text-[10px]">
                                    <span>Articles ({totalItems})</span>
                                    <span>{Number(totalPrice).toFixed(2).replace('.', ',')} MAD</span>
                                </div>
                                <div className="flex justify-between items-center text-charcoal-muted font-bold uppercase tracking-widest text-[10px]">
                                    <span>Livraison</span>
                                    <span className="text-accent">GRATUITE</span>
                                </div>
                                <div className="pt-6 mt-6 border-t border-border flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Total à payer</p>
                                        <p className="text-4xl font-black tracking-tighter">
                                            {Number(totalPrice).toFixed(2).replace('.', ',')} <span className="text-lg">MAD</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsCheckingOut(true)}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/30 group"
                            >
                                <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                                Commander via WhatsApp
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-[10px] text-charcoal-muted font-medium leading-relaxed">
                                    Une fois cliqué, vous serez redirigé vers WhatsApp pour finaliser votre commande avec nous directement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {isCheckingOut && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !isLoading && setIsCheckingOut(false)}
                    />

                    {/* Modal Content */}
                    <div className="bg-white border border-border w-full max-w-lg rounded-[32px] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                        <div className="bg-primary p-8 text-white relative">
                            <button
                                onClick={() => setIsCheckingOut(false)}
                                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <MessageCircle size={24} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Finalisation</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Infos Livraison</h2>
                            <p className="text-white/60 text-xs font-medium mt-2">Dernière étape pour envoyer votre commande sur WhatsApp.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-charcoal-muted block px-1">Nom Complet (Obligatoire)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Votre nom complet"
                                            className="w-full bg-canvas-alt border border-border rounded-xl py-4 pl-12 pr-4 text-charcoal font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            value={customerInfo.name}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-charcoal-muted block px-1">Email (Obligatoire pour le devis)</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted" size={18} />
                                        <input
                                            type="email"
                                            placeholder="votre@email.com"
                                            required
                                            className="w-full bg-canvas-alt border border-border rounded-xl py-4 pl-12 pr-4 text-charcoal font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-charcoal-muted block px-1">Téléphone (Obligatoire)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Votre numéro de téléphone"
                                            className="w-full bg-canvas-alt border border-border rounded-xl py-4 pl-12 pr-4 text-charcoal font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-charcoal-muted block px-1">Adresse / Ville (Obligatoire)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ville, Quartier..."
                                            className="w-full bg-canvas-alt border border-border rounded-xl py-4 pl-12 pr-4 text-charcoal font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            value={customerInfo.address}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // 0. Vérification des champs vides
                                    if (!customerInfo.name.trim()) {
                                        showToast('Veuillez entrer votre nom complet.', 'error');
                                        return;
                                    }
                                    if (!customerInfo.email.trim()) {
                                        showToast('Veuillez entrer votre adresse email.', 'error');
                                        return;
                                    }
                                    if (!customerInfo.phone.trim()) {
                                        showToast('Veuillez entrer votre numéro de téléphone.', 'error');
                                        return;
                                    }
                                    if (!customerInfo.address.trim()) {
                                        showToast('Veuillez entrer votre adresse ou ville.', 'error');
                                        return;
                                    }

                                    // 1. Validation Nom (Pas de chiffres)
                                    if (customerInfo.name && /[0-9]/.test(customerInfo.name)) {
                                        showToast('Le nom ne doit pas contenir de chiffres.', 'error');
                                        return;
                                    }

                                    // 2. Validation Email (Format standard)
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (!emailRegex.test(customerInfo.email)) {
                                        showToast('Veuillez entrer une adresse email valide.', 'error');
                                        return;
                                    }

                                    // 3. Validation Téléphone (Pas de lettres)
                                    if (customerInfo.phone && /[a-zA-Z]/.test(customerInfo.phone)) {
                                        showToast('Le numéro de téléphone ne doit pas contenir de lettres.', 'error');
                                        return;
                                    }

                                    // 4. Validation Ville/Adresse (Pas de chiffres selon demande)
                                    if (customerInfo.address && /[0-9]/.test(customerInfo.address)) {
                                        showToast('La ville ne doit pas contenir de chiffres.', 'error');
                                        return;
                                    }

                                    handleCheckout();
                                }}
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 disabled:bg-canvas-alt text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-primary/20"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Confirmer & Envoyer</>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-charcoal-soft font-medium italic">
                                Note : Les informations saisies aideront à traiter votre commande plus rapidement once sur WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
