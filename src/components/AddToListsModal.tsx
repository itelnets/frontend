'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '@/context/CartContext';

type Props = {
    product: any;
    isOpen: boolean;
    isAlreadyAdded?: boolean;
    onClose: () => void;
    onAdded: () => void;
    onRemoved: () => void;
};

export default function AddToListsModal({ product, isOpen, isAlreadyAdded, onClose, onAdded, onRemoved }: Props) {
    const { myLists, moveToList, removeFromList } = useCart();
    const [mounted, setMounted] = useState(false);
    const [myListChecked, setMyListChecked] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // When modal opens, pre-check My List if already added
    useEffect(() => {
        if (isOpen) {
            setMyListChecked(!!isAlreadyAdded);
        }
    }, [isOpen, isAlreadyAdded]);

    const handleDone = () => {
        if (myListChecked && !isAlreadyAdded) {
            // User checked → add to list
            moveToList(product);
            onAdded();
        } else if (!myListChecked && isAlreadyAdded) {
            // User unchecked → remove from list
            removeFromList(product?._id);
            onRemoved();
        } else if (myListChecked && isAlreadyAdded) {
            // Already added and still checked → just mark added
            onAdded();
        }
        onClose();
    };

    if (!mounted || !isOpen) return null;

    const modal = (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg p-6 w-[90%] max-w-[420px] shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-gray-900 text-lg">Add to Lists</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* My List row */}
                <div className="mb-4">
                    <label className="flex items-center gap-3 py-3 border-b border-gray-100 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-green-600 rounded cursor-pointer"
                            checked={myListChecked}
                            onChange={() => setMyListChecked(prev => !prev)}
                        />
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm text-gray-800">My List ({myLists.length})</span>
                    </label>
                </div>

                {/* Done button */}
                <button
                    onClick={handleDone}
                    className="w-full bg-[#458500] hover:bg-[#366800] text-white font-bold py-3 rounded-md transition-colors cursor-pointer"
                >
                    Done
                </button>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
