'use client';

import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Spinner from './Spinner';
import SearchBar from './SearchBar';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { getBannerSlug } from './HeroCarousel';

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(undefined);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [successOrderCount, setSuccessOrderCount] = useState<number>(0);
    const [successOrderAmount, setSuccessOrderAmount] = useState<number>(0);
    const { cartCount } = useCart();
    const headerRef = useRef<HTMLElement | null>(null);

    const [productTypes, setProductTypes] = useState<string[]>(['Supplements', 'Sports', 'Bath', 'Beauty', 'Grocery', 'Home', 'Baby', 'Pets']);

    useEffect(() => {
        api.get('/products/types')
            .then(res => {
                if (res.data?.types && Array.isArray(res.data.types) && res.data.types.length > 0) {
                    setProductTypes(res.data.types);
                }
            })
            .catch(() => { });
    }, [pathname]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsAuthOpen(false);
    }, [pathname]);

    useEffect(() => {
        const checkAuth = (e?: Event) => {
            const isUserInfoUpdate = e?.type === 'userInfoUpdated';
            const userInfo = localStorage.getItem('userInfo');

            if (userInfo) {
                setUser(JSON.parse(userInfo));
                // Self-healing: ensure cookie exists if they have a valid session
                if (!document.cookie.includes('isLoggedIn=true')) {
                    document.cookie = "isLoggedIn=true; path=/; max-age=2592000";
                }

                // Only fetch orders on initial load or cross-tab login, NOT on simple profile updates
                if (!isUserInfoUpdate) {
                    api.get('/orders/myorders?status=Success&limit=1').then(res => {
                        setSuccessOrderCount(res.data.totalOrders || 0);
                        setSuccessOrderAmount(res.data.totalAmount || 0);
                    }).catch(err => console.error('Failed to fetch success orders data:', err));
                }
            } else {
                setUser(null);
            }
            setIsAuthReady(true);
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        window.addEventListener('userInfoUpdated', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('userInfoUpdated', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.removeItem('userInfo');
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        setUser(null);
        setIsAuthOpen(false);
        toast.success('Logged out successfully!');
        window.location.href = '/login';
    };

    return (
        <>
            <header ref={headerRef} className="sticky w-full left-0 top-0 z-[100]">
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
                                        <div className="w-[200px] sm:w-[500px] bg-white text-gray-800 rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col sm:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>

                                            {/* Left Side: Orders Info */}
                                            <div className="hidden sm:flex w-[170px] bg-gray-50 p-3 sm:p-4 border-r border-gray-100 flex-col items-center text-center">
                                                <div className="text-sm font-bold text-[#458500] mb-1 flex items-center gap-1">
                                                    Itelents <span className="text-gray-400 font-normal text-xs">| ORDERS</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-2">Total Paid Orders</div>
                                                <div className="text-lg font-extrabold text-[#458500] my-1">
                                                    ₹0.00
                                                </div>
                                                <div className="text-[10px] text-[#458500] font-medium">Successful Orders: <span className="font-bold">0</span></div>
                                            </div>

                                            {/* Right Side: Navigation */}
                                            <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-[200px]">
                                                <div className="text-sm sm:text-[15px] font-bold text-[#458500] mb-3">Welcome!</div>

                                                <div className="flex flex-col mb-4 sm:mb-6 flex-1">
                                                    <Link href="/login" onClick={() => setIsAuthOpen(false)} className="flex items-center justify-between gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                            My Account
                                                        </div>
                                                    </Link>
                                                    <Link href="/login" onClick={() => setIsAuthOpen(false)} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                        Orders
                                                    </Link>
                                                    <Link href="/login" onClick={() => setIsAuthOpen(false)} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                        My Lists
                                                    </Link>
                                                    <Link href="/login" onClick={() => setIsAuthOpen(false)} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                        Messages
                                                    </Link>
                                                    <Link href="/login" onClick={() => setIsAuthOpen(false)} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        My Address
                                                    </Link>
                                                    <Link href="/login" onClick={() => setIsAuthOpen(false)} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Terms & Conditions
                                                    </Link>
                                                </div>

                                                <Link href="/login" onClick={() => setIsAuthOpen(false)} className="block text-center w-full bg-[#458500] hover:bg-[#366800] text-white py-2 sm:py-2.5 px-6 rounded-md transition-colors font-bold text-[15px] sm:text-[16px] mt-auto">
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
                                            <span className="text-[12px] text-gray-200 leading-[10px] mb-1">Hi, {user.name || user.email?.split('@')[0]}</span>
                                            <span className="text-[13px] sm:text-[13px] font-bold leading-[13px]">
                                                My Account
                                            </span>
                                        </div>
                                        <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${isAuthOpen ? '-rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>

                                    {/* Authenticated Dropdown Wrapper */}
                                    <div className={`absolute top-full right-[-10px] sm:right-0 pt-1 transition-all z-50 ${isAuthOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                        <div className="w-[200px] sm:w-[500px] bg-white text-gray-800 rounded-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] border border-gray-100 flex flex-col sm:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>

                                            {/* Left Side: Orders Info */}
                                            <div className="hidden sm:flex w-[170px] bg-gray-50 p-3 sm:p-4 border-r border-gray-100 flex-col items-center text-center">
                                                <div className="text-sm font-bold text-[#458500] mb-1 flex items-center gap-1">
                                                    Itelents <span className="text-gray-400 font-normal text-xs">| ORDERS</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-2">Total Paid Orders</div>
                                                <div className="text-lg font-extrabold text-[#458500] my-1">
                                                    ₹{successOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-[10px] text-[#458500] font-medium">Successful Orders: <span className="font-bold">{successOrderCount}</span></div>
                                            </div>

                                            {/* Right Side: Navigation */}
                                            <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-[200px]">
                                                <div className="text-sm sm:text-[15px] font-bold text-[#458500]">Welcome!</div>
                                                <div className="text-xs sm:text-sm font-bold text-[#458500] mb-3 truncate">{user.email}</div>

                                                <div className="flex flex-col mb-4 sm:mb-6 flex-1">
                                                    <Link href="/user/myaccount" className="flex items-center justify-between gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                            My Account
                                                        </div>
                                                    </Link>
                                                    <Link href="/user/orders" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                        Orders
                                                    </Link>
                                                    <Link href="/user/lists" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                        My Lists
                                                    </Link>
                                                    <Link href="https://wa.me/9558688770" target="_blank" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                        Messages
                                                    </Link>
                                                    <Link href="/user/address" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        My Address
                                                    </Link>
                                                    <Link href="/user/terms-and-conditions" className="flex items-center gap-2 sm:gap-3 text-sm sm:text-[15px] text-gray-800 hover:bg-[#eef6e6] px-3 py-1.5 sm:py-2.5 rounded-md transition-colors">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Terms & Conditions
                                                    </Link>

                                                </div>

                                                <button onClick={handleLogout} className="w-full text-center py-2 sm:py-2.5 bg-white border border-[#458500] cursor-pointer text-[#458500] hover:bg-gray-50 font-bold rounded-md shadow-sm transition-colors text-sm mt-auto">
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
                                {productTypes.map((type) => (
                                    <Link key={type} href={`/type/${encodeURIComponent(type.toLowerCase())}`} className="hover:text-[#458500] capitalize">
                                        {type}
                                    </Link>
                                ))}
                                <Link href="/brands" className="hover:text-[#458500] ml-4 text-gray-400">Brands A-Z</Link>
                                <Link href="/products" className="hover:text-[#458500] text-gray-400">Health Topics</Link>
                            </div>
                            <div className="flex items-center gap-6 ml-8 pr-4">
                                <Link href="/doctor-corner" className="text-red-600 hover:text-red-700">Dr. Corner</Link>
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
                        <div className="relative w-[85vw] max-w-[250px] sm:max-w-[300px] h-full bg-white shadow-xl flex flex-col animate-fade-in-left">
                            <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">

                                {/* Top Header */}
                                <div className="p-4 flex flex-col shrink-0 pb-2">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="text-[#458500] font-bold text-lg leading-none">Welcome!</div>
                                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700 p-1 -mr-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    {user && (
                                        <div className="text-[#458500] font-bold text-[12px] sm:text-sm break-all mt-1 pr-4">{user.email}</div>
                                    )}
                                </div>

                                <div className="pb-4">
                                    {/* Authenticated User Links */}
                                    {user && (
                                        <>
                                            <div className="flex flex-col py-2">
                                                <Link href="/user" className="flex items-center justify-between text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                        My Account
                                                    </div>
                                                </Link>
                                                <Link href="/user/orders" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                    Orders
                                                </Link>
                                                <Link href="/user/lists" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                    My Lists
                                                </Link>
                                                <Link href="https://wa.me/9558688770" target="_blank" className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                    Messages
                                                </Link>
                                                <Link href="/user/address" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    My Address
                                                </Link>
                                                <Link href="/user/terms-and-conditions" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[14px] text-[#333] hover:bg-gray-50 px-2.5 py-1.5 transition-colors">
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Terms & Conditions
                                                </Link>
                                            </div>
                                            <div className="mx-4 border-b border-gray-200"></div>
                                        </>
                                    )}
                                    {/* Main Categories */}
                                    <div className="flex flex-col">
                                        {productTypes.map((cat) => (
                                            <Link key={cat} href={`/type/${encodeURIComponent(cat.toLowerCase())}`} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3.5 hover:bg-gray-50 border-b border-gray-50">
                                                <span className="text-base font-medium text-gray-900 capitalize">{cat}</span>
                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Shop By Section */}
                                    <div className="pt-6 pb-2">
                                        <div className="px-4 text-xs text-gray-500 mb-2 uppercase tracking-wide">Shop By</div>
                                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                            <span className="text-base font-medium text-gray-900">Health Topics</span>
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                        <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                            <span className="text-base font-medium text-gray-900">Brands A-Z</span>
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                        <Link href="/doctor-corner" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 hover:bg-gray-50 text-base font-medium text-red-600">Dr. Corner</Link>
                                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-base font-medium text-gray-900">Best Sellers</Link>
                                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-base font-medium text-gray-900">New</Link>
                                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-base font-medium text-gray-900">Try</Link>
                                    </div>
                                    <div className="mx-4 border-b border-gray-200"></div>

                                    {/* Learn Section */}
                                    <div className="pt-4 pb-2">
                                        <div className="px-4 text-xs text-gray-500 mb-2 uppercase tracking-wide">Learn</div>
                                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-base font-medium text-gray-900">Wellness Hub</Link>
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

                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="p-4 border-t border-gray-100 bg-white mt-auto shrink-0 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)]">
                                {!user ? (
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full bg-[#458500] hover:bg-[#366800] text-white py-2.5 rounded-md transition-colors font-bold text-[15px]">
                                        Sign in
                                    </Link>
                                ) : (
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-center py-2.5 bg-white border border-[#458500] text-[#458500] hover:bg-gray-50 font-bold rounded-md shadow-sm transition-colors text-[15px]">
                                        Sign out
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Navbar;
