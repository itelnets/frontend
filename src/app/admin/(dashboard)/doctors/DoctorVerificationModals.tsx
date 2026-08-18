'use client';

import React from 'react';

interface DoctorVerificationModalsProps {
    approveModalItem: any;
    setApproveModalItem: (item: any) => void;
    rejectModalItem: any;
    setRejectModalItem: (item: any) => void;
    discountDetailsInput: string;
    setDiscountDetailsInput: (val: string) => void;
    rejectReason: string;
    setRejectReason: (val: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
    onConfirmApprove: () => void;
    onConfirmReject: () => void;
    viewDocModalUrl?: string | null;
    setViewDocModalUrl?: (url: string | null) => void;
}

export default function DoctorVerificationModals({
    approveModalItem,
    setApproveModalItem,
    rejectModalItem,
    setRejectModalItem,
    discountDetailsInput,
    setDiscountDetailsInput,
    rejectReason,
    setRejectReason,
    isApproving,
    isRejecting,
    onConfirmApprove,
    onConfirmReject,
    viewDocModalUrl,
    setViewDocModalUrl,
}: DoctorVerificationModalsProps) {
    const [isImgLoading, setIsImgLoading] = React.useState(true);

    React.useEffect(() => {
        if (viewDocModalUrl) {
            setIsImgLoading(true);
        }
    }, [viewDocModalUrl]);

    const handleDownloadImage = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        e.stopPropagation();

        let downloadUrl = url;
        if (url.includes('/upload/file/')) {
            downloadUrl = url.includes('?') ? `${url}&download=true` : `${url}?download=true`;
        } else {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            downloadUrl = `${apiUrl}/upload/download-file?url=${encodeURIComponent(url)}`;
        }

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <>
            {/* Clean Document Preview Popup Modal */}
            {viewDocModalUrl && setViewDocModalUrl && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 cursor-pointer"
                    onClick={() => setViewDocModalUrl(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-150 min-w-[200px] min-h-[200px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Loading Spinner */}
                        {isImgLoading && !viewDocModalUrl.toLowerCase().includes('.pdf') && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg backdrop-blur-2xs z-40">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Download Icon Button */}
                        <button
                            type="button"
                            onClick={(e) => handleDownloadImage(e, viewDocModalUrl)}
                            title="Download Certificate"
                            className="absolute top-3 right-3 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-lg cursor-pointer border border-white/20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>

                        {/* Pure Document Image Preview */}
                        {viewDocModalUrl.toLowerCase().includes('.pdf') ? (
                            <iframe
                                src={viewDocModalUrl}
                                className="w-[90vw] sm:w-[80vw] max-w-4xl h-[80vh] rounded-lg border-0 shadow-2xl"
                                title="Certificate Document"
                            />
                        ) : (
                            <img
                                src={viewDocModalUrl}
                                alt="Certificate Document"
                                onLoad={() => setIsImgLoading(false)}
                                onError={() => setIsImgLoading(false)}
                                className={`max-w-[92vw] sm:max-w-4xl max-h-[85vh] object-contain rounded-lg shadow-2xl transition-opacity duration-200 ${isImgLoading ? 'opacity-0' : 'opacity-100'}`}
                            />
                        )}
                    </div>
                </div>
            )}
            {/* Approval Confirmation Popup Modal */}
            {approveModalItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 shadow-2xl border border-gray-100 space-y-2 sm:space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">Doctor Verification</h3>
                            <p className="text-[11px] sm:text-xs text-gray-500">Confirm approval and issue promo code</p>
                        </div>


                        <div className="space-y-3 pt-1">


                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        maxLength={2}
                                        placeholder="e.g. 25"
                                        value={discountDetailsInput}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            setDiscountDetailsInput(val);
                                        }}
                                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-green-600 font-bold pr-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setApproveModalItem(null)}
                                className="w-auto px-5 py-2 text-xs sm:text-[13px] font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-[6px] sm:rounded-md transition-colors cursor-pointer text-center shadow-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isApproving}
                                onClick={onConfirmApprove}
                                className="w-auto min-w-[90px] sm:min-w-[100px] h-[34px] sm:h-[36px] px-5 text-xs sm:text-[13px] font-bold bg-green-600 hover:bg-green-700 text-white rounded-[6px] sm:rounded-md transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                            >
                                {isApproving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Confirmation Popup Modal */}
            {rejectModalItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 shadow-2xl border border-gray-100 space-y-2 sm:space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">Reject Verification</h3>
                            <p className="text-[11px] sm:text-xs text-gray-500">Dr. {rejectModalItem.name}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Rejection (Optional)</label>
                            <textarea
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g. Reg number mismatch with council database..."
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-red-500"
                            />
                        </div>

                        <div className="flex flex-row items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectModalItem(null);
                                    setRejectReason('');
                                }}
                                className="w-auto px-5 py-2 text-xs sm:text-[13px] font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-[6px] sm:rounded-md transition-colors cursor-pointer text-center shadow-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isRejecting}
                                onClick={onConfirmReject}
                                className="w-auto min-w-[90px] sm:min-w-[100px] h-[34px] sm:h-[36px] px-5 text-xs sm:text-[13px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-[6px] sm:rounded-md transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                            >
                                {isRejecting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
