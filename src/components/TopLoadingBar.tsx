"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopLoadingBar({ isPageLoading }: { isPageLoading?: boolean }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        setProgress(35);
        const timer1 = setTimeout(() => setProgress(75), 120);
        const timer2 = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 200);
        }, 350);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [pathname, searchParams]);

    useEffect(() => {
        if (isPageLoading) {
            setVisible(true);
            setProgress(40);
            const timer = setTimeout(() => setProgress(85), 250);
            return () => clearTimeout(timer);
        } else if (visible && progress > 0) {
            setProgress(100);
            const timer = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isPageLoading]);

    if (!visible && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-gray-100/50 overflow-hidden">
            <div
                className="h-full bg-green-600 transition-all duration-300 ease-out shadow-[0_0_8px_#16a34a]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
