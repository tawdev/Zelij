'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Download, FileText, MapPin, Phone, User, Loader2, X } from 'lucide-react';
import { api } from '../../lib/api';

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

interface InvoiceModalProps {
    orderId: number | string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function InvoiceModal({ orderId, isOpen, onClose }: InvoiceModalProps) {
    const [order, setOrder] = useState<OrderPayload | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !orderId) return;

        api.getSettings().then(setSettings).catch(console.error);

        async function fetchOrder() {
            setLoading(true);
            try {
                const data = await api.getOrderById(orderId as any);
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
            setLoading(false);
        }

        fetchOrder();
    }, [orderId, isOpen]);

    const handlePrint = () => {
        const printContent = invoiceRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Devis ${order?.invoiceNumber}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            @page { 
                                margin: 0; 
                                size: auto;
                            }
                            body { 
                                margin: 0; 
                                -webkit-print-color-adjust: exact;
                            }
                            .print-container {
                                zoom: 0.9; /* Shrink to fit more content on one page */
                                padding: 1.5cm !important;
                            }
                            /* Reduce spacing for print */
                            .mb-10, .mb-8 { margin-bottom: 0.75rem !important; }
                            .p-8, .p-12 { padding: 1rem !important; }
                            .mt-16 { margin-top: 1rem !important; }
                            table tr td, table tr th { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
                        }
                    </style>
                </head>
                <body class="print-container">
                    ${printContent.innerHTML}
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Actions */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <FileText className="text-primary" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                            Aperçu du Devis
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Download size={14} /> Télécharger / Imprimer
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-slate-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 size={40} className="text-primary animate-spin mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement du devis...</p>
                        </div>
                    ) : !order ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs text-red-500">Erreur: Devis introuvable</p>
                        </div>
                    ) : (
                        <div ref={invoiceRef} className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-8 sm:p-12 mx-auto max-w-[800px]">
                            {/* Inner Invoice Content (copied from invoice page and adjusted for light mode) */}
                            <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-8 mb-8">
                                <div className="mb-6 md:mb-0">
                                    <div className="mb-4">
                                        <div className="relative w-40 h-16 mb-2">
                                            <img
                                                src={settings?.logoDarkUrl || settings?.logoUrl || "/icon.png"}
                                                alt={settings?.storeName || "MOL Trottinette"}
                                                className="w-full h-full object-contain object-left"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-slate-500 space-y-1">
                                        <p>{settings?.address || '123 Boulevard Hassan II'}</p>
                                        <p>{settings?.phoneNumber ? `Tél: ${settings.phoneNumber}` : 'Tél: +212 5 22 XX XX XX'}</p>
                                        <p>{settings?.supportEmail ? `Email: ${settings.supportEmail}` : 'Email: contact@moltrottinette.ma'}</p>
                                    </div>
                                </div>

                                <div className="text-left md:text-right">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-100 mb-2">Devis</h2>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">N° {order.invoiceNumber}</p>
                                        <p className="text-sm font-medium text-slate-500">Date : {new Date(order.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                    <User size={14} /> Facturé à
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-slate-700">
                                    {order.customerInfo.name && (
                                        <div className="flex gap-2 items-center">
                                            <span className="font-bold text-slate-900">Client :</span> {order.customerInfo.name}
                                        </div>
                                    )}
                                    {order.customerInfo.phone && (
                                        <div className="flex gap-2 items-center">
                                            <Phone size={14} className="text-slate-400" /> {order.customerInfo.phone}
                                        </div>
                                    )}
                                    {order.customerInfo.address && (
                                        <div className="flex gap-2 items-start sm:col-span-2">
                                            <MapPin size={14} className="text-slate-400 mt-1 flex-shrink-0" />
                                            <span className="leading-relaxed">{order.customerInfo.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-10 overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-primary">
                                            <th className="py-4 px-2">Description</th>
                                            <th className="py-4 px-2 text-center">Qté</th>
                                            <th className="py-4 px-2 text-right">Prix U.</th>
                                            <th className="py-4 px-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-semibold text-slate-600">
                                        {order.items.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-50">
                                                <td className="py-4 px-2 text-slate-900">{item.name}</td>
                                                <td className="py-4 px-2 text-center text-slate-400">{item.quantity}</td>
                                                <td className="py-4 px-2 text-right">{item.price.toFixed(2).replace('.', ',')}</td>
                                                <td className="py-4 px-2 text-right text-slate-900 font-bold">{(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-full sm:w-1/2 space-y-4 text-sm">
                                    <div className="flex justify-between font-bold text-slate-400 px-2">
                                        <span className="uppercase tracking-widest text-[10px]">Sous-total HT</span>
                                        <span>{order.totalPrice.toFixed(2).replace('.', ',')} MAD</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-400 px-2 pb-4 border-b border-slate-100">
                                        <span className="uppercase tracking-widest text-[10px]">TVA (0%)</span>
                                        <span>0,00 MAD</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-black text-slate-900 px-2 pt-2">
                                        <span className="text-primary tracking-tighter uppercase">Total TTC</span>
                                        <span className="tracking-tighter">{order.totalPrice.toFixed(2).replace('.', ',')} MAD</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
                                <p className="mb-1 font-black text-primary uppercase tracking-widest">Merci pour votre confiance</p>
                                <p>Ce devis certifie la bonne réception de votre commande.</p>
                                <p className="mt-2 text-[10px] text-slate-300 italic">Généré via MolTrottinette Management</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
