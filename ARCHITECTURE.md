# SSO Architecture: Cross-App + Microservices Integration

## Architecture Overview

Your SSO proof-of-concept now supports **both** Cross-App Integration and Microservices Integration patterns:

```
┌─────────────────────┐    ┌─────────────────────┐
│   Angular App 1     │    │   Angular App 2     │
│   (Port 4200)       │    │   (Port 4201)       │
└──────────┬──────────┘    └──────────┬──────────┘
           │                          │
           └──────────┬─────────────────┘
                      │ Session-based Auth
                      ▼
┌─────────────────────────────────────────────────┐
│           Auth Service (BFF)                    │
│           node-api-1 (Port 3001)                │
│   • Session management                          │
│   • OAuth2 flow with Keycloak                  │
│   • Token validation endpoints                 │
│   • Microservices auth provider                │
└─────────────────────┬───────────────────────────┘
                      │ JWT Token Validation
                      ▼
┌─────────────────────────────────────────────────┐
│         Microservices Layer                     │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │   node-api-2    │  │   node-api-3    │ ...  │
│  │   (Port 3002)   │  │   (Port 3003)   │      │
│  │   Orders Service│  │   Users Service │      │
│  └─────────────────┘  └─────────────────┘      │
└─────────────────────────────────────────────────┘
```

## 🔄 Cross-App Integration (Frontend)

**Pattern**: Multiple frontend applications share authentication via a centralized BFF

**Features**:

- ✅ Single Sign-On across multiple Angular apps
- ✅ Shared session management
- ✅ Centralized authentication flow
- ✅ Cross-origin session sharing

**How it works**:

1. User logs in via any app (4200 or 4201)
2. Authentication handled by BFF (3001)
3. Session cookie shared across allowed origins
4. All apps automatically authenticated

## 🏗️ Microservices Integration (Backend)

**Pattern**: Distributed services validate tokens via centralized auth service

**Features**:

- ✅ Service-to-service authentication
- ✅ Centralized token validation
- ✅ Role-based authorization
- ✅ Token introspection
- ✅ Distributed authorization

**How it works**:

1. Frontend gets JWT token from auth service
2. Frontend sends token to any microservice
3. Microservice validates token with auth service
4. Business logic executes with user context

## 🔐 Authentication Flows

### Cross-App Authentication

```
User → Angular App → Auth Service → Keycloak → Session Cookie → All Apps
```

### Microservices Authentication

```
Frontend → Auth Service → JWT Token → Microservice → Token Validation → Protected Resource
```

## 📡 API Endpoints

### Auth Service (node-api-1:3001)

- `POST /login` - OAuth2 login flow
- `POST /logout` - SSO logout
- `GET /protected` - Session-based protected resource
- `POST /validate-token` - Validate JWT for microservices
- `GET /user-info` - Get current user session info
- `POST /introspect` - Keycloak token introspection
- `GET /health` - Health check

### Microservice Example (node-api-2:3002)

- `GET /protected` - Token-based protected resource
- `GET /admin` - Role-based protected resource
- `GET /api/orders` - Business logic with auth
- `GET /health` - Health check

## 🔧 Integration Patterns

### 1. Frontend-to-BFF (Session-based)

```javascript
// Angular apps use session cookies
this.http.get("/protected", { withCredentials: true });
```

### 2. Frontend-to-Microservice (Token-based)

```javascript
// Frontend gets token and sends to microservices
const token = await this.getToken();
this.http.get("/api/orders", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 3. Service-to-Service (Token validation)

```javascript
// Microservices validate tokens via auth service
axios.post("http://auth-service:3001/validate-token", { token });
```

## 🚀 Deployment Strategies

### Development

- All services on localhost with different ports
- Shared session cookies across localhost origins
- Memory-based session storage

### Production

- Services behind API Gateway/Load Balancer
- Redis-based session storage
- HTTPS with secure cookies
- Service mesh for internal communication

## 📋 Configuration

### Environment Variables

```env
# Auth Service
AUTH_SERVICE_URL=http://localhost:3001
KEYCLOAK_BASE_URL=https://keycloak.domain.com/realms/realm
ALLOWED_ORIGINS=https://app1.com,https://app2.com

