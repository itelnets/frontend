'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LoginPrompt() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            setIsLoggedIn(!!localStorage.getItem('userInfo'));
        };
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Don't render anything while checking or if logged in
    if (isLoggedIn === null || isLoggedIn) {
        return null;
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 mt-16 mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-b border-gray-200 py-6">
                <div className="text-lg font-bold text-gray-800 mb-4 sm:mb-0">
                    Get a more personalized experience
                </div>
                <Link href="/login" className="px-8 py-3 bg-[#458500] hover:bg-[#3b7100] text-white font-bold rounded-md shadow-sm transition-colors cursor-pointer text-sm">
                    Sign In or Create Account
                </Link>
            </div>
        </div>
    );
}
