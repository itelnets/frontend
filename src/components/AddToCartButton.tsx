'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ product }: { product: any }) {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the product page if inside a Link
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <button
            onClick={handleAddToCart}
            className="absolute bottom-2 left-1/2 cursor-pointer -translate-x-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-1 px-3 text-[10px] sm:py-1.5 sm:px-4 sm:text-xs rounded-full shadow-md z-10 w-[80%]"
        >
            Add to Cart
        </button>
    );
}
