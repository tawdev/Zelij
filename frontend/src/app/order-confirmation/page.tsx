import Link from 'next/link';

export default function OrderConfirmationPage() {
  return (
    <>
      <div className="font-display bg-background-light dark:bg-background-dark text-charcoal flex flex-col" style={{ '--primary': '#094507', '--background-light': '#f8f7f6', '--background-dark': '#0f172a', '--brand-navy': '#1e293b', '--radius': '0.25rem', '--radius-lg': '0.5rem', '--radius-xl': '0.75rem', '--radius-full': '9999px', '--font-display': 'Inter,sans-serif' } as React.CSSProperties}>

        <div className="layout-container flex h-full grow flex-col">

          <header className="flex items-center justify-between whitespace-nowrap border-b border-border bg-canvas px-6 md:px-20 lg:px-40 py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-charcoal">
                <span className="material-symbols-outlined text-3xl text-primary">auto_awesome_mosaic</span>
                <h2 className="text-xl font-bold leading-tight tracking-tight italic uppercase">Zelij <span className="text-primary">Maroc</span></h2>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <Link className="text-charcoal-soft text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/produits">Boutique</Link>
                <Link className="text-charcoal-soft text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/about">À Propos</Link>
                <Link className="text-charcoal-soft text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/contact">Support</Link>
              </nav>
            </div>
            <div className="flex flex-1 justify-end gap-4">
              <div className="flex gap-2">
                <Link href="/cart" className="flex items-center justify-center rounded-lg h-10 w-10 bg-canvas-alt text-charcoal hover:bg-primary hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl">shopping_cart</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-canvas">
            <div className="max-w-[720px] w-full text-center space-y-8">

              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-primary-10 rounded-full flex items-center justify-center text-primary mb-2 shadow-2xl">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h1 className="text-charcoal text-3xl md:text-4xl font-black italic uppercase tracking-tight">Commande Validée avec Succès</h1>
                <p className="text-primary text-lg font-black uppercase tracking-widest">N° de Commande: #ZEL-782910</p>
              </div>

              <div className="bg-white rounded-[32px] shadow-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-canvas-alt">
                  <h3 className="text-charcoal font-black uppercase italic text-lg">Résumé de la Commande</h3>
                  <span className="text-sm text-charcoal-soft font-bold">Effectuée le {new Date().toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-charcoal-soft text-[10px] uppercase tracking-[0.2em] font-black">
                        <th className="px-6 py-4">Article</th>
                        <th className="px-6 py-4 text-center">Quantité</th>
                        <th className="px-6 py-4 text-right">Prix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-charcoal font-bold italic">Zellige Marocain Fès</span>
                            <span className="text-[11px] text-charcoal-soft uppercase font-black">Artisanat d'Exception</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-charcoal-soft font-bold">1</td>
                        <td className="px-6 py-4 text-right text-primary font-black">34 900 MAD</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-canvas-alt">
                      <tr>
                        <td className="px-6 py-4 text-charcoal-muted font-bold uppercase text-xs" colSpan={2}>Sous-total</td>
                        <td className="px-6 py-4 text-right text-charcoal font-bold">34 900 MAD</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-charcoal-muted font-bold uppercase text-xs border-t border-border" colSpan={2}>Livraison</td>
                        <td className="px-6 py-4 text-right text-primary border-t border-border font-black uppercase tracking-widest">OFFERTE</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-6 text-charcoal text-xl font-black uppercase italic" colSpan={2}>Total</td>
                        <td className="px-6 py-6 text-right text-primary text-2xl font-black">34 900 MAD</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 pt-4">
                <Link href="/produits" className="bg-primary hover:bg-primary/80 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 transition-all flex items-center gap-2 uppercase tracking-widest italic">
                  Continuer mes Achats
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <p className="text-charcoal-muted text-sm max-w-md font-medium italic">
                  Un message de confirmation a été envoyé sur votre WhatsApp. Vous pouvez suivre l'état de votre livraison directement avec notre équipe support.
                </p>
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}
