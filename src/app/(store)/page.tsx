import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

async function getProducts() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');
        return await res.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export default async function Home() {
    const allProducts = await getProducts();
    const products = allProducts.filter((p: any) => p.isActive !== false);
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="w-full flex-1 mb-20">
                {/* Hero Banner Section */}
                <div className="max-w-[1400px] mx-auto mt-0 sm:mt-2">
                    <HeroCarousel />
                </div>

                {/* Deals Section */}
                <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 mt-2 sm:mt-6">
                    <div className="flex items-center gap-4 mb-2 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recommended for you</h2>
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 pb-4">
                            {products.length > 0 ? products.map((product: any) => (
                                <ProductCard key={product._id} product={product} />
                            )) : (
                                <div className="text-gray-500 py-8 text-sm">No recommended products available at the moment. Add some products in the admin panel.</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
