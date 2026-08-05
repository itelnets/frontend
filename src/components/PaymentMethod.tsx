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
                                <span className="font-bold text-[14px] sm:text-[15px] text-gray-900 flex-1">Pay Securely with Razorpay (Cards, UPI, Netbanking)</span>
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
