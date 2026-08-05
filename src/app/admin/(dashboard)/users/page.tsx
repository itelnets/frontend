'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { fetchAdminUsers } from '@/services/userService';
import CopyIcon from '@/components/CopyIcon';
import { formatDate } from '@/utils/formatDate';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchInput, setSearchInput] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalNode(document.getElementById('orders-topbar-portal'));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(searchInput), 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            try {
                const data = await fetchAdminUsers(currentPage, 20, searchQuery);
                setUsers(data.users || []);
                setTotalPages(data.totalPages || 1);
                setTotalUsers(data.totalUsers || 0);
            } catch (error) {
                console.error('Failed to load users', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, [currentPage, searchQuery]);



    return (
        <div className="sm:p-4 w-full h-[calc(100vh-65px)] flex flex-col mx-auto font-sans">
            {/* Mobile Controls */}
            <div className="sm:hidden px-2 py-2 bg-gray-50 flex items-center justify-between gap-2 shrink-0 border-b border-gray-200">
                <div className="relative flex items-center flex-1">
                    <div className="absolute left-2.5 text-gray-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search user by user id and email"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="border border-gray-300 rounded-md pl-8 pr-8 h-[32px] text-[13px] outline-none focus:border-green-500 w-full transition-all bg-white"
                    />
                    {searchInput && (
                        <button onClick={() => setSearchInput('')} className="absolute right-2 cursor-pointer w-5 h-5 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
                {/* Pagination beside search */}
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-1 shadow-sm shrink-0 h-[32px]">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-100 rounded cursor-pointer"
                    >
                        &lt;
                    </button>
                    <span className="text-xs font-medium text-gray-700 min-w-[30px] text-center whitespace-nowrap">
                        {currentPage}/{totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-100 rounded cursor-pointer"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {portalNode && createPortal(
                <>
                    <div className="hidden sm:flex relative items-center w-[350px] shrink min-w-[120px]">
                        <div className="absolute left-2.5 text-gray-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search user by user id and email"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="border border-gray-300 rounded-md pl-8 pr-8 h-[32px] sm:h-[36px] text-[13px] sm:text-sm outline-none focus:border-green-500 w-full transition-all"
                        />
                        {searchInput && (
                            <button onClick={() => setSearchInput('')} className="absolute right-1.5 cursor-pointer w-4 h-4 sm:w-5 sm:h-5 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-1 sm:gap-2 bg-white border sm:border-gray-300 border-gray-200 rounded-md px-1 sm:px-2 shadow-sm h-[32px] sm:h-[36px] shrink-0">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 sm:p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
                            >
                                &lt;
                            </button>
                            <span className="text-xs sm:text-sm font-bold text-gray-700 min-w-[32px] sm:min-w-[40px] text-center">{currentPage} / {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 sm:p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </>,
                portalNode
            )}

            <div className="bg-transparent sm:bg-white sm:rounded-lg sm:shadow-sm sm:border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-2 py-2 sm:p-0 flex flex-col">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-500 flex justify-center items-center h-full">
                            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-gray-500 sm:bg-white sm:rounded-none">No users found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 block sm:table">
                            <thead className="bg-green-600 hidden sm:table-header-group sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                            <tr>
                                <th className="px-3 sm:px-4 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">User Details</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">User ID</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Role</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Verified</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Joined</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Total Orders</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Success Orders</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Failed Orders</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Return Count</th>
                                <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 block sm:table-row-group">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors block sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none relative">
                                    {/* Desktop Columns */}
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-left">
                                        <div className="text-[14px] sm:text-[15px] font-medium text-gray-900 flex items-center">
                                            <span className="break-words">{user.name || 'Unknown'}</span>
                                        </div>
                                        <div className="text-[12px] sm:text-[13px] font-medium text-gray-500 flex items-center mt-0.5">
                                            <span className="break-words">{user.email}</span>
                                            <CopyIcon text={user.email} label="Email" />
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className="text-[13px] sm:text-[14px] font-semibold text-gray-800 flex items-center justify-center">
                                            <span className="font-mono tracking-tight">{user._id}</span>
                                            <CopyIcon text={user._id} label="User ID" />
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className="text-[13px] sm:text-[14px] font-medium text-gray-900 capitalize">{user.role || 'user'}</div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className={`text-[12px] font-bold px-2 py-1 rounded-full inline-block ${user.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isEmailVerified ? 'Yes' : 'No'}
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className="text-[13px] sm:text-[14px] font-medium text-gray-900">
                                            {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className="text-[13px] sm:text-[14px] font-medium text-gray-900">{user.totalOrders}</div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className="text-[13px] sm:text-[14px] font-bold text-green-600">{user.successOrders}</div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className="text-[13px] sm:text-[14px] font-bold text-red-500">{user.failedOrders}</div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <div className="text-[13px] sm:text-[14px] font-bold text-red-600">{user.returnCount}</div>
                                    </td>
                                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                                        <Link href={`/admin/orders?userId=${user._id}`} className="bg-green-100 text-green-700 hover:bg-green-200 p-1.5 rounded-md transition-colors inline-flex items-center justify-center">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </Link>
                                    </td>

                                    {/* Mobile Card Layout */}
                                    <td className="sm:hidden block p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 pr-2">
                                                <div className="text-[13px] sm:text-[14px] font-bold text-gray-900 flex items-center">
                                                    <span className="break-words">{user.name || 'Unknown'}</span>
                                                </div>
                                                <div className="text-[11px] sm:text-[12px] text-gray-500 flex items-center mt-0.5">
                                                    <span className="break-words">{user.email}</span>
                                                    <CopyIcon text={user.email} label="Email" />
                                                </div>
                                            </div>
                                            <Link href={`/admin/orders?userId=${user._id}`} className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 p-1.5 rounded-md transition-colors shrink-0">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </Link>
                                        </div>

                                        <div className="mb-2">
                                            <div className="text-[12px] sm:text-[13px] font-medium text-gray-600 flex items-center break-all">
                                                <span className="font-mono tracking-tight">{user._id}</span>
                                                <CopyIcon text={user._id} label="User ID" />
                                            </div>
                                        </div>

                                        <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                                            <div className="text-center pr-3">
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Role</div>
                                                <div className="text-[12px] sm:text-[13px] font-bold text-gray-900 capitalize">{user.role || 'user'}</div>
                                            </div>
                                            <div className="text-center border-l border-gray-100 px-3">
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Verified</div>
                                                <div className={`text-[12px] font-bold ${user.isEmailVerified ? 'text-green-600' : 'text-red-500'}`}>
                                                    {user.isEmailVerified ? 'Yes' : 'No'}
                                                </div>
                                            </div>
                                            <div className="text-center border-l border-gray-100 pl-3">
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Joined</div>
                                                <div className="text-[12px] sm:text-[13px] font-medium text-gray-900">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                            <div className="text-center">
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Total</div>
                                                <div className="text-[13px] sm:text-[14px] font-bold text-gray-900">{user.totalOrders}</div>
                                            </div>
                                            <div className="text-center border-l border-r border-gray-100 px-2 sm:px-3">
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Success</div>
                                                <div className="text-[13px] sm:text-[14px] font-bold text-green-600">{user.successOrders}</div>
                                            </div>
                                            <div className="text-center border-r border-gray-100 px-2 sm:px-3">
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Fail</div>
                                                <div className="text-[13px] sm:text-[14px] font-bold text-red-500">{user.failedOrders}</div>
                                            </div>
                                            <div className="text-center px-2 sm:px-3">
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Returns</div>
                                                <div className="text-[13px] sm:text-[14px] font-bold text-red-600">{user.returnCount}</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            </div>
        </div>
    );
}
