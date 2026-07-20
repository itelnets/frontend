'use client';

import { useState } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    options: string[];
    value: string;
    onChange: (val: string) => void;
    totalResults: number;
};

export default function MobileSortDrawer({ isOpen, onClose, options, value, onChange, totalResults }: Props) {
    const [localValue, setLocalValue] = useState(value);

    if (!isOpen) return null;

    const handleApply = () => {
        onChange(localValue);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[300] flex flex-col lg:hidden">
            <style jsx global>{`
                @keyframes slideUpSort {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up-sort {
                    animation: slideUpSort 0.3s ease-out forwards;
                }
            `}</style>

            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

            {/* Bottom Sheet Drawer */}
            <div className="relative w-full h-[85vh] mt-auto bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col rounded-t-2xl overflow-hidden animate-slide-up-sort">
                {/* Header */}
                <div className="flex justify-center items-center p-4 border-b border-gray-200 shrink-0 relative">
                    <h2 className="text-lg font-bold text-gray-900">Sort</h2>
                    <button onClick={onClose} className="absolute right-4 p-2 -mr-2 text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white py-2">
                    {options.map(option => (
                        <div 
                            key={option} 
                            onClick={() => setLocalValue(option)}
                            className="flex items-center gap-4 px-6 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${localValue === option ? 'border-[#3b7100]' : 'border-gray-300'}`}>
                                {localValue === option && <div className="w-3 h-3 rounded-full bg-[#3b7100]"></div>}
                            </div>
                            <span className={`text-[15px] ${localValue === option ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {option}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white flex gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded text-gray-900 font-bold hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleApply} className="flex-1 py-2.5 px-4 bg-[#458500] hover:bg-[#3b7100] text-white rounded font-bold">
                        Apply ({totalResults})
                    </button>
                </div>
            </div>
        </div>
    );
}
