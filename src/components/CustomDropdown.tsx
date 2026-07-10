'use client';

import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function CustomDropdown({ 
    options, 
    value, 
    onChange, 
    placeholder = 'Select...', 
    className = 'w-48' 
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative select-none ${className}`} ref={dropdownRef}>
            <button 
                type="button"
                draggable={false}
                onClick={() => setIsOpen(!isOpen)}
                className="flex cursor-pointer items-center justify-between w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-green-600 transition-colors"
            >
                <span className="truncate">{displayLabel}</span>
                <svg className={`flex-shrink-0 w-4 h-4 ml-2 text-green-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-full min-w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((option) => (
                            <button 
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)} 
                                className={`w-full cursor-pointer text-left px-4 py-2 text-sm transition-colors ${
                                    value === option.value 
                                        ? 'bg-green-600 text-white font-semibold' 
                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
