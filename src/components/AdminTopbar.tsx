'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import CustomDropdown from './CustomDropdown';

interface AdminTopbarProps {
    onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
    const pathname = usePathname();
    const [selectedType, setSelectedType] = useState('');

    const productTypes = [
        { label: 'Physical', value: 'physical' },
        { label: 'Digital', value: 'digital' }
    ];

    let pageTitle = 'Dashboard';
    if (pathname.includes('/products/add')) {
        pageTitle = 'Add Product';
    } else if (pathname.includes('/products/edit')) {
        pageTitle = 'Edit Product';
    } else if (pathname.includes('/products')) {
        pageTitle = 'Products';
    }

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
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

            <div className="flex items-center gap-4">
                <CustomDropdown
                    options={productTypes}
                    value={selectedType}
                    onChange={setSelectedType}
                    placeholder="Select"
                    className="w-36"
                />
                <Link href="/admin/products/add" className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-1.5 border border-transparent rounded-md text-sm font-medium transition-colors">
                    Add Product
                </Link>
            </div>
        </header>
    );
}
