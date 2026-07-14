'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
    value: number;
    onChange: (qty: number) => void;
    max?: number;
    className?: string;
};

export default function QuantityDropdown({ value, onChange, max = 10, className = '' }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = Array.from({ length: max + 1 }, (_, i) => i); // 0 to max (e.g. 0 to 10)

    const handleSelect = (qty: number) => {
        onChange(qty);
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between bg-white border border-gray-300 text-gray-800 py-1.5 pl-4 pr-3.5 rounded-full text-sm font-bold min-w-[72px] focus:outline-none hover:border-gray-400 transition-colors cursor-pointer select-none"
            >
                <span>{value}</span>
                <svg
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ml-1.5 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Custom Dropdown List */}
            {isOpen && (
                <div 
                    className="absolute left-0 mt-1 w-[72px] bg-white border border-gray-200 rounded-[14px] shadow-lg z-50 py-1.5 flex flex-col"
                    style={{ maxHeight: '200px' }}
                >
                    {/* Scroll Container with thin scrollbar */}
                    <div 
                        className="overflow-y-auto flex-1 px-1 custom-thin-scrollbar"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#d1d5db transparent'
                        }}
                    >
                        <style jsx global>{`
                            .custom-thin-scrollbar::-webkit-scrollbar {
                                width: 4px;
                            }
                            .custom-thin-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .custom-thin-scrollbar::-webkit-scrollbar-thumb {
                                background-color: #cbd5e1;
                                border-radius: 9999px;
                            }
                            .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {
                                background-color: #94a3b8;
                            }
                        `}</style>

                        {options.map((option) => {
                            const isSelected = option === value;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full text-center py-2 text-sm font-medium rounded-[10px] transition-colors cursor-pointer block mb-0.5 ${
                                        isSelected 
                                            ? 'bg-[#e2f0d9] text-[#458500] font-bold' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
