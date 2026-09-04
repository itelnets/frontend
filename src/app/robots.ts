import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prathamherbs.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin',
                '/admin/',
                '/admin/*',
                '/checkout',
                '/cart',
                '/user/',
                '/user/*',
            ],
        },
        sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
    };
}
