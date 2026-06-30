'use client';

import Link from 'next/link';
import { Gavel, Scale, FileCheck, AlertCircle, ShoppingBag, CreditCard } from 'lucide-react';

const sections = [
    {
        icon: <ShoppingBag className="w-6 h-6" />,
        title: "1. Commandes & Produits",
        content: "Les commandes sont fermes et définitives une fois confirmées via notre plateforme ou WhatsApp. Nous nous efforçons de présenter les produits avec la plus grande précision possible, mais des variations mineures peuvent exister."
    },
    {
        icon: <Scale className="w-6 h-6" />,
        title: "2. Prix & Devises",
        content: "Tous nos prix sont indiqués en Dirhams Marocains (MAD) toutes taxes comprises (TTC). Nous nous réservons le droit de modifier les prix à tout moment, mais les produits sont facturés sur la base des tarifs au moment de la commande."
    },
    {
        icon: <CreditCard className="w-6 h-6" />,
        title: "3. Modalités de Paiement",
        content: "Le paiement s'effectue intégralement à la livraison (Cash on Delivery) sauf accord spécifique pour les clients professionnels. Le client s'engage à être présent lors du passage du livreur pour honorer le paiement."
    },
    {
        icon: <AlertCircle className="w-6 h-6" />,
        title: "4. Responsabilités",
        content: "Zelij Maroc ne saurait être tenue pour responsable des dommages résultant d'une mauvaise utilisation du produit acheté (non-respect des consignes de sécurité, absence de protections, etc.)."
    },
    {
        icon: <FileCheck className="w-6 h-6" />,
        title: "5. Propriété Intellectuelle",
        content: "Tous les contenus du site (logos, images, textes) sont la propriété exclusive de Zelij Maroc et sont protégés par le droit d'auteur au Maroc."
    },
    {
        icon: <Gavel className="w-6 h-6" />,
        title: "6. Droit Applicable",
        content: "En cas de litige, les tribunaux de Casablanca seront seuls compétents, et le droit marocain sera exclusivement applicable."
    }
];

export default function ConditionsGeneralesPage() {
    return (
        <div className="flex-1 bg-canvas min-h-screen">
            {/* Hero Header */}
            <div className="bg-canvas border-b border-border py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-canvas-alt [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative">
                    <h1 className="text-4xl md:text-5xl font-black text-charcoal mb-6 tracking-tight uppercase italic">
                        Conditions <span className="text-primary">Générales</span>
                    </h1>
                    <p className="text-lg text-charcoal-soft font-medium max-w-2xl mx-auto italic">
                        Veuillez lire attentivement les conditions régissant l'utilisation de nos services et vos achats sur moltrottinette.ma.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="bg-white rounded-[48px] p-8 md:p-16 border border-border shadow-2xl">
                    <div className="space-y-12">
                        {sections.map((section, i) => (
                            <section key={i} className="group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-canvas-alt rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-black text-charcoal uppercase italic tracking-tight underline decoration-primary/20 decoration-4 underline-offset-8">
                                        {section.title}
                                    </h2>
                                </div>
                                <p className="text-charcoal-soft font-medium leading-[1.8] text-[16px] pl-16">
                                    {section.content}
                                </p>
                            </section>
                        ))}
                    </div>

                    <div className="mt-20 p-8 bg-canvas-alt rounded-3xl border border-dashed border-border text-center">
                        <p className="text-charcoal-soft font-bold italic">
                            Dernière mise à jour du document : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                
                <div className="mt-12 text-center text-charcoal-soft text-sm font-medium uppercase tracking-widest">
                    Pour toute question relative à ces conditions, merci de <Link href="/contact" className="text-primary font-black hover:underline">nous contacter</Link>.
                </div>
            </div>
        </div>
    );
}
