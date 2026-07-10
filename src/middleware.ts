import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // Check if the hostname is exactly admin.domain.com or admin.localhost:3000
    const isAdminSubdomain = hostname.startsWith('admin.');

    if (isAdminSubdomain) {
        // We are on the admin subdomain
        // If the path DOES NOT start with /admin, prefix it.
        // e.g. admin.domain.com/login -> rewrites to /admin/login (which maps to app/admin/login/page.tsx)
        // e.g. admin.domain.com/ -> rewrites to /admin
        if (!url.pathname.startsWith('/admin')) {
            url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
            return NextResponse.rewrite(url);
        }
    } else {
        // We are on the main domain (e.g. domain.com or localhost:3000)
        // Block direct access to /admin on the main domain to keep things clean
        if (url.pathname.startsWith('/admin')) {
            url.pathname = '/404'; // Rewrite to a 404 page
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
