'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Products', href: '/admin/products', icon: 'inventory_2', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Categories', href: '/admin/categories', icon: 'category', roles: ['super_admin', 'manager'] },
    { label: 'Orders', href: '/admin/orders', icon: 'shopping_cart', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Inventory', href: '/admin/inventory', icon: 'inventory', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Users', href: '/admin/users', icon: 'group', roles: ['super_admin'] },
    { label: 'Blog', href: '/admin/blog', icon: 'article', roles: ['super_admin', 'admin'] },
    { label: 'Marques', href: '/admin/brands', icon: 'verified', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Avis Clients', href: '/admin/reviews', icon: 'reviews', roles: ['super_admin', 'admin'] },
    { label: 'Témoignages', href: '/admin/testimonials', icon: 'format_quote', roles: ['super_admin', 'admin'] },
    { label: 'Messages', href: '/admin/messages', icon: 'mail', roles: ['super_admin', 'admin'] },
    { label: 'Analytics', href: '/admin/analytics', icon: 'analytics', roles: ['super_admin'] },
    { label: 'Settings', href: '/admin/settings', icon: 'settings', roles: ['super_admin'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    // Initials for the avatar
    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'AD';

    // Force light mode on main content area, but sidebar will be dark
    useEffect(() => {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, [pathname]);

    // Close sidebar on navigation
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => 
        user && item.roles.includes(user.role as any)
    );

    return (
        <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}>
            <div className="light bg-[#F8FAFC] text-slate-900 antialiased min-h-screen" style={{ '--primary': '#094507' } as React.CSSProperties}>
                {/* Mobile Header with Burger Menu */}
                <header className="lg:hidden h-16 bg-slate-950 border-b border-gray-800 flex items-center justify-between px-4 z-[40] sticky top-0">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-10 h-10 flex items-center justify-center text-white hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[28px] text-white font-bold">
                            {isSidebarOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                    <div className="relative h-8 w-24">
                        <img
                            src={settings?.logoUrl || "/icon.png"}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                <div className="flex h-screen overflow-hidden relative">
                    {/* Backdrop for mobile */}
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Fixed Sidebar - Now Dark */}
                    <aside className={`fixed lg:static inset-y-0 left-0 w-72 flex-shrink-0 bg-slate-950 flex flex-col h-full z-[50] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <div className="p-8 border-b border-gray-800">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative shrink-0 w-32 h-12">
                                    <img
                                        src={settings?.logoUrl || "/icon.png"}
                                        alt={settings?.storeName || "MOL Admin"}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </Link>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 pl-1">Management Portal</p>
                        </div>

                        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar py-6 custom-scrollbar">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? 'fill-1' : 'group-hover:text-primary'}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`text-[13px] uppercase tracking-wider ${isActive ? 'font-black' : 'font-bold'}`}>
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-black/30" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-6 mt-auto border-t border-gray-800 bg-black/20">
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-gray-800">
                                <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm uppercase shadow-lg shadow-primary/20">
                                    {initials}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[13px] font-black text-white truncate uppercase tracking-tight">
                                        {user?.fullName || 'Admin User'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 truncate uppercase tracking-widest font-bold">
                                        {user?.role || 'manager'}
                                    </span>
                                </div>
                                <button 
                                    onClick={logout}
                                    className="ml-auto w-10 h-10 flex items-center justify-center rounded-xl text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    title="Se déconnecter"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Area */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                        {children}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}


