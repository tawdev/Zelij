'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, ShoppingBag, Heart, User, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface NavItem {
    label: string;
    icon: any;
    href: string;
    active: boolean;
    badge?: number;
    onClick?: () => void;
}

const MobileBottomNav = () => {
    const pathname = usePathname();
    const { totalItems } = useCart();
    const { count: wishlistCount } = useWishlist();

    const isShopPage = pathname === '/produits' || pathname?.startsWith('/produits/');
    const isActuallyShop = pathname === '/produits'; // Only show filter on main shop page

    const navItems: NavItem[] = [
        {
            label: 'Accueil',
            icon: Home,
            href: '/',
            active: pathname === '/',
        },
        {
            label: 'Boutique',
            icon: Store,
            href: '/produits',
            active: pathname === '/produits',
        },
        {
            label: 'Panier',
            icon: ShoppingBag,
            href: '/cart',
            active: pathname === '/cart',
            badge: totalItems,
        },
        {
            label: 'Wishlist',
            icon: Heart,
            href: '/wishlist',
            active: pathname === '/wishlist',
            badge: wishlistCount,
        },
    ];

    // If on shop page, insert the Filter icon in the middle
    if (isActuallyShop) {
        navItems.splice(2, 0, {
            label: 'Filtrer',
            icon: SlidersHorizontal,
            href: '#',
            active: false,
            onClick: () => {
                window.dispatchEvent(new CustomEvent('open-filter'));
            }
        });
    }

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#070707]/80 backdrop-blur-xl border-t border-white/5 pb-safe print:hidden print-hidden">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const content = (
                        <div className="flex flex-col items-center justify-center gap-1 min-w-[64px]">
                            <div className="relative">
                                <Icon 
                                    size={22} 
                                    className={`transition-colors ${item.active ? 'text-[#99cc00]' : 'text-slate-400'}`} 
                                    strokeWidth={item.active ? 2.5 : 2}
                                />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-[#070707]">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${item.active ? 'text-[#99cc00]' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                        </div>
                    );

                    if (item.onClick) {
                        return (
                            <button key={index} onClick={item.onClick} className="flex-1 outline-none">
                                {content}
                            </button>
                        );
                    }

                    return (
                        <Link key={index} href={item.href} className="flex-1 flex justify-center">
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
