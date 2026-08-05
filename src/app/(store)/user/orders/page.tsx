'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMyOrders } from '@/services/orderService';
import { requestReturn } from '@/services/paymentService';
import SortDropdown from '@/components/SortDropdown';
import toast from 'react-hot-toast';
import OrderDetailsModal from './OrderDetailsModal';
import api from '@/services/api';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isRefunding, setIsRefunding] = useState(false);
    const [showRefundConfirm, setShowRefundConfirm] = useState<string | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

    const generateInvoice = async () => {
        if (!selectedOrder || isGeneratingInvoice) return;
        setIsGeneratingInvoice(true);

        try {
            const response = await api.get(`/orders/${selectedOrder._id}/invoice`, {
                responseType: 'blob', // Important: tells axios to expect binary data
                timeout: 15000, // Override the 3s default timeout for PDF generation
            });

            // Create a blob URL from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.download = `Invoice_${selectedOrder.razorpayOrderId || selectedOrder._id}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Failed to download invoice', error);
            toast.error('Failed to download invoice');
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    useEffect(() => {
        const loadOrders = async () => {
            setIsLoading(true);
            try {
                const data = await fetchMyOrders(currentPage, 10, activeTab);
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
    }, [activeTab, currentPage]);

    const filteredOrders = orders;

    const tabs = ['All', 'Success', 'Failed', 'Refunded'];

    // Reset to page 1 when changing tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const canRequestReturn = (order: any) => {
        if (!order.isPaid || !order.paidAt) return false;
        if (order.status === 'Cancelled' || order.status === 'Refunded' || order.status === 'Refund Initiated' || order.status === 'Refund Requested' || order.status === 'Refund Failed') return false;
        if (order.refundStatus && order.refundStatus !== 'NONE') return false;
        const fortyEightHours = 2 * 24 * 60 * 60 * 1000;
        return Date.now() - new Date(order.paidAt).getTime() <= fortyEightHours;
    };

    const handleRefund = async (orderId: string) => {
        setIsRefunding(true);
        try {
            const res = await requestReturn(orderId);
            const newStatus = res?.order?.status || 'Refund Requested';
            const newRefundStatus = res?.order?.refundStatus || 'requested';
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus, refundStatus: newRefundStatus } : o));
            setSelectedOrder(null);
            setShowRefundConfirm(null);
            toast.success('Your return request sent');
        } catch (error: any) {
            console.error('Failed to request return', error);
            toast.error(error?.response?.data?.message || 'Failed to request return');
        } finally {
            setIsRefunding(false);
        }
    };
    return (
        <div className="w-full h-[calc(100dvh-110px)]  sm:h-[calc(100dvh-150px)] md:h-[calc(100dvh-210px)] flex flex-col">
            <div className="bg-white rounded-none sm:rounded-lg shadow-sm border border-[#458500]/20 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-3 sm:p-4 border-b-2 border-[#458500]/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-[14px] sm:text-[16px] font-bold text-gray-800">My Orders {totalOrders > 0 ? `(${totalOrders})` : ''}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 sm:p-1.5 rounded-md bg-[#458500] text-white hover:bg-[#366800] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-[12px] sm:text-[14px] text-gray-700 font-medium whitespace-nowrap">
                                {currentPage} / {Math.max(1, totalPages)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="p-1 sm:p-1.5 rounded-md bg-[#458500] text-white hover:bg-[#366800] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <SortDropdown
                            options={tabs.map(tab => tab === 'All' ? 'All Orders' : tab)}
                            value={activeTab === 'All' ? 'All Orders' : activeTab}
                            onChange={(val) => setActiveTab(val === 'All Orders' ? 'All' : val)}
                            className="z-[90]"
                            buttonClassName="w-[140px] sm:w-[150px]"
                            menuClassName="w-[100px] sm:w-full"
                        />
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center min-h-0">
                            <svg className="animate-spin h-8 w-8 sm:h-12 sm:w-12 text-[#458500]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 sm:p-16 text-center flex-1 flex flex-col items-center justify-center min-h-0">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 mb-2">
                                {activeTab === 'All' ? 'No orders found' : `No ${activeTab} orders found`}
                            </h2>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">Looks like you haven't placed any orders yet. Start shopping to fill this space!</p>
                            <button onClick={() => router.push('/')} className="bg-[#458500] hover:bg-[#366800] text-white px-8 py-3 rounded-md font-bold transition-colors shadow-sm cursor-pointer shrink-0">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto flex-1 min-h-0">
                            {filteredOrders.map((order: any) => (
                                <div key={order._id} onClick={() => setSelectedOrder(order)} className="bg-white rounded-lg hover:bg-[#458500]/5 hover:border-[#458500] border border-gray-200 overflow-hidden cursor-pointer transition-colors">
                                    <div className="p-2 sm:p-3 flex flex-col sm:flex-row gap-0 sm:gap-2.5">
                                        <div className="flex-1">
                                            <div className="space-y-3 sm:space-y-4">
                                                {order.orderItems.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex gap-3 sm:gap-4">
                                                        <div className="w-12 h-12 sm:w-16 lg:w-20 sm:h-16 lg:h-20 shrink-0 bg-gray-50 rounded-md border border-gray-200 p-1.5 sm:p-2 overflow-hidden flex items-center justify-center">
                                                            <img src={item.product?.image || item.image || '/placeholder.png'} alt={item.name} className="max-w-full max-h-full object-contain" />
                                                        </div>
                                                        <div className="flex-1 py-0.5 sm:py-1">
                                                            <h3 className="text-[12px] sm:text-[15px] font-medium text-[#284d00] mb-0.5 sm:mb-1 line-clamp-2">{item.name}</h3>
                                                            <p className="text-[11px] sm:text-[13px] text-gray-500 font-medium">
                                                                Qty: {item.qty} &nbsp;|&nbsp; ₹{(order.orderItems.length > 1 ? item.price * item.qty : order.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="sm:w-[240px] sm:border-l sm:border-gray-200 sm:pl-6 flex flex-col justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex justify-between items-center gap-2">
                                                    <span className={`inline-flex items-center text-[13px] font-bold ${order.status === 'Delivered' || order.status === 'Refunded' ? 'text-green-700' :
                                                        order.status === 'Captured' ? 'text-green-700' :
                                                            (order.status === 'Cancelled' || order.status === 'Pending' || order.status === 'Refund Failed') ? 'text-red-800' :
                                                                (order.status === 'Refund Requested' || order.refundStatus === 'requested') ? 'text-blue-700' :
                                                                    'text-yellow-800'
                                                        }`}>
                                                        {(order.status === 'Cancelled' || order.status === 'Pending') ? 'Failed' : order.status === 'Captured' ? 'Success' : order.status}
                                                    </span>
                                                    {order.paymentMethod && (
                                                        <span className="text-[11px] sm:text-[13px] text-gray-500 flex items-center gap-1">
                                                            {order.isPaid ? (
                                                                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                            ) : (order.status === 'Cancelled' || order.status === 'Pending') ? (
                                                                <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                                            )}
                                                            {order.isPaid ? 'Paid via' : (order.status === 'Cancelled' || order.status === 'Pending') ? 'Failed via' : 'Pending via'} <span className="capitalize">{order.paymentMethod === 'Razorpay' ? 'Online' : order.paymentMethod}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center mt-0 sm:mt-0.5">
                                                    <span className="text-gray-700 font-bold text-[12px] sm:text-[13px]">Order Placed</span>
                                                    <span className="text-gray-900 font-medium text-[11px] sm:text-[13px]">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-0 sm:mt-0.5">
                                                    <span className="text-[12px] sm:text-[13.5px] font-bold text-gray-900">₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    <span className="text-[11px] sm:text-[13px] text-gray-500 font-medium">Qty: {order.orderItems.reduce((acc: number, item: any) => acc + item.qty, 0)}</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <OrderDetailsModal
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
                generateInvoice={generateInvoice}
                isGeneratingInvoice={isGeneratingInvoice}
                setShowRefundConfirm={setShowRefundConfirm}
                isRefunding={isRefunding}
                canRequestReturn={canRequestReturn}
            />

            {/* Refund Confirm Modal */}
            {showRefundConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => !isRefunding && setShowRefundConfirm(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[17px] font-bold text-gray-900">Request return</h3>
                            <button onClick={() => !isRefunding && setShowRefundConfirm(null)} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-[14.5px] mb-8">Are you sure you want to request a return for this order?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowRefundConfirm(null)}
                                disabled={isRefunding}
                                className="h-[38px] px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-bold text-[14.5px] transition-colors cursor-pointer flex items-center justify-center w-full"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRefund(showRefundConfirm)}
                                disabled={isRefunding}
                                className="h-[38px] px-4 bg-[#458500] hover:bg-[#366800] text-white rounded-md font-bold text-[14.5px] transition-colors flex items-center justify-center cursor-pointer w-full relative"
                            >
                                <span className={isRefunding ? 'opacity-0' : ''}>Request Return</span>
                                {isRefunding && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
