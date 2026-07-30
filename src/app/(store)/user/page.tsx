'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserMenuPage() {
    const router = useRouter();

    useEffect(() => {
        // If we are on desktop, redirect to /user/myaccount automatically
        // On mobile, this page acts as the menu carrier (handled by layout.tsx)
        const checkMobileAndRedirect = () => {
            if (window.innerWidth >= 768) {
                router.replace('/user/myaccount');
            }
        };

        checkMobileAndRedirect();
        
        window.addEventListener('resize', checkMobileAndRedirect);
        return () => window.removeEventListener('resize', checkMobileAndRedirect);
    }, [router]);

    return (
        <div className="hidden md:flex flex-col items-center justify-center py-20">
            {/* Fallback content for desktop if redirect is slow */}
        </div>
    );
}
