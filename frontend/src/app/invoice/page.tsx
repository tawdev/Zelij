'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Download, CheckCircle2, FileText, MapPin, Phone, User, Zap, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string | null;
}

interface OrderPayload {
    invoiceNumber: string;
    date: string;
    items: OrderItem[];
    totalPrice: number;
    customerInfo: {
        name: string;
        phone: string;
        address: string;
    };
}

function InvoiceContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState<OrderPayload | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        api.getSettings().then(setSettings).catch(console.error);

        async function fetchOrder() {
            setLoading(true);
            if (orderId) {
                try {
                    const data = await api.getOrderById(orderId);
                    setOrder({
                        invoiceNumber: data.invoiceReference || `FAC-${data.id}`,
                        date: data.createdAt,
                        items: Array.isArray(data.items) ? data.items : [],
                        totalPrice: Number(data.totalPrice),
                        customerInfo: {
                            name: data.customerName,
                            phone: data.phone || '',
                            address: data.address || ''
                        }
                    });
                } catch (error) {
                    console.error("Erreur backend:", error);
                }
            } else {
                const storedOrder = localStorage.getItem('zelij_maroc_last_order');
                if (storedOrder) {
                    try {
                        setOrder(JSON.parse(storedOrder));
                    } catch (error) {
                        console.error("Erreur locale:", error);
                    }
                }
            }
            setLoading(false);
        }

        fetchOrder();
    }, [orderId]);

    const generatePDF = () => {
        window.print();
    };

    if (!isClient || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-canvas">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas">
                <div className="w-24 h-24 bg-canvas-alt rounded-full flex items-center justify-center mb-6">
                    <FileText size={40} className="text-charcoal/20" />
                </div>
                <h1 className="text-3xl font-black text-charcoal mb-4 uppercase tracking-tighter text-center">Aucun devis trouvé</h1>
                <p className="text-charcoal-muted mb-8 max-w-md text-center font-medium">
                    Nous n'avons trouvé aucune trace de cette commande.
                </p>
                <Link
                    href="/produits"
                    className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20"
                >
                    <ArrowLeft size={16} /> Retour à la boutique
                </Link>
            </div>
        );
    }

    const orderDate = new Date(order.date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex-1 flex flex-col bg-canvas py-12 px-4 sm:px-6 print:bg-white print:py-0 print:px-0 relative overflow-hidden">

            <style jsx global>{`
                @media print {
                    /* Hide website UI elements */
                    header, footer, nav, 
                    .print-hidden, 
                    #scroll-to-top, 
                    button, 
                    .action-bar,
                    .hidden-print {
                        display: none !important;
                    }

                    /* Reset body and main for print */
                    body, html {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        -webkit-print-color-adjust: exact;
                    }

                    /* Remove browser-added header/footer (date, title, URL) */
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    
                    .print-container {
                        margin: 0 !important;
                        padding: 1.5cm !important;
                        width: 100% !important;
                        max-width: none !important;
                        zoom: 0.95;
                    }

                    .bg-white {
                        background: white !important;
                        border: none !important;
                    }
                    
                    .text-charcoal {
                        color: black !important;
                    }
                    
                    .text-charcoal-muted, .text-charcoal-soft, .text-charcoal\/20 {
                        color: #475569 !important;
                    }

                    .text-primary {
                        color: #094507 !important;
                    }

                    /* Compact spacing for print */
                    .mb-10, .mb-12, .mb-8 {
                        margin-bottom: 1rem !important;
                    }
                    .py-12 {
                        padding-top: 0 !important;
                        padding-bottom: 0 !important;
                    }
                    .p-14 {
                        padding: 1rem !important;
                    }
                    .mt-16 {
                        margin-top: 1.5rem !important;
                    }

                    .border-border {
                        border-color: #e2e8f0 !important;
                    }

                    table tr td {
                        padding-top: 0.5rem !important;
                        padding-bottom: 0.5rem !important;
                    }

                    .print-text-black {
                        color: black !important;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto relative z-10 print-container">
                {/* Floating Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-border mb-8 gap-4 print:hidden mx-2 sm:mx-0">
                    <Link
                        href={orderId ? "/admin/orders" : "/produits"}
                        className="flex items-center text-[11px] sm:text-sm font-bold uppercase tracking-widest text-charcoal-muted hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" /> {orderId ? "Retour aux commandes" : "Continuer vos achats"}
                    </Link>
                    <button
                        onClick={generatePDF}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-primary/80 transition-colors shadow-md shadow-primary/20"
                    >
                        <Download size={16} />
                        Télécharger en PDF
                    </button>
                </div>

                {/* Printable Invoice Container */}
                <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-2xl overflow-hidden mb-12 border border-border print:shadow-none print:border-none print:m-0 print:p-0 print:bg-white mx-1 sm:mx-0">
                    <div ref={invoiceRef} className="relative p-4 sm:p-14 bg-white print:bg-white print:p-0 print:pt-4 overflow-hidden">

                        {/* Big Central Watermark Logo (Background) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.1] print:opacity-[0.12] pointer-events-none z-0 w-[70%] rotate-[-35deg] flex items-center justify-center">
                            <img
                                src={settings?.logoDarkUrl || settings?.logoUrl || "/mol.png"}
                                alt="Watermark"
                                className="w-full h-auto max-h-[600px] object-contain"
                            />
                        </div>

                        {/* Header Section */}
                        <div className="relative z-10 flex flex-col md:flex-row print:flex-row justify-between items-start border-b border-border pb-8 mb-8 print:border-slate-100">
                            <div className="mb-6 md:mb-0 print:mb-0">
                                <div className="mb-4">
                                    <div className="relative w-40 h-16 sm:w-48 sm:h-20 mb-2">
                                        <Image
                                            src={settings?.logoDarkUrl || settings?.logoUrl || "/mol.png"}
                                            alt={settings?.storeName || "Zelij Maroc"}
                                            fill
                                            style={{ objectFit: 'contain', objectPosition: 'left' }}
                                            priority
                                            unoptimized
                                        />
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-charcoal-muted space-y-1">
                                    <p>{settings?.address || '123 Boulevard Hassan II'}</p>
                                    <p>{settings?.phoneNumber ? `Tél: ${settings.phoneNumber}` : 'Tél: +212 5 22 XX XX XX'}</p>
                                    <p>{settings?.supportEmail ? `Email: ${settings.supportEmail}` : 'Email: contact@zelijmaroc.ma'}</p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto text-left md:text-right print:text-right">
                                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-charcoal/10 print:text-slate-200 mb-1 sm:mb-2">Devis</h2>
                                <div className="space-y-0.5 sm:space-y-1">
                                    <p className="text-[11px] sm:text-sm font-bold text-charcoal print:text-slate-900">N° {order.invoiceNumber}</p>
                                    <p className="text-[10px] sm:text-sm font-medium text-charcoal-muted">Date : {orderDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Section */}
                        {(order.customerInfo.name || order.customerInfo.phone || order.customerInfo.address) && (
                            <div className="relative z-10 mb-10 p-6 bg-canvas-alt rounded-2xl border border-border print:bg-transparent print:border-none">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-charcoal-muted mb-4 flex items-center gap-2">
                                    <User size={14} /> Facturé à
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-charcoal-soft print:text-slate-700">
                                    {order.customerInfo.name && (
                                        <div className="flex gap-2 items-center">
                                            <span className="font-bold text-charcoal print:text-slate-900">Client :</span> {order.customerInfo.name}
                                        </div>
                                    )}
                                    {order.customerInfo.phone && (
                                        <div className="flex gap-2 items-center">
                                            <Phone size={14} className="text-charcoal-muted" /> {order.customerInfo.phone}
                                        </div>
                                    )}
                                    {order.customerInfo.address && (
                                        <div className="flex gap-2 items-start sm:col-span-2">
                                            <MapPin size={14} className="text-charcoal-muted mt-1 flex-shrink-0" />
                                            <span className="leading-relaxed">{order.customerInfo.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Items Section - Table on Desktop, List on Mobile */}
                        <div className="relative z-10 mb-10">
                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[450px]">
                                    <thead>
                                        <tr className="border-b-2 border-border text-xs font-black uppercase tracking-widest text-primary print:border-slate-200">
                                            <th className="py-4 px-2">Description</th>
                                            <th className="py-4 px-2 text-center">Qté</th>
                                            <th className="py-4 px-2 text-right">Prix U.</th>
                                            <th className="py-4 px-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-semibold text-charcoal-soft print:text-slate-700">
                                        {order.items.map((item, index) => (
                                            <tr key={index} className="border-b border-border print:border-slate-100">
                                                <td className="py-4 px-2 text-charcoal print:text-slate-900">{item.name}</td>
                                                <td className="py-4 px-2 text-center text-charcoal-muted">{item.quantity}</td>
                                                <td className="py-4 px-2 text-right">{item.price.toFixed(2).replace('.', ',')}</td>
                                                <td className="py-4 px-2 text-right text-charcoal print:text-slate-900 font-bold">{(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile List View (< 640px) */}
                            <div className="sm:hidden space-y-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-border pb-2 mb-2">Articles commandés</div>
                                {order.items.map((item, index) => (
                                    <div key={index} className="bg-canvas-alt rounded-xl p-4 border border-border">
                                        <div className="font-bold text-charcoal text-sm mb-3">{item.name}</div>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="text-charcoal-muted">
                                                <span className="font-bold text-primary">{item.quantity}</span> x {item.price.toFixed(2).replace('.', ',')} MAD
                                            </div>
                                            <div className="font-black text-charcoal">
                                                {(item.price * item.quantity).toFixed(2).replace('.', ',')} MAD
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="relative z-10 flex justify-end">
                            <div className="w-full sm:w-1/2 md:w-1/3 space-y-3 sm:space-y-4 text-xs sm:text-sm">
                                <div className="flex justify-between font-bold text-charcoal-muted px-2">
                                    <span>Sous-total HT</span>
                                    <span>{order.totalPrice.toFixed(2).replace('.', ',')} MAD</span>
                                </div>
                                <div className="flex justify-between font-bold text-charcoal-muted px-2 pb-3 sm:pb-4 border-b border-border print:border-slate-200">
                                    <span>TVA (0%)</span>
                                    <span>0,00 MAD</span>
                                </div>
                                <div className="flex justify-between items-center text-lg sm:text-xl font-black text-charcoal print:text-slate-900 px-2 pt-2">
                                    <span className="text-primary">Total TTC</span>
                                    <span>{order.totalPrice.toFixed(2).replace('.', ',')} MAD</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="mt-16 pt-8 border-t border-border print:border-slate-100 text-center text-xs font-medium text-charcoal-muted">
                            <p className="mb-1 font-bold text-primary uppercase tracking-widest">Merci pour votre confiance</p>
                            <p>Ce devis certifie la bonne réception de votre commande.</p>
                            <p className="mt-2 text-[10px] text-charcoal-muted">Généré le {new Date().toLocaleString('fr-FR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InvoicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-canvas">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        }>
            <InvoiceContent />
        </Suspense>
    );
}
