'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Heart, ShoppingBag, Menu } from 'lucide-react';

export default function Header() {
    const { settings, loading: settingsLoading } = useSettings();
    const { count: wishlistCount } = useWishlist();
    const { totalItems } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
            <header className={`w-full bg-white/95 backdrop-blur-md sticky top-0 lg:relative border-b border-gray-200 transition-all duration-300 z-[100] lg:z-auto`}>
                {/* Main Header */}
                <div className="h-[48px] flex items-center relative">
                    {/* Mobile Header Layout (< 1024px) */}
                    <div className="lg:hidden flex w-full items-center justify-between px-2 sm:px-10 h-[44px] xs:h-[48px]">
                        {/* Left: Burger Menu */}
                        <div className="flex-1 flex justify-start">
                            <button
                                className="p-2 -ml-2 text-[#1F2937] hover:text-[#094507] transition-all active:scale-95 focus:outline-none"
                                onClick={() => {
                                    document.dispatchEvent(new CustomEvent('open-mobile-menu'));
                                }}
                                aria-label="Menu"
                            >
                                <div className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <Menu size={20} strokeWidth={2.5} />
                                </div>
                            </button>
                        </div>

                        {/* Center: Logo */}
                        <div className="flex-none flex justify-center">
                            <Link href="/" className="shrink-0">
                                <div className="relative w-[70px] xs:w-[100px] h-[36px] xs:h-[44px]">
                                    {(!mounted || settingsLoading) ? (
                                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
                                    ) : (
                                        <Image
                                            src={settings?.logoUrl || "/icon.png"}
                                            alt={settings?.storeName || "Zelij Maroc"}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            priority
                                            unoptimized={true}
                                            sizes="100px"
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>

                        {/* Right: Action Icons */}
                        <div className="flex-1 flex justify-end">
                            <div className="flex items-center gap-1 sm:gap-4">
                                <Link href="/wishlist" className="hidden min-[800px]:flex relative p-1.5 text-[#1F2937] hover:text-[#094507] transition-colors">
                                    <Heart size={20} />
                                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#063005] text-[7px] font-black text-white ring-2 ring-[#F8F9FA]">
                                        {mounted ? wishlistCount : 0}
                                    </span>
                                </Link>
                                <Link href="/cart" className="relative p-1.5 text-[#1F2937] hover:text-[#094507] transition-colors">
                                    <ShoppingBag size={20} />
                                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#063005] text-[7px] font-black text-white ring-2 ring-[#F8F9FA]">
                                        {mounted ? totalItems : 0}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Header Layout (>= 1024px) */}
                    <div className="hidden lg:flex w-full max-w-[1400px] mx-auto items-center justify-between px-4 sm:px-6 lg:px-8 gap-10">
                        {/* Left Block: Logo (Desktop) */}
                        <div className="lg:min-w-[240px] flex items-center justify-start">
                            <Link href="/" className="shrink-0 group">
                                <div className="relative w-[160px] h-[64px]">
                                    {(!mounted || settingsLoading) ? (
                                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
                                    ) : (
                                        <Image
                                            src={settings?.logoUrl || "/icon.png"}
                                            alt={settings?.storeName || "Zelij Maroc"}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            priority
                                            unoptimized={true}
                                            sizes="160px"
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>

                    </div>
                </div>
        </header>
    );
}
