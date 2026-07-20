'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    className?: string;
};

export default function SortDropdown({ options, value, onChange, className = '' }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 text-gray-800 py-[7px] pl-4 pr-3 rounded-full text-sm font-bold min-w-[200px] sm:min-w-[220px] focus:outline-none hover:border-[#007185] transition-colors cursor-pointer select-none shadow-sm"
            >
                <span className="truncate">{value}</span>
                <svg
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-1 w-full sm:w-[240px] bg-white border border-gray-200 rounded-[14px] shadow-lg z-50 py-1.5 flex flex-col"
                >
                    <div className="overflow-y-auto flex-1 px-1 custom-thin-scrollbar max-h-[300px]">
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
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer block rounded-[10px] mb-0.5 ${isSelected
                                        ? 'bg-[#e2f0d9] text-[#458500] font-bold'
                                        : 'text-gray-700 hover:bg-gray-100 font-medium'
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
