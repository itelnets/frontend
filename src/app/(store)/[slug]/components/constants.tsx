import React from 'react';

export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    discount: number;
    images: string[];
    brand?: string;
    type?: string;
    inStock?: string;
    rating?: number;
    numReviews?: number;
}

export interface FilterState {
    inStock: boolean;
    brands: string[];
    price: string[];
    rating: string[];
}

export const SORT_OPTIONS = [
    'Featured',
    'Best sellers',
    'Top Rated',
    'Price: Low to High',
    'Price: High to Low',
    'Newest',
    'Highest Discount'
];

export const PRODUCT_TYPES = [
    {
        id: 'all',
        name: 'All Deals',
        type: '',
        icon: (
            <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3.5" y="3.5" width="7" height="7" rx="2" strokeWidth="1.4" />
                <rect x="13.5" y="3.5" width="7" height="7" rx="2" strokeWidth="1.4" />
                <rect x="3.5" y="13.5" width="7" height="7" rx="2" strokeWidth="1.4" />
                <circle cx="16" cy="16" r="3" strokeWidth="1.4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M18.2 18.2l2.3 2.3" />
            </svg>
        )
    },
    {
        id: 'supplements',
        name: 'Supplements',
        type: 'supplements',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M9 3h6a1 1 0 011 1v1.5H8V4a1 1 0 011-1z" />
                <rect x="6.5" y="6.5" width="11" height="13.5" rx="2.5" strokeWidth="1.4" />
                <line x1="9.5" y1="11.5" x2="14.5" y2="11.5" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="9.5" y1="14.5" x2="13" y2="14.5" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        )
    },
    {
        id: 'sports',
        name: 'Sports',
        type: 'sports',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M6.5 17.5l11-11" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M4.5 14.5l5 5m-3.5-6.5l5 5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M14.5 4.5l5 5m-6.5-3.5l5 5" />
            </svg>
        )
    },
    {
        id: 'bath',
        name: 'Bath',
        type: 'bath',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M3 13h18v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M6 19v2m12-2v2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M6 13V6a2 2 0 012-2h1" />
                <circle cx="11" cy="4" r="1" strokeWidth="1.4" fill="none" />
            </svg>
        )
    },
    {
        id: 'beauty',
        name: 'Beauty',
        type: 'beauty',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M6 21v-7m-2-3c0-2 2-3 2-6s2 0 2 0v6c0 3 2 1 2 3a2 2 0 01-4 0z" />
                <rect x="14" y="12" width="5" height="9" rx="1" strokeWidth="1.4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M14 12V9l4-3v6" />
            </svg>
        )
    },
    {
        id: 'grocery',
        name: 'Grocery',
        type: 'grocery',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="7" y="3" width="10" height="18" rx="2" strokeWidth="1.4" transform="rotate(-25 12 12)" />
                <line x1="7" y1="12" x2="17" y2="12" strokeWidth="1.4" transform="rotate(-25 12 12)" />
                <line x1="12" y1="7" x2="12" y2="17" strokeWidth="1.4" transform="rotate(-25 12 12)" />
            </svg>
        )
    },
    {
        id: 'home',
        name: 'Home',
        type: 'home',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M12 16.5c-1.5-1.2-3-2.2-3-3.3 0-.8.6-1.5 1.5-1.5.7 0 1.2.4 1.5.9.3-.5.8-.9 1.5-.9.9 0 1.5.7 1.5 1.5 0 1.1-1.5 2.1-3 3.3z" />
            </svg>
        )
    },
    {
        id: 'baby',
        name: 'Baby',
        type: 'baby',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M4 5h3l2.5 8h9.5l2-6H9.5" />
                <circle cx="9.5" cy="18" r="1.5" strokeWidth="1.4" fill="none" />
                <circle cx="17" cy="18" r="1.5" strokeWidth="1.4" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M12 7a4 4 0 014 4" />
            </svg>
        )
    },
    {
        id: 'pets',
        name: 'Pets',
        type: 'pets',
        icon: (
            <svg className="w-6.5 h-6.5 sm:w-9 sm:h-9 lg:w-11 lg:h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" d="M12 13.5c-2.8 0-4.8 1.4-4.8 3 0 1.6 2 2.8 4.8 2.8s4.8-1.2 4.8-2.8c0-1.6-2-3-4.8-3z" />
                <circle cx="7" cy="10.2" r="1.6" strokeWidth="1.4" fill="none" />
                <circle cx="10.2" cy="7" r="1.6" strokeWidth="1.4" fill="none" />
                <circle cx="13.8" cy="7" r="1.6" strokeWidth="1.4" fill="none" />
                <circle cx="17" cy="10.2" r="1.6" strokeWidth="1.4" fill="none" />
            </svg>
        )
    }
];
