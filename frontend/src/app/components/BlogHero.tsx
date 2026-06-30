'use client';

import React from 'react';
import { Search, Trophy, Users, BookOpen } from 'lucide-react';

interface BlogHeroProps {
  search: string;
  setSearch: (value: string) => void;
}

const BlogHero: React.FC<BlogHeroProps> = ({ search, setSearch }) => {
  const categories = [
    "NOUVEAUTÉS MOL",
    "ASTUCES MOBILITÉ",
    "COMPARATIFS ÉLECTRIQUE",
    "CONSEILS ENTRETIEN",
    "GUIDES ACCESSOIRES",
    "AUTONOMIE & BATTERIE",
    "SÉCURITÉ URBAINE"
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#0D0D0D] pt-16 pb-0">
      {/* Background with Image and Red Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-luminosity"
        style={ { backgroundImage: "url('/blog.png')" }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 to-transparent" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-20 opacity-10" 
        style={{ 
          backgroundImage: `radial-gradient(#99cc00 1px, transparent 1px)`, 
          backgroundSize: '30px 30px' 
        }} 
      />

      <div className="relative z-30 mx-auto max-w-[1400px] px-6 lg:px-12 pt-12 pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#99cc00]/30 bg-[#99cc00]/10 px-4 py-1.5 text-[11px] font-black tracking-[0.2em] text-[#99cc00] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#99cc00] animate-pulse" />
              Le Blog MOL Trottinette
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
              CONSEILS & <br />
              <span className="text-[#99cc00]">ACTUALITÉS</span>
            </h1>

            <p className="max-w-xl text-lg font-medium leading-relaxed text-slate-400">
              Guides d'achat, comparatifs, astuces de pros et tendances du secteur — tout ce dont vous avez besoin pour faire les bons choix en matière de mobilité électrique.
            </p>

            {/* Search Bar — Made Sleeker (h-14) */}
            <div className="relative max-w-2xl group">
              <div className="flex h-14 w-full items-center gap-2 rounded-full bg-white/10 backdrop-blur-md p-1.5 shadow-2xl transition-all group-focus-within:ring-4 group-focus-within:ring-[#99cc00]/20 border border-white/10">
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un article..."
                    className="w-full border-none bg-transparent px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-0 font-semibold text-[15px]"
                  />
                </div>
                <button className="h-full rounded-full bg-[#99cc00] px-8 text-[13px] font-black tracking-widest text-black transition-all hover:bg-[#b4f500] active:scale-95 shadow-lg shadow-[#99cc00]/20">
                  CHERCHER
                </button>
              </div>
            </div>
          </div>

          {/* Right Stats (Glassmorphism Cards) */}
          <div className="lg:col-span-5 flex flex-col gap-4 animate-fade-in delay-300">
            <StatCard 
              icon={<BookOpen className="h-6 w-6 text-white" />}
              value="48"
              label="Articles Publiés"
              sublabel="& en croissance"
            />
            <StatCard 
              icon={<Users className="h-6 w-6 text-white" />}
              value="12K+"
              label="Lecteurs Mensuels"
              sublabel="Communauté active"
            />
            <StatCard 
              icon={<Trophy className="h-6 w-6 text-black" />}
              value="Top 1"
              label="Blog Trottinette Maroc"
              sublabel="Référence du secteur"
            />
          </div>
        </div>
      </div>

    </section>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, sublabel }) => (
  <div className="group flex items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:bg-white/10 hover:translate-x-2">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#99cc00]/20 transition-colors group-hover:bg-[#99cc00]">
      {icon}
    </div>
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-white">{value}</span>
      </div>
      <div className="text-sm font-bold text-white leading-tight">{label}</div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{sublabel}</div>
    </div>
  </div>
);

export default BlogHero;
