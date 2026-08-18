'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('adminInfo');
        router.push('/admin/login');
    };

    const menuItems = [
        { name: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Products', path: '/admin/products', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Add Products', path: '/admin/products/add', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Banners', path: '/admin/banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Doctor Verification', path: '/admin/doctors', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { name: 'Orders', path: '/admin/orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { name: 'Settings', path: '#', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-[100dvh] w-48 sm:w-52 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col shadow-xl lg:shadow-none pb-1 lg:pb-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo Area */}
                <div className="h-14 sm:h-16 flex items-center px-6 border-b border-gray-100 shrink-0 bg-gradient-to-r from-green-50 to-white">
                    <span className="text-[20px] sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        Admin
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto pt-2 sm:pt-3 pb-3 px-2 space-y-1">

                    {menuItems.map((item) => {
                        let isActive = pathname === item.path;
                        if (!isActive && item.path !== '/admin' && item.path !== '/') {
                            const isExactMatchForAnother = menuItems.some(m => m.path === pathname);
                            if (pathname?.startsWith(item.path + '/') && !isExactMatchForAnother) {
                                isActive = true;
                            }
                        }
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-2 sm:gap-3 px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-md font-medium text-sm group select-none cursor-pointer ${isActive
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                                    }`}
                            >
                                <svg
                                    className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-green-600'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? "2.5" : "2"} d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-0 sm:p-2 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full cursor-pointer text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
