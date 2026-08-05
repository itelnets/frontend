'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PageLoader from './PageLoader';

interface AdminTopbarProps {
    onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        setIsCancelling(false);
    }, [pathname]);

    const handleCancel = () => {
        setIsCancelling(true);
        router.push('/admin/products');
    };

    let pageTitle = 'Products';
    if (pathname.includes('/products/add')) {
        pageTitle = 'Add Product';
    } else if (pathname.includes('/products/edit')) {
        pageTitle = 'Edit Product';
    } else if (pathname.includes('/products')) {
        pageTitle = 'Products';
    } else if (pathname.includes('/orders')) {
        pageTitle = 'Orders';
    } else if (pathname.includes('/users')) {
        pageTitle = 'Users';
    }

    return (
        <>
            <header className="min-h-[48px] sm:min-h-[64px] h-auto py-2 sm:py-0 bg-white border-b border-gray-200 flex flex-nowrap items-center px-4 sm:px-6 z-30 shrink-0 gap-y-2 gap-x-2">
                <div className="flex items-center gap-4 mr-auto shrink-0">
                    {/* Hamburger Menu (Mobile Only) */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden cursor-pointer py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Dynamic Page Title */}
                    <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
                </div>

                {!pathname.includes('/products/add') && !pathname.includes('/products/edit') && !pathname.includes('/orders') && !pathname.includes('/users') ? (
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
                        <div id="products-topbar-portal" className="contents"></div>
                        <Link href="/admin/products/add" className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-2 sm:px-4 py-1 sm:py-1.5 border border-transparent rounded-md text-[13px] sm:text-sm font-medium transition-colors shrink-0">
                            Add Product
                        </Link>
                    </div>
                ) : pathname.includes('/orders') || pathname.includes('/users') ? (
                    <div id="orders-topbar-portal" className="contents"></div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleCancel} className="bg-white text-gray-700 text-[13px] sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="product-form"
                            className="bg-green-600 hover:bg-green-700 text-white text-[13px] sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-1.5 border border-transparent rounded-md transition-colors cursor-pointer shadow-sm"
                        >
                            {pathname.includes('/products/add') ? 'Create Product' : 'Save Product'}
                        </button>
                    </div>
                )}
            </header>
            {isCancelling && <PageLoader />}
        </>
    );
}
