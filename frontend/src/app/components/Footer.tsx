'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, Youtube } from 'lucide-react';
import { api, Category, BlogPost } from '../lib/api';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
    const { settings, loading: settingsLoading } = useSettings();
    const [categories, setCategories] = useState<Category[]>([]);
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        api.getCategoriesWithProducts().then(res => {
            setCategories(res.slice(0, 6));
        }).catch(err => console.error('Footer categories fetch error:', err));

        api.getPosts(1, 5, undefined, undefined, undefined, 'createdAt').then(res => {
            setRecentPosts(res.data);
        }).catch(err => console.error('Footer blog fetch error:', err));
    }, []);

    return (
        <footer className="border-t border-gray-200 bg-white pt-7 sm:pt-20 pb-6 sm:pb-10 mt-auto">
            <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 sm:gap-8 lg:gap-8 mb-7 sm:mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 pr-0 lg:pr-12">
                        <Link href="/" className="inline-block mb-4 sm:mb-6 group">
                            <div className="relative w-[140px] h-[56px] sm:w-[180px] sm:h-[72px]">
                                {(!mounted || settingsLoading) ? (
                                    <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
                                ) : (
                                    <Image
                                        src={settings?.logoUrl || "/icon.png"}
                                        alt={settings?.storeName || "Zelij Maroc"}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized={true}
                                        sizes="180px"
                                    />
                                )}
                            </div>
                        </Link>
                        <div className="text-[12px] sm:text-[14px] font-medium leading-relaxed text-[#6B7280] mb-4 sm:mb-8 max-w-sm">
                            {(!mounted || settingsLoading) ? (
                                <div className="space-y-2">
                                    <div className="w-full h-4 bg-gray-100 animate-pulse rounded" />
                                    <div className="w-full h-4 bg-gray-100 animate-pulse rounded" />
                                    <div className="w-[80%] h-4 bg-gray-100 animate-pulse rounded" />
                                </div>
                            ) : (
                                settings?.description || "Zelij Maroc est votre artisan du zellige authentique. Carreaux en terre cuite émaillée taillés à la main par nos maâlems de Fès. Tradition et excellence depuis des générations."
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <a 
                                href="https://www.instagram.com/zelijmaroc" 
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#094507]/10 flex items-center justify-center text-[#094507] hover:bg-[#094507] hover:text-white transition-all"
                            >
                                <Instagram size={16} className="sm:!w-[18px] sm:!h-[18px]" />
                            </a>
                            <a 
                                href="#" 
                                aria-label="Pinterest"
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#094507]/10 flex items-center justify-center text-[#094507] hover:bg-[#094507] hover:text-white transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.372 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.628 0 12-5.372 12-12S18.628 0 12 0z"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* Service Client */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[15px] sm:text-[20px] font-bold text-[#1F2937] mb-4 sm:mb-8 font-display">Service Client</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            <li><Link href="/contact" className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] hover:text-[#094507] transition-colors">Contact</Link></li>
                            <li><Link href="/blog" className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] hover:text-[#094507] transition-colors">Blog</Link></li>
                            <li><Link href="/faqs" className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] hover:text-[#094507] transition-colors">FAQ</Link></li>
                            <li><Link href="/livraison" className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] hover:text-[#094507] transition-colors">Livraison</Link></li>
                            <li><Link href="/track-order" className="text-[13px] sm:text-[15px] font-bold text-[#063005] hover:text-[#094507] transition-colors">Suivre ma commande</Link></li>
                            <li><Link href="/retours" className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] hover:text-[#094507] transition-colors">Retours & Échanges</Link></li>
                            <li><Link href="/confidentialite" className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] hover:text-[#094507] transition-colors">Confidentialité</Link></li>
                            <li><Link href="/conditions-generales" className="text-[13px] sm:text-[15px] font-normal text-[#6B7280] hover:text-[#094507] transition-colors">Conditions Générales</Link></li>
                        </ul>
                    </div>

                    {/* Categories Section */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[15px] sm:text-[20px] font-bold text-[#1F2937] mb-4 sm:mb-8 font-display">Catégories</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            href={`/produits?categoryId=${cat.id}`}
                                            className="text-[13px] sm:text-[15px] font-normal text-[#374151] hover:text-[#094507] transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link href="/produits?categoryId=1" className="text-[13px] sm:text-[15px] font-normal text-[#374151] hover:text-[#094507] transition-colors">Zellige Classique</Link></li>
                                    <li><Link href="/produits?categoryId=2" className="text-[13px] sm:text-[15px] font-normal text-[#374151] hover:text-[#094507] transition-colors">Bejmat</Link></li>
                                    <li><Link href="/produits?categoryId=3" className="text-[13px] sm:text-[15px] font-normal text-[#374151] hover:text-[#094507] transition-colors">Panneaux Mosaïque</Link></li>
                                    <li><Link href="/produits?categoryId=4" className="text-[13px] sm:text-[15px] font-normal text-[#374151] hover:text-[#094507] transition-colors">Créations en Zelij</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Blog Section */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[15px] sm:text-[20px] font-bold text-[#1F2937] mb-4 sm:mb-8 font-display">Blog</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {recentPosts.length > 0 ? (
                                recentPosts.map((post) => (
                                    <li key={post.id}>
                                        <Link
                                            href={`/blog/post/${post.slug}`}
                                            className="text-[14px] font-normal text-[#374151] hover:text-[#094507] transition-colors line-clamp-2 leading-snug"
                                        >
                                            {post.title}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <li key={i}>
                                        <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                                    </li>
                                ))
                            )}
                            <li className="pt-1">
                                <Link href="/blog" className="text-[12px] font-black text-[#063005] hover:text-[#094507] uppercase tracking-wider transition-colors">
                                    Voir tous les articles →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[15px] sm:text-[20px] font-bold text-[#1F2937] mb-4 sm:mb-8 font-display">Contact</h4>
                        <ul className="space-y-3 sm:space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-[#094507] shrink-0 mt-0.5" />
                                <span className="text-[14px] font-medium text-[#374151]">
                                    {(!mounted || settingsLoading) ? <div className="w-32 h-4 bg-gray-100 animate-pulse rounded" /> : (settings?.address || "Marrakech, Maroc")}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-[#094507] shrink-0" />
                                <span className="text-[14px] font-bold text-[#374151]">
                                    {(!mounted || settingsLoading) ? <div className="w-24 h-4 bg-gray-100 animate-pulse rounded" /> : (settings?.phoneNumber || "+212 6XX XX XX XX")}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-[#094507] shrink-0" />
                                <span className="text-[14px] font-bold text-[#374151] truncate">
                                    {(!mounted || settingsLoading) ? <div className="w-40 h-4 bg-gray-100 animate-pulse rounded" /> : (settings?.supportEmail || "contact@zelij-maroc.com")}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-5 sm:pt-10">
                    <p className="text-[13px] font-medium text-[#6B7280]">
                        Copyright © {new Date().getFullYear()} Zelij Maroc. Tous droits réservés. Artisanat marocain d&apos;exception.
                    </p>
                </div>
            </div>
        </footer>
    );
}
