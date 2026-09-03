'use client';

import React from 'react';
import ThreeDotsLoader from './ThreeDotsLoader';

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    totalItems?: number;
    itemsPerPage?: number;
    className?: string;
}

export function ProductPagination({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
    totalItems,
    itemsPerPage,
    className = '',
}: ProductPaginationProps) {
    if (isLoading) {
        return <ThreeDotsLoader className="my-4" />;
    }

    if (totalPages <= 1) {
        return null;
    }

    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);
        if (currentPage > 3) {
            pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            if (i > 1 && i < totalPages) {
                pages.push(i);
            }
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }
        pages.push(totalPages);
    }

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-gray-100 mt-6 w-full ${className}`}>
            {totalItems !== undefined && itemsPerPage !== undefined && (
                <div className="text-xs sm:text-sm text-gray-500 font-medium">
                    Showing <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{' '}
                    <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                    <span className="font-semibold text-gray-900">{totalItems}</span> products
                </div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2.5 sm:px-3 h-7 sm:h-8 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 border ${
                        currentPage === 1
                            ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-[#458500] cursor-pointer bg-white shadow-2xs'
                    }`}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Prev</span>
                </button>

                {/* Page Numbers */}
                {pages.map((p, idx) => (
                    <React.Fragment key={idx}>
                        {typeof p === 'number' ? (
                            <button
                                onClick={() => onPageChange(p)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                                    currentPage === p
                                        ? 'bg-[#458500] text-white shadow-xs'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#458500] bg-white border border-gray-200'
                                }`}
                            >
                                {p}
                            </button>
                        ) : (
                            <span className="px-1 text-gray-400 font-bold select-none">...</span>
                        )}
                    </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2.5 sm:px-3 h-7 sm:h-8 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 border ${
                        currentPage === totalPages
                            ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#458500] cursor-pointer bg-white shadow-2xs'
                    }`}
                >
                    <span>Next</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default ProductPagination;
