'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { fetchAdminUsers, toggleAdminUserStatus } from '@/services/userService';
import toast from 'react-hot-toast';
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

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            // Optimistic update
            setUsers(users.map(u => u._id === userId ? { ...u, isDeleted: newStatus } : u));
            await toggleAdminUserStatus(userId, newStatus);
            toast.success(`User successfully ${newStatus ? 'deleted' : 'restored'}`);
        } catch (error) {
            // Revert on error
            setUsers(users.map(u => u._id === userId ? { ...u, isDeleted: currentStatus } : u));
            toast.error('Failed to update user status');
        }
    };



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
                    {users.length === 0 && !isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-gray-500 sm:bg-white sm:rounded-none">No users found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 block sm:table">
                            <thead className="bg-green-600 hidden sm:table-header-group sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <th className="px-3 sm:px-4 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">User Details</th>
                                    <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">User ID</th>
                                    <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Role</th>
                                    <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Joined</th>
                                    <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Total</th>
                                    <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Success</th>
                                    <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Failed</th>
                                    <th className="px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Return</th>
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
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => handleToggleStatus(user._id, !!user.isDeleted)}
                                                    className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${!user.isDeleted ? 'bg-green-600' : 'bg-gray-300'}`}
                                                    title={!user.isDeleted ? 'User is active (On)' : 'User is disabled (Off)'}
                                                >
                                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${!user.isDeleted ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                                </button>
                                                <Link href={`/admin/orders?userId=${user._id}`} className="inline-flex items-center justify-center p-1.5 border border-transparent rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors shadow-sm" title="View Orders">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                                <div className={`flex items-center justify-center p-1.5 border border-transparent rounded-md transition-colors shadow-sm ${user.isEmailVerified ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50'}`} title={user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                {user.latitude && user.longitude && (
                                                    <a href={`https://maps.google.com/?q=${user.latitude},${user.longitude}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1.5 border border-transparent rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors shadow-sm" title="View Location">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </td>

                                        {/* Mobile Card Layout */}
                                        <td className="sm:hidden block p-3">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-[13px] sm:text-[14px] font-bold text-gray-900 flex items-center">
                                                        <span className="break-words">{user.name || 'Unknown'}</span>
                                                    </div>
                                                    <div className="text-[12px] sm:text-[13px] text-gray-500 flex items-center mt-0.5">
                                                        <span className="break-words">{user.email}</span>
                                                        <CopyIcon text={user.email} label="Email" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id, !!user.isDeleted)}
                                                        className={`cursor-pointer relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${!user.isDeleted ? 'bg-green-600' : 'bg-gray-300'}`}
                                                        title={!user.isDeleted ? 'User is active (On)' : 'User is disabled (Off)'}
                                                    >
                                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${!user.isDeleted ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                    <Link href={`/admin/orders?userId=${user._id}`} className="inline-flex items-center justify-center p-1 rounded text-green-700 bg-green-50 hover:bg-green-100 transition-colors" title="View Orders">
                                                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </Link>
                                                    <div className={`flex items-center justify-center p-1 rounded transition-colors ${user.isEmailVerified ? 'text-green-700 bg-green-50' : 'text-gray-400 bg-gray-50'}`} title={user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}>
                                                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    {user.latitude && user.longitude && (
                                                        <a href={`https://maps.google.com/?q=${user.latitude},${user.longitude}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1 rounded text-green-700 bg-green-50 hover:bg-green-100 transition-colors" title="View Location">
                                                            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mb-2">
                                                <div className="text-[12px] sm:text-[13px] text-gray-500 flex items-center pr-2">
                                                    <span className="font-mono tracking-tight break-all">{user._id}</span>
                                                    <CopyIcon text={user._id} label="User ID" />
                                                </div>
                                                <div className="flex items-center justify-end gap-3 shrink-0">
                                                    <div className="text-center">
                                                        <div className="text-[12px] font-bold text-gray-900 leading-[1]">{user.totalOrders}</div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase leading-[1] mt-0.5">T</div>
                                                    </div>
                                                    <div className="text-center border-l border-gray-100 pl-3">
                                                        <div className="text-[12px] font-bold text-green-600 leading-[1]">{user.successOrders}</div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase leading-[1] mt-0.5">S</div>
                                                    </div>
                                                    <div className="text-center border-l border-gray-100 pl-3">
                                                        <div className="text-[12px] font-bold text-red-500 leading-[1]">{user.failedOrders}</div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase leading-[1] mt-0.5">F</div>
                                                    </div>
                                                    <div className="text-center border-l border-gray-100 pl-3">
                                                        <div className="text-[12px] font-bold text-red-600 leading-[1]">{user.returnCount}</div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase leading-[1] mt-0.5">R</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                <div className="flex items-center justify-end">
                                                    <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400  mr-2">Created :</div>
                                                    <div className="text-[12px] sm:text-[13px] font-medium text-gray-900">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</div>
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
