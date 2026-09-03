'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { ProductPagination } from './ProductPagination';
import { ThreeDotsLoader } from './ThreeDotsLoader';
import { getProducts } from '@/services/product';

interface HomeProductSectionProps {
    initialProducts: any[];
    initialTotal: number;
}

export default function HomeProductSection({ initialProducts, initialTotal }: HomeProductSectionProps) {
    const [products, setProducts] = useState(initialProducts);
    const [totalProducts, setTotalProducts] = useState(initialTotal);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 30;

    const handlePageChange = async (page: number) => {
        const startTime = Date.now();
        setIsLoading(true);
        setCurrentPage(page);
        window.scrollTo({ top: 400, behavior: 'smooth' });
        try {
            const { data } = await getProducts({ page, limit: itemsPerPage });
            const rawProducts = Array.isArray(data) ? data : (data.products || []);
            const totalCount = data.totalProducts ?? (Array.isArray(data) ? data.length : rawProducts.length);

            const elapsedTime = Date.now() - startTime;
            const minLoaderDelay = 2000;
            if (elapsedTime < minLoaderDelay) {
                await new Promise(resolve => setTimeout(resolve, minLoaderDelay - elapsedTime));
            }

            setProducts(rawProducts);
            setTotalProducts(totalCount);
        } catch (error) {
            console.error('Failed to fetch home page products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (products.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-16 sm:py-24 px-4 min-h-[30vh] sm:min-h-[40vh]">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-base sm:text-lg font-medium text-gray-600 mb-1 sm:mb-2">No recommended products available at the moment.</span>
                <span className="text-xs sm:text-sm">The server is currently experiencing an issue.</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {isLoading ? (
                <ThreeDotsLoader className="py-16" />
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                        {products.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    <ProductPagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalProducts / itemsPerPage)}
                        onPageChange={handlePageChange}
                        totalItems={totalProducts}
                        itemsPerPage={itemsPerPage}
                        isLoading={isLoading}
                    />
                </>
            )}
        </div>
    );
}
