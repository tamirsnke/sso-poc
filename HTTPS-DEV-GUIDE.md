# 🔒 HTTPS Development Mode Guide

## Quick Start: Enable HTTPS Everywhere

### 1. Set Environment Variables

```bash
# Enable HTTPS for all services
HTTPS_ENABLED=true

# Service ports
AUTH_SERVICE_HTTPS_PORT=3443
BUSINESS_SERVICE_HTTPS_PORT=3444
```

### 2. Start Services in HTTPS Mode

**Auth Service (HTTPS):**

```bash
cd apis/auth-service
set HTTPS_ENABLED=true && node server.js
# Or use VS Code task: "Start Auth Service (HTTPS)"
```

**Business Service (HTTPS):**

```bash
cd apis/business-service
set HTTPS_ENABLED=true && node server.js
# Or use VS Code task: "Start Business Service (HTTPS)"
```

### 3. Update Angular Apps for HTTPS

Update `environment.ts` files:

```typescript
export const environment = {
  production: false,
  authServiceUrl: "https://localhost:3443",
  businessServiceUrl: "https://localhost:3444",
  enableHttps: true,
};
```

### 4. HTTPS URLs for Development

- 🔐 **Auth Service**: https://localhost:3443
- 🔐 **Business Service**: https://localhost:3444
- 🔐 **Angular App 1**: https://localhost:4200 (with ng serve --ssl)
- 🔐 **Angular App 2**: https://localhost:4201 (with ng serve --ssl)

### 5. Browser Security Notice

⚠️ **Expected Behavior:**

- Browser shows "Not Secure" warning
- Click "Advanced" → "Proceed to localhost (unsafe)"
- This is normal for self-signed certificates in development

### 6. Production vs Development

**Development (localhost):**

- Self-signed certificates
- HTTP + HTTPS both available
- Relaxed security for testing

**Production:**

- Real SSL certificates (Let's Encrypt, CloudFlare, etc.)
- HTTPS-only with security headers
- Strict security policies

## Benefits of HTTPS in Development

✅ **Realistic Testing**: Test exactly like production
✅ **Security Features**: Test secure cookies, CORS policies
✅ **OAuth/SSO Compliance**: Many providers require HTTPS
✅ **Service Worker Testing**: Requires HTTPS context
✅ **Modern Browser Features**: Many APIs require HTTPS

## Mixed Mode Support

Your architecture supports **both HTTP and HTTPS simultaneously**:

- **HTTP**: http://localhost:3001, http://localhost:3002
- **HTTPS**: https://localhost:3443, https://localhost:3444

Perfect for gradual migration and testing!

## 🎯 Production Security Implementation

When ready for production, you'll have:

1. **Real SSL Certificates** (Let's Encrypt, CloudFlare)
2. **HTTPS-Only Mode** (HTTP redirects to HTTPS)
3. **Security Headers** (HSTS, CSP, etc.)
4. **Secure Session Cookies** (Secure, HttpOnly, SameSite)
5. **Certificate Pinning** (Optional advanced security)

Your development setup perfectly prepares you for production! 🚀

// Contains AI-generated edits.
