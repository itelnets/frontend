'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                router.push('/login');
                return;
            }

            const user = JSON.parse(userInfo);
            if (user.role !== 'admin') {
                router.push('/dashboard');
                return;
            }

            setIsLoading(false);
        };

        checkAdmin();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h1 className="text-3xl text-gray-800 font-bold">Admin Dashboard</h1>
                        <Link href="/dashboard" className="text-sm text-green-600 hover:text-green-800">
                            View Client Dashboard
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Management Section */}
                        <div className="border rounded-lg p-6 bg-green-50">
                            <h2 className="text-xl font-bold text-green-900 mb-4">Product Management</h2>
                            <p className="text-gray-600 mb-4">Manage existing products or upload new ones to the catalog.</p>
                            <div className="flex gap-4">
                                <Link href="/admin/products" className="inline-block bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition">
                                    View All Products
                                </Link>
                                <Link href="/admin/products/add" className="inline-block bg-white text-green-700 border border-green-700 px-4 py-2 rounded hover:bg-green-50 transition">
                                    Add New Product
                                </Link>
                            </div>
                        </div>

                        {/* Order Management Section Placeholder */}
                        <div className="border rounded-lg p-6 bg-white">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
                            <p className="text-gray-500 italic">No orders yet.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
