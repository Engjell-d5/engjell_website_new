import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, AuthUser } from './auth';

/**
 * Middleware helper to require authentication for API routes
 */
export function requireAuth(
  request: NextRequest,
  options?: {
    roles?: ('admin' | 'editor')[];
    requireAdmin?: boolean;
  }
): { user: AuthUser } | NextResponse {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check role requirements
  if (options?.requireAdmin && user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  if (options?.roles && !options.roles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  return { user };
}

/**
 * Middleware helper to require admin role
 */
export function requireAdmin(request: NextRequest): { user: AuthUser } | NextResponse {
  return requireAuth(request, { requireAdmin: true });
}



