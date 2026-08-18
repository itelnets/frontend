"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { getAllDoctorRequests, approveDoctorRequest, rejectDoctorRequest } from '@/services/doctor';
import SortDropdown from '@/components/SortDropdown';
import CopyIcon from '@/components/CopyIcon';
import DoctorVerificationModals from './DoctorVerificationModals';

export default function AdminDoctorRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('All status');
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

    // Modal state for Approval Confirmation Popup
    const [approveModalItem, setApproveModalItem] = useState<any | null>(null);
    const [discountDetailsInput, setDiscountDetailsInput] = useState('25% OFF on all prescription & healthcare products');
    const [isApproving, setIsApproving] = useState(false);

    // Modal state for Rejection Confirmation Popup
    const [rejectModalItem, setRejectModalItem] = useState<any | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    // Document Preview Modal State
    const [viewDocModalUrl, setViewDocModalUrl] = useState<string | null>(null);

    useEffect(() => {
        setPortalNode(document.getElementById('doctors-topbar-portal'));
    }, []);

    useEffect(() => {
        fetchDoctorRequests();
    }, [activeTab]);

    const fetchDoctorRequests = async () => {
        setLoading(true);
        try {
            const statusFilter = activeTab === 'All status' || activeTab === 'All' ? undefined : activeTab.toLowerCase();
            const data = await getAllDoctorRequests(statusFilter);
            setRequests(data.doctorRequests || []);
        } catch (error: any) {
            console.error('Failed to fetch doctor requests', error);
            toast.error(error.response?.data?.message || 'Failed to load doctor requests');
        } finally {
            setLoading(false);
        }
    };

    const generate8CharPromoCode = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleOpenApproveModal = (reqItem: any) => {
        setApproveModalItem(reqItem);
        setDiscountDetailsInput('25');
    };

    const handleConfirmApprove = async () => {
        if (!approveModalItem) return;
        setIsApproving(true);
        const autoPromoCode = generate8CharPromoCode();
        try {
            await approveDoctorRequest(approveModalItem._id, {
                promoCode: autoPromoCode,
                discountDetails: discountDetailsInput || '25'
            });
            toast.success(`Verification approved!`);
            setApproveModalItem(null);
            fetchDoctorRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve doctor request');
        } finally {
            setIsApproving(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectModalItem) return;
        setIsRejecting(true);
        try {
            await rejectDoctorRequest(rejectModalItem._id, rejectReason);
            toast.success(`Request rejected`);
            setRejectModalItem(null);
            setRejectReason('');
            fetchDoctorRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reject request');
        } finally {
            setIsRejecting(false);
        }
    };

    const getDocumentUrl = (docUrl: string) => {
        if (!docUrl) return '';
        if (docUrl.startsWith('http')) return docUrl;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        return `${apiUrl}/upload/file/${docUrl}`;
    };

    const formatSubmittedDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    const statusOptions = ['All status', 'Pending', 'Approved', 'Rejected'];

    return (
        <div className="sm:p-4 w-full h-full flex-1 min-h-0 flex flex-col mx-auto font-sans">
            {/* Render Status Dropdown into Topbar Portal */}
            {portalNode && createPortal(
                <div className="flex items-center gap-2">
                    <SortDropdown
                        isAdmin={true}
                        options={statusOptions}
                        value={activeTab}
                        onChange={(val) => setActiveTab(val)}
                        className="z-30 w-[90px] sm:w-[110px]"
                        buttonClassName="h-[34px] text-[11px] sm:text-xs bg-white border border-gray-300 rounded-md px-1.5 font-bold"
                        menuClassName="w-full"
                        listClassName="max-h-[200px]"
                    />
                </div>,
                portalNode
            )}

            {/* Table Container (Matching Admin Orders Page) */}
            <div className="bg-transparent sm:bg-white sm:rounded-lg sm:shadow-sm sm:border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto overflow-x-auto px-2 py-2 sm:p-0 flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-xs sm:text-sm text-gray-500 font-medium">
                            Loading doctor requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-xs sm:text-sm text-gray-500 font-medium">
                            No doctor verification requests found.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 block sm:table sm:table-fixed">
                            {/* Matching Green Table Header */}
                            <thead className="bg-green-600 hidden sm:table-header-group sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <th className="w-[15%] px-3 sm:px-4 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Doctor Name</th>
                                    <th className="w-[16%] px-3 sm:px-4 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Contact</th>
                                    <th className="w-[12%] px-3 sm:px-4 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Clinic</th>
                                    <th className="w-[12%] px-3 sm:px-4 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Specialization</th>
                                    <th className="w-[17%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Reg No</th>
                                    <th className="w-[12%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Submitted</th>
                                    <th className="w-[5%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Status</th>
                                    <th className="w-[11%] px-3 sm:px-4 py-3.5 text-center text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 block sm:table-row-group">
                                {requests.map((req) => {
                                    const fullDocUrl = getDocumentUrl(req.documentUrl);

                                    return (
                                        <tr
                                            key={req._id}
                                            className="hover:bg-gray-50 transition-colors block sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none relative"
                                        >
                                            {/* Desktop Doctor Name */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                                                <div className="text-[13px] sm:text-[14px] font-bold text-gray-900 whitespace-nowrap">Dr. {req.name}</div>
                                            </td>

                                            {/* Desktop Contact */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3">
                                                <div className="text-gray-800 text-xs sm:text-sm flex items-center gap-1">
                                                    <span className="truncate">{req.email}</span>
                                                    {req.email && <CopyIcon text={req.email} label="Email" />}
                                                </div>
                                                <div className="text-[11px] sm:text-xs text-gray-500">{req.mobileNumber}</div>
                                            </td>

                                            {/* Desktop Clinic */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3">
                                                <div className="text-xs sm:text-sm text-gray-700 font-medium capitalize">{req.hospitalClinic || 'N/A'}</div>
                                            </td>

                                            {/* Desktop Specialization */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3">
                                                <div className="font-medium text-gray-900 text-xs sm:text-sm capitalize">{req.specialization}</div>
                                            </td>

                                            {/* Desktop Reg No */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                                                <div className="inline-flex items-center justify-center gap-1 font-mono font-bold text-gray-800 text-xs sm:text-sm whitespace-nowrap">
                                                    <span className="whitespace-nowrap">{req.registrationNumber}</span>
                                                    <CopyIcon text={req.registrationNumber} label="Reg No" />
                                                </div>
                                            </td>

                                            {/* Desktop Submitted */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-center text-gray-600 text-xs font-medium whitespace-nowrap">
                                                {formatSubmittedDate(req.createdAt)}
                                            </td>

                                            {/* Desktop Status */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-center">
                                                <span className={`inline-flex items-center justify-center text-[13px] sm:text-[14px] font-bold ${req.status === 'approved' ? 'text-green-600' :
                                                    req.status === 'pending' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                </span>
                                            </td>

                                            {/* Desktop Actions */}
                                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    {/* Eye View Document Button */}
                                                    {fullDocUrl ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewDocModalUrl(fullDocUrl)}
                                                            title="View Certificate Document"
                                                            className="w-[26px] h-[26px] sm:w-[32px] sm:h-[32px] inline-flex items-center justify-center border border-transparent rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors shadow-sm cursor-pointer shrink-0"
                                                        >
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                    ) : null}

                                                    {/* Desktop Verification Toggle Switch (h-5 w-9) */}
                                                    <button
                                                        type="button"
                                                        disabled={req.status === 'rejected'}
                                                        onClick={() => {
                                                            if (req.status === 'rejected') return;
                                                            if (req.status === 'approved') {
                                                                setRejectModalItem(req);
                                                            } else {
                                                                handleOpenApproveModal(req);
                                                            }
                                                        }}
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${req.status === 'rejected'
                                                                ? 'cursor-not-allowed opacity-50 bg-gray-300'
                                                                : 'cursor-pointer ' + (req.status === 'approved' ? 'bg-green-600' : 'bg-gray-300')
                                                            }`}
                                                        title={req.status === 'rejected' ? 'Rejected (Cannot be enabled)' : req.status === 'approved' ? 'Verified (Click to unverify)' : 'Unverified (Click to verify)'}
                                                    >
                                                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${req.status === 'approved' ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Mobile Card View (screens < 640px) */}
                                            <td className="sm:hidden block p-3.5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">Dr. {req.name}</div>
                                                        <div className="text-xs text-gray-500">{req.specialization} • {req.hospitalClinic || 'N/A'}</div>
                                                    </div>
                                                    <span className={`inline-flex items-center text-[12px] sm:text-[13px] font-bold ${req.status === 'approved' ? 'text-green-600' :
                                                        req.status === 'pending' ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                                                    <p><span className="font-semibold text-gray-800">Reg No:</span> {req.registrationNumber}</p>
                                                    <p><span className="font-semibold text-gray-800">Contact:</span> {req.email} • {req.mobileNumber}</p>
                                                    <p className="text-[11px] text-gray-400">Submitted: {formatSubmittedDate(req.createdAt)}</p>
                                                </div>

                                                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                                                    {/* Eye View Document Button + Mobile Toggle Switch besides each other */}
                                                    {fullDocUrl ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewDocModalUrl(fullDocUrl)}
                                                            title="View Certificate Document"
                                                            className="w-[26px] h-[26px] inline-flex items-center justify-center border border-transparent rounded-[4px] sm:rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors shadow-sm cursor-pointer shrink-0"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                    ) : null}

                                                    {/* Mobile Verification Toggle Switch (h-4 w-7) */}
                                                    <button
                                                        type="button"
                                                        disabled={req.status === 'rejected'}
                                                        onClick={() => {
                                                            if (req.status === 'rejected') return;
                                                            if (req.status === 'approved') {
                                                                setRejectModalItem(req);
                                                            } else {
                                                                handleOpenApproveModal(req);
                                                            }
                                                        }}
                                                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${req.status === 'rejected'
                                                                ? 'cursor-not-allowed opacity-50 bg-gray-300'
                                                                : 'cursor-pointer ' + (req.status === 'approved' ? 'bg-green-600' : 'bg-gray-300')
                                                            }`}
                                                        title={req.status === 'rejected' ? 'Rejected (Cannot be enabled)' : req.status === 'approved' ? 'Verified (Click to unverify)' : 'Unverified (Click to verify)'}
                                                    >
                                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${req.status === 'approved' ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Approval & Rejection Popup Modals */}
            <DoctorVerificationModals
                approveModalItem={approveModalItem}
                setApproveModalItem={setApproveModalItem}
                rejectModalItem={rejectModalItem}
                setRejectModalItem={setRejectModalItem}
                discountDetailsInput={discountDetailsInput}
                setDiscountDetailsInput={setDiscountDetailsInput}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                isApproving={isApproving}
                isRejecting={isRejecting}
                onConfirmApprove={handleConfirmApprove}
                onConfirmReject={handleConfirmReject}
                viewDocModalUrl={viewDocModalUrl}
                setViewDocModalUrl={setViewDocModalUrl}
            />
        </div>
    );
}
