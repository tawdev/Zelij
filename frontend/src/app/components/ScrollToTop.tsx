'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const toggleVisibility = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            if (scrollTop > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            if (scrollHeight > 0) {
                const progress = (scrollTop / scrollHeight) * 100;
                setScrollProgress(progress);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        // Initial check
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) return null;

    const radius = 22;
    const strokeWidth = 2;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 lg:bottom-10 lg:right-10 z-[100] group outline-none transition-all duration-300 transform hover:scale-110 active:scale-95 print:hidden"
            aria-label="Scroll to top"
        >
            <div className="relative flex items-center justify-center w-14 h-14 bg-[#111] border border-white/10 rounded-full shadow-2xl hover:shadow-[#99cc00]/10 transition-all backdrop-blur-xl">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="absolute -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        stroke="rgba(255,255,255,0.05)"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    {/* Progress circle */}
                    <circle
                        stroke="#99cc00"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="transition-all duration-150 ease-out"
                    />
                </svg>
                
                <ArrowUp 
                    className="w-5 h-5 text-[#99cc00] relative z-10 transition-transform duration-300 group-hover:-translate-y-1" 
                    strokeWidth={2.5}
                />
            </div>
        </button>
    );
}
