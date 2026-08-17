'use client';

import React, { useEffect, useState } from 'react';
import { fetchAddresses } from '@/services/addressService';
import { useRouter } from 'next/navigation';

export default function AddressBookPage() {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadAddresses = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                router.push('/login');
                return;
            }

            try {
                const data = await fetchAddresses();
                setAddresses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch addresses', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAddresses();
    }, [router]);

    return (
        <div className="w-full h-[calc(100dvh-110px)] sm:h-[calc(100dvh-150px)] md:h-[calc(100dvh-210px)] flex flex-col">
            <div className="bg-white rounded-none sm:rounded-lg shadow-sm border border-[#458500]/20 flex flex-col flex-1 min-h-0 overflow-hidden">
                {addresses.length > 0 && (
                    <div className="p-3 sm:p-5 border-b-2 border-[#458500]/20 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-[16px] sm:text-[18px] font-bold text-gray-800">Address Book</span>
                        </div>
                    </div>
                )}

                <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    {addresses.length === 0 && !isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[300px]">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">
                                No addresses saved yet
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 max-w-sm px-4">
                                Add a new address to speed up your checkout process next time you shop!
                            </p>
                            <button onClick={() => router.push('/checkout')} className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-md bg-[#458500] hover:bg-[#366800] text-white text-sm sm:text-base font-bold transition-colors cursor-pointer shrink-0">
                                Add Address
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {addresses.map((address, index) => (
                                <div
                                    key={address._id || index}
                                    onClick={() => router.push('/checkout')}
                                    className="group cursor-pointer text-[12px] sm:text-[14px] text-gray-600 leading-relaxed border border-[#d4e5c5] rounded-md p-3 sm:p-4 bg-[#eef6e6] relative transition-shadow hover:shadow-sm hover:border-[#a9c990]"
                                >
                                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                                        <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                    {address.isDefault && (
                                        <span className="absolute bottom-3 sm:bottom-4 right-3 sm:bottom-4 text-[10px] font-bold bg-white text-[#458500] border border-[#d4e5c5] px-2 py-1.5 rounded-md">DEFAULT</span>
                                    )}
                                    <div className="font-semibold text-[13px] sm:text-[15px] text-gray-800 mb-1 pr-6">{address.fullName}</div>
                                    <div>{address.addressLine1},</div>
                                    <div>{address.addressLine2}{address.addressLine2 ? ' - ' : ''}{address.zip},</div>
                                    <div>{address.landmark ? address.landmark + ', ' : ''}{address.city}, {address.state}, India</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