# Microservices
NODE_ENV=production
PORT=3002
```

## 🔍 Monitoring & Observability

### Health Checks

- All services expose `/health` endpoints
- Centralized monitoring via auth service
- Service dependency tracking

### Logging

- Request logging in auth service
- Token validation tracking
- Error correlation across services

## 🛡️ Security Features

### Cross-App Security

- CORS protection for allowed origins
- HttpOnly secure session cookies
- Rate limiting on auth endpoints

### Microservices Security

- JWT signature validation
- Role-based access control
- Service-to-service authentication
- Token introspection for real-time validation

## 📈 Scalability

### Horizontal Scaling

- Redis session store for multi-instance auth service
- Stateless microservices
- Load balancer support

### Performance

- Local JWT validation option for microservices
- Token caching strategies
- Connection pooling

Your architecture now supports both patterns seamlessly! 🎉

## 🚨 Production Security Checklist

### ❌ Currently Missing - Critical Security Items

#### 1. **HTTPS/TLS Everywhere**

```bash
# Current: HTTP (insecure)
http://localhost:3001/auth/login

# Production Required: HTTPS
https://auth.yourdomain.com/auth/login
```

#### 2. **Secure Session Configuration**

```javascript
// Current: Development settings
app.use(
  session({
    secret: "business-service-secret-key-change-in-production", // ❌ Hardcoded
    cookie: {
      secure: false, // ❌ Not HTTPS-only
      httpOnly: true, // ✅ Good
      sameSite: "none", // ❌ Missing CSRF protection
    },
  })
);

// Production Required:
app.use(
  session({
    secret: process.env.SESSION_SECRET, // ✅ Environment variable
    cookie: {
      secure: true, // ✅ HTTPS-only
      httpOnly: true, // ✅ XSS protection
      sameSite: "strict", // ✅ CSRF protection
      maxAge: 30 * 60 * 1000, // ✅ 30-minute timeout
      domain: ".yourdomain.com", // ✅ Subdomain sharing
    },
    store: new RedisStore({
      // ✅ Persistent, scalable storage
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
    }),
  })
);
```

#### 3. **JWT Security Hardening**

```javascript
// Current: Basic JWT
const token = jwt.sign(payload, secret);

// Production Required:
const token = jwt.sign(payload, privateKey, {
  algorithm: "RS256", // ✅ Asymmetric signing
  expiresIn: "15m", // ✅ Short-lived tokens
  issuer: "https://auth.yourdomain.com",
  audience: "https://api.yourdomain.com",
});
```

#### 4. **Missing: Refresh Token Flow**

```javascript
// ❌ Currently Missing - Implement refresh tokens
{
  "access_token": "short-lived-jwt",
  "refresh_token": "long-lived-secure-token",
  "expires_in": 900 // 15 minutes
}
```

#### 5. **Missing: Rate Limiting & DDoS Protection**

```javascript
// ❌ Currently Missing
const rateLimit = require("express-rate-limit");

app.use(
  "/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: "Too many login attempts",
  })
);
```

#### 6. **Missing: Input Validation & Sanitization**

```javascript
// ❌ Currently Missing
const { body, validationResult } = require("express-validator");

