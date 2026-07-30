'use client';

import React, { useEffect, useState } from 'react';
import { fetchAddresses } from '@/services/addressService';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner className="w-8 h-8 sm:w-12 sm:h-12 text-[#458500]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-none sm:rounded-lg shadow-sm border border-[#458500]/20 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#458500]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#458500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[16px] sm:text-[18px] font-bold text-gray-800">Address Book</span>
                </div>
            </div>

            <div className="p-3 sm:p-4">
                {addresses.length === 0 ? (
                    <div className="text-gray-500 italic text-[13px] sm:text-sm">No addresses saved yet.</div>
                ) : (
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {addresses.map((address, index) => (
                            <div
                                key={address._id || index}
                                className="text-[12px] sm:text-[14px] text-gray-600 leading-relaxed border border-[#d4e5c5] rounded-md p-3 sm:p-4 bg-[#eef6e6] relative transition-shadow hover:shadow-sm hover:border-[#a9c990]"
                            >
                                {address.isDefault && (
                                    <span className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-[10px] font-bold bg-white text-[#458500] border border-[#d4e5c5] px-2 py-1.5 rounded-md">DEFAULT</span>
                                )}
                                <div className="font-semibold text-[13px] sm:text-[15px] text-gray-800 mb-1">{address.fullName}</div>
                                <div>
                                    {address.addressLine1} {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                                    {address.landmark ? `, ${address.landmark}` : ''}
                                </div>
                                <div>{address.city}, {address.state} {address.zip}</div>
                                <div className="mt-0.5">Phone: {address.phone}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
