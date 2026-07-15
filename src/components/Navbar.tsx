'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Spinner from './Spinner';

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(undefined);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { cartCount } = useCart();
    const headerRef = useRef<HTMLElement | null>(null);
    const [spacerHeight, setSpacerHeight] = useState(0);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                const h = headerRef.current.getBoundingClientRect().height || headerRef.current.offsetHeight || 0;
                setSpacerHeight(h);
            }
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    useEffect(() => {
        const checkAuth = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            } else {
                setUser(null);
            }
            setIsAuthReady(true);
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        router.push('/login');
    };

    return (
        <>
        <header ref={headerRef} className={`fixed w-full left-0 top-0 z-[100]` }>
            {/* Top Promo Bar (Hidden on very small screens) - visually hidden when scrolled */}
            <div className={`hidden md:flex bg-[#f5f5f5] border-b border-gray-200 text-xs text-gray-700 items-center justify-between px-4 py-1.5`}>
                <div className="flex items-center space-x-6">
                    <span className="cursor-pointer hover:underline bg-[#dca8b9] text-[#78233f] px-2 py-0.5 rounded-full font-medium">Buy One, Get One 80% Off &gt;</span>
                    <span className="cursor-pointer hover:underline flex items-center gap-1">
                        Shop Travel Essentials &gt;
                    </span>
                    <span className="cursor-pointer hover:underline flex items-center gap-1">
                        Sunscreen: Buy One, Get One 50% Off &gt;
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="cursor-pointer hover:underline flex items-center gap-1">
                        IN | EN | INR
                    </span>
                </div>
            </div>

            {/* Main Green Header */}
            <div className={`bg-[#458500] text-white transition-all duration-200`}>
                <div className={`max-w-[1400px] mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-4`}> 
                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <Link href="/" className="font-bold text-[25px] sm:text-[30px] tracking-normal shrink-0">
                            Itelents
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-4xl hidden sm:block relative">
                        <input
                            type="text"
                            placeholder="Search all of Itelents"
                            className="w-full rounded-full py-2.5 px-4 text-black outline-none h-12 text-sm shadow-inner bg-white"
                        />
                        <button className="absolute right-0 top-0 bottom-0 px-4 text-gray-500 hover:text-black">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                    </div>

                    {/* Auth & Cart */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0 relative z-50">
                        {!isAuthReady ? (
                            <div className="flex items-center justify-center gap-2 bg-[#2d5700] px-4 py-3 min-w-[142px] sm:min-w-[160px] rounded-full text-sm text-white">
                        <Spinner className="w-4 h-4 text-white" />
                    </div>
                        ) : !user ? (
                            <div
                                className="flex items-center gap-2 cursor-pointer group bg-[#2d5700] px-4 py-3 rounded-full hover:bg-[#234300] transition-colors relative"
                                onMouseEnter={() => setIsAuthOpen(true)}
                                onMouseLeave={() => setIsAuthOpen(false)}
                                onClick={() => setIsAuthOpen(!isAuthOpen)}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <div className="flex items-center gap-1 text-white">
                                    <span className="text-sm font-medium">Sign in</span>
                                    <svg className={`w-3 h-3 transition-transform duration-200 ${isAuthOpen ? '-rotate-180' : 'group-hover:-rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>

                                {/* Unauthenticated Dropdown Wrapper with top padding for gap */}
                                <div className={`absolute top-full right-[-10px] sm:right-0 pt-1 transition-all z-50 ${isAuthOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                                    <div className="w-[200px] sm:w-[450px] bg-white text-gray-800 rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col sm:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>

                                        {/* Left Side: Rewards Info */}
                                        <div className="hidden sm:flex w-[170px] bg-gray-50 p-3 sm:p-4 border-r border-gray-100 flex-col items-center text-center">
                                            <div className="text-sm font-bold text-gray-800 mb-1">
                                                Itelents <span className="text-gray-400 font-normal text-xs">| REWARDS</span>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-base font-extrabold text-gray-900">$98.2M+</div>
                                                <div className="text-[10px] text-gray-500 mt-1">Credits rewarded in 2025</div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-base font-extrabold text-gray-900">3.9M+</div>
                                                <div className="text-[10px] text-gray-500 mt-1">Orders using rewards in 2025</div>
                                            </div>
                                            <Link href="#" className="text-[11px] text-blue-600 font-medium hover:underline mt-4">
                                                Learn More &gt;
                                            </Link>
                                        </div>

                                        {/* Right Side: Navigation */}
                                        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-[200px]">
                                            <div className="text-sm sm:text-[15px] font-bold text-[#458500] mb-2 sm:mb-3">Welcome!</div>

                                            <div className="flex flex-col mb-4 sm:mb-6 flex-1">
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-[12px] sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-2 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    My Account
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-[12px] sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-2 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                    Orders
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-[12px] sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-2 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                    My Lists
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-[12px] sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-2 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Rewards Credit
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-[12px]   sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-2 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    My Reviews
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-[12px] sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-2 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                    Messages
                                                </Link>
                                            </div>

                                            <Link href="/login" className="w-full text-center py-2 sm:py-2.5 bg-[#458500] hover:bg-[#3b7100] text-white font-bold rounded-md shadow-sm transition-colors text-sm mt-auto">
                                                Sign in/Register
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 cursor-pointer group bg-[#2d5700] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-[#234300] transition-colors relative"
                                onMouseEnter={() => setIsAuthOpen(true)}
                                onMouseLeave={() => setIsAuthOpen(false)}
                                onClick={() => setIsAuthOpen(!isAuthOpen)}
                            >
                                <svg className="w-5 sm:w-6 lg:w-7 lg:h-7 h-5 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <div className="flex items-center gap-1 text-white">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[12px] text-gray-200 leading-[10px] mb-1">Hi, {user.email?.split('@')[0]}</span>
                                        <span className="text-[13px] sm:text-[13px] font-bold leading-[13px]">My Account</span>
                                    </div>
                                    <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${isAuthOpen ? '-rotate-180' : 'group-hover:-rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>

                                {/* Authenticated Dropdown Wrapper */}
                                <div className={`absolute top-full right-[-10px] sm:right-0 pt-1 transition-all z-50 ${isAuthOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                                    <div className="w-[200px] sm:w-[500px] bg-white text-gray-800 rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col sm:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>

                                        {/* Left Side: Rewards Info */}
                                        <div className="hidden sm:flex w-[170px] bg-gray-50 p-3 sm:p-4 border-r border-gray-100 flex-col items-center text-center">
                                            <div className="text-sm font-bold text-[#458500] mb-1 flex items-center gap-1">
                                                Itelents <span className="text-gray-400 font-normal text-xs">| REWARDS</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-2">Total Rewards Available</div>
                                            <div className="text-lg font-extrabold text-[#458500] my-1">₹0.00</div>
                                            <div className="text-[10px] text-[#458500] font-medium">Converted from <span className="font-bold">0.00 USD</span></div>
                                            <Link href="#" className="text-xs text-blue-600 font-medium hover:underline mt-4">
                                                View all Rewards &gt;
                                            </Link>
                                        </div>

                                        {/* Right Side: Navigation */}
                                        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-[200px]">
                                            <div className="text-sm sm:text-[15px] font-bold text-[#458500]">Welcome!</div>
                                            <div className="text-xs sm:text-sm font-bold text-[#458500] mb-3 truncate">{user.email}</div>

                                            <div className="flex flex-col mb-4 sm:mb-6 flex-1">
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    My Account
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                    Orders
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                    My Lists
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Rewards Credit
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    My Reviews
                                                </Link>
                                                <Link href="#" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                    Messages
                                                </Link>
                                            </div>

                                            <button onClick={handleLogout} className="w-full text-center py-2 sm:py-2.5 bg-white border border-[#458500] text-[#458500] hover:bg-gray-50 font-bold rounded-md shadow-sm transition-colors text-sm mt-auto">
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <Link href="/cart" className="flex items-center gap-1 hover:opacity-80 relative">
                            <svg className="sm:w-7 sm:h-7 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Sub-navigation categories (visually hidden when scrolled) */}
            <div className={`bg-white border-b border-gray-200`}>
                <div className="max-w-[1400px] mx-auto px-4">
                    <div className="flex items-center justify-between h-8 sm:h-12 overflow-x-auto whitespace-nowrap text-[12px] sm:text-sm font-semibold text-gray-700 hide-scrollbar">
                        <div className="flex items-center gap-6">
                            <Link href="/products" className="hover:text-[#458500]">Supplements</Link>
                            <Link href="/products" className="hover:text-[#458500]">Sports</Link>
                            <Link href="/products" className="hover:text-[#458500]">Bath</Link>
                            <Link href="/products" className="hover:text-[#458500]">Beauty</Link>
                            <Link href="/products" className="hover:text-[#458500]">Grocery</Link>
                            <Link href="/products" className="hover:text-[#458500]">Home</Link>
                            <Link href="/products" className="hover:text-[#458500]">Baby</Link>
                            <Link href="/products" className="hover:text-[#458500]">Pets</Link>
                            <Link href="/products" className="hover:text-[#458500] ml-4 text-gray-400">Brands A-Z</Link>
                            <Link href="/products" className="hover:text-[#458500] text-gray-400">Health Topics</Link>
                        </div>
                        <div className="flex items-center gap-6 ml-8 pr-4">
                            <Link href="/products" className="text-red-600 hover:text-red-700">Deals</Link>
                            <Link href="/products" className="hover:text-[#458500]">Best Sellers</Link>
                            <Link href="/products" className="hover:text-[#458500]">BOGO</Link>
                            <Link href="/products" className="hover:text-[#458500]">New</Link>
                            <Link href="/products" className="text-[#458500] hover:text-[#3b7100]">Wellness Hub</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search (Shows only on mobile below header) */}
            <div className="sm:hidden bg-[#458500] p-1.5 h-[55px] border-t border-[#3b7100]">
                <div className="relative">
                    <input type="text" placeholder="Search all of Itelents" className="w-full rounded-full py-2 px-4 h-[41px] text-black outline-none text-sm shadow-inner bg-white" />
                    <button className="absolute right-0 top-0 bottom-0 px-4 text-gray-500 hover:text-black">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[200] flex">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>

                    {/* Sidebar */}
                    <div className="relative w-[55vw] max-w-[220px] h-full bg-white shadow-xl flex flex-col overflow-y-auto animate-fade-in-left">
                        {/* Sidebar Header */}
                        <div className="p-4 bg-[#458500] text-white flex justify-between items-center shrink-0">
                            <Link href="/" className="font-extrabold text-2xl tracking-tighter" onClick={() => setIsMobileMenuOpen(false)}>
                                Itelents
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-[#3b7100] rounded">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 px-4 py-2 overflow-y-auto">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#458500] py-3 text-base font-medium border-b border-gray-100">Home</Link>
                            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#458500] py-3 text-base font-medium border-b border-gray-100">Products</Link>
                            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#458500] py-3 text-base font-medium border-b border-gray-100">About</Link>

                            {/* Mobile Auth Links */}
                            {!user ? (
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#458500] py-3 text-base font-bold text-[#458500]">
                                    Sign In / Sign Up
                                </Link>
                            ) : (
                                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 text-base font-medium text-red-600 border-t border-gray-100 mt-2">
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
        <div aria-hidden="true" style={{ height: spacerHeight }} />
        </>
    );
};

export default Navbar;
