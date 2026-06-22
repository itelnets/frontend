'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname(); // To re-render on route change if needed
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        // Check auth state on mount and update
        const checkAuth = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUser(JSON.parse(userInfo));
            } else {
                setUser(null);
            }
        };

        checkAuth();

        // Listen for custom event or storage event if multiple tabs
        window.addEventListener('storage', checkAuth);

        // Also check occasionally or on specific events if needed
        return () => window.removeEventListener('storage', checkAuth);
    }, [pathname]); // Re-check on route change (e.g. after login redirect)

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        // Clear cookie if needed via API, but for now client-side clear
        // Ideally call API /auth/logout
        setUser(null);
        router.push('/login');
    };

    return (
        <nav className="relative bg-green-800 text-white shadow-md z-50">
            <div className="max-w-[90vw] mx-auto">
                <div className="flex items-center justify-between h-[70px]">
                    <div className="flex items-center">
                        <Link href="/" className="font-bold text-[25px] sm:text-[35px]">
                            Itelents
                        </Link>

                    </div>
                    <div>
                        <div className="ml-4 flex items-center md:ml-6 space-x-4">
                            {!user ? (
                                <>
                                    <div className="hidden md:block">
                                        <div className="ml-10 flex items-baseline space-x-4">
                                            <Link href="/" className="hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium">
                                                Home
                                            </Link>
                                            <Link href="/products" className="hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium">
                                                Products
                                            </Link>
                                            <Link href="/about" className="hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium">
                                                About
                                            </Link>
                                        </div>
                                    </div>

                                    {pathname === '/register' ? (
                                        <Link
                                            href="/login"
                                            className="bg-white text-green-800 hover:bg-gray-100 w-24 py-2 rounded-md text-sm font-medium flex justify-center"
                                        >
                                            Login
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/register"
                                            className="bg-white text-green-800 hover:bg-gray-100 w-24 py-2 rounded-md text-sm font-medium flex justify-center"
                                        >
                                            Register
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:block text-sm mr-2">Welcome, {user.name || 'User'}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                            {!['/login', '/register'].includes(pathname) && (
                                <Link href="/cart" className="hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium">
                                    Cart (0)
                                </Link>
                            )}

                            {/* Mobile menu button */}
                            <div className="md:hidden flex items-center ml-2">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        {isMobileMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute w-full left-0 z-50 bg-green-800 border-t border-green-700 shadow-xl">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium">
                            Home
                        </Link>
                        <Link href="/products" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium">
                            Products
                        </Link>
                        <Link href="/about" className="block hover:bg-green-700 px-3 py-2 rounded-md text-base font-medium">
                            About
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
