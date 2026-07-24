import React, { useState, useEffect } from 'react';

interface PaymentMethodProps {
    selectedPaymentMethod: string | null;
    setSelectedPaymentMethod: (method: string) => void;
    activeAddress: any;
    showCardError?: boolean;
    isProcessingGPay?: boolean;
    isPreparingGPay?: boolean;
    onProcessGPay?: () => void;
}

export default function PaymentMethod({
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    activeAddress,
    showCardError,
    isProcessingGPay,
    isPreparingGPay,
    onProcessGPay
}: PaymentMethodProps) {
    const [localShowCardError, setLocalShowCardError] = useState(showCardError || false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [securityCode, setSecurityCode] = useState('');
    const [nameOnCard, setNameOnCard] = useState(activeAddress?.fullName || '');

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);

        if (val.length >= 3) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        } else if (val.length === 2 && e.target.value.endsWith('/')) {
            val = val + '/';
        } else if (val.length === 2 && expiryDate.length === 3) {
            val = val.slice(0, 1);
        } else if (val.length === 2) {
            val = val + '/';
        }

        setExpiryDate(val);
    };

    const handleSecurityCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 3));
    };

    const validateAndContinue = () => {
        if (cardNumber.replace(/\s/g, '').length === 16 && expiryDate.length === 5 && securityCode.length === 3 && nameOnCard.trim()) {
            setLocalShowCardError(false);
            console.log('Proceeding with payment...');
        } else {
            setLocalShowCardError(true);
        }
    };

    useEffect(() => {
        if (cardNumber.replace(/\s/g, '').length === 16 && expiryDate.length === 5 && securityCode.length === 3 && nameOnCard.trim()) {
            setLocalShowCardError(false);
        }
    }, [cardNumber, expiryDate, securityCode, nameOnCard]);

    return (
        <div className="bg-white rounded shadow-sm">
            <div className="p-2 sm:p-4 sm:p-6 pb-4 sm:pb-6">
                <h2 className="text-[18px] sm:text-[22px] font-bold text-gray-900 mb-2 sm:mb-4 ml-2 sm:ml-0">Payment method</h2>
                <h3 className="text-[16px] sm:text-[16px] font-bold text-gray-900 mb-2 sm:mb-4 ml-2 sm:ml-0">Add a payment method</h3>

                <div className="flex flex-col gap-2 sm:gap-4">
                    {/* Option 1: Card */}
                    <div className={`border ${selectedPaymentMethod === 'card' ? 'border-[#458500] border-2' : 'border-gray-300'} ${isProcessingGPay && selectedPaymentMethod === 'card' ? 'order-first' : ''} rounded-md overflow-hidden`}>
                        <div
                            className="p-3 sm:p-4 flex flex-col cursor-pointer"
                            onClick={() => setSelectedPaymentMethod('card')}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'card' ? 'border-[#458500]' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'card' && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#458500]" />}
                                </div>
                                <span className="font-bold text-[14px] sm:text-[15px] text-gray-900 flex-1">Add a Credit / Debit Card</span>
                            </div>
                            <div className="pl-8 flex gap-1.5 sm:gap-2 mt-2">
                                <div className="h-6 w-10 sm:h-8 sm:w-14 bg-white border cursor-disable border-gray-200 rounded flex items-center justify-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/81/Visa_Brandmark_2021.svg" className="w-full h-full object-contain" alt="Visa" />
                                </div>
                                <div className="h-6 w-10 sm:h-8 sm:w-14 bg-white border cursor-disable border-gray-200 rounded flex items-center justify-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="w-full h-full object-contain" alt="Mastercard" />
                                </div>
                                <div className="h-6 w-10 sm:h-8 sm:w-14 bg-white border cursor-disable border-gray-200 rounded flex items-center justify-center">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" className="w-full h-full object-contain" alt="RuPay" />
                                </div>
                            </div>
                        </div>

                        {selectedPaymentMethod === 'card' && (
                            <div className="px-3 sm:px-12 pb-4 pt-2">
                                <div className="space-y-4">
                                    {localShowCardError && (
                                        <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] px-4 py-3 rounded text-[14px] flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-full bg-[#be123c] text-white flex items-center justify-center shrink-0">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M12 19h.01" /></svg>
                                            </div>
                                            <span>Please enter required card information.</span>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-[13px] text-gray-800 mb-1.5">Card Number</label>
                                        <div className="relative">
                                            <input type="text" value={cardNumber} onChange={handleCardNumberChange} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-gray-400" placeholder="1234 5678 9012 3456" />
                                            <div className="absolute right-3 top-2 text-gray-300">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[13px] text-gray-800 mb-1.5">Expiry Date</label>
                                            <div className="relative">
                                                <input type="text" value={expiryDate} onChange={handleExpiryChange} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-gray-400" placeholder="MM/YY" />
                                                <div className="absolute right-3 top-2 text-gray-300">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[13px] text-gray-800 mb-1.5">Security Code</label>
                                            <div className="relative">
                                                <input type="text" value={securityCode} onChange={handleSecurityCodeChange} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-gray-400" placeholder="3 digits" />
                                                <div className="absolute right-3 top-2 text-gray-300">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-gray-800 mb-1.5">Name on Card</label>
                                        <div className="relative">
                                            <input type="text" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-gray-400" placeholder="Full Name" />
                                            <div className="absolute right-3 top-2.5 text-green-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#458500] border-gray-300 rounded focus:ring-[#458500] accent-[#458500]" />
                                            <span className="text-[14px] sm:text-[15px] text-gray-900">Save card for future purchases</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#458500] border-gray-300 rounded focus:ring-[#458500] accent-[#458500]" />
                                            <span className="text-[14px] sm:text-[15px] text-gray-900">Set as my default payment method</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#458500] border-gray-300 rounded focus:ring-[#458500] accent-[#458500]" />
                                            <span className="text-[14px] sm:text-[15px] text-gray-900">Billing address is the same as shipping address</span>
                                        </label>
                                    </div>

                                    <div className="bg-[#f9f9f9] rounded px-4 py-4 mt-4 text-[13px] text-gray-800">
                                        <div className="font-bold text-gray-900 mb-3 text-[14px]">Billing address</div>
                                        <div className="font-bold text-gray-900 mb-1 text-[14px]">{activeAddress?.fullName || 'No address selected'}</div>
                                        <div className="text-gray-600 leading-relaxed">
                                            {activeAddress ? `${activeAddress.addressLine1}${activeAddress.addressLine2 ? ', ' + activeAddress.addressLine2 : ''}, ${activeAddress.landmark ? activeAddress.landmark + ', ' : ''}${activeAddress.city}, ${activeAddress.state}, ${activeAddress.zip} | India | ${activeAddress.phone}` : ''}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button type="button" onClick={(e) => { e.preventDefault(); validateAndContinue(); }} className="bg-[#458500] hover:bg-[#366800] text-white font-normal font-bold text-[14px] sm:text-[16px] py-[5.5px] sm:py-2 px-4 sm:px-6 rounded-md transition-colors cursor-pointer">
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Option 2: Google Pay */}
                    <div className={`border ${selectedPaymentMethod === 'gpay' ? 'border-[#458500] border-2' : 'border-gray-300'} ${isProcessingGPay && selectedPaymentMethod === 'gpay' ? 'order-first' : ''} rounded-md overflow-hidden`}>
                        <div
                            className="p-3 sm:p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => setSelectedPaymentMethod('gpay')}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === 'gpay' ? 'border-[#458500]' : 'border-gray-300'}`}>
                                    {selectedPaymentMethod === 'gpay' && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#458500]" />}
                                </div>
                                <div className="border border-gray-300 rounded px-1.5 sm:px-2 py-0.5 bg-white shrink-0">
                                    <img src="/google-pay.png" alt="Google Pay" className="h-4 sm:h-6 object-contain" />
                                </div>
                                <span className="font-bold text-[13px] sm:text-[15px] text-gray-900 leading-tight">Pay with Google Pay</span>
                            </div>

                            {selectedPaymentMethod === 'gpay' && !isProcessingGPay && (
                                <button type="button" onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (onProcessGPay) onProcessGPay();
                                }} disabled={isPreparingGPay} className="bg-[#458500] hover:bg-[#366800] text-white font-normal font-bold text-[14px] sm:text-[16px] py-[5.5px] sm:py-2 px-4 sm:px-6 rounded-md transition-colors cursor-pointer shrink-0 ml-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    Continue
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
