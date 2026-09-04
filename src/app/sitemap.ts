import { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prathamherbs.com').replace(/\/$/, '');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
            priority: 0.9,
        },
        {
            url: `${baseUrl}/type/Ayurvedic`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/doctor-corner`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/user/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/user/terms-and-conditions`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
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
                    const imageUrl = product.images?.[0]
                        ? (product.images[0].startsWith('http') ? product.images[0] : `${apiUrl}/upload/file/${product.images[0]}`)
                        : undefined;

                    return {
                        url: `${baseUrl}/products/${product._id}`,
                        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.9,
                        images: imageUrl ? [imageUrl] : undefined,
                    };
                });
            }
        } catch (error) {
            console.error('Failed to fetch products for sitemap:', error);
        }
    }

    return [...staticRoutes, ...productRoutes];
}
