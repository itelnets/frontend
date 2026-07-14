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
        router.push('/admin');
    };

    let pageTitle = 'Dashboard';
    if (pathname.includes('/products/add')) {
        pageTitle = 'Add Product';
    } else if (pathname.includes('/products/edit')) {
        pageTitle = 'Edit Product';
    } else if (pathname.includes('/products')) {
        pageTitle = 'Products';
    }

    return (
        <>
            <header className="h-12 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu (Mobile Only) */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden cursor-pointer p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Dynamic Page Title */}
                    <h1 className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">{pageTitle}</h1>
                </div>

                {!pathname.includes('/products/add') && !pathname.includes('/products/edit') ? (
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products/add" className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-1.5 border border-transparent rounded-md text-sm font-medium transition-colors">
                            Add Product
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button onClick={handleCancel} className="bg-white text-gray-700 text-sm font-medium px-4 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="product-form"
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 border border-transparent rounded-md transition-colors cursor-pointer shadow-sm"
                        >
                            {pathname.includes('/products/add') ? 'Create Product' : 'Save Product'}
                        </button>
                    </div>
                )}
            </header>
            {isCancelling && (
                <div className="fixed inset-0 top-16 bg-gradient-to-br from-green-50/40 via-gray-50 to-green-50/40 flex items-center justify-center z-50">
                    <PageLoader />
                </div>
            )}
        </>
    );
}
