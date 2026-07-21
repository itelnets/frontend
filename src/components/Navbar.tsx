'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Spinner from './Spinner';
import SearchBar from './SearchBar';

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
        setIsAuthOpen(false);
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
        setIsAuthOpen(false);
        router.push('/login');
    };

    return (
        <>
            <header ref={headerRef} className={`fixed w-full left-0 top-0 z-[100]`}>
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
                            <Link href="/" className="font-bold text-[23px] sm:text-[30px] tracking-normal shrink-0">
                                Itelents
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <SearchBar />

                        {/* Auth & Cart */}
                        <div className="flex items-center gap-3 sm:gap-6 shrink-0 relative z-50 pr-2 sm:pr-0">
                            {!isAuthReady ? (
                                <div className="hidden md:flex items-center justify-center gap-2 bg-[#2d5700] px-4 py-3 min-w-[142px] sm:min-w-[160px] rounded-full text-sm text-white">
                                    <Spinner className="w-4 h-4 text-white" />
                                </div>
                            ) : !user ? (
                                <div
                                    className="hidden md:flex items-center gap-2 cursor-pointer group bg-[#2d5700] px-4 py-3 rounded-full hover:bg-[#234300] transition-colors relative"
                                    onMouseEnter={() => setIsAuthOpen(true)}
                                    onMouseLeave={() => setIsAuthOpen(false)}
                                    onClick={() => setIsAuthOpen(!isAuthOpen)}
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <div className="flex items-center gap-1 text-white">
                                        <span className="text-sm font-medium">Sign in</span>
                                        <svg className={`w-3 h-3 transition-transform duration-200 ${isAuthOpen ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>

                                    {/* Unauthenticated Dropdown Wrapper with top padding for gap */}
                                    <div className={`absolute top-full right-[-10px] sm:right-0 pt-1 transition-all z-50 ${isAuthOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
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

                                                <Link href="/login" onClick={() => setIsAuthOpen(false)} className="block text-center w-full bg-[#458500] hover:bg-[#366800] text-white py-2 sm:py-3 px-6 rounded-md transition-colors font-bold text-[15px] sm:text-[16px] mt-auto">
                                                    Sign in
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="hidden md:flex items-center gap-2 cursor-pointer group bg-[#2d5700] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-[#234300] transition-colors relative"
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
                                        <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${isAuthOpen ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>

                                    {/* Authenticated Dropdown Wrapper */}
                                    <div className={`absolute top-full right-[-10px] sm:right-0 pt-1 transition-all z-50 ${isAuthOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
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
                                <span className="absolute -top-1 -right-2 bg-white text-[#458500] text-[9px] sm:text-[12px] font-bold px-[5px] rounded-full">{cartCount}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sub-navigation categories (visually hidden when scrolled) */}
                <div className={`hidden sm:block bg-white border-b border-gray-200`}>
                    <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
                        <div className="flex items-center justify-between h-8 sm:h-12 overflow-x-auto whitespace-nowrap text-[12px] sm:text-sm font-semibold text-gray-700 hide-scrollbar">
                            <div className="flex items-center gap-6">
                                <Link href="/type/Supplements" className="hover:text-[#458500]">Supplements</Link>
                                <Link href="/type/Sports" className="hover:text-[#458500]">Sports</Link>
                                <Link href="/type/Bath" className="hover:text-[#458500]">Bath</Link>
                                <Link href="/type/Beauty" className="hover:text-[#458500]">Beauty</Link>
                                <Link href="/type/Grocery" className="hover:text-[#458500]">Grocery</Link>
                                <Link href="/type/Home" className="hover:text-[#458500]">Home</Link>
                                <Link href="/type/Baby" className="hover:text-[#458500]">Baby</Link>
                                <Link href="/type/Pets" className="hover:text-[#458500]">Pets</Link>
                                <Link href="/brands" className="hover:text-[#458500] ml-4 text-gray-400">Brands A-Z</Link>
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
                    <SearchBar isMobile={true} />
                </div>

                {/* Mobile Menu Drawer */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-[200] flex">
                        {/* Backdrop */}
                        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>

                        {/* Sidebar */}
                        <div className="relative w-[85vw] max-w-[300px] h-full bg-white shadow-xl flex flex-col overflow-y-auto overflow-x-hidden animate-fade-in-left">

                            {/* Top Header */}
                            <div className="p-4 flex justify-between items-start shrink-0 pb-2">
                                <div className="flex flex-col pr-4 truncate">
                                    {user ? (
                                        <>
                                            <div className="text-[#458500] font-bold text-lg">Welcome!</div>
                                            <div className="text-[#458500] font-bold text-sm truncate">{user.email}</div>
                                        </>
                                    ) : (
                                        <div className="text-[#458500] font-bold text-lg">Welcome!</div>
                                    )}
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="pb-4">
                                {/* Authenticated User Links */}
                                {user && (
                                    <>
                                        <div className="flex flex-col py-2">
                                            <Link href="#" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                My Account
                                            </Link>
                                            <Link href="#" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                Orders
                                            </Link>
                                            <Link href="#" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                My Lists
                                            </Link>
                                            <Link href="#" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Rewards Credit
                                            </Link>
                                            <Link href="#" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                My Reviews
                                            </Link>
                                            <Link href="#" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                Messages
                                            </Link>
                                        </div>
                                        <div className="mx-4 border-b border-gray-200"></div>
                                    </>
                                )}
                                {/* Main Categories */}
                                <div className="flex flex-col">
                                    {['Supplements', 'Sports', 'Bath', 'Beauty', 'Grocery', 'Home', 'Baby', 'Pets'].map(cat => (
                                        <Link key={cat} href={`/type/${cat}`} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 border-b border-gray-50">
                                            <span className="text-base font-medium text-gray-900">{cat}</span>
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    ))}
                                </div>

                                {/* Shop By Section */}
                                <div className="pt-6 pb-2">
                                    <div className="px-4 text-xs text-gray-500 mb-2 uppercase tracking-wide">Shop By</div>
                                    <Link href="/products" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                        <span className="text-base font-medium text-gray-900">Health Topics</span>
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                    <Link href="/products" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                        <span className="text-base font-medium text-gray-900">Brands</span>
                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </Link>
                                    <Link href="/products" className="block px-4 py-3 hover:bg-gray-50 text-base font-medium text-red-600">Deals</Link>
                                    <Link href="/products" className="block px-4 py-3 hover:bg-gray-50 text-base font-medium text-gray-900">Best Sellers</Link>
                                    <Link href="/products" className="block px-4 py-3 hover:bg-gray-50 text-base font-medium text-gray-900">New</Link>
                                    <Link href="/products" className="block px-4 py-3 hover:bg-gray-50 text-base font-medium text-gray-900">Try</Link>
                                </div>
                                <div className="mx-4 border-b border-gray-200"></div>

                                {/* Learn Section */}
                                <div className="pt-4 pb-2">
                                    <div className="px-4 text-xs text-gray-500 mb-2 uppercase tracking-wide">Learn</div>
                                    <Link href="/products" className="block px-4 py-3 hover:bg-gray-50 text-base font-medium text-gray-900">Wellness Hub</Link>
                                </div>
                                <div className="mx-4 border-b border-gray-200"></div>

                                {/* Bottom Links */}
                                <div className="py-2">
                                    <Link href="/" className="block px-4 py-3 hover:bg-gray-50 text-[15px] text-gray-700">Sales & Offers</Link>
                                    <Link href="/" className="block px-4 py-3 hover:bg-gray-50 text-[15px] text-gray-700">Brands</Link>
                                    <Link href="/" className="block px-4 py-3 hover:bg-gray-50 text-[15px] text-gray-700">Rewards</Link>
                                    <Link href="/" className="block px-4 py-3 hover:bg-gray-50 text-[15px] text-gray-700">EGift Card</Link>
                                </div>
                                <div className="mx-4 border-b border-gray-200"></div>

                                {/* Footer Area */}
                                <div className="p-4 flex flex-col gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-black">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-[15px]">24/7 Support</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-black">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-[15px]">IN | EN | INR</span>
                                    </div>

                                    {/* Logout Button */}
                                    {user && (
                                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full mt-4 text-center py-2.5 bg-white border border-[#458500] text-[#458500] hover:bg-gray-50 font-bold rounded-md shadow-sm transition-colors text-[15px]">
                                            Sign out
                                        </button>
                                    )}
                                </div>
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
