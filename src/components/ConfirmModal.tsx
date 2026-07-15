'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Spinner from '@/components/Spinner';

type ConfirmModalProps = {
    isOpen: boolean;
    title: string;
    description: string;
    onCancel: () => void;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    isLoading?: boolean;
    icon?: ReactNode;
    className?: string;
};

export default function ConfirmModal({
    isOpen,
    title,
    description,
    onCancel,
    onConfirm,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    isLoading = false,
    icon,
    className = '',
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-lg p-6 max-w-sm w-full shadow-xl ${className}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        {icon && <div className="rounded-full bg-gray-100 p-2">{icon}</div>}
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-sm text-gray-700 mb-6">{description}</p>
                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2 bg-[#d14b45] hover:bg-[#b03f39] text-white font-bold rounded transition-colors cursor-pointer text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <Spinner className="w-5 h-5 text-white" /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
