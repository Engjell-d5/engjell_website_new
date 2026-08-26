import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Redirect www to non-www. Build the target URL explicitly: behind the
  // reverse proxy request.nextUrl carries the internal origin (port 3000),
  // so cloning it would leak that port into the public redirect.
  if (hostname.startsWith('www.')) {
    const bareHost = hostname.slice(4).replace(/:\d+$/, '');
    return NextResponse.redirect(
      new URL(`${url.pathname}${url.search}`, `https://${bareHost}`),
      301
    );
  }

  // The admin panel was removed: d5 manages the content, the audience
  // and the enquiries for this site. Anything still pointing at /admin
  // (a bookmark, a crawler) gets sent to the homepage rather than a
  // login screen for a panel that no longer exists.
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const res = NextResponse.redirect(new URL('/', request.url), 308);
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }
  // Add basic security headers to all routes
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS belongs on the public site too, not just /admin — without it the
  // first http:// hit to any page is still downgradeable.
  //
  // Deliberately WITHOUT includeSubDomains: that directive is effectively
  // irreversible (browsers enforce it for max-age regardless of whether the
  // header is later removed) and would take down any subdomain that is not
  // already serving valid HTTPS. Only add it once every subdomain is verified.
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  }

  // Set Content-Security-Policy for non-admin routes (allows Google Analytics and Fonts)
  const publicCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com", // Needed for Next.js and Google Analytics
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Needed for CSS-in-JS and Google Fonts
    "img-src 'self' data: https: https://www.googletagmanager.com https://www.google-analytics.com",
    "font-src 'self' data: https://fonts.gstatic.com", // Allow Google Fonts
    "connect-src 'self' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.google.com", // GA4 sends beacons to regional hosts (e.g. region1.google-analytics.com)
    "base-uri 'self'", // Block <base href> injection from rewriting relative URLs
    "form-action 'self'", // Contact/subscribe/podcast forms post to this origin only
    "object-src 'none'",
    "frame-ancestors 'self'", // Matches X-Frame-Options: SAMEORIGIN
  ].join('; ');
  response.headers.set('Content-Security-Policy', publicCsp);

  return response;
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
