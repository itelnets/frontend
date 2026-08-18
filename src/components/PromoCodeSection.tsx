'use client';

import React from 'react';

interface PromoCodeSectionProps {
    isLoggedIn?: boolean;
    doctorPromo: string | null;
    appliedPromo: { code: string; discountPercent: number } | null;
    promoCodeInput: string;
    promoError: string;
    onApplyPromo: (code?: string) => void;
    onRemovePromo: () => void;
    onInputChange: (val: string) => void;
}

export default function PromoCodeSection({
    isLoggedIn = true,
    doctorPromo,
    appliedPromo,
    promoCodeInput,
    promoError,
    onApplyPromo,
    onRemovePromo,
    onInputChange,
}: PromoCodeSectionProps) {
    if (!isLoggedIn) return null;

    return (
        <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Promo Code
            </label>

            {appliedPromo ? (
                <div className="bg-green-50 border border-green-300 rounded-md p-2.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-800 font-mono">{appliedPromo.code}</span>
                        <span className="text-[11px] text-green-600 font-semibold">({appliedPromo.discountPercent}% OFF Applied)</span>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="ENTER PROMO CODE"
                            maxLength={8}
                            value={promoCodeInput}
                            onChange={(e) => onInputChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (promoCodeInput.trim().length === 8) {
                                        onApplyPromo();
                                    }
                                }
                            }}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-mono font-semibold uppercase focus:outline-none focus:border-green-600 h-[34px] sm:h-[40px]"
                        />
                        <button
                            type="button"
                            disabled={promoCodeInput.trim().length !== 8}
                            onClick={() => onApplyPromo()}
                            className="bg-[#458500] hover:bg-[#366800] text-[#FFFFFF] font-bold text-xs sm:text-sm px-4 sm:px-5 h-[34px] sm:h-[40px] rounded-md transition-colors cursor-pointer shrink-0 flex items-center justify-center shadow-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#458500]"
                        >
                            Apply
                        </button>
                    </div>
                    {promoError && (
                        <p className="text-xs text-red-600 mt-1 font-medium">{promoError}</p>
                    )}
                </div>
            )}
        </div>
    );
}
