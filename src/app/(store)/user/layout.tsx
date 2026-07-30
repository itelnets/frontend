'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const allLinks = [
        { name: 'Profile', href: '/user/myaccount', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'My Lists', href: '/user/lists', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
        { name: 'Messages', href: '/user/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { name: 'Address Book', href: '/user/address', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
        { name: 'Orders', href: '/user/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Account Information', href: '/user/info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Payment Methods', href: '/user/payment', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        { name: 'Terms and Conditions', href: '/terms-and-conditions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Shipping', href: '/shipping', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { name: 'Credit / Debit', href: '/user/credit', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    ];

    // Determine if we are on the mobile menu root page. 
    // On mobile, /user can act as the main menu list.
    const isMenuPage = pathname === '/user' || pathname === '/user/menu';

    return (
        <div className="flex-1 font-sans">
            <div className="max-w-[1400px] mx-auto px-0 sm:px-4 py-0 sm:py-6">
                <div className="flex flex-col md:flex-row gap-0 sm:gap-4 lg:gap-8">

                    {/* Sidebar Navigation */}
                    <div className={`w-full md:w-[250px] lg:w-[280px] xl:w-[300px] shrink-0 bg-white border border-[#458500]/20 sm:border-solid sm:rounded-lg sm:shadow-sm overflow-hidden ${!isMenuPage ? 'hidden md:block' : ''}`}>
                        <div className="flex flex-col">
                            {allLinks.map((link, idx) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-2 border-b border-[#458500]/20 last:border-b-0 transition-colors ${isActive ? 'bg-[#458500] text-white hover:bg-[#366800]' : 'text-gray-700 hover:bg-[#eef6e6]'}`}
                                    >
                                        <div className="flex items-center gap-2  sm:gap-3 lg:gap-4">
                                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                                            </svg>
                                            <span className="text-[14px] sm:text-[15px] font-medium">{link.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={`flex-1 ${isMenuPage ? 'hidden md:block' : ''}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
