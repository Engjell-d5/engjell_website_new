import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUsers, User } from './data';
import bcrypt from 'bcryptjs';

// Validate JWT_SECRET at startup
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!process.env.JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  SECURITY WARNING: JWT_SECRET is not set or using default value in production!');
    console.error('⚠️  Set a strong JWT_SECRET environment variable immediately!');
  } else {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable for production.');
  }
}

// Minimum password length requirement
export const MIN_PASSWORD_LENGTH = 8;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'engjell-website',
    audience: 'admin-panel',
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'engjell-website',
      audience: 'admin-panel',
    }) as AuthUser;
    return decoded;
  } catch (error) {
    // Log error in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Token verification failed:', error);
    }
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  // Validate input
  if (!email || !password) {
    return null;
  }

  // Normalize email (trim and lowercase)
  const normalizedEmail = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return null;
  }

  const users = await getUsers();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  
  if (!user) {
    // Use bcrypt timing-safe comparison even when user doesn't exist
    // This prevents user enumeration through timing attacks
    await bcrypt.compare(password, '$2a$10$fakehashtopreventtimingattack');
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  // Validate password strength
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  
  // Use higher cost factor for better security (12 rounds)
  return bcrypt.hash(password, 12);
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

