'use client';

import React from 'react';
import Image from 'next/image';
import { BannerItem } from '@/services/banner';
import ProductCard from '@/components/ProductCard';
import SortDropdown from '@/components/SortDropdown';
import { Product, FilterState, SORT_OPTIONS, PRODUCT_TYPES } from './constants';

export function DealsHeroBanner({
    banner,
    pageTitle,
    pageSubtitle,
    isBannerLoading
}: {
    banner: BannerItem | null;
    pageTitle: string;
    pageSubtitle: string;
    isBannerLoading?: boolean;
}) {
    if (isBannerLoading) {
        return (
            <div className="w-full aspect-[1368/260] bg-gray-100 animate-pulse rounded-md sm:rounded-2xl relative overflow-hidden" />
        );
    }

    return (
        <div className="w-full aspect-[1368/260] rounded-md sm:rounded-2xl overflow-hidden relative">
            {banner?.imageUrl ? (
                <Image
                    src={banner.imageUrl}
                    alt={pageTitle}
                    fill
                    priority
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        {pageTitle}
                    </h2>
                    <p className="text-xs sm:text-base text-gray-700 mt-1 sm:mt-2 font-semibold">
                        {pageSubtitle}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        May not be combined with other offers. Limited time only.
                    </p>
                </div>
            )}
        </div>
    );
}

