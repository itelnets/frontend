'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminTopbarProps {
    onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleCancel = () => {
        router.push('/admin/products');
    };

    let pageTitle = 'Products';
    if (pathname.includes('/banners')) {
        pageTitle = 'Banners';
    } else if (pathname.includes('/doctors')) {
        pageTitle = 'Doctor Verification';
    } else if (pathname.includes('/products/add')) {
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

                {!pathname.includes('/products/add') && !pathname.includes('/products/edit') && !pathname.includes('/orders') && !pathname.includes('/doctors') && !pathname.includes('/users') && !pathname.includes('/banners') ? (
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-1 justify-end">
                        <div id="products-topbar-portal" className="contents"></div>
                        <Link href="/admin/products/add" className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-2 sm:px-4 py-1 sm:py-1.5 border border-transparent rounded-md text-[13px] sm:text-sm font-medium transition-colors shrink-0">
                            Add Product
                        </Link>
                        <div id="products-pagination-portal" className="contents"></div>
                    </div>
                ) : pathname.includes('/orders') ? (
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-1 justify-end">
                        <div id="orders-topbar-portal" className="contents"></div>
                        <div id="orders-pagination-portal" className="contents"></div>
                    </div>
                ) : pathname.includes('/doctors') ? (
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-1 justify-end">
                        <div id="doctors-topbar-portal" className="contents"></div>
                        <div id="doctors-pagination-portal" className="contents"></div>
                    </div>
                ) : pathname.includes('/users') || pathname.includes('/banners') ? (
                    <div id="topbar-portal" className="contents"></div>
                ) : (
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={handleCancel} className="bg-white text-gray-700 text-[13px] sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer shadow-sm shrink-0">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="product-form"
                            className="bg-green-600 hover:bg-green-700 text-white text-[13px] sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-1.5 border border-transparent rounded-md transition-colors cursor-pointer shadow-sm shrink-0"
                        >
                            {pathname.includes('/products/add') ? 'Create' : 'Save'}
                        </button>
                        {pathname.includes('/products/add') && (
                            <label htmlFor="bulk-upload-input" className="hidden sm:flex bg-[#0052A5] text-white px-2 sm:px-4 py-1 sm:py-1.5 border border-transparent rounded-md hover:bg-[#003d7a] transition font-medium text-[13px] sm:text-sm items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm shrink-0">
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <span>Bulk Upload (.csv)</span>
                            </label>
                        )}
                    </div>
                )}
            </header>
        </>
    );
}
