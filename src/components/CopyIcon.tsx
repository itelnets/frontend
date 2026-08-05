'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface CopyIconProps {
    text: string;
    label: string;
}

export default function CopyIcon({ text, label }: CopyIconProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div onClick={handleCopy} className="inline ml-1.5 cursor-pointer flex-shrink-0">
            {copied ? (
                <svg className="w-[18px] h-[18px] text-green-600 inline transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            ) : (
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 inline transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
            )}
        </div>
    );
}
