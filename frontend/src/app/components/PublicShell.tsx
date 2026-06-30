'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

export default function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const shouldHideShell = pathname?.startsWith('/admin') || pathname?.startsWith('/portal');

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] print:bg-white">
            {!shouldHideShell && (
                <Suspense fallback={<div className="h-20 bg-[#F8F9FA] animate-pulse" />}>
                    <div className="lg:hidden">
                        <Header />
                    </div>
                </Suspense>
            )}
            {!shouldHideShell && (
                <Suspense fallback={<div className="h-10 bg-[#F8F9FA] animate-pulse" />}>
                    <Navbar />
                </Suspense>
            )}
            <main className="flex-grow pb-16 lg:pb-0 print:pb-0">
                {children}
            </main>
            {!shouldHideShell && (
                <Suspense fallback={<div className="h-40 bg-[#F8F9FA] animate-pulse" />}>
                    <Footer />
                </Suspense>
            )}
            {!shouldHideShell && <MobileBottomNav />}
        </div>
    );
}
