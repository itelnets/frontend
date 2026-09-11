import { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_URL || '').replace(/\/$/, '');
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

    // Dynamically fetch product types / categories from backend API
    let categories: string[] = ['Supplements', 'Sports', 'Bath', 'Beauty', 'Grocery', 'Home', 'Baby', 'Pets'];

    if (apiUrl) {
        try {
            const typesRes = await fetch(`${apiUrl}/products/types`, { next: { revalidate: 3600 } });
            if (typesRes.ok) {
                const typesData = await typesRes.json();
                if (Array.isArray(typesData.types) && typesData.types.length > 0) {
                    categories = typesData.types;
                }
            }
        } catch (error) {
            console.error('Failed to fetch product types for sitemap:', error);
        }
    }

    const typeRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${baseUrl}/type/${encodeURIComponent(cat.toLowerCase())}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(cat)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
    }));

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${baseUrl}/doctor-corner`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        },
        ...typeRoutes,
        ...categoryRoutes,
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/user/terms-and-conditions`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/user/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
    ];

    let productRoutes: MetadataRoute.Sitemap = [];

    if (apiUrl) {
        try {
            const res = await fetch(`${apiUrl}/products?limit=1000`, { next: { revalidate: 3600 } });
            if (res.ok) {
                const data = await res.json();
                const products = Array.isArray(data) ? data : (data.products || []);
                productRoutes = products.map((product: any) => {
                    const images: string[] = (product.images || [])
                        .map((img: string) => img.startsWith('http') ? img : `${apiUrl}/upload/file/${img}`)
                        .filter(Boolean);

                    return {
                        url: `${baseUrl}/products/${product._id}`,
                        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.9,
                        images: images.length > 0 ? images : undefined,
                    };
                });
            }
        } catch (error) {
            console.error('Failed to fetch products for sitemap:', error);
        }
    }

    return [...staticRoutes, ...productRoutes];
}
