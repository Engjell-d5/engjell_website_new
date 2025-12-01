# Security Documentation

This document outlines the security measures implemented in the admin platform.

## Authentication & Authorization

### JWT Token Security
- **Secret Management**: JWT_SECRET must be set as an environment variable
  - Default secret generates warnings in production
  - Tokens include issuer and audience claims for additional validation
- **Token Expiration**: 7 days (configurable)
- **Cookie Security**:
  - `httpOnly`: Prevents XSS attacks
  - `secure`: Enabled in production (HTTPS only)
  - `sameSite: 'lax'`: Prevents CSRF attacks
  - `path: '/'`: Cookie available site-wide

### Password Security
- **Hashing**: bcrypt with 12 rounds (cost factor)
- **Minimum Length**: 8 characters
- **Strength Requirements** (optional validation):
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Authentication Flow
1. Server-side middleware validates JWT tokens for all `/admin/*` routes
2. Invalid or missing tokens redirect to login
3. Client-side layout provides additional UX checks
4. Timing-safe password comparison prevents enumeration attacks

## Rate Limiting

### Login Endpoint
- **Limit**: 5 attempts per 15 minutes per IP
- **Response**: 429 Too Many Requests with retry-after header
- **Headers**: Rate limit information in response headers

### Implementation
- In-memory store (suitable for single-server deployments)
- For multi-server setups, consider Redis-based rate limiting

## Security Headers

All admin routes include the following security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features
- `Strict-Transport-Security` - HSTS (production only, HTTPS required)
- `Content-Security-Policy` - Restricts resource loading

## Input Validation

### Login Endpoint
- Email format validation
- Input length limits (prevent DoS)
- Request body size limit (1KB max)
- Type checking for all inputs
- Email normalization (trim, lowercase)

### General Principles
- Always validate and sanitize user input
- Normalize email addresses (trim, lowercase)
- Use generic error messages to prevent information leakage
- Rate limit sensitive endpoints

## Protection Against Common Attacks

### Cross-Site Scripting (XSS)
- HttpOnly cookies prevent token theft
- Content-Security-Policy headers
- Input sanitization and validation

### Cross-Site Request Forgery (CSRF)
- SameSite cookie attribute
- Server-side token validation
- Origin validation in middleware

### SQL Injection / NoSQL Injection
- Using Prisma ORM with parameterized queries
- No direct database queries

### Timing Attacks
- Constant-time password comparison (bcrypt)
- Timing-safe dummy comparison for non-existent users

### Brute Force Attacks
- Rate limiting on login endpoint
- Progressive delays on failed attempts
- Account lockout (consider implementing)

### User Enumeration
- Generic error messages
- Timing-safe comparisons
- Same response time for valid/invalid users

### Session Fixation
- New token generated on every login
- Tokens expire after 7 days

## API Route Protection

### All Admin API Routes
- Server-side authentication check via `getAuthUser()`
- Role-based access control (admin vs editor)
- Consistent error responses (401 Unauthorized, 403 Forbidden)

### Recommended Pattern
```typescript
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Protected logic here
}
```

## Environment Variables

### Required for Production

```env
JWT_SECRET=your-strong-random-secret-key-here
NODE_ENV=production
```

### Security Best Practices

1. **Never commit secrets** to version control
2. **Use strong secrets** (minimum 32 characters, random)
3. **Rotate secrets** periodically
4. **Use different secrets** for development and production
5. **Monitor** for default secret usage

## Error Handling

### Security-Focused Error Messages
- Generic messages prevent information leakage
- No stack traces in production
- No sensitive data in error responses
- Consistent error format

### Example
```typescript
// ❌ Bad - leaks information
{ error: `User ${email} not found` }

// ✅ Good - generic message
{ error: 'Invalid credentials' }
```

## Recommendations for Further Security

### High Priority
1. **Implement account lockout** after X failed attempts
2. **Add 2FA/MFA** for admin accounts
3. **Session management** (view active sessions, logout all)
4. **Audit logging** for admin actions
5. **IP whitelisting** for admin access

### Medium Priority
1. **Password expiration** and forced rotation
2. **Security notifications** (email on login from new device)
3. **Redis-based rate limiting** for multi-server deployments
4. **Advanced CSP** policies
5. **Request signing** for critical operations

### Low Priority
1. **CAPTCHA** on login after rate limit
2. **Biometric authentication**
3. **OAuth/SSO integration**
4. **Advanced threat detection**

## Monitoring & Incident Response

### Logging
- Log all authentication attempts (success and failure)
- Log admin actions (audit trail)
- Monitor for suspicious patterns

### Incident Response
1. **Immediate**: Revoke all tokens, force password reset
2. **Investigation**: Review logs, identify attack vector
3. **Prevention**: Implement additional security measures
4. **Communication**: Notify affected users if necessary

## Compliance Considerations

- **GDPR**: Secure handling of user data, right to deletion
- **Data Protection**: Encrypted storage, secure transmission
- **Access Control**: Least privilege principle
- **Audit Trails**: Logging for compliance requirements

## Testing Security

### Recommended Tests
1. **Penetration testing** of admin routes
2. **Rate limiting** verification
3. **Input validation** fuzzing
4. **Session management** testing
5. **CSRF/XSS** vulnerability scanning

### Security Headers Verification
Use tools like:
- SecurityHeaders.com
- OWASP ZAP
- Burp Suite

---

**Last Updated**: 2024
**Version**: 1.0



