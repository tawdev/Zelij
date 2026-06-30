'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Truck } from 'lucide-react';

export default function CheckoutPage() {
    return (
        <div className="flex-1 flex flex-col bg-canvas py-20 px-4">
            <div className="max-w-4xl mx-auto w-full">
                {/* Visual Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Système de Commande Directe
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none italic">
                        PRÊT POUR <br />
                        <span className="text-primary">VOTRE PROJET ?</span>
                    </h1>
                    <p className="text-charcoal-muted text-lg font-medium max-w-xl mx-auto leading-relaxed">
                        Chez Zelij Maroc, nous simplifions votre achat. Pas de formulaires complexes, juste un échange direct pour un service premium.
                    </p>
                </div>

                {/* Workflow Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white p-8 rounded-[32px] border border-border relative group hover:border-primary/30 transition-all">
                        <div className="w-14 h-14 bg-canvas-alt rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                            <ShoppingBag size={28} />
                        </div>
                        <h3 className="text-charcoal font-black uppercase tracking-tight text-xl mb-3">1. Panier</h3>
                        <p className="text-charcoal-muted text-sm font-medium leading-relaxed">
                            Sélectionnez vos zelliges et pièces préférées dans votre panier.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-border relative group hover:border-primary/30 transition-all">
                        <div className="w-14 h-14 bg-canvas-alt rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                            <MessageCircle size={28} />
                        </div>
                        <h3 className="text-charcoal font-black uppercase tracking-tight text-xl mb-3">2. WhatsApp</h3>
                        <p className="text-charcoal-muted text-sm font-medium leading-relaxed">
                            Validez via WhatsApp. Un artisan-conseiller vous accompagne en direct.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-border relative group hover:border-primary/30 transition-all">
                        <div className="w-14 h-14 bg-canvas-alt rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                            <Truck size={28} />
                        </div>
                        <h3 className="text-charcoal font-black uppercase tracking-tight text-xl mb-3">3. Livraison</h3>
                        <p className="text-charcoal-muted text-sm font-medium leading-relaxed">
                            Recevez vos zelliges partout au Maroc avec soin et sécurité.
                        </p>
                    </div>
                </div>

                {/* Main CTA Box */}
                <div className="bg-white rounded-[40px] p-10 md:p-16 border border-border relative overflow-hidden text-center shadow-2xl">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-10 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-charcoal uppercase tracking-tight mb-6">Prêt à passer commande ?</h2>
                        <p className="text-charcoal-soft mb-12 max-w-lg mx-auto font-medium">
                            Votre panier est la clé de votre futur intérieur. Cliquez ci-dessous pour finaliser vos choix et nous contacter.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link 
                                href="/cart"
                                className="w-full sm:w-auto px-12 py-5 bg-primary text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95"
                            >
                                <ShoppingBag size={18} />
                                Voir mon Panier
                            </Link>
                            <Link 
                                href="/produits"
                                className="w-full sm:w-auto px-12 py-5 bg-canvas-alt border border-border text-charcoal font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-border transition-all flex items-center justify-center gap-3"
                            >
                                Explorer la Boutique
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Trust Badges Simple */}
                <div className="mt-16 flex flex-wrap justify-center items-center gap-12 text-charcoal-muted opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Paiement Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Garantie Zelij</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Truck size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Livraison Maroc</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
