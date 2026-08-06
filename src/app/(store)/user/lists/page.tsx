'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Spinner from '@/components/Spinner';
import ProductCard from '@/components/ProductCard';

export default function MyListsPage() {
    const { myLists, isCartLoading } = useCart();

    if (isCartLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner className="w-8 h-8 sm:w-12 sm:h-12 text-[#458500]" />
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100dvh-110px)] sm:h-[calc(100dvh-150px)] md:h-[calc(100dvh-210px)] flex flex-col">
            <div className="bg-white rounded-none sm:rounded-lg shadow-sm border border-[#458500]/20 flex flex-col flex-1 min-h-0 overflow-hidden">
                {myLists.length > 0 && (
                    <div className="p-3 sm:p-5 border-b-2 border-[#458500]/20 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-[16px] sm:text-[18px] font-bold text-gray-800">My Lists</span>
                        </div>
                    </div>
                )}
            <div className="p-2.5 sm:p-2 flex-1 flex flex-col min-h-0 overflow-y-auto">
                {myLists.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[300px]">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">Your list is empty</h2>
                        <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 max-w-sm px-4">
                            Save items to your list to easily find them later or add them to your cart.
                        </p>
                        <Link href="/" className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-md bg-[#458500] hover:bg-[#366800] text-white text-sm sm:text-base font-bold transition-colors">
                            Select Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 pb-4">
                        {myLists.map((product, index) => (
                            <ProductCard 
                                key={product?._id ? product._id : `list-item-${index}`} 
                                product={product} 
                                showHeart={true} 
                            />
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
