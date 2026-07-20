'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getProducts } from '@/services/product';

interface Product {
    _id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
}

export default function SearchBar({ isMobile = false }: { isMobile?: boolean }) {
    const [query, setQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (query.trim().length < 3) {
                setFilteredProducts([]);
                setIsOpen(false);
                return;
            }

            try {
                const res = await getProducts({ search: query.trim() });
                setFilteredProducts(res.data.slice(0, 10)); // show up to 10, scroll after 5
                setIsOpen(true);
            } catch (err) {
                console.error('Failed to search products', err);
            }
        };

        const timer = setTimeout(() => {
            fetchSearchResults();
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getImageUrl = (img: string) => {
        if (!img) return '';
        if (img.startsWith('http')) return img;
        return `${process.env.NEXT_PUBLIC_API_URL || ''}/upload/file/${img}`;
    };

    return (
        <div ref={searchRef} className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-4xl hidden sm:block'}`}>
            <div className="absolute left-0 top-0 bottom-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
                type="text"
                placeholder="Search all of Itelents"
                value={query}
                autoCapitalize="none"
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (query.trim().length > 0 && filteredProducts.length > 0) setIsOpen(true); }}
                className={`w-full rounded-full py-2 pl-11 pr-10 text-black outline-none shadow-inner bg-white ${isMobile ? 'h-[41px] text-sm' : 'h-12 text-sm py-2.5'}`}
            />
            {query.length > 0 && (
                <button
                    onClick={() => { setQuery(''); setIsOpen(false); setFilteredProducts([]); }}
                    className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-[#458500] hover:bg-[#3b7100] text-white rounded-full flex items-center justify-center transition-colors"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}

            {isOpen && filteredProducts.length > 0 && (
                <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-300 z-[100] overflow-hidden text-black">
                    <div className="px-3 py-2 sm:px-4 sm:py-3 bg-white border-b border-gray-200 font-bold text-gray-700 text-[14px] sm:text-[16px]">
                        Suggested products
                    </div>
                    <div className="max-h-[380px] sm:max-h-[600px] overflow-y-auto">
                        {filteredProducts.map((product, index) => {
                            const finalPrice = product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price;

                            return (
                                <Link
                                    key={product._id}
                                    href={`/products/${product._id}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                    className="block hover:bg-gray-50 transition-colors"
                                >
                                    <div className={`flex items-start gap-4 py-2 mx-2.5 sm:mx-4 ${index !== filteredProducts.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white flex items-center justify-center relative">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <div className="text-[12px] sm:text-[14px] font-normal text-[#0066c0] hover:text-[#c45500] hover:underline line-clamp-2 leading-snug">
                                                {product.name}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 mb-1">
                                                <div className="flex text-[#ffa41c]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className="w-[14px] h-[14px] sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-[15px] sm:text-[18px] font-medium text-[#0f1111]">
                                                <span className="text-[12px] relative -top-1 pr-[1px]">₹</span>{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
