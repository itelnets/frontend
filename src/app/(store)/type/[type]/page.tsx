'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, getFilters } from '@/services/product';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import Spinner from '@/components/Spinner';
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
    const router = useRouter();
    const { type: paramsType } = useParams<{ type: string }>();
    const { myLists, moveToList, removeFromList } = useCart();
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
        }
    }, []);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const { data } = await getFilters({ type: decodeURIComponent(paramsType) });
                setAvailableBrands(data.brands || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const params = {
                    sort: sortOption !== 'Featured' ? sortOption : undefined,
                    inStock: filters.inStock ? 'true' : undefined,
                    brand: filters.brands.length > 0 ? filters.brands.join('|') : undefined,
                    priceRanges: filters.price.length > 0 ? filters.price.join('|') : undefined,
                    ratings: filters.rating.length > 0 ? filters.rating.join('|') : undefined,
                    type: decodeURIComponent(paramsType)
                };
                const { data } = await getProducts(params);
                setProducts(data);
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
    <div className="min-h-screen bg-gray-50 py-2.5 sm:py-5 px-2.5 sm:px-4 lg:px-5">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4">
            {/* Left Sidebar (Filters - Desktop) */}
            <div className="hidden lg:block w-56 shrink-0 bg-white p-5 rounded-xl border border-gray-200 h-fit sticky top-6 shadow-sm">
                <h2 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">Filters</h2>

                <div className="mb-6">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="font-semibold text-sm text-gray-800 group-hover:text-[#458500] transition-colors">In Stock</span>
                        <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${filters.inStock ? 'bg-green-600' : 'bg-gray-400'}`}>
                            <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform ${filters.inStock ? 'translate-x-5' : ''}`} />
                        </div>
                        <input type="checkbox" className="hidden accent-[#458500]" checked={filters.inStock} onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })} />
                    </label>
                </div>

                <div className="mb-6 border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-sm text-gray-800 mb-3">Brands</h3>
                    <div className="space-y-2.5 text-sm text-gray-600 max-h-60 overflow-y-auto scrollbar-thin">
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

                <div className="mb-6 border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-sm text-gray-800 mb-3">Price Range</h3>
                    <div className="space-y-2.5 text-sm text-gray-600">
                        {['Under ₹500', '₹500 - ₹1,000', 'Over ₹1,000'].map(priceOption => (
                            <label key={priceOption} className="flex items-center gap-2 cursor-pointer hover:text-[#458500]">
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

                <div className="border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-sm text-gray-800 mb-3">Ratings</h3>
                    <div className="space-y-2.5 text-sm text-gray-600">
                        {['4 Stars & Up', '3 Stars & Up'].map(ratingOption => (
                            <label key={ratingOption} className="flex items-center gap-2 cursor-pointer hover:text-[#458500]">
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
                                /> {ratingOption}
                            </label>
                        ))}
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
                        <h1 className="text-xl sm:text-2xl text-gray-900 font-bold">{decodeURIComponent(paramsType)}</h1>
                        <p className="text-sm text-gray-500 mt-1">Showing 1-{products.length} of {products.length} results</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-sm mt-4 sm:mt-0">
                        <label className="text-gray-600 whitespace-nowrap">Sort by:</label>
                        <SortDropdown
                            options={['Featured', 'Best sellers', 'Top Rated', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Heaviest', 'Lightest', 'Highest Discount']}
                            value={sortOption}
                            onChange={setSortOption}
                            className="w-auto z-[90]"
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

                {isLoading ? (
                    <div className="w-full flex items-center justify-center py-20">
                        <Spinner className="w-8 h-8 text-green-700" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2 sm:gap-3">
                            {products.map((product) => (
                                <div key={product._id} className="h-full">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <p className="text-[15px] sm:text-xl text-gray-500">No products found. Check back soon!</p>
                        )}
                    </>
                )}
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
            onChange={setSortOption}
            totalResults={products.length}
        />
    </div>
);
}
