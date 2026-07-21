'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '@/services/product';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    totalResults: number;
    initialView?: ViewState;
    availableBrands: string[];
    filters: any;
    setFilters: (f: any) => void;
};

type ViewState = 'main' | 'brands' | 'ratings' | 'price';

const AccordionItem = ({ title, activeValue, children, hasToggle = false, isToggled = false, onToggle }: { title: string, activeValue?: string, children?: React.ReactNode, hasToggle?: boolean, isToggled?: boolean, onToggle?: () => void }) => {
    const [expanded, setExpanded] = useState(false);

    if (hasToggle) {
        return (
            <div className="flex items-center justify-between py-4 border-b border-gray-200 px-4">
                <span className="text-gray-900 font-bold">{title}</span>
                <button
                    onClick={onToggle}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${isToggled ? 'bg-[#458500]' : 'bg-gray-400'}`}
                >
                    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${isToggled ? 'translate-x-5' : ''}`} />
                </button>
            </div>
        );
    }

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-4 px-4 bg-white hover:bg-gray-50"
            >
                <span className="text-gray-900 font-bold">{title}</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {expanded ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    )}
                </svg>
            </button>
            {expanded && children && (
                <div className="bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function MobileFilterDrawer({ isOpen, onClose, totalResults, initialView = 'main', availableBrands, filters, setFilters }: Props) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [brandSearch, setBrandSearch] = useState('');
    const [localTotal, setLocalTotal] = useState(totalResults);
    const [isFetchingCount, setIsFetchingCount] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
            setLocalTotal(totalResults);
        }
    }, [isOpen, filters, totalResults]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchLocalCount = async () => {
            setIsFetchingCount(true);
            try {
                const params = {
                    inStock: localFilters.inStock ? 'true' : undefined,
                    brand: localFilters.brands.length > 0 ? localFilters.brands.join('|') : undefined,
                    priceRanges: localFilters.price.length > 0 ? localFilters.price.join('|') : undefined,
                    ratings: localFilters.rating.length > 0 ? localFilters.rating.join('|') : undefined
                };
                const { data } = await getProducts(params);
                setLocalTotal(data.length);
            } catch (error) {
                console.error('Failed to fetch filter count', error);
            } finally {
                setIsFetchingCount(false);
            }
        };

        const timer = setTimeout(fetchLocalCount, 300);
        return () => clearTimeout(timer);
    }, [localFilters, isOpen]);

    if (!isOpen) return null;

    const renderBrandsContent = () => {
        const filteredBrands = availableBrands.filter(brand => brand.toLowerCase().includes(brandSearch.toLowerCase()));
        return (
            <div className="flex flex-col gap-4 pt-4 px-4 pb-4 max-h-[60vh] overflow-y-auto">
                <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Find a brand"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#458500]"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                    />
                </div>
                <div className="space-y-5 mt-2">
                    {filteredBrands.length === 0 && (
                        <div className="text-gray-500 text-sm py-2">No brands found.</div>
                    )}
                    {filteredBrands.map(brand => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-[#458500] focus:ring-[#458500] accent-[#458500]"
                                checked={localFilters.brands.includes(brand)}
                                onChange={(e) => {
                                    const newBrands = e.target.checked
                                        ? [...localFilters.brands, brand]
                                        : localFilters.brands.filter((b: string) => b !== brand);
                                    setLocalFilters({ ...localFilters, brands: newBrands });
                                }}
                            />
                            <span className="text-gray-900 font-medium">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    const renderRatingsContent = () => (
        <div className="p-4 space-y-6">
            {['4 Stars & Up', '3 Stars & Up'].map((ratingOption, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="mobile-rating"
                        className="w-5 h-5 border-gray-300 rounded text-[#458500] focus:ring-[#458500] accent-[#458500]"
                        checked={localFilters.rating.includes(ratingOption)}
                        onChange={(e) => {
                            const newRating = e.target.checked
                                ? [...localFilters.rating, ratingOption]
                                : localFilters.rating.filter((r: string) => r !== ratingOption);
                            setLocalFilters({ ...localFilters, rating: newRating });
                        }}
                    />
                    <span className="text-gray-600 font-medium ml-1">{ratingOption}</span>
                </label>
            ))}
        </div>
    );

    const renderPriceContent = () => (
        <div className="p-4 space-y-6">
            {['Under ₹500', '₹500 - ₹1,000', 'Over ₹1,000'].map(priceOption => (
                <label key={priceOption} className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        name="mobile-price"
                        className="w-5 h-5 rounded border-gray-300 text-[#458500] focus:ring-[#458500] accent-[#458500]"
                        checked={localFilters.price.includes(priceOption)}
                        onChange={(e) => {
                            const newPrice = e.target.checked
                                ? [...localFilters.price, priceOption]
                                : localFilters.price.filter((p: string) => p !== priceOption);
                            setLocalFilters({ ...localFilters, price: newPrice });
                        }}
                    />
                    <span className="text-gray-900 font-medium">{priceOption}</span>
                </label>
            ))}
        </div>
    );

    // AccordionItem removed from here

    const activeCount = localFilters.brands.length + (localFilters.inStock ? 1 : 0) + localFilters.price.length + localFilters.rating.length;

    return (
        <div className="fixed inset-0 z-[300] flex flex-col lg:hidden">
            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slideUp 0.3s ease-out forwards;
                }
            `}</style>

            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

            {/* Bottom Sheet Drawer */}
            <div className="relative w-full h-[85vh] mt-auto bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col rounded-t-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                {initialView === 'main' ? (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
                        <h2 className="text-xl font-bold text-gray-900">Filter & Sort</h2>
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-4 border-b border-gray-200 shrink-0 relative">
                        <h2 className="text-lg font-bold text-gray-900 capitalize">{initialView}</h2>
                        <button onClick={onClose} className="absolute right-4 p-2 -mr-2 text-gray-500 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {initialView === 'main' && (
                        <>
                            {/* Popular Filters */}
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Popular filters</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button className="px-3 py-1.5 border border-gray-300 rounded-full text-sm text-gray-700 bg-white hover:bg-gray-50">Sport Certified</button>
                                    <button
                                        onClick={() => setLocalFilters({ ...localFilters, inStock: !localFilters.inStock })}
                                        className={`px-3 py-1.5 border rounded-full text-sm font-medium transition-colors ${localFilters.inStock ? 'bg-green-50 border-[#458500] text-[#458500]' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                                    >
                                        In stock
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-b border-gray-200 px-4">
                                <span className="text-gray-900 font-bold">Show available only</span>
                                <button
                                    onClick={() => setLocalFilters({ ...localFilters, inStock: !localFilters.inStock })}
                                    className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${localFilters.inStock ? 'bg-[#458500]' : 'bg-gray-400'}`}
                                >
                                    <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${localFilters.inStock ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            <AccordionItem title="Brands" activeValue={localFilters.brands.length > 0 ? localFilters.brands.join(', ') : undefined}>
                                {renderBrandsContent()}
                            </AccordionItem>
                            <AccordionItem title="Ratings" activeValue={localFilters.rating.length > 0 ? localFilters.rating.join(', ') : undefined}>
                                {renderRatingsContent()}
                            </AccordionItem>
                            <AccordionItem title="Price" activeValue={localFilters.price.length > 0 ? localFilters.price.join(', ') : undefined}>
                                {renderPriceContent()}
                            </AccordionItem>
                            <AccordionItem title="Special offers" />
                            <AccordionItem title="Weight" />
                            <AccordionItem title="Help With" />
                        </>
                    )}

                    {initialView === 'brands' && renderBrandsContent()}
                    {initialView === 'ratings' && renderRatingsContent()}
                    {initialView === 'price' && renderPriceContent()}
                </div>

                {/* Active Filters Bar */}
                {(localFilters.inStock || localFilters.price.length > 0 || localFilters.rating.length > 0 || localFilters.brands.length > 0) && (
                    <div className="border-t border-gray-200 p-3 bg-white shrink-0">
                        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                            {localFilters.inStock && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#458500] text-[#458500] rounded-full text-sm font-medium whitespace-nowrap shrink-0 bg-white">
                                    In Stock
                                    <button onClick={() => setLocalFilters({ ...localFilters, inStock: false })} className="p-0.5 hover:bg-green-50 rounded-full transition-colors flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}
                            {localFilters.price.map((p: string) => (
                                <div key={p} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#458500] text-[#458500] rounded-full text-sm font-medium whitespace-nowrap shrink-0 bg-white">
                                    {p}
                                    <button onClick={() => setLocalFilters({ ...localFilters, price: localFilters.price.filter((item: string) => item !== p) })} className="p-0.5 hover:bg-green-50 rounded-full transition-colors flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            {localFilters.rating.map((r: string) => (
                                <div key={r} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#458500] text-[#458500] rounded-full text-sm font-medium whitespace-nowrap shrink-0 bg-white">
                                    {r}
                                    <button onClick={() => setLocalFilters({ ...localFilters, rating: localFilters.rating.filter((item: string) => item !== r) })} className="p-0.5 hover:bg-green-50 rounded-full transition-colors flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            {localFilters.brands.map((brand: string) => (
                                <div key={brand} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#458500] text-[#458500] rounded-full text-sm font-medium whitespace-nowrap shrink-0 bg-white">
                                    {brand}
                                    <button onClick={() => setLocalFilters({ ...localFilters, brands: localFilters.brands.filter((b: string) => b !== brand) })} className="p-0.5 hover:bg-green-50 rounded-full transition-colors flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-white flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded text-gray-900 font-bold hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { setFilters(localFilters); onClose(); }}
                        className="flex-1 py-2.5 px-4 bg-[#458500] hover:bg-[#3b7100] text-white rounded font-bold"
                    >
                        Apply {`( ${localTotal} )`}
                    </button>
                </div>
            </div>
        </div>
    );
}
