'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (!adminInfo) {
            router.replace('/admin/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return <div className="h-screen w-screen bg-gray-50 flex items-center justify-center"></div>;
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">
            {/* Sidebar Component */}
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
                {/* Topbar Component */}
                <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-green-50/40 via-gray-50 to-green-50/40 min-h-0 flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
