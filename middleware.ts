import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

// Convert secret string to Uint8Array for jose
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'engjell-website',
      audience: 'admin-panel',
    });
    
    // jose returns the payload with the claims
    const user: AuthUser = {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'admin' | 'editor',
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Token verified successfully');
    }
    
    return user;
  } catch (error: any) {
    // Log the actual error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Middleware] Token verification error:', error.message);
      console.error('[Middleware] Error name:', error.name);
      if (error.code === 'ERR_JWT_INVALID') {
        console.error('[Middleware] JWT Error details:', error.message);
      } else if (error.code === 'ERR_JWT_EXPIRED') {
        console.error('[Middleware] Token expired');
      }
    }
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Redirect www to non-www
  if (hostname.startsWith('www.')) {
    url.hostname = hostname.replace('www.', '');
    return NextResponse.redirect(url, 301);
  }

  // Protect admin routes server-side
  if (pathname.startsWith('/admin')) {
    // Allow login page without auth (but check if already authenticated)
    if (pathname === '/admin/login') {
      const token = request.cookies.get('auth-token')?.value;
      if (token) {
        const user = await verifyToken(token);
        // If already authenticated, redirect to admin dashboard
        if (user) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return NextResponse.next();
    }

    // Check authentication for all other admin routes
    const token = request.cookies.get('auth-token')?.value;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Checking auth for path:', pathname);
      console.log('[Middleware] Token present:', !!token);
      console.log('[Middleware] All cookies:', request.cookies.getAll().map(c => c.name));
    }
    
    if (!token) {
      // Redirect to login if not authenticated
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] No token found, redirecting to login');
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const user = await verifyToken(token);
    
    if (!user) {
      // Invalid token, clear cookie and redirect
      // Log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Token verification failed for path:', pathname);
        console.log('[Middleware] Token value (first 20 chars):', token.substring(0, 20));
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
    
    // Log successful auth in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Authenticated user:', user.email, 'for path:', pathname);
    }

    // Add security headers to admin routes
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Only set Strict-Transport-Security in production (HTTPS)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Set Content-Security-Policy for admin routes
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Needed for Next.js
      "style-src 'self' 'unsafe-inline'", // Needed for CSS-in-JS
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
    
    return response;
  }

  // Add basic security headers to all routes
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
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
