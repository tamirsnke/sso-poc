# Node API 1 - Production Ready SSO Backend

## Overview

Production-ready Backend-for-Frontend (BFF) API for SSO authentication using Keycloak, designed to support multiple Angular applications with session-based authentication.

## Production Features

### Security

- ✅ **Helmet.js** - Security headers and CSRF protection
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Input Validation** - Validates all user inputs
- ✅ **Secure Sessions** - HttpOnly, Secure, SameSite cookies
- ✅ **CORS Protection** - Strict origin validation
- ✅ **JWT Validation** - RS256 algorithm with public key verification

### Scalability

- ✅ **Redis Sessions** - Distributed session storage
- ✅ **Token Refresh** - Automatic token renewal
- ✅ **Health Checks** - Monitoring endpoints
- ✅ **Graceful Shutdown** - Clean process termination
- ✅ **Error Handling** - Comprehensive error management

### Monitoring & Logging

- ✅ **Request Logging** - All API calls logged
- ✅ **Error Tracking** - Detailed error information
- ✅ **Performance Metrics** - Response time monitoring

## Environment Setup

### Development

```bash
NODE_ENV=development
npm run dev
```

### Production

```bash
NODE_ENV=production
npm run prod
```

## Required Environment Variables

### Essential

```env
NODE_ENV=production
SESSION_SECRET=your-32-char-secret
KEYCLOAK_CLIENT_ID=your-client-id
KEYCLOAK_BASE_URL=https://keycloak.domain.com/realms/realm-name
```

### Production-Specific

```env
KEYCLOAK_CLIENT_SECRET=your-client-secret
REDIS_URL=redis://redis:6379
COOKIE_DOMAIN=.yourdomain.com
ALLOWED_ORIGINS=https://app1.com,https://app2.com
```

## Docker Deployment

```bash
# Build image
docker build -t sso-api .

# Run container
docker run -d \
  --name sso-api \
  -p 3001:3001 \
  --env-file .env.production \
  sso-api
```

## API Endpoints

| Endpoint     | Method | Description        | Rate Limit |
| ------------ | ------ | ------------------ | ---------- |
| `/health`    | GET    | Health check       | 100/15min  |
| `/login`     | POST   | OAuth2 login       | 5/15min    |
| `/logout`    | POST   | SSO logout         | 5/15min    |
| `/protected` | GET    | Protected resource | 100/15min  |

## Security Considerations

1. **Always use HTTPS in production**
2. **Set secure session configuration**
3. **Validate all redirect URIs**
4. **Monitor rate limit violations**
5. **Regular security updates**

## Monitoring

### Health Check

```bash
curl https://api.yourdomain.com/health
```

### Response Format

```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Redis instance available
- [ ] SSL certificates installed
- [ ] Keycloak client configured
- [ ] CORS origins validated
- [ ] Health checks working
- [ ] Logging configured
- [ ] Monitoring setup

## Support

For production issues:

1. Check application logs
2. Verify Keycloak connectivity
3. Validate environment configuration
4. Monitor Redis connection

// Contains AI-generated edits.
