import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface OrderDetailsModalProps {
    selectedOrder: any;
    setSelectedOrder: (val: any) => void;
    generateInvoice: () => void;
    isGeneratingInvoice: boolean;
    setShowRefundConfirm: (val: any) => void;
    isRefunding: boolean;
    canRequestReturn: (order: any) => boolean;
}

export default function OrderDetailsModal({
    selectedOrder,
    setSelectedOrder,
    setShowRefundConfirm,
    isRefunding,
    canRequestReturn,
}: OrderDetailsModalProps) {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const CopyIcon = ({ text, label }: { text: string, label: string }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = (e: React.MouseEvent) => {
            e.stopPropagation();
            copyToClipboard(text, label);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <div onClick={handleCopy} className="inline mr-1.5 cursor-pointer flex-shrink-0" title={`Copy ${label}`}>
                {copied ? (
                    <svg className="w-3.5 h-3.5 text-green-600 inline transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                ) : (
                    <svg className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 inline transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                )}
            </div>
        );
    };

    if (!selectedOrder) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)}>
            <div className="bg-[#f2f4f7] sm:bg-white w-full sm:max-w-xl rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white p-3 sm:p-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[18px] sm:text-lg font-bold text-gray-900">
                            Payment Details
                        </h2>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer transition-colors flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-0 sm:p-4 space-y-1.5 sm:space-y-3">


                    {/* Paid From Section */}
                    <div className="bg-white p-2 sm:p-4 sm:rounded-lg sm:border sm:border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[15px] font-bold text-gray-900">Paid from</h3>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-white border border-gray-200 rounded-full flex items-center justify-center p-0.5">
                                    {selectedOrder.paymentMethod === 'Razorpay' || selectedOrder.paymentMethod === 'Online' ? (
                                        <img src="/google-pay.png" className="w-full h-full object-contain opacity-70" alt="UPI" />
                                    ) : (
                                        <svg className="w-full h-full text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    )}
                                </div>
                                <div className="text-[13px] sm:text-[14px] font-bold text-gray-900 capitalize">
                                    {selectedOrder.paymentMethod === 'Razorpay' ? 'UPI / Online' : selectedOrder.paymentMethod || 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-white p-2.5 sm:px-4 sm:py-3.5 sm:rounded-lg sm:border sm:border-gray-200">
                        <div className="space-y-2 sm:space-y-3">
                            {selectedOrder.razorpayPaymentId && (
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Transaction ID</span>
                                    <div className="flex items-center">
                                        <CopyIcon text={selectedOrder.razorpayPaymentId} label="Transaction ID" />
                                        <span className="font-medium text-gray-900">{selectedOrder.razorpayPaymentId}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-gray-500">Order ID</span>
                                <div className="flex items-center">
                                    <CopyIcon text={selectedOrder.razorpayOrderId || selectedOrder._id} label="Order ID" />
                                    <span className="font-medium text-gray-900">{selectedOrder.razorpayOrderId || selectedOrder._id}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-gray-500">Date and time</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(selectedOrder.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                            </div>

                            {selectedOrder.user && (
                                <>
                                    <div className="border-t border-gray-100 my-3"></div>
                                    <div className="flex justify-between items-start text-[13px]">
                                        <span className="text-gray-500">Customer details</span>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                <span className="font-medium text-gray-900">{selectedOrder.user.mobileNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                <span className="font-medium text-gray-900">{selectedOrder.user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>



                    {/* Payment details */}
                    <div className="bg-white p-2.5 sm:p-4 pb-4 sm:pb-4 sm:rounded-lg sm:border sm:border-gray-200">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h3 className="text-[15px] font-bold text-gray-900">Payment details</h3>
                            {selectedOrder.isPaid && selectedOrder.status !== 'Cancelled' && (
                                <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[12px] sm:text-[13px] font-bold cursor-default bg-green-50 text-green-700">
                                    Payment Successful
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-gray-500">Bill amount</span>
                                <span className="font-medium text-gray-900">₹{((selectedOrder.itemsPrice || (selectedOrder.totalPrice - (selectedOrder.taxPrice || 0) - (selectedOrder.shippingPrice || 0)))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-gray-500">Taxes</span>
                                <span className="font-medium text-gray-900">₹{(selectedOrder.taxPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium text-gray-900">{selectedOrder.shippingPrice === 0 ? 'Free' : `₹${(selectedOrder.shippingPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-gray-500">Convenience fee</span>
                                <span className="font-medium text-gray-900">₹0</span>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-dashed border-gray-300 flex justify-between items-center">
                            <span className="text-[15px] font-bold text-gray-900">Order total</span>
                            <span className="text-[15px] font-bold text-gray-900">₹{(selectedOrder.totalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="mt-3 pt-4 border-t border-gray-100 flex justify-start items-center">
                            {canRequestReturn(selectedOrder) ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowRefundConfirm(selectedOrder._id);
                                    }}
                                    disabled={isRefunding}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-[12.5px] sm:text-[13px] font-bold cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center relative"
                                >
                                    <span className={isRefunding ? 'opacity-0' : ''}>Request Return</span>
                                    {isRefunding && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        </div>
                                    )}
                                </button>
                            ) : (
                                <div
                                    title="Not allowed"
                                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-[12.5px] sm:text-[13px] font-bold cursor-not-allowed ${(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Pending') ? 'bg-red-50 text-red-600' :
                                        selectedOrder.refundStatus === 'requested' ? 'bg-blue-50 text-blue-700' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                    {(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Pending') ? 'Payment Failed' :
                                        (selectedOrder.refundStatus === 'processed' || selectedOrder.refundStatus === 'pending') ? 'Already Refunded' :
                                            selectedOrder.refundStatus === 'requested' ? 'Refund Requested' :
                                                'Return Closed'
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
