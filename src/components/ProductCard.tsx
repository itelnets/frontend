'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import { useCart } from '@/context/CartContext';
import ConfirmModal from '@/components/ConfirmModal';

interface Product {
    _id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
    description?: string;
    rating?: number;
    numReviews?: number;
}

interface ProductCardProps {
    product: Product;
    showHeart?: boolean;
}

export default function ProductCard({ product, showHeart = false }: ProductCardProps) {
    const { myLists, moveToList, removeFromList } = useCart();
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    const isInList = showHeart ? myLists.some((p: any) => p._id === product._id) : false;

    const toggleList = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInList) {
            setIsRemoveModalOpen(true);
        } else {
            moveToList(product as any);
        }
    };

    const confirmRemove = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        removeFromList(product._id);
        setIsRemoveModalOpen(false);
    };

    const cancelRemove = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsRemoveModalOpen(false);
    };

    return (
        <Link
            href={`/products/${product._id}`}
            className="bg-white rounded-xl flex flex-col cursor-pointer hover:shadow-lg transition-shadow group border border-gray-300 overflow-hidden w-full h-full relative"
        >
            {showHeart && (
                <button
                    onClick={toggleList}
                    className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-colors cursor-pointer ${isInList ? 'text-[#458500] bg-green-50' : 'text-gray-400 hover:text-[#458500] hover:bg-green-50'}`}
                    title={isInList ? 'Remove from list' : 'Add to list'}
                >
                    {isInList ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    )}
                </button>
            )}

            <ConfirmModal
                isOpen={isRemoveModalOpen}
                title="Remove from My Lists"
                description="Are you sure you want to remove this item from your lists?"
                onCancel={cancelRemove}
                onConfirm={confirmRemove}
                cancelText="Cancel"
                confirmText="Remove"
            />

            <div className="w-full h-[170px] sm:h-[200px] lg:h-[220px] shrink-0 flex items-center justify-center relative bg-white border-b border-gray-100 p-1">
                {product.images && product.images.length > 0 ? (
                    <Image
                        src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`}
                        alt={product.name}
                        width={500}
                        height={500}
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                ) : (
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                )}
                <AddToCartButton product={product as any} />
            </div>

            <div className="p-2 sm:p-3 flex-1 flex flex-col relative">
                <div className="text-[12px] sm:text-[13px] text-gray-800 line-clamp-2 min-h-[2.7em] h-[2.7em] leading-snug pb-0.5 mb-1 sm:mb-2 font-medium group transition-colors overflow-hidden">
                    {product.name}
                </div>

                <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => {
                            const rating = product.rating || 0;
                            if (rating >= i + 1) {
                                return (
                                    <svg key={i} className="w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                );
                            } else if (rating > i) {
                                return (
                                    <div key={i} className="relative w-3.5 h-3.5 md:w-5 md:h-5">
                                        <svg className="absolute top-0 left-0 w-3.5 h-3.5 md:w-5 md:h-5 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="absolute top-0 left-0 w-3.5 h-3.5 md:w-5 md:h-5 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                );
                            } else {
                                return (
                                    <svg key={i} className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                );
                            }
                        })}
                    </div>
                    <span className="text-[14px] text-[#458500] hover:underline cursor-pointer">{product.numReviews || 0}</span>
                </div>

                <div className="flex items-center gap-1 lg:gap-2 mt-auto overflow-hidden">
                    <div className="text-[15px] lg:text-[15px] xl:text-lg font-bold text-gray-900 whitespace-nowrap">
                        <span className="text-xs xl:text-sm font-medium relative -top-0.5 pr-0.5">₹</span>{product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price}
                    </div>
                    {product.discount > 0 && (
                        <>
                            <div className="text-[10px] xl:text-xs text-gray-500 line-through whitespace-nowrap truncate">
                                ₹{product.price}
                            </div>
                            <div className="whitespace-nowrap bg-[#ff3344] text-white text-[9px] xl:text-[10px] font-bold px-1 xl:px-1.5 py-0.5 rounded shadow-sm shrink-0">
                                {product.discount}% OFF
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}
