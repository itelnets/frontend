'use client';
import { useEffect } from 'react';

export default function TriggerMaintenance() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('server-maintenance'));
        }
    }, []);
    return null;
}
