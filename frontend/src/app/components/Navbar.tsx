'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Menu, Home, Store, ShieldCheck, Info, Mail, ChevronRight, X, Heart, ShoppingBag, Newspaper, ChevronDown, Package } from 'lucide-react';
import { api, type Category } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {

    const pathname = usePathname();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileExpandedCat, setMobileExpandedCat] = useState<number | null>(null);
    const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
    const [hoveredSubCatId, setHoveredSubCatId] = useState<number | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { count: wishlistCount } = useWishlist();
    const { totalItems } = useCart();
    const { settings, loading: settingsLoading } = useSettings();

    const menuRef = useRef<HTMLDivElement>(null);
    const moreRef = useRef<HTMLDivElement>(null);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);

        const handleOpenMenu = () => setIsMobileMenuOpen(true);
        document.addEventListener('open-mobile-menu', handleOpenMenu);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('open-mobile-menu', handleOpenMenu);
        };
    }, []);

    useEffect(() => {
        api.getCategoriesWithProducts().then(setCategories).catch(console.error);
    }, []);

    const categoryTree = useMemo(() => {
        const buildTree = (items: Category[], parentId: number | null = null): Category[] => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };
        return buildTree(categories);
    }, [categories]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
                setHoveredCatId(null);
                setHoveredSubCatId(null);
            }
            if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
                setIsMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hoveredCategory = categoryTree.find(c => c.id === hoveredCatId);
    const hoveredSubCategory = hoveredCategory?.children?.find(c => c.id === hoveredSubCatId);

    const mainNavItems = [
        { name: 'Accueil', href: '/', icon: <Home size={18} /> },
        { name: 'Boutique', href: '/produits', icon: <Store size={18} /> },
        { name: 'À Propos', href: '/about', icon: <Info size={18} /> },
    ];

    const moreNavItems = [
        { name: 'Contact', href: '/contact', icon: <Mail size={18} /> },
        { name: 'Suivi', href: '/track-order', icon: <Package size={18} /> },
    ];

    const allNavItems = [...mainNavItems, ...moreNavItems];

    return (
        <nav className="w-full sticky top-[84px] sm:top-[88px] lg:top-0 z-[110] bg-transparent h-0 lg:h-[72px] flex items-center" suppressHydrationWarning>
            <div className="w-full lg:max-w-[1400px] lg:mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop Navbar */}
                <div className="hidden lg:flex h-[60px] items-center rounded-xl bg-white shadow-sm border border-border px-3 transition-all duration-300 w-full">
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen);
                                setHoveredCatId(null);
                                setHoveredSubCatId(null);
                            }}
                            className="flex items-center justify-between gap-3 bg-primary px-4 h-[44px] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-primary-light transition-all group min-w-[160px]"
                        >
                            Catégories
                            {isMenuOpen ? (
                                <X size={14} className="transition-transform" />
                            ) : (
                                <Menu size={16} className="group-hover:scale-110 transition-transform" />
                            )}
                        </button>

                        {/* Mega Menu Dropdown */}
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute top-[calc(100%+10px)] left-0 z-[100] flex"
                                    onMouseLeave={() => {
                                        setIsMenuOpen(false);
                                        setHoveredCatId(null);
                                        setHoveredSubCatId(null);
                                    }}
                                >
                                    <div className="relative w-[240px] h-fit bg-white border border-border rounded-xl shadow-lg py-3 flex flex-col z-30">
                                        <div className="absolute -top-[8px] left-8 w-4 h-4 bg-white rotate-45 rounded-[2px] border-l border-t border-border z-0"></div>
                                        <div className="relative z-10">
                                            {categoryTree.map((cat) => {
                                                const hasChildren = cat.children && cat.children.length > 0;
                                                const isHovered = hoveredCatId === cat.id;
                                                return (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/produits?categoryId=${cat.id}`}
                                                        onMouseEnter={() => {
                                                            setTimeout(() => {
                                                                setHoveredCatId(cat.id);
                                                                setHoveredSubCatId(null);
                                                            }, 100);
                                                        }}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className={`relative flex items-center justify-between px-5 py-[10px] text-sm transition-all duration-200 ${isHovered
                                                            ? 'text-primary font-bold bg-primary-10'
                                                            : 'text-charcoal-soft font-medium hover:text-primary hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full transition-all duration-200 ${isHovered ? 'bg-primary opacity-100' : 'bg-transparent opacity-0'}`}></div>
                                                        <span>{cat.name}</span>
                                                        {hasChildren && (
                                                            <ChevronRight size={14} strokeWidth={isHovered ? 2.5 : 2} className={`transition-colors duration-200 ${isHovered ? 'text-primary' : 'text-charcoal-muted'}`} />
                                                        )}
                                                    </Link>
                                                );
                                            })}

                                            <div className="border-t border-border my-2 mx-5"></div>

                                            <Link
                                                href="/produits?sort=newest"
                                                onClick={() => setIsMenuOpen(false)}
                                                onMouseEnter={() => { setTimeout(() => { setHoveredCatId(null); setHoveredSubCatId(null); }, 100); }}
                                                className="flex items-center px-5 py-[10px] text-sm font-bold text-charcoal-soft hover:text-primary bg-transparent hover:bg-gray-50 transition-colors"
                                            >
                                                Nouveautés
                                            </Link>
                                            <Link
                                                href="/produits?onSale=true"
                                                onClick={() => setIsMenuOpen(false)}
                                                onMouseEnter={() => { setTimeout(() => { setHoveredCatId(null); setHoveredSubCatId(null); }, 100); }}
                                                className="flex items-center px-5 py-[10px] text-sm font-bold text-charcoal-soft hover:text-primary bg-transparent hover:bg-gray-50 transition-colors"
                                            >
                                                Promotions
                                            </Link>
                                        </div>
                                    </div>

                                    {hoveredCategory && hoveredCategory.children && hoveredCategory.children.length > 0 && (
                                        <div className="relative z-20 w-[250px] h-fit bg-white border border-border rounded-xl shadow-lg py-2 flex flex-col animate-in fade-in slide-in-from-left-6 duration-300 ease-out fill-mode-both mr-[12px] mt-[16px]">
                                            {hoveredCategory.children.map((sub) => {
                                                const hasGrandChildren = sub.children && sub.children.length > 0;
                                                const isSubHovered = hoveredSubCatId === sub.id;
                                                return (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/produits?categoryId=${sub.id}`}
                                                        onMouseEnter={() => {
                                                            setTimeout(() => {
                                                                setHoveredSubCatId(sub.id);
                                                            }, 100);
                                                        }}
                                                        onClick={() => setIsMenuOpen(false)}
                                                        className={`flex items-center justify-between px-5 py-[10px] text-sm transition-all duration-200 ${isSubHovered
                                                            ? 'text-primary font-bold bg-primary-10 rounded-r-lg'
                                                            : 'text-charcoal-muted font-medium hover:text-primary hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <span>{sub.name}</span>
                                                        {hasGrandChildren && (
                                                            <ChevronRight size={14} strokeWidth={isSubHovered ? 2.5 : 2} className={`transition-colors duration-200 ${isSubHovered ? 'text-primary' : 'text-transparent'}`} />
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center ml-3 gap-0.5 lg:flex-1 lg:justify-center xl:flex-none xl:justify-start">
                        {mainNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all rounded-lg whitespace-nowrap group
                                        ${isActive ? 'text-primary' : 'text-charcoal-soft hover:text-primary hover:bg-gray-50'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navHeaderActive"
                                            className="absolute inset-0 bg-primary-10 rounded-lg z-0 border border-primary/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`relative z-10 ${isActive ? 'text-primary' : 'text-charcoal-muted group-hover:text-primary'} transition-colors shrink-0`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            );
                        })}

                        {/* Secondary Items */}
                        {moreNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all rounded-lg whitespace-nowrap group
                                        ${isActive ? 'text-primary' : 'text-charcoal-soft hover:text-primary hover:bg-gray-50'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="navHeaderActive2"
                                            className="absolute inset-0 bg-primary-10 rounded-lg z-0 border border-primary/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`relative z-10 ${isActive ? 'text-primary' : 'text-charcoal-muted group-hover:text-primary'} transition-colors shrink-0`}>
                                        {item.icon}
                                    </span>
                                    <span className="relative z-10">{item.name}</span>
                                </Link>
                            );
                        })}

                        {/* "More" Dropdown - Visible only on LG to XL */}
                        <div className="relative xl:hidden" ref={moreRef}>
                            <button
                                onClick={() => setIsMoreOpen(!isMoreOpen)}
                                className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all rounded-lg whitespace-nowrap
                                    ${isMoreOpen ? 'text-primary bg-primary-10' : 'text-charcoal-soft hover:text-primary hover:bg-gray-50'}`}
                            >
                                <span className="relative z-10">Plus</span>
                                <ChevronDown size={14} className={`relative z-10 transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isMoreOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className="absolute top-[calc(100%+8px)] left-0 w-[180px] bg-white border border-border rounded-xl shadow-lg py-2 z-50"
                                    >
                                        <div className="absolute -top-[5px] left-5 w-3 h-3 bg-white rotate-45 border-l border-t border-border"></div>
                                        {moreNavItems.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsMoreOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-charcoal-soft hover:text-primary hover:bg-gray-50 transition-all"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Desktop Action Icons */}
                    <div className="flex items-center gap-2 ml-auto border-l border-border pl-4 h-8">
                        <Link href="/wishlist" className="group relative p-1.5 rounded-lg hover:bg-gray-50 transition-all">
                            <Heart size={18} className="text-charcoal-muted transition-colors group-hover:text-primary" />
                            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[7px] font-black text-white ring-2 ring-white">
                                {mounted ? wishlistCount : 0}
                            </span>
                        </Link>
                        <Link href="/cart" className="group relative p-1.5 rounded-lg hover:bg-gray-50 transition-all">
                            <ShoppingBag size={18} className="text-charcoal-muted transition-colors group-hover:text-primary" />
                            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[7px] font-black text-white ring-2 ring-white">
                                {mounted ? totalItems : 0}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-[200] animate-in fade-in duration-300 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Side Drawer */}
            <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[210] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden overflow-y-auto custom-scrollbar border-r border-border ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between p-4 h-[64px] border-b border-border bg-canvas">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="shrink-0">
                            <div className="relative w-[100px] h-[40px]">
                                {(!mounted || settingsLoading) ? (
                                    <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
                                ) : (
                                    <Image
                                        src={settings?.logoUrl || "/icon.png"}
                                        alt={settings?.storeName || "Zelij Maroc"}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized={true}
                                    />
                                )}
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 text-charcoal hover:text-primary rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-4 space-y-1">
                        {allNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-10 text-primary' : 'text-charcoal-soft hover:bg-gray-50'}`}
                                >
                                    <span className={isActive ? 'text-primary' : 'text-charcoal-muted'}>{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Categories Accordion */}
                    <div className="p-4 pt-0">
                        <h3 className="px-4 py-2 text-[10px] font-bold text-charcoal-muted uppercase tracking-[0.2em] mb-2">Les Catégories</h3>
                        <div className="space-y-1">
                            {categoryTree.map((cat) => {
                                const isExpanded = mobileExpandedCat === cat.id;
                                const hasChildren = cat.children && cat.children.length > 0;

                                return (
                                    <div key={cat.id} className="overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <Link
                                                href={`/produits?categoryId=${cat.id}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex-1 px-4 py-3 text-sm font-medium text-charcoal-soft hover:text-primary transition-colors"
                                            >
                                                {cat.name}
                                            </Link>
                                            {hasChildren && (
                                                <button
                                                    onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                                                    className={`p-3 text-charcoal-muted hover:text-primary transition-all ${isExpanded ? 'rotate-180' : ''}`}
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {hasChildren && (
                                            <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                <div className="overflow-hidden bg-gray-50 rounded-xl ml-4">
                                                    {cat.children!.map((sub) => (
                                                        <Link
                                                            key={sub.id}
                                                            href={`/produits?categoryId=${sub.id}`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="block px-8 py-2.5 text-sm font-medium text-charcoal-muted hover:text-primary"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="border-t border-border my-4 mx-4"></div>

                            <Link
                                href="/produits?sort=newest"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 text-sm font-bold text-primary hover:bg-gray-50 transition-colors uppercase tracking-widest"
                            >
                                Nouveautés
                            </Link>
                            <Link
                                href="/produits?onSale=true"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-4 py-3 text-sm font-bold text-primary hover:bg-gray-50 transition-colors uppercase tracking-widest"
                            >
                                Promotions
                            </Link>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-auto p-8 bg-gray-50">
                        <div className="flex items-center gap-4 mb-6">
                            <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="relative flex-1 flex flex-col items-center gap-2 py-4 bg-white rounded-xl border border-border shadow-sm">
                                <Heart size={20} className="text-charcoal-muted" />
                                <span className="text-[10px] font-bold text-charcoal-muted">Souhaits</span>
                                <span className="absolute top-2 right-4 bg-accent text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">{mounted ? wishlistCount : 0}</span>
                            </Link>
                        </div>
                        <p className="text-[10px] text-charcoal-muted font-medium text-center uppercase tracking-widest">
                            Zelij Maroc © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
