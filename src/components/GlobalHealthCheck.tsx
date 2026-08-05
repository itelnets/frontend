'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalHealthCheck() {
    const pathname = usePathname();

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // Fast 3-second timeout
                
                // We only care if the server is reachable, not the status code.
                const res = await fetch(apiUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
            } catch (e) {
                // If it fails completely (timeout or connection refused), trigger maintenance
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('server-maintenance'));
                }
            }
        };

        checkHealth();
    }, [pathname]);

    return null;
}
