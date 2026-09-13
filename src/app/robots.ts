import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const rawUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prathamherbs.com';
    const baseUrl = (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1') || /192\.168\.\d+\.\d+/.test(rawUrl))
        ? 'https://prathamherbs.com'
        : rawUrl.replace(/\/$/, '');

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin',
                '/admin/*',
                '/login',
                '/register',
                '/reset-password',
                '/checkout',
                '/cart',
                '/user/myaccount',
                '/user/lists',
                '/user/address',
                '/user/orders',
            ],
        },
        sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
    };
}
