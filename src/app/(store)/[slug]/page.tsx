'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProducts } from '@/services/product';
import { getBanners, BannerItem } from '@/services/banner';
import { getBannerSlug } from '@/components/HeroCarousel';
import toast from 'react-hot-toast';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import MobileSortDrawer from '@/components/MobileSortDrawer';

// Sub-components & Types from DealsPageComponents & constants
import { Product, FilterState, SORT_OPTIONS } from './components/constants';
import {
    DealsHeroBanner,
    DealsTypeCategories,
    DealsSidebarFilters,
    DealsHeaderBar,
    DealsProductGrid
} from './components/DealsPageComponents';

export default function BannerDealsPage() {
    const params = useParams();
    const slug = (params?.slug as string) || '';

    const [banner, setBanner] = useState<BannerItem | null>(null);
    const [isBannerLoading, setIsBannerLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('');
    const [sortOption, setSortOption] = useState('Featured');
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);

    const [filters, setFilters] = useState<FilterState>({
        inStock: false,
        brands: [],
        price: [],
        rating: []
    });

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [mobileFilterView, setMobileFilterView] = useState<'main' | 'brands' | 'ratings' | 'price'>('main');
    const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

    // Parse discount number and direction from slug or banner title (e.g., 10% off -> maxDiscount: 10; 20% off -> maxDiscount: 20; 30% off -> maxDiscount: 30)
    const isMinDiscount = slug.toLowerCase().includes('min-') || (banner?.tabTitle?.toLowerCase().includes('minimum') ?? false);
    const isUpTo = !isMinDiscount;
    const discountMatch = slug.match(/(\d+)-off/i) || slug.match(/(\d+)%/) || slug.match(/(\d+)-percent/i) || (banner?.tabTitle || '').match(/(\d+)%/) || (banner?.tabTitle || '').match(/(\d+)\s*%?\s*off/i);
    const parsedDiscount = discountMatch ? parseInt(discountMatch[1], 10) : undefined;

    // Fetch banner details for the header card
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                setIsBannerLoading(true);
                const banners = await getBanners();
                const matched = banners.find(b => getBannerSlug(b.tabTitle) === slug);
                if (matched) {
                    setBanner(matched);
                }
            } catch (err) {
                console.error('Failed to load banner details:', err);
            } finally {
                setIsBannerLoading(false);
            }
        };
        fetchBanner();
    }, [slug]);

    // Fetch filtered products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);

                let minPrice: number | undefined = undefined;
                let maxPrice: number | undefined = undefined;

                if (filters.price.length > 0) {
                    const minValues = filters.price.map((p: string) => {
                        if (p === '₹0 - ₹500') return 0;
                        if (p === '₹500 - ₹1,000') return 500;
                        if (p === '₹1,000 - ₹2,000') return 1000;
                        if (p === '₹2,000 - ₹3,000') return 2000;
                        if (p === '₹3,000+') return 3000;
                        return 0;
                    });
                    const maxValues = filters.price.map((p: string) => {
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

                const cleanRatings = filters.rating.map((r: string) => parseInt(r.charAt(0))).filter((n: number) => !isNaN(n)).join(',');

                const queryParams: any = {
                    type: selectedType ? selectedType : undefined,
                    sort: sortOption !== 'Featured' ? sortOption : undefined,
                    inStock: filters.inStock ? 'true' : undefined,
                    brand: filters.brands.length > 0 ? filters.brands.join(',') : undefined,
                    ratings: cleanRatings || undefined,
                    includeFilters: true
                };

                if (parsedDiscount) {
                    queryParams.maxDiscount = parsedDiscount;
                    queryParams.minDiscount = 1;
                }

                if (minPrice !== undefined) queryParams.minPrice = minPrice;
                if (maxPrice !== undefined) queryParams.maxPrice = maxPrice;

                const { data } = await getProducts(queryParams);

                if (data.filters && data.filters.brands) {
                    setAvailableBrands(data.filters.brands);
                }

                let rawProducts: Product[] = data.products || data || [];

                if (parsedDiscount) {
                    rawProducts = rawProducts.filter((p: Product) => {
                        const d = p.discount || 0;
                        return d > 0 && d <= parsedDiscount;
                    });
                }

                setProducts(rawProducts);
            } catch (error) {
                console.error('Failed to fetch promotional products:', error);
                toast.error('Failed to load deals');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [slug, banner, selectedType, filters, sortOption, parsedDiscount, isUpTo]);

    const pageTitle = banner?.tabTitle || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const pageSubtitle = banner?.tabSubtitle || 'Hundreds of picks across every aisle. Limited time only.';

    const hasActiveFilters = filters.inStock || filters.brands.length > 0 || filters.price.length > 0 || filters.rating.length > 0 || selectedType !== '';

    const clearAllFilters = () => {
        setFilters({
            inStock: false,
            brands: [],
            price: [],
            rating: []
        });
        setSelectedType('');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">

            {/* Top Banner & Category Icons Section - Matches Home Page Edge-to-Edge Container */}
            <div className="w-full max-w-[1400px] mx-auto mt-0 sm:mt-2">
                <DealsHeroBanner
                    banner={banner}
                    pageTitle={pageTitle}
                    pageSubtitle={pageSubtitle}
                    isBannerLoading={isBannerLoading}
                />
                <DealsTypeCategories
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                />
            </div>

            {/* Main Products & Filters Section */}
            <div className="flex-1 bg-gray-50 py-3 sm:py-5 px-2.5 sm:px-4 lg:px-5">
                <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 items-start w-full relative">

                    {/* Left Sidebar (Desktop Filters) */}
                    <DealsSidebarFilters
                        filters={filters}
                        setFilters={setFilters}
                        availableBrands={availableBrands}
                    />

                    {/* Right Main Content Area */}
                    <div className="flex-1 w-full min-w-0">
                        {/* Mobile Quick Filters & Header Bar */}
                        <DealsHeaderBar
                            pageTitle={pageTitle}
                            productsCount={products.length}
                            filters={filters}
                            setFilters={setFilters}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                            setIsMobileFilterOpen={setIsMobileFilterOpen}
                            setMobileFilterView={setMobileFilterView}
                            setIsMobileSortOpen={setIsMobileSortOpen}
                        />

                        {/* Products Grid Section */}
                        <DealsProductGrid
                            isLoading={isLoading}
                            products={products}
                            hasActiveFilters={hasActiveFilters}
                            clearAllFilters={clearAllFilters}
                        />
                    </div>

                </div>
            </div>

            {/* Mobile Drawers */}
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
                options={SORT_OPTIONS}
                value={sortOption}
                onChange={setSortOption}
                totalResults={products.length}
            />
        </div>
    );
}
