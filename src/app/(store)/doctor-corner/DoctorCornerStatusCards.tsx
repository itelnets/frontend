'use client';

import React from 'react';
import Link from 'next/link';

interface DoctorCornerStatusCardsProps {
    doctorRequest: any;
    copied: boolean;
    onCopyCode: (code: string) => void;
}

export default function DoctorCornerStatusCards({
    doctorRequest,
    copied,
    onCopyCode,
}: DoctorCornerStatusCardsProps) {
    if (!doctorRequest) return null;

    if (doctorRequest.status === 'pending') {
        return (
            /* State: Logged-in User with Pending Verification */
            <div className="bg-white rounded-lg border border-amber-200/80 p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg sm:text-xl shrink-0 font-bold">
                            ⏳
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900">Verification Pending</h2>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Submitted on {new Date(doctorRequest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Pending
                    </span>
                </div>

                {/* Prominent Pending Message */}
                <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-3.5 sm:p-5 flex items-start gap-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-amber-900">Verification in Progress</h3>
                        <p className="text-xs sm:text-sm text-amber-800 font-semibold mt-1 leading-relaxed">
                            “After your verification is confirmed, you will receive your promo code by email.”
                        </p>
                        <p className="text-[11px] sm:text-xs text-amber-700 mt-1.5 leading-normal">
                            Our medical verification team is reviewing your details with council registration records. Thank you for your patience!
                        </p>
                    </div>
                </div>

                {/* Summary of submitted details */}
                <div className="bg-gray-50 rounded-lg p-3.5 sm:p-5 border border-gray-100 space-y-3">
                    <h3 className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted Verification Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm">
                        <div className="bg-white p-2.5 rounded-lg sm:bg-transparent sm:p-0 border sm:border-0 border-gray-100">
                            <span className="text-gray-500 block text-[11px] sm:text-xs">Doctor Name</span>
                            <span className="font-semibold text-gray-900">{doctorRequest.name}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg sm:bg-transparent sm:p-0 border sm:border-0 border-gray-100">
                            <span className="text-gray-500 block text-[11px] sm:text-xs">Medical Reg No</span>
                            <span className="font-semibold text-gray-900">{doctorRequest.registrationNumber}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg sm:bg-transparent sm:p-0 border sm:border-0 border-gray-100">
                            <span className="text-gray-500 block text-[11px] sm:text-xs">Specialization</span>
                            <span className="font-semibold text-gray-900 capitalize">{doctorRequest.specialization}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg sm:bg-transparent sm:p-0 border sm:border-0 border-gray-100">
                            <span className="text-gray-500 block text-[11px] sm:text-xs">Hospital / Clinic</span>
                            <span className="font-semibold text-gray-900 capitalize">{doctorRequest.hospitalClinic || 'N/A'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg sm:bg-transparent sm:p-0 border sm:border-0 border-gray-100">
                            <span className="text-gray-500 block text-[11px] sm:text-xs">Email</span>
                            <span className="font-semibold text-gray-900 break-all">{doctorRequest.email}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg sm:bg-transparent sm:p-0 border sm:border-0 border-gray-100">
                            <span className="text-gray-500 block text-[11px] sm:text-xs">Certificate</span>
                            <span className="font-semibold text-gray-900 break-all">
                                {doctorRequest.documentUrl ? 'Uploaded' : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (doctorRequest.status === 'approved') {
        return (
            /* State: Logged-in User with Approved Verification */
            <div className="bg-white rounded-lg border border-green-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-[#458500] flex items-center justify-center text-lg sm:text-xl shrink-0 font-bold">
                            ✅
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900">Dr. {doctorRequest.name}</h2>
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                                Verified Reg No: <span className="font-semibold text-gray-700">{doctorRequest.registrationNumber}</span> (<span className="capitalize">{doctorRequest.specialization}</span>)
                            </p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800 border border-green-200 shrink-0">
                        Verified Doctor
                    </span>
                </div>

                {/* Promo Code & Discount Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-[#458500]/40 rounded-lg p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-[10px] sm:text-xs font-bold text-[#458500] uppercase tracking-wider">Your Exclusive Doctor Promo Code</span>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 mt-0.5 leading-snug">
                                {doctorRequest.discountDetails || '25% OFF on all prescription & healthcare products'}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-gray-600 mt-1">
                                Use this code during checkout to claim your verified doctor benefit.
                            </p>
                        </div>
                        <div className="flex flex-col items-stretch sm:items-end shrink-0">
                            <div className="bg-white border-2 border-[#458500] px-3.5 py-2 rounded-lg flex items-center justify-between sm:justify-start gap-3 shadow-xs">
                                <span className="font-mono text-base sm:text-lg font-black text-[#458500] tracking-wider">
                                    {doctorRequest.promoCode || ''}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onCopyCode(doctorRequest.promoCode || '')}
                                    title={copied ? "Copied!" : "Copy Promo Code"}
                                    className="p-1 text-[#458500] hover:text-[#366800] hover:bg-green-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0"
                                >
                                    {copied ? (
                                        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-stretch sm:justify-end">
                        <Link
                            href="/products"
                            className="w-full sm:w-auto bg-[#458500] hover:bg-[#366800] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 text-center"
                        >
                            Shop Healthcare Products
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
