'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchAllOrders } from '@/services/orderService';
import { refundOrder } from '@/services/paymentService';
import SortDropdown from '@/components/SortDropdown';
import ConfirmModal from '@/components/ConfirmModal';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';
import CopyIcon from '@/components/CopyIcon';

function AdminOrdersContent() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('All status');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchInput, setSearchInput] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || '';
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isRefunding, setIsRefunding] = useState(false);
    const [showRefundConfirm, setShowRefundConfirm] = useState<string | null>(null);
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const [paginationPortalNode, setPaginationPortalNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalNode(document.getElementById('orders-topbar-portal'));
        setPaginationPortalNode(document.getElementById('orders-pagination-portal'));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(searchInput), 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const statusParam = activeTab === 'Return' ? 'Refund Requested' : activeTab === 'Paid' ? 'Captured' : activeTab === 'All status' ? 'All' : activeTab;
                const data = await fetchAllOrders(currentPage, 20, statusParam, searchQuery, userId);
                setOrders(data.orders || []);
                setTotalPages(data.totalPages || 1);
                setTotalOrders(data.totalOrders || 0);
            } catch (error) {
                console.error('Failed to load orders', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, [activeTab, currentPage, searchQuery, userId]);

    const tabs = ['All status', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Return'];

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    const handleApproveRefund = async (orderId: string) => {
        setIsRefunding(true);
        try {
            const res = await refundOrder(orderId);
            const newStatus = res?.status || 'Refunded';
            const newRefundStatus = res?.refund?.status || 'processed';
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus, refundStatus: newRefundStatus } : o));
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus, refundStatus: newRefundStatus });
            }
            setShowRefundConfirm(null);
            toast.success('Refund processed successfully!');
        } catch (error: any) {
            console.error('Failed to process refund', error);
            toast.error(error?.response?.data?.message || 'Failed to process refund');
        } finally {
            setIsRefunding(false);
        }
    };

    return (
        <div className="sm:p-4 w-full h-[calc(100vh-65px)] flex flex-col mx-auto font-sans">
            {/* Mobile & Tablet Controls (Below Topbar for screens < 1024px) */}
            <div className="lg:hidden px-2 sm:px-0 pt-2 sm:pt-0 pb-2 bg-gray-50 flex items-center justify-between gap-2 shrink-0 border-b border-gray-200 shadow-2xs">
                <div className="relative flex items-center flex-1">
                    <div className="absolute left-2.5 text-gray-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search Order ID or Email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="border border-gray-300 rounded-md pl-8 pr-8 h-[34px] text-[13px] outline-none focus:border-green-500 w-full transition-all bg-white shadow-2xs"
                    />
                    {searchInput && (
                        <button onClick={() => setSearchInput('')} className="absolute right-2 cursor-pointer w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <SortDropdown
                        isAdmin={true}
                        options={['All status', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Return']}
                        value={activeTab}
                        onChange={(val) => setActiveTab(val)}
                        className="z-30 w-[110px] sm:w-[130px]"
                        buttonClassName="h-[34px] text-[11px] sm:text-xs bg-white border border-gray-300 rounded-md px-2"
                        menuClassName="w-full"
                        listClassName="max-h-[200px]"
                    />
                </div>
            </div>

            <div className="bg-transparent sm:bg-white sm:rounded-lg sm:shadow-sm sm:border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-scroll overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent px-2 py-2 sm:p-0 flex flex-col">
                    {orders.length === 0 && !isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-gray-500 sm:bg-white sm:rounded-none">No orders found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 block sm:table sm:table-fixed">
                            <thead className="bg-green-600 hidden sm:table-header-group sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <th className="w-[18%] px-3 sm:px-4 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Customer</th>
                                    <th className="w-[18%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Order ID</th>
                                    <th className="w-[16%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Date</th>
                                    <th className="w-[8%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Items</th>
                                    <th className="w-[12%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Total</th>
                                    <th className="w-[14%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Status</th>
                                    <th className="w-[14%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 block sm:table-row-group transition-opacity duration-200 ${isLoading && orders.length > 0 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors block sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none relative">

                                        {/* Desktop Columns */}
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 whitespace-nowrap text-left">
                                            <div className="text-[14px] sm:text-[15px] font-medium text-gray-900 flex items-center">
                                                <span className="break-words">{order.user?.name || 'Unknown'}</span>
                                            </div>
                                            <div className="text-[12px] sm:text-[13px] font-medium text-gray-500 flex items-center mt-0.5">
                                                <span className="break-words">{order.user?.email}</span>
                                                {order.user?.email && <CopyIcon text={order.user.email} label="Email" />}
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 whitespace-nowrap text-center">
                                            <div className="text-[13px] sm:text-[14px] font-semibold text-gray-800 flex items-center justify-center">
                                                <span>{order._id}</span>
                                                <CopyIcon text={order._id} label="Order ID" />
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 whitespace-nowrap text-center">
                                            <div className="text-[13px] sm:text-[14px] font-medium text-gray-600">{formatDate(order.createdAt)}</div>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 whitespace-nowrap text-center">
                                            <div className="text-[13px] sm:text-[14px] font-medium text-gray-900">{order.orderItems?.length || 0}</div>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 whitespace-nowrap text-center">
                                            <div className="text-[13px] sm:text-[14px] font-bold text-gray-900">₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center justify-center text-[13px] sm:text-[14px] font-bold ${order.status === 'Refund Requested' ? 'text-blue-600' :
                                                order.status === 'Captured' ? 'text-green-600' :
                                                    order.status === 'Refunded' ? 'text-orange-600' :
                                                        (order.status === 'Cancelled' || order.status === 'Refund Failed') ? 'text-red-600' :
                                                            'text-yellow-600'
                                                }`}>
                                                {order.status === 'Captured' ? 'Paid' : order.status}
                                            </span>
                                        </td>
                                        <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 text-center font-medium whitespace-nowrap">
                                            {order.status === 'Refund Requested' && (
                                                <button
                                                    onClick={() => setShowRefundConfirm(order._id)}
                                                    disabled={isRefunding && showRefundConfirm === order._id}
                                                    className="text-white bg-green-600 hover:bg-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-bold shadow-sm disabled:opacity-50 cursor-pointer relative"
                                                >
                                                    <span className={isRefunding && showRefundConfirm === order._id ? 'opacity-0' : ''}>Approve For Return</span>
                                                    {isRefunding && showRefundConfirm === order._id && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        </div>
                                                    )}
                                                </button>
                                            )}
                                        </td>

                                        {/* Mobile Card Layout */}
                                        <td className="sm:hidden block p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 pr-2">
                                                    <div className="text-[13px] sm:text-[14px] font-bold text-gray-900 flex items-center">
                                                        <span className="break-words">{order.user?.name || 'Unknown'}</span>
                                                    </div>
                                                    <div className="text-[11px] sm:text-[12px] text-gray-500 flex items-center mt-0.5">
                                                        <span className="break-words">{order.user?.email}</span>
                                                        {order.user?.email && <CopyIcon text={order.user.email} label="Email" />}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className={`inline-flex items-center text-[12px] sm:text-[13px] font-bold ${order.status === 'Refund Requested' ? 'text-blue-600' :
                                                        order.status === 'Captured' ? 'text-green-600' :
                                                            order.status === 'Refunded' ? 'text-orange-600' :
                                                                (order.status === 'Cancelled' || order.status === 'Refund Failed') ? 'text-red-600' :
                                                                    'text-yellow-600'
                                                        }`}>
                                                        {order.status === 'Captured' ? 'Paid' : order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <div className="text-[12px] sm:text-[13px] font-medium text-gray-600 flex items-center break-all">
                                                    <span>{order._id}</span>
                                                    <CopyIcon text={order._id} label="Order ID" />
                                                </div>
                                                <div className="text-[11px] sm:text-[12px] font-medium text-gray-500 mt-0.5">{formatDate(order.createdAt)}</div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                                <div>
                                                    <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Total ({order.orderItems?.length || 0} items)</div>
                                                    <div className="text-[13px] sm:text-[14px] font-bold text-gray-900">₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                                </div>
                                                <div>
                                                    {order.status === 'Refund Requested' && (
                                                        <button
                                                            onClick={() => setShowRefundConfirm(order._id)}
                                                            disabled={isRefunding && showRefundConfirm === order._id}
                                                            className="text-white bg-green-600 hover:bg-green-700 px-2 py-1.5 rounded text-[10px] font-bold shadow-sm disabled:opacity-50 cursor-pointer flex-shrink-0 relative"
                                                        >
                                                            <span className={isRefunding && showRefundConfirm === order._id ? 'opacity-0' : ''}>Approve For Return</span>
                                                            {isRefunding && showRefundConfirm === order._id && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                                </div>
                                                            )}
                                                        </button>
                                                    )}
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
            {showRefundConfirm && (
                <ConfirmModal
                    isOpen={!!showRefundConfirm}
                    title="Approve For Return"
                    description="Are you sure you want to approve and process the refund via Razorpay?"
                    onCancel={() => !isRefunding && setShowRefundConfirm(null)}
                    onConfirm={() => handleApproveRefund(showRefundConfirm)}
                    confirmText="Approve"
                    cancelText="Cancel"
                    isLoading={isRefunding}
                />
            )}

            {portalNode && createPortal(
                <>
                    <div className="hidden lg:flex relative items-center w-[350px] xl:w-[450px] shrink min-w-[120px]">
                        <div className="absolute left-2.5 text-gray-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Order ID or Email..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="border border-gray-300 rounded-md pl-8 pr-8 h-[32px] sm:h-[36px] text-[11px] sm:text-sm outline-none focus:border-green-500 w-full min-w-0 transition-all"
                        />
                        {searchInput && (
                            <button onClick={() => setSearchInput('')} className="absolute right-1.5 cursor-pointer w-4 h-4 sm:w-5 sm:h-5 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        )}
                    </div>
                    <div className="hidden lg:flex items-center gap-2 sm:gap-3 shrink-0">
                        <SortDropdown
                            isAdmin={true}
                            options={['All status', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Return']}
                            value={activeTab}
                            onChange={(val) => setActiveTab(val)}
                            className="z-30 w-[120px] sm:w-[140px]"
                            buttonClassName="h-[32px] sm:h-[36px] text-[11px] sm:text-sm bg-white border border-gray-300 rounded-md"
                            menuClassName="w-full"
                            listClassName="max-h-[200px]"
                        />
                    </div>
                </>,
                portalNode
            )}

            {paginationPortalNode && createPortal(
                <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-gray-300 rounded-md px-1 shadow-xs h-[30px] sm:h-[36px] shrink-0">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-1.5 py-0.5 sm:p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40 cursor-pointer text-xs sm:text-sm"
                    >
                        &lt;
                    </button>
                    <span className="text-[11px] sm:text-sm font-bold text-gray-700 px-0.5 sm:px-1 whitespace-nowrap min-w-[28px] sm:min-w-[44px] text-center">{currentPage} / {Math.max(1, totalPages)}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-1.5 py-0.5 sm:p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40 cursor-pointer text-xs sm:text-sm"
                    >
                        &gt;
                    </button>
                </div>,
                paginationPortalNode
            )}
        </div>
    );
}

export default function AdminOrdersPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading orders...</div>}>
            <AdminOrdersContent />
        </Suspense>
    );
}
