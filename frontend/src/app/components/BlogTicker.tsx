'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

const TICKER_ITEMS = [
    'MOBILITÉ ÉLECTRIQUE',
    'TROTTINETTES',
    'ENTRETIEN PRO',
    'SÉCURITÉ URBAINE',
    'ACCESSOIRES',
    'AUTONOMIE',
    'MOL TROTTINETTE',
    'GUIDES ACHAT',
];

export default function BlogTicker() {
    return (
        <div className="bg-[#99cc00] py-2 overflow-hidden whitespace-nowrap border-y border-black/5 relative z-20">
            <div className="flex animate-marquee gap-16 items-center">
                {/* Double the items to ensure seamless loop */}
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                    <div key={i} className="flex items-center gap-16 group">
                        <span className="text-black font-black text-[12px] uppercase tracking-[0.3em] flex items-center gap-6">
                            {item} 
                            <Sparkles size={14} className="text-black/40 group-hover:scale-125 transition-transform" strokeWidth={3} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
