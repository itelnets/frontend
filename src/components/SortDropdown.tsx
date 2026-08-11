'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
    options: string[];
    value: string;
    onChange: (val: string) => void;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
    listClassName?: string;
    isAdmin?: boolean;
};

export default function SortDropdown({ options, value, onChange, className = '', buttonClassName, menuClassName, listClassName, isAdmin = false }: Props) {
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
                className={`w-full flex items-center justify-between bg-white border ${isOpen ? (isAdmin ? 'border-green-500' : 'border-[#458500]') : (isAdmin ? 'border-gray-300 hover:border-gray-400 focus:border-green-500' : 'border-gray-300 hover:border-gray-400 focus:border-[#458500]')} text-gray-800 py-1.5 sm:py-[7px] px-2 sm:px-3 rounded-lg text-[12px] sm:text-sm font-bold focus:outline-none transition-colors cursor-pointer select-none shadow-sm ${buttonClassName || 'min-w-[200px] sm:min-w-[220px]'}`}
            >
                <span className="truncate">{value}</span>
                <svg
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1.5 flex flex-col ${menuClassName || 'w-full sm:w-[240px]'}`}
                >
                    <div className={`overflow-y-auto flex-1 px-1 ${listClassName || 'max-h-[300px]'}`}>
                        {options.map((option) => {
                            const isSelected = option === value;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={`w-full text-left px-2 sm:px-3 py-1 sm:py-1.5 text-[12px] sm:text-sm transition-colors cursor-pointer block rounded-md mb-0.5 ${isSelected
                                        ? (isAdmin ? 'bg-green-600 text-white font-bold' : 'bg-[#458500] text-white font-bold')
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
