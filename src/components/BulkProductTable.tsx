'use client';

import { useState, useMemo } from 'react';
import Spinner from '@/components/Spinner';
import SortDropdown from '@/components/SortDropdown';

export interface ProductItem {
    _id: string;
    name: string;
    type?: string;
    price: number;
    discount?: number;
    brand?: string;
    manufacturer?: string;
    categories?: string[];
    inStock?: string;
    bestSeller?: string;
    overview?: string;
    suggestedUse?: string;
    otherIngredients?: string;
    warnings?: string;
    disclaimer?: string;
    hsn?: string;
    batchNo?: string;
    expiredOn?: string;
    images?: string[];
    specifications?: { key: string; value: string }[];
}

interface BulkProductTableProps {
    products: ProductItem[];
    isLoading: boolean;
    selectedProductIds: Set<string>;
    setSelectedProductIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedTypeFilter: string;
    setSelectedTypeFilter: (val: string) => void;
    productTypeOptions: string[];
}

export default function BulkProductTable({
    products,
    isLoading,
    selectedProductIds,
    setSelectedProductIds,
    selectedTypeFilter,
    setSelectedTypeFilter,
    productTypeOptions,
}: BulkProductTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Product Type Filter Dropdown Options (with "All Types")
    const typeFilterDropdownOptions = useMemo(() => {
        return ['All Types', ...productTypeOptions];
    }, [productTypeOptions]);

    // Helper: Extract SKU from product
    const getProductSku = (p: ProductItem): string => {
        if (!Array.isArray(p.specifications)) return '';
        const found = p.specifications.find(s => {
            const k = (s.key || '').toLowerCase().trim();
            return k.includes('sku') || k.includes('product code') || k === 'code';
        });
        return found?.value || '';
    };

    // Filtered Products by Search Query AND Product Type Filter
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Product Type Filter
            if (selectedTypeFilter !== 'All Types') {
                const targetType = selectedTypeFilter.toLowerCase().trim();
                const prodType = (p.type || '').toLowerCase().trim();
                if (prodType !== targetType) return false;
            }

            // Search Query Filter
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const sku = getProductSku(p).toLowerCase();
            const name = (p.name || '').toLowerCase();
            const brand = (p.brand || '').toLowerCase();
            const type = (p.type || '').toLowerCase();
            return sku.includes(q) || name.includes(q) || brand.includes(q) || type.includes(q);
        });
    }, [products, searchQuery, selectedTypeFilter]);

    // Handle Select All Toggle
    const isAllFilteredSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.has(p._id));

    const toggleSelectAllFiltered = () => {
        const next = new Set(selectedProductIds);
        if (isAllFilteredSelected) {
            filteredProducts.forEach(p => next.delete(p._id));
        } else {
            filteredProducts.forEach(p => next.add(p._id));
        }
        setSelectedProductIds(next);
    };

    const toggleSelectProduct = (id: string) => {
        const next = new Set(selectedProductIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedProductIds(next);
    };

    return (
        <div className="w-full lg:w-8/12 space-y-2 sm:space-y-3 lg:h-full lg:flex lg:flex-col lg:pl-2">

            {/* Search Input, Type Filter Dropdown & Selection Counter Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
                {/* Row 1 on Mobile: Product Type Filter Dropdown + Selected Pill */}
                <div className="flex items-center justify-between gap-2.5 w-full sm:w-auto">
                    <div className="w-32 sm:w-36 shrink-0">
                        <SortDropdown
                            isAdmin={true}
                            options={typeFilterDropdownOptions}
                            value={selectedTypeFilter}
                            onChange={(val) => setSelectedTypeFilter(val)}
                            className="w-full"
                            buttonClassName="w-full h-[34px] sm:h-[38px] text-xs bg-white border border-gray-200 rounded-md font-semibold hover:border-green-600 shadow-sm px-2.5"
                            menuClassName="w-full"
                            listClassName="max-h-[220px]"
                        />
                    </div>

                    {/* Selected Counter (Mobile Only - Same Row as Dropdown) */}
                    <div className="flex items-center shrink-0 sm:hidden">
                        <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-md border border-green-200">
                            {selectedProductIds.size} Select
                        </span>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by SKU, Product Name, Brand, or Type..."
                        className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-md focus:border-green-600 focus:outline-none transition-all placeholder-gray-400 h-[34px] sm:h-[38px]"
                    />
                    <svg className={`w-4 h-4 absolute left-3 top-2 sm:top-2.5 transition-colors ${searchQuery.trim() ? 'text-gray-800' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1.5 sm:top-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-0.5 transition-colors cursor-pointer"
                            title="Clear search"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Selected Counter (Desktop Only) */}
                <div className="hidden sm:flex items-center shrink-0">
                    <span className="bg-green-50 text-green-700 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-md border border-green-200">
                        {selectedProductIds.size} Select
                    </span>
                </div>
            </div>

            {/* Products Table */}
            <div className="flex-1 min-h-[300px] lg:h-full overflow-x-auto overflow-y-auto border border-gray-200 rounded-md scrollbar-thin scrollbar-thumb-gray-200">
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Spinner />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs sm:text-sm">
                        <p>No products found matching filters</p>
                    </div>
                ) : (
                    <table className="min-w-[480px] w-full text-left text-xs sm:text-sm">
                        <thead className="bg-gray-100 sticky top-0 border-b border-gray-200 z-10 text-gray-800 font-bold text-[12px]">
                            <tr>
                                <th className="py-2 sm:py-3.5 pl-1.5 sm:pl-5 pr-1.5 sm:pr-3 w-7 sm:w-12 text-center whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={isAllFilteredSelected}
                                        onChange={toggleSelectAllFiltered}
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 rounded cursor-pointer accent-green-600"
                                    />
                                </th>
                                <th className="py-2 sm:py-3.5 px-1 sm:px-3 whitespace-nowrap">SKU</th>
                                <th className="py-2 sm:py-3.5 px-2 sm:px-3 whitespace-nowrap min-w-[200px]">Product Name</th>
                                <th className="py-2 sm:py-3.5 pl-2 sm:pl-3 pr-2 sm:pr-5 text-right whitespace-nowrap">Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white border-b border-gray-200">
                            {filteredProducts.map((p) => {
                                const isSelected = selectedProductIds.has(p._id);
                                const sku = getProductSku(p) || 'N/A';

                                return (
                                    <tr
                                        key={p._id}
                                        onClick={() => toggleSelectProduct(p._id)}
                                        className={`cursor-pointer transition-colors ${isSelected
                                            ? 'bg-green-100/80 font-medium text-gray-900 hover:bg-green-100'
                                            : 'bg-white hover:bg-green-50 text-gray-800'
                                            }`}
                                    >
                                        <td className="py-2 sm:py-3.5 pl-1.5 sm:pl-5 pr-1.5 sm:pr-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectProduct(p._id)}
                                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 rounded cursor-pointer accent-green-600"
                                            />
                                        </td>
                                        <td className="py-2 sm:py-3.5 px-1 sm:px-3 text-[11px] sm:text-xs font-mono font-bold text-[#0052A5] whitespace-nowrap">
                                            {sku}
                                        </td>
                                        <td className="py-2 sm:py-3.5 px-2 sm:px-3 font-medium text-gray-900 whitespace-nowrap truncate max-w-[240px] sm:max-w-none">
                                            {p.name}
                                        </td>
                                        <td className="py-2 sm:py-3.5 pl-2 sm:pl-3 pr-2 sm:pr-5 text-right font-bold text-gray-900 shrink-0 whitespace-nowrap">
                                            ₹{p.price}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