app.post(
  "/auth/login",
  [
    body("username").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);
```

#### 7. **Missing: Security Headers**

```javascript
// ❌ Currently Missing
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

#### 8. **Missing: Audit Logging & Monitoring**

```javascript
// ❌ Currently Missing
const auditLogger = require("./utils/auditLogger");

// Log all authentication events
function logAuthEvent(event, userId, ip, userAgent) {
  auditLogger.info({
    event,
    userId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });
}
```

### 🔐 Critical Security Implementations Needed

#### A. **Token Blacklisting/Revocation**

```javascript
// Redis-based token blacklist
class TokenBlacklist {
  async revokeToken(tokenId) {
    await redis.setex(`blacklist:${tokenId}`, tokenExpiry, "revoked");
  }

  async isTokenRevoked(tokenId) {
    return await redis.exists(`blacklist:${tokenId}`);
  }
}
```

#### B. **Multi-Factor Authentication (MFA)**

```javascript
// TOTP/SMS implementation
const speakeasy = require("speakeasy");

async function verifyMFA(userId, token) {
  const secret = await getUserMFASecret(userId);
  return speakeasy.totp.verify({
    secret,
    token,
    window: 2,
  });
}
```

#### C. **Account Lockout & Brute Force Protection**

```javascript
// Account lockout after failed attempts
class AccountSecurity {
  async recordFailedAttempt(username) {
    const attempts = await redis.incr(`failed:${username}`);
    if (attempts === 1) {
      await redis.expire(`failed:${username}`, 900); // 15 min window
    }
    if (attempts >= 5) {
      await redis.setex(`locked:${username}`, 3600, "locked"); // 1 hour lockout
    }
  }
}
```

#### D. **Secrets Management**

```bash
# ❌ Current: Hardcoded secrets
secret: 'business-service-secret-key-change-in-production'

# ✅ Production: External secrets management
# Azure Key Vault, AWS Secrets Manager, HashiCorp Vault
JWT_PRIVATE_KEY=$(vault kv get -field=private_key secret/jwt)
```

#### E. **Certificate Pinning & PKI**

```javascript
// Certificate validation for service-to-service
const https = require("https");
const fs = require("fs");

const agent = new https.Agent({
  ca: fs.readFileSync("path/to/ca-cert.pem"),
  checkServerIdentity: (host, cert) => {
    // Implement certificate pinning
  },
});
```

### 🛡️ Infrastructure Security Missing

#### 1. **Network Security**

- ❌ VPC/Network segmentation
- ❌ WAF (Web Application Firewall)
- ❌ DDoS protection (CloudFlare, AWS Shield)
- ❌ API Gateway with throttling

#### 2. **Container Security**

```dockerfile
# ❌ Current: Basic container
FROM node:18

# ✅ Production: Hardened container
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

#### 3. **Database Security**

- ❌ Database encryption at rest
- ❌ Connection encryption (TLS)
- ❌ Database access controls
- ❌ SQL injection protection

### ⚡ Performance & Availability

#### 1. **High Availability**

- ❌ Load balancers with health checks
- ❌ Auto-scaling groups
- ❌ Multiple availability zones
- ❌ Circuit breakers for service calls

#### 2. **Caching Strategy**

```javascript
// ❌ Missing: Redis caching for token validation
const cache = require("redis").createClient();

async function validateTokenCached(token) {
  const cached = await cache.get(`token:${tokenId}`);
  if (cached) return JSON.parse(cached);

  const result = await validateTokenFromKeycloak(token);
  await cache.setex(`token:${tokenId}`, 300, JSON.stringify(result));
  return result;
}
```

### 📊 Monitoring & Alerting Missing

#### 1. **Security Monitoring**

- ❌ Failed login attempt alerts
- ❌ Unusual access pattern detection
- ❌ Token abuse monitoring
- ❌ Security incident response automation

#### 2. **Application Performance Monitoring**

- ❌ Request tracing (OpenTelemetry)
- ❌ Error tracking (Sentry)
- ❌ Performance metrics (Prometheus)
- ❌ Log aggregation (ELK Stack)

### 🔧 Compliance & Governance

#### 1. **Data Protection**

- ❌ GDPR compliance (data retention, right to be forgotten)
- ❌ PII encryption
- ❌ Data classification
- ❌ Backup encryption

#### 2. **Audit & Compliance**

- ❌ SOC 2 compliance
- ❌ Regular security assessments
- ❌ Penetration testing
- ❌ Vulnerability scanning

## ⚠️ Immediate Action Items for Production

### Phase 1: Critical Security (Week 1)

1. Implement HTTPS everywhere
2. Secure session configuration
3. Add security headers (Helmet.js)
4. Implement rate limiting
5. Add input validation

### Phase 2: Authentication Hardening (Week 2)

1. Implement refresh token flow
2. Add MFA support
3. Token blacklisting
4. Account lockout protection
5. Audit logging

### Phase 3: Infrastructure Security (Week 3)

1. Secrets management
2. Container hardening
3. Network security
4. Database encryption
5. Certificate management

### Phase 4: Monitoring & Compliance (Week 4)

1. Security monitoring
2. Performance monitoring
3. Compliance frameworks
4. Incident response procedures
5. Regular security testing

**Current Security Level: 🔴 Development/Demo**
**Target Security Level: 🟢 Production-Ready Enterprise**

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OAuth 2.1 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

// Contains AI-generated edits.
