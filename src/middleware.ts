import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';

    // If someone visits the old admin subdomain, permanently redirect them to the main domain
    if (hostname.startsWith('admin.')) {
        const mainDomain = hostname.replace('admin.', '');

        // Map old admin subdomain routes to the new /admin path on the main domain
        if (!url.pathname.startsWith('/admin')) {
            url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
        }

        const redirectUrl = new URL(url.pathname, `http://${mainDomain}`);
        return NextResponse.redirect(redirectUrl);
    }

    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

    // Protect /user routes from logged-out users
    if (url.pathname.startsWith('/user') && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
