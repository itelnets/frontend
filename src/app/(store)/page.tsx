import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import TriggerMaintenance from '@/components/TriggerMaintenance';

export const dynamic = 'force-dynamic';

async function getProducts() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');
        return await res.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return { error: 'maintenance' };
    }
}

export default async function Home() {
    const allProducts = await getProducts();
    const isMaintenance = !Array.isArray(allProducts) && allProducts?.error === 'maintenance';
    const products = isMaintenance ? [] : allProducts.filter((p: any) => p.isActive !== false);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {isMaintenance && <TriggerMaintenance />}
            <main className="w-full flex-1 mb-20">
                {/* Hero Banner Section */}
                <div className="max-w-[1400px] mx-auto p-1 sm:p-4">
                    <HeroCarousel />
                </div>

                {/* Deals Section */}
                <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 mt-1 sm:mt-[-20px] md:mt-[-10px] lg:mt-6">
                    <div className="flex items-center gap-4 mb-2 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recommended for you</h2>
                    </div>

                    <div className="relative">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 pb-4">
                                {products.map((product: any) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-16 sm:py-24 px-4 min-h-[30vh] sm:min-h-[40vh]">
                                <svg className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="text-base sm:text-lg font-medium text-gray-600 mb-1 sm:mb-2">No recommended products available at the moment.</span>
                                <span className="text-xs sm:text-sm">The server is currently experiencing an issue.</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
