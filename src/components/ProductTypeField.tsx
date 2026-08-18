'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';

interface ProductTypeFieldProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    labelClassName?: string;
}

export default function ProductTypeField({
    value,
    onChange,
    className = '',
    labelClassName = 'block text-sm font-semibold text-gray-700 mb-2'
}: ProductTypeFieldProps) {
    const defaultPresets = ['Supplements', 'Sports', 'Bath', 'Beauty', 'Grocery', 'Home', 'Baby', 'Pets'];

    // Maintain list of custom types added during session or fetched from DB
    const [customTypes, setCustomTypes] = useState<string[]>(() => {
        if (value && !defaultPresets.includes(value)) {
            return [value];
        }
        return [];
    });

    const [isOpen, setIsOpen] = useState(false);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTypeInput, setNewTypeInput] = useState('');

    // Inline edit state
    const [editingType, setEditingType] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');

    // Delete confirmation modal state
    const [deleteConfirmType, setDeleteConfirmType] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch product types from database on mount
    useEffect(() => {
        api.get('/products/types')
            .then(res => {
                if (res.data?.types && Array.isArray(res.data.types)) {
                    setCustomTypes(prev => Array.from(new Set([...prev, ...res.data.types])));
                }
            })
            .catch(() => { });
    }, []);

    // Combine presets + customTypes + current value
    const allOptions = Array.from(new Set([...defaultPresets, ...customTypes, ...(value ? [value] : [])]));

    // Sync value when loaded asynchronously (e.g. on Edit Product page)
    useEffect(() => {
        if (!value) return;
        const matchedPreset = defaultPresets.find(p => p.toLowerCase() === value.toLowerCase());
        if (matchedPreset) {
            if (matchedPreset !== value) {
                onChange(matchedPreset);
            }
        } else if (!customTypes.includes(value)) {
            setCustomTypes(prev => [...prev, value]);
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsAddingNew(false);
                setEditingType(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveNewType = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newTypeInput.trim();
        if (trimmed) {
            if (!customTypes.includes(trimmed)) {
                setCustomTypes(prev => [...prev, trimmed]);
            }
            onChange(trimmed);
            setNewTypeInput('');
            setIsAddingNew(false);
            setIsOpen(false);
            try {
                await api.post('/products/types', { name: trimmed });
                toast.success(`Page added successfully`);
            } catch (err) {
                // Silently handle if already exists
            }
        }
    };

    const handleStartEdit = (e: React.MouseEvent, opt: string) => {
        e.stopPropagation();
        setEditingType(opt);
        setEditingValue(opt);
    };

    const handleSaveEdit = async () => {
        if (!editingType) return;
        const trimmed = editingValue.trim();
        if (trimmed && trimmed !== editingType) {
            try {
                await api.put('/products/types', { oldName: editingType, newName: trimmed });
                setCustomTypes(prev => prev.map(t => t.toLowerCase() === editingType.toLowerCase() ? trimmed : t));
                if (value.toLowerCase() === editingType.toLowerCase()) {
                    onChange(trimmed);
                }
                toast.success(`Product type renamed to '${trimmed}'`);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to rename product type');
            }
        }
        setEditingType(null);
    };

    const handleStartDelete = (e: React.MouseEvent, opt: string) => {
        e.stopPropagation();
        setDeleteConfirmType(opt);
        setIsOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmType) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/products/types/${encodeURIComponent(deleteConfirmType)}`);
            setCustomTypes(prev => prev.filter(t => t.toLowerCase() !== deleteConfirmType.toLowerCase()));
            if (value.toLowerCase() === deleteConfirmType.toLowerCase()) {
                onChange('');
            }
            toast.success(res.data?.message || `Product type '${deleteConfirmType}' deleted`);
            setDeleteConfirmType(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete product type');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className={`relative select-none ${className}`} ref={dropdownRef}>
                <label className={labelClassName}>Product Type</label>

                {/* Dropdown Display Box */}
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setIsAddingNew(false);
                        setEditingType(null);
                    }}
                    className="flex cursor-pointer items-center justify-between w-full border border-gray-300 text-gray-700 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-green-600 transition-colors h-[38px]"
                >
                    <span className="truncate">{value || 'Select Product Type'}</span>
                    <svg className={`flex-shrink-0 w-4 h-4 ml-2 text-green-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown Menu Container */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 animate-in fade-in duration-100">
                        {!isAddingNew ? (
                            <div className="max-h-60 overflow-y-auto py-1">
                                {/* TOP ITEM: Add New Type */}
                                <button
                                    type="button"
                                    onClick={() => setIsAddingNew(true)}
                                    className="w-full cursor-pointer text-left px-4 py-2 text-sm font-bold text-green-600 hover:bg-green-50 flex items-center gap-1.5 border-b border-gray-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Type
                                </button>

                                {/* Options List with Edit & Delete Action Icons */}
                                {allOptions.map((opt) => {
                                    const isEditing = editingType === opt;
                                    const isSelected = value && value.toLowerCase() === opt.toLowerCase();

                                    if (isEditing) {
                                        return (
                                            <div key={opt} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50/70 border-y border-green-100">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleSaveEdit();
                                                        }
                                                    }}
                                                    className="flex-1 px-2 py-1 text-xs bg-white border border-green-300 rounded focus:outline-none focus:border-green-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSaveEdit}
                                                    className="p-1 text-green-700 hover:bg-green-200 rounded cursor-pointer"
                                                    title="Save Name"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingType(null)}
                                                    className="p-1 text-gray-500 hover:bg-gray-200 rounded cursor-pointer"
                                                    title="Cancel"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={opt}
                                            onClick={() => {
                                                onChange(opt);
                                                setIsOpen(false);
                                            }}
                                            className={`group flex items-center justify-between w-full px-4 py-2 text-sm transition-colors cursor-pointer ${isSelected
                                                ? 'bg-green-600 text-white font-semibold'
                                                : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                                }`}
                                        >
                                            <span className="truncate flex-1 pr-2">{opt}</span>

                                            {/* Action Icons: Edit & Delete */}
                                            <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleStartEdit(e, opt)}
                                                    className={`inline-flex items-center justify-center p-1 rounded transition-colors cursor-pointer ${isSelected
                                                        ? 'text-white bg-green-700 hover:bg-green-800'
                                                        : 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                                                        }`}
                                                    title={`Edit ${opt}`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleStartDelete(e, opt)}
                                                    className={`inline-flex items-center justify-center p-1 rounded transition-colors cursor-pointer ${isSelected
                                                        ? 'text-white bg-red-500 hover:bg-red-700'
                                                        : 'text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700'
                                                        }`}
                                                    title={`Delete ${opt}`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Inline container inside dropdown menu for entering custom type */
                            <div className="p-3 bg-gray-50/80 space-y-2 border-t border-gray-100">
                                <span className="block text-xs font-bold text-gray-700">Add Custom Product Type</span>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newTypeInput}
                                    onChange={(e) => setNewTypeInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSaveNewType();
                                        }
                                    }}
                                    placeholder="Enter type name..."
                                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-green-600"
                                />
                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingNew(false);
                                            setNewTypeInput('');
                                        }}
                                        className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveNewType()}
                                        disabled={!newTypeInput.trim()}
                                        className="px-3 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded transition-colors cursor-pointer shadow-xs"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Popup Modal */}
            {deleteConfirmType && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-gray-100 space-y-3.5 animate-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Delete page "{deleteConfirmType}"?</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteConfirmType}"</span>?
                                    <br />
                                    <span className="text-red-600 font-semibold block mt-1">
                                        This will permanently delete all associated products with this page.
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmType(null)}
                                className="px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-md transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-xs cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                    </div>
                                ) : (
                                    'Delete page'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
