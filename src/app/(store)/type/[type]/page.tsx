'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/services/product';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import SortDropdown from '@/components/SortDropdown';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import MobileSortDrawer from '@/components/MobileSortDrawer';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    images: string[];
}

import { useParams } from 'next/navigation';

export default function TypeProductsPage() {
    const { type: paramsType } = useParams<{ type: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOption, setSortOption] = useState('Featured');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [mobileFilterView, setMobileFilterView] = useState<'main' | 'brands' | 'ratings' | 'price'>('main');
    const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        inStock: false,
        brands: [] as string[],
        price: [] as string[],
        rating: [] as string[]
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const brand = params.get('brand');
            if (brand) {
                setFilters(prev => ({ ...prev, brands: [brand] }));
            }
            const sort = params.get('sort');
            if (sort) {
                setSortOption(sort);
            }
        }
    }, []);

    const handleSortChange = (newSort: string) => {
        setSortOption(newSort);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (newSort && newSort !== 'Featured') {
                url.searchParams.set('sort', newSort);
            } else {
                url.searchParams.delete('sort');
            }
            window.history.replaceState({}, '', url.toString());
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const typeRaw = decodeURIComponent(paramsType);
                const typeFormatted = typeRaw.charAt(0).toLowerCase() + typeRaw.slice(1);

                let minPrice: number | undefined = undefined;
                let maxPrice: number | undefined = undefined;

                if (filters.price.length > 0) {
                    const minValues = filters.price.map(p => {
                        if (p === '₹0 - ₹500') return 0;
                        if (p === '₹500 - ₹1,000') return 500;
                        if (p === '₹1,000 - ₹2,000') return 1000;
                        if (p === '₹2,000 - ₹3,000') return 2000;
                        if (p === '₹3,000+') return 3000;
                        return 0;
                    });
                    const maxValues = filters.price.map(p => {
                        if (p === '₹0 - ₹500') return 500;
                        if (p === '₹500 - ₹1,000') return 1000;
                        if (p === '₹1,000 - ₹2,000') return 2000;
                        if (p === '₹2,000 - ₹3,000') return 3000;
                        if (p === '₹3,000+') return 999999;
                        return 999999;
                    });
                    minPrice = Math.min(...minValues);
                    const computedMax = Math.max(...maxValues);
                    maxPrice = computedMax === 999999 ? undefined : computedMax;
                }

                const cleanRatings = filters.rating.map(r => parseInt(r.charAt(0))).filter(n => !isNaN(n)).join(',');

                const params: any = {
                    type: typeFormatted,
                    sort: sortOption !== 'Featured' ? sortOption : undefined,
                    inStock: filters.inStock ? 'true' : undefined,
                    brand: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
                    ratings: cleanRatings || undefined,
                    includeFilters: availableBrands.length === 0
                };

                if (minPrice !== undefined) params.minPrice = minPrice;
                if (maxPrice !== undefined) params.maxPrice = maxPrice;

                const { data } = await getProducts(params);

                if (data.filters && data.filters.brands) {
                    setAvailableBrands(data.filters.brands);
                }

                setProducts(data.products || data);
            } catch (error) {
                console.error('Failed to fetch products', error);
                toast.error('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [filters, sortOption]);


    return (
        <div className="flex-1 bg-gray-50 py-2.5 sm:py-5 px-2.5 sm:px-4 lg:px-5 flex flex-col">
            <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 relative">
                {/* Left Sidebar (Filters - Desktop) */}
                <div className="hidden lg:block w-56 shrink-0 bg-white p-5 rounded-xl border border-gray-200 h-fit self-start sticky top-[175px] shadow-sm max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
                    <h2 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">Filters</h2>

                    <div className="mb-6">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="font-semibold text-sm text-gray-800 group-hover:text-[#458500] transition-colors">In Stock</span>
                            <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${filters.inStock ? 'bg-[#458500]' : 'bg-gray-400'}`}>
                                <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${filters.inStock ? 'translate-x-5' : ''}`} />
                            </div>
                            <input type="checkbox" className="hidden accent-[#458500]" checked={filters.inStock} onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })} />
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
                                            setFilters({ ...filters, brands: newBrands });
                                        }}
                                    />
                                    <div className="flex-1 flex justify-between items-start leading-snug group-hover:text-[#458500] transition-colors">
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
                                            setFilters({ ...filters, price: newPrice });
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
                                                setFilters({ ...filters, rating: newRating });
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
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">

                    {/* Mobile Quick Filters Bar */}
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
                            onClick={() => setFilters({ ...filters, inStock: !filters.inStock })}
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

                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 mb-4 sm:mb-6 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm mt-1 sm:mt-0">
                        {/* Desktop Header */}
                        <div className="hidden sm:block">
                            <h1 className="text-[18px] sm:text-[20px] text-gray-900 font-bold capitalize">
                                {decodeURIComponent(paramsType)} <span className="text-gray-500 font-normal text-[18px] sm:text-[20px]">({products.length})</span>
                            </h1>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-sm mt-4 sm:mt-0">
                            <label className="text-gray-600 whitespace-nowrap">Sort by:</label>
                            <SortDropdown
                                options={['Featured', 'Best sellers', 'Top Rated', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Heaviest', 'Lightest', 'Highest Discount']}
                                value={sortOption}
                                onChange={handleSortChange}
                                className="w-auto z-[90]"
                                buttonClassName="!w-[170px] !min-w-[170px]"
                                menuClassName="!w-[170px] !min-w-[170px] [&>div]:!max-h-[200px]"
                            />
                        </div>

                        {/* Mobile Header */}
                        <div className="sm:hidden flex items-center justify-between w-full px-1">
                            <div className="text-sm font-medium text-gray-600">
                                {products.length.toLocaleString()} results
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

                    <div className={`transition-opacity duration-200 ${isLoading && products.length > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2 sm:gap-3">
                            {products.map((product) => (
                                <div key={product._id} className="h-full">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {!isLoading && products.length === 0 && (
                            <div className="flex flex-col items-center justify-center w-full py-16 sm:py-24 text-center px-4 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13.5l1.5-1.5m0 0l1.5-1.5m-1.5 1.5l-1.5-1.5m1.5 1.5l1.5 1.5" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-sm sm:text-base text-gray-500 max-w-sm">
                                    We couldn't find any products matching your current filters. Try adjusting your search criteria to find what you're looking for.
                                </p>
                                <button
                                    onClick={() => setFilters({ inStock: false, brands: [], price: [], rating: [] })}
                                    className="mt-6 px-6 py-2.5 bg-[#458500] text-white font-medium rounded-lg hover:bg-[#366800] transition-colors shadow-sm text-sm"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MobileFilterDrawer
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                totalResults={products.length}
                initialView={mobileFilterView}
                availableBrands={availableBrands}
                filters={filters}
                setFilters={setFilters}
            />

            <MobileSortDrawer
                isOpen={isMobileSortOpen}
                onClose={() => setIsMobileSortOpen(false)}
                options={['Featured', 'Best sellers', 'Top Rated', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Heaviest', 'Lightest', 'Highest Discount']}
                value={sortOption}
                onChange={handleSortChange}
                totalResults={products.length}
            />
        </div>
    );
}
