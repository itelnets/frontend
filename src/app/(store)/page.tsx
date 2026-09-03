import HeroCarousel from '@/components/HeroCarousel';
import FeatureBar from '@/components/FeatureBar';
import TriggerMaintenance from '@/components/TriggerMaintenance';
import HomeProductSection from '@/components/HomeProductSection';

export const dynamic = 'force-dynamic';

async function getProducts() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?page=1&limit=30`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');
        return await res.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return { error: 'maintenance' };
    }
}

export default async function Home() {
    const data = await getProducts();
    const isMaintenance = !data || data.error === 'maintenance';
    const products = isMaintenance ? [] : (Array.isArray(data) ? data : data.products || []).filter((p: any) => p.isActive !== false);
    const totalProducts = isMaintenance ? 0 : (data.totalProducts ?? products.length);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {isMaintenance && <TriggerMaintenance />}
            <main className="w-full flex-1 mb-2 sm:mb-6">
                {/* Hero Banner Section (Full Width Edge to Edge) */}
                <div className="w-full mb-2 sm:mb-4">
                    <HeroCarousel />
                </div>

                {/* Feature Highlights Bar */}
                <FeatureBar />

                {/* Deals Section */}
                <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 mt-1 sm:mt-[-20px] md:mt-[-10px] lg:mt-6">
                    <div className="flex items-center gap-4 mb-2 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recommended for you</h2>
                    </div>

                    <HomeProductSection initialProducts={products} initialTotal={totalProducts} />
                </div>
            </main>
        </div>
    );
}
