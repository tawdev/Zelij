'use client';

import { Truck, Clock, MapPin, ShieldCheck, Box, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LivraisonPage() {
    return (
        <div className="flex-1 bg-canvas">
            {/* Hero Section */}
            <div className="relative py-24 bg-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519233073527-4c5740497502?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-10 border border-primary/20 rounded-full text-primary mb-8">
                        <Truck size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Expédition Premium</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-charcoal mb-6 uppercase italic tracking-tight">
                        Livraison <span className="text-primary">Partout au Maroc</span>
                    </h1>
                    <p className="text-lg text-charcoal-soft font-medium max-w-2xl mx-auto leading-relaxed italic">
                        Chez Zelij Maroc, nous savons que votre décor ne peut pas attendre. C'est pourquoi nous avons optimisé notre logistique pour vous livrer vos zelliges et carreaux dans les plus brefs délais.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-24">
                {/* Key Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                    <div className="p-8 bg-white rounded-[32px] border border-border group hover:border-primary/30 transition-all shadow-2xl">
                        <div className="w-14 h-14 bg-canvas-alt border border-border rounded-2xl flex items-center justify-center text-primary shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <Clock size={28} />
                        </div>
                        <h3 className="text-xl font-black text-charcoal mb-4 uppercase italic">24h - 48h</h3>
                        <p className="text-charcoal-soft font-medium leading-relaxed italic">
                            Délai moyen pour les grandes villes comme Casablanca, Rabat, Marrakech et Tanger.
                        </p>
                    </div>
                    <div className="p-8 bg-white rounded-[32px] border border-border group hover:border-primary/30 transition-all shadow-2xl">
                        <div className="w-14 h-14 bg-canvas-alt border border-border rounded-2xl flex items-center justify-center text-primary shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <MapPin size={28} />
                        </div>
                        <h3 className="text-xl font-black text-charcoal mb-4 uppercase italic">Couverture Nationale</h3>
                        <p className="text-charcoal-soft font-medium leading-relaxed italic">
                            Nous livrons dans toutes les provinces du royaume, du nord au sud.
                        </p>
                    </div>
                    <div className="p-8 bg-white rounded-[32px] border border-border group hover:border-primary/30 transition-all shadow-2xl">
                        <div className="w-14 h-14 bg-canvas-alt border border-border rounded-2xl flex items-center justify-center text-primary shadow-sm mb-6 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-black text-charcoal mb-4 uppercase italic">Paiement Sécurisé</h3>
                        <p className="text-charcoal-soft font-medium leading-relaxed italic">
                            Payez en toute confiance à la réception de votre colis (Cash on Delivery).
                        </p>
                    </div>
                </div>

                {/* Shipping Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
                    <div>
                        <h2 className="text-3xl font-black text-charcoal mb-8 uppercase tracking-tight italic relative inline-block">
                            Processus de <span className="text-primary">Commande</span>
                            <div className="absolute -bottom-2 left-0 w-20 h-1.5 bg-primary rounded-full"></div>
                        </h2>
                        <div className="space-y-8">
                            {[
                                { title: 'Validation Immédiate', desc: 'Dès réception de votre commande, notre équipe vérifie la disponibilité et valide votre panier.' },
                                { title: 'Emballage Soigné', desc: 'Votre zellige est emballé avec des protections renforcées pour éviter tout dommage durant le transport.' },
                                { title: 'Prise en charge Transporteur', desc: 'Nos partenaires logistiques récupèrent les colis quotidiennement pour un départ immédiat.' },
                                { title: 'Notification SMS/WhatsApp', desc: 'Vous recevez un message dès que le livreur est en route vers votre adresse.' },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-charcoal mb-1">{step.title}</h4>
                                        <p className="text-charcoal-soft font-medium leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-[48px] p-12 text-charcoal relative overflow-hidden border border-border shadow-2xl">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full -mr-32 -mb-32 blur-3xl"></div>
                        <Box size={80} className="text-primary opacity-20 mb-8" />
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-tight italic">Tarifs de Livraison</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-border">
                                <span className="text-charcoal-soft font-medium uppercase tracking-widest text-[11px] font-black">Marrakech & Alentours</span>
                                <span className="text-xl font-black text-primary">25 MAD</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-border">
                                <span className="text-charcoal-soft font-medium uppercase tracking-widest text-[11px] font-black">Villes Principales (Casa, Rabat...)</span>
                                <span className="text-xl font-black text-primary">45 MAD</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-charcoal-soft font-medium uppercase tracking-widest text-[11px] font-black">Autres Régions</span>
                                <span className="text-xl font-black text-primary">55 MAD</span>
                            </div>
                        </div>
                        <div className="mt-8 p-6 bg-primary-10 border border-primary/20 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <CheckCircle2 size={20} className="text-white" />
                            </div>
                            <p className="text-sm font-black leading-tight uppercase tracking-tighter">
                                Livraison <span className="text-primary">OFFERTE</span> pour toute commande supérieure à 2000 MAD !
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-white rounded-[48px] py-16 px-8 border border-border shadow-2xl">
                    <h2 className="text-3xl font-black text-charcoal mb-6 uppercase italic tracking-tight">
                        Besoin d'une <span className="text-primary">Livraison Express ?</span>
                    </h2>
                    <p className="text-charcoal-soft font-medium mb-10 max-w-xl mx-auto italic leading-relaxed">
                        Pour des besoins urgents ou des livraisons spéciales, contactez-nous directement pour un service sur mesure.
                    </p>
                    <Link 
                        href="/contact" 
                        className="inline-flex h-14 items-center px-10 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                        Contactez-nous
                    </Link>
                </div>
            </div>
        </div>
    );
}