export function DealsTypeCategories({ selectedType, onSelectType }: { selectedType: string; onSelectType: (type: string) => void }) {
    return (
        <div className="w-full overflow-x-auto scrollbar-none px-2.5 sm:px-4 pt-1.5 sm:pt-3 pb-1.5 lg:pb-3">
            <div className="flex items-center justify-start md:justify-center gap-3 md:gap-4 lg:gap-5 min-w-max mx-auto">
                {PRODUCT_TYPES.map((pt) => {
                    const isSelected = selectedType.toLowerCase() === pt.type.toLowerCase();
                    return (
                        <button
                            key={pt.id}
                            onClick={() => onSelectType(isSelected ? '' : pt.type)}
                            className="flex flex-col items-center gap-1 sm:gap-2 group cursor-pointer shrink-0 transition-transform active:scale-95"
                        >
                            <div
                                className={`w-14 h-14 sm:w-20 sm:h-20 xl:w-24 xl:h-24 rounded-full flex items-center justify-center transition-all ${isSelected
                                    ? 'bg-[#f0f5f0] border-2 border-[#12592d] text-[#12592d] shadow-xs'
                                    : 'bg-[#f4f7f4] border border-transparent text-[#12592d] group-hover:bg-[#e6efe6] group-hover:border-[#12592d]/20'
                                    }`}
                            >
                                {pt.icon}
                            </div>
                            <span
                                className={`text-[11px] md:text-[13px] lg:text-[14px] tracking-tight text-center max-w-[85px] sm:max-w-[105px] truncate ${isSelected ? 'text-[#12592d] font-bold' : 'text-gray-700 font-medium group-hover:text-[#12592d]'
                                    }`}
                            >
                                {pt.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function DealsSidebarFilters({
    filters,
    setFilters,
    availableBrands
}: {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    availableBrands: string[];
}) {
    return (
        <div className="hidden lg:block w-56 shrink-0 bg-white p-5 rounded-xl border border-gray-200 h-fit self-start sticky top-[175px] shadow-sm max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
            <h2 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">Filters</h2>

            <div className="mb-6">
                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="font-semibold text-sm text-gray-800 group-hover:text-[#458500] transition-colors">In Stock</span>
                    <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${filters.inStock ? 'bg-[#458500]' : 'bg-gray-400'}`}>
                        <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${filters.inStock ? 'translate-x-5' : ''}`} />
                    </div>
                    <input
                        type="checkbox"
                        className="hidden accent-[#458500]"
                        checked={filters.inStock}
                        onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                    />
                </label>
            </div>

            <div className="mb-3 border-t border-gray-100 pt-2">
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Brands</h3>
                <div className="space-y-2.5 text-sm text-gray-600 max-h-48 overflow-y-auto scrollbar-thin">
                    {availableBrands.map(brand => (
                        <label key={brand} className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="rounded text-[#458500] focus:ring-[#458500] accent-[#458500] w-4 h-4 cursor-pointer mt-0.5"
                                checked={filters.brands.includes(brand)}
                                onChange={(e) => {
                                    const newBrands = e.target.checked
                                        ? [...filters.brands, brand]
                                        : filters.brands.filter(b => b !== brand);
                                    setFilters(prev => ({ ...prev, brands: newBrands }));
                                }}
                            />
                            <div className="flex-1 flex justify-between items-start leading-snug">
                                <span className="pr-2">{brand}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-3 border-t border-gray-100 pt-2">
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Price</h3>
                <div className="space-y-2.5 text-sm text-gray-600">
                    {['₹0 - ₹500', '₹500 - ₹1,000', '₹1,000 - ₹2,000', '₹2,000 - ₹3,000', '₹3,000+'].map(priceOption => (
                        <label key={priceOption} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="price"
                                className="text-[#458500] focus:ring-[#458500] rounded accent-[#458500] w-4 h-4 cursor-pointer border-gray-300"
                                checked={filters.price.includes(priceOption)}
                                onChange={(e) => {
                                    const newPrice = e.target.checked
                                        ? [...filters.price, priceOption]
                                        : filters.price.filter(p => p !== priceOption);
                                    setFilters(prev => ({ ...prev, price: newPrice }));
                                }}
                            /> {priceOption}
                        </label>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Ratings</h3>
                <div className="space-y-2.5 text-sm text-gray-600">
                    {['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'].map(ratingOption => {
                        const stars = parseInt(ratingOption.charAt(0)) || 0;
                        return (
                            <label key={ratingOption} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rating"
                                    className="text-[#458500] focus:ring-[#458500] rounded accent-[#458500] w-4 h-4 cursor-pointer border-gray-300"
                                    checked={filters.rating.includes(ratingOption)}
                                    onChange={(e) => {
                                        const newRating = e.target.checked
                                            ? [...filters.rating, ratingOption]
                                            : filters.rating.filter(r => r !== ratingOption);
                                        setFilters(prev => ({ ...prev, rating: newRating }));
                                    }}
                                />
                                <div className="flex items-center gap-1">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <svg key={i} className={`w-4 h-4 ${i <= stars ? 'text-[#f5a623] fill-current' : 'text-gray-300 stroke-current fill-transparent'}`} viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        ))}
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export function DealsHeaderBar({
    pageTitle,
    productsCount,
    filters,
    setFilters,
    sortOption,
    setSortOption,
    setIsMobileFilterOpen,
    setMobileFilterView,
    setIsMobileSortOpen
}: {
    pageTitle: string;
    productsCount: number;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    sortOption: string;
    setSortOption: (option: string) => void;
    setIsMobileFilterOpen: (open: boolean) => void;
    setMobileFilterView: (view: 'main' | 'brands' | 'ratings' | 'price') => void;
    setIsMobileSortOpen: (open: boolean) => void;
}) {
    return (
        <>
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-4 sm:mb-2">
                {(() => {
                    const activeCount = filters.brands.length + (filters.inStock ? 1 : 0) + filters.price.length + filters.rating.length;
                    return (
                        <button
                            onClick={() => { setMobileFilterView('main'); setIsMobileFilterOpen(true); }}
                            className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm font-bold whitespace-nowrap shrink-0 shadow-sm transition-colors ${activeCount > 0 ? 'bg-green-50 border-[#458500] text-[#458500]' : 'bg-white border-gray-300 text-gray-800'}`}
                        >
                            {activeCount > 0 && (
                                <div className="w-5 h-5 bg-[#458500] text-white rounded-full flex items-center justify-center text-xs">
                                    {activeCount}
                                </div>
                            )}
                            <svg className={`w-4 h-4 ${activeCount > 0 ? 'text-[#458500]' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Filters
                        </button>
                    );
                })()}
                <button
                    onClick={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
                    className={`px-3 py-1.5 border rounded-full text-sm flex items-center gap-1 whitespace-nowrap shrink-0 shadow-sm transition-colors ${filters.inStock ? 'bg-green-50 border-[#458500] text-[#458500] font-medium' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    In stock
                </button>
                <button
                    onClick={() => { setMobileFilterView('brands'); setIsMobileFilterOpen(true); }}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 flex items-center gap-1 whitespace-nowrap shrink-0 hover:bg-gray-50 shadow-sm"
                >
                    Brands <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button
                    onClick={() => { setMobileFilterView('price'); setIsMobileFilterOpen(true); }}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 flex items-center gap-1 whitespace-nowrap shrink-0 hover:bg-gray-50 shadow-sm"
                >
                    Price <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button
                    onClick={() => { setMobileFilterView('ratings'); setIsMobileFilterOpen(true); }}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 flex items-center gap-1 whitespace-nowrap shrink-0 hover:bg-gray-50 shadow-sm"
                >
                    Ratings <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 mb-3 sm:mb-4 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm mt-1 sm:mt-0">
                <div className="hidden sm:block">
                    <h1 className="text-[18px] sm:text-[20px] text-gray-900 font-bold capitalize">
                        {pageTitle} <span className="text-gray-500 font-normal text-[18px] sm:text-[20px]">({productsCount})</span>
                    </h1>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-sm mt-4 sm:mt-0">
                    <label className="text-gray-600 whitespace-nowrap">Sort by:</label>
                    <SortDropdown
                        options={SORT_OPTIONS}
                        value={sortOption}
                        onChange={setSortOption}
                        className="w-auto z-[90]"
                        buttonClassName="!w-[170px] !min-w-[170px]"
                        menuClassName="!w-[170px] !min-w-[170px] [&>div]:!max-h-[200px]"
                    />
                </div>
                <div className="sm:hidden flex items-center justify-between w-full px-1">
                    <div className="text-sm font-medium text-gray-600">
                        {productsCount.toLocaleString()} results
                    </div>
                    <button
                        onClick={() => setIsMobileSortOpen(true)}
                        className="flex items-center gap-1 text-[15px] text-gray-800 hover:text-black"
                    >
                        {sortOption}
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                    </button>
                </div>
            </div>
        </>
    );
}

export function DealsProductGrid({
    isLoading,
    products,
    hasActiveFilters,
    clearAllFilters
}: {
    isLoading: boolean;
    products: Product[];
    hasActiveFilters: boolean;
    clearAllFilters: () => void;
}) {


    return (
        <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2 sm:gap-3">
                {products.map((product) => (
                    <div key={product._id} className="h-full">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {!isLoading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full min-h-[450px] sm:min-h-[480px] py-12 sm:py-20 text-center px-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-sm sm:text-base text-gray-500 max-w-sm">
                        We couldn't find any products matching your current filters. Try adjusting your search criteria to find what you're looking for.
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="mt-6 px-6 py-2.5 bg-[#458500] text-white font-medium rounded-lg hover:bg-[#366800] transition-colors shadow-sm text-sm cursor-pointer"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
