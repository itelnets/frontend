'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFilters } from '@/services/product';
import Spinner from '@/components/Spinner';

export default function BrandsPage() {
    const [groupedBrands, setGroupedBrands] = useState<{ [key: string]: string[] }>({});
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Spinner className="w-8 h-8 text-[#458500]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto bg-white rounded-xl border border-gray-200 p-6 sm:p-10 shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Brands A-Z</h1>

                {/* Jump Links */}
                <div className="sticky top-[80px] sm:top-[120px] bg-white z-10 py-3 sm:py-4 border-t border-b border-gray-200 mb-10 flex flex-wrap gap-x-3 gap-y-3 justify-center sm:justify-between text-[#d98324] font-semibold text-sm sm:text-base px-2 shadow-sm">
                    {keys.map(key => (
                        <a 
                            key={key} 
                            href={`#section-${key}`}
                            className={`hover:text-[#458500] transition-colors ${groupedBrands[key]?.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}
                        >
                            {key}
                        </a>
                    ))}
                </div>

                {/* Brand Sections */}
                <div className="space-y-12">
                    {keys.map(key => {
                        const brandsInGroup = groupedBrands[key] || [];
                        if (brandsInGroup.length === 0) return null;

                        return (
                            <div key={key} id={`section-${key}`} className="scroll-mt-[180px] sm:scroll-mt-[220px]">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-6">
                                    <h2 className="text-2xl font-bold text-[#d98324]">{key}</h2>
                                    <a href="#" className="text-sm font-medium text-[#2d68a8] hover:underline">
                                        Back to top
                                    </a>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {brandsInGroup.map(brand => (
                                        <Link 
                                            key={brand} 
                                            href={`/products?brand=${encodeURIComponent(brand)}`}
                                            className="text-sm text-gray-700 hover:text-[#458500] hover:underline truncate"
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
