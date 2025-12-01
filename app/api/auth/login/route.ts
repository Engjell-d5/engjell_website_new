import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Prevent JSON parsing attacks with size limit
const MAX_BODY_SIZE = 1024; // 1KB max for login request

// Rate limiting: 5 attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(`login:${clientId}`, LOGIN_RATE_LIMIT);
    
    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime).toISOString();
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': LOGIN_RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': resetTime,
          },
        }
      );
    }

    // Check content length to prevent DoS
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }

    // Trim and normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    
    // Basic length validation to prevent DoS
    if (normalizedEmail.length > 255 || password.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Authenticate user (this uses timing-safe comparison)
    const user = await authenticateUser(normalizedEmail, password);

    if (!user) {
      // Generic error message to prevent user enumeration
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Limit': LOGIN_RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      );
    }

    // Successful authentication
    const token = generateToken(user);

    // Return JSON response with cookie set
    // Client will handle redirect after cookie is set
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirect: request.nextUrl.searchParams.get('redirect') || '/admin',
    });
    
    // Set secure cookie on the JSON response
    // This ensures the cookie is set before client-side redirect
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    // Log in development to debug cookie issues
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login] Cookie set successfully for user:', user.email);
      console.log('[Login] Cookie will be available on next request');
    }

    return response;
  } catch (error: any) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
    
    // Generic error message to prevent information leakage
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

