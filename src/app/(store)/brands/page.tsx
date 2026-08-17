'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getFilters } from '@/services/product';

export default function BrandsPage() {
    const [groupedBrands, setGroupedBrands] = useState<{ [key: string]: string[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const keys = ['0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const { data } = await getFilters();
                const brands: string[] = data.brands || [];

                const grouped: { [key: string]: string[] } = {};
                keys.forEach(key => grouped[key] = []);

                brands.forEach(brand => {
                    const firstChar = brand.charAt(0).toUpperCase();
                    if (/[0-9]/.test(firstChar)) {
                        grouped['0-9'].push(brand);
                    } else if (/[A-Z]/.test(firstChar)) {
                        grouped[firstChar].push(brand);
                    } else {
                        // fallback
                        grouped['0-9'].push(brand);
                    }
                });

                Object.keys(grouped).forEach(key => {
                    grouped[key].sort((a, b) => a.localeCompare(b));
                });

                setGroupedBrands(grouped);
            } catch (err) {
                console.error('Failed to fetch brands', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrands();
    }, []);

    const scrollToTop = (e: React.MouseEvent) => {
        e.preventDefault();
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };



    return (
        <div className="h-[calc(100dvh-125px)] md:h-[calc(100dvh-155px)] flex flex-col bg-gray-50 py-2.5 sm:py-6 px-2.5 sm:px-6 lg:px-6">
            <div className="max-w-[1400px] mx-auto w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

                {/* Fixed Header Group (No longer sticky, fixed inside the flex column) */}
                <div className="bg-white z-10 p-3 sm:p-5 border-b border-gray-100 flex-shrink-0">
                    <h1 className="text-[18px] sm:text-[20px] font-bold text-gray-900 mb-2 sm:mb-4">Brands A-Z</h1>

                    {/* Jump Links */}
                    <div className="bg-white py-1.5 sm:py-2 border border-gray-200 rounded-lg flex flex-wrap justify-center gap-[2px] sm:gap-1 text-[#d98324] font-semibold text-[14px] sm:text-[19px] px-1.5 sm:px-4 shadow-sm mx-auto">
                        {keys.map(key => (
                            <a
                                key={key}
                                href={`#section-${key}`}
                                className={`flex items-center justify-center h-6 sm:h-8 rounded-md hover:bg-orange-50 hover:text-[#458500] transition-colors whitespace-nowrap ${key === '0-9' ? 'px-1 sm:px-2' : 'w-6 sm:w-8'} ${groupedBrands[key]?.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                            >
                                {key}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Brand Sections (Scrollable Area) */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-8 sm:space-y-12 scroll-smooth">
                    {keys.map(key => {
                        const brandsInGroup = groupedBrands[key] || [];
                        if (brandsInGroup.length === 0) return null;

                        return (
                            <div key={key} id={`section-${key}`} className="scroll-mt-4 sm:scroll-mt-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 sm:pb-2 mb-4 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#d98324]">{key}</h2>
                                    <button onClick={scrollToTop} className="text-xs sm:text-sm font-medium text-[#2d68a8] bg-transparent border-none cursor-pointer p-0">
                                        Back to top
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {brandsInGroup.map(brand => (
                                        <Link
                                            key={brand}
                                            href={`/products?brand=${encodeURIComponent(brand)}`}
                                            className="text-[13px] sm:text-sm text-gray-700 hover:text-[#458500] truncate"
                                        >
                                            {brand}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
