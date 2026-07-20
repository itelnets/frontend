'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ product }: { product: any }) {
    const { addToCart } = useCart();

    const isInStock = product?.inStock?.toLowerCase() === 'yes';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the product page if inside a Link
        e.stopPropagation();
        if (isInStock) {
            addToCart(product);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`absolute bottom-2 left-1/2 -translate-x-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity font-bold py-1 px-1 text-[11px] sm:py-1.5 sm:px-4 sm:text-xs rounded-full shadow-md z-10 w-[65%] sm:w-[80%] ${
                isInStock ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
    );
}
