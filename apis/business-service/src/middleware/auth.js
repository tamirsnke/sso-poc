const AuthService = require('../services/authService');
const config = require('../config');

/**
 * Middleware to authenticate via session (BFF pattern)
 */
async function authenticateViaSession(req, res, next) {
  console.log('=== SESSION AUTH MIDDLEWARE CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Has session:', !!req.session);
  console.log('Session ID:', req.sessionID);
  console.log('Session user:', req.session?.user?.preferred_username);
  
  try {
    // For development: always use mock user for testing
    // if (config.nodeEnv === 'development') {
    //   // Check if we have a real session first
    //   if (req.session && req.session.user) {
    //     req.user = req.session.user;
    //     req.sessionId = req.sessionID;
    //     req.authSource = 'local-session';
    //     console.log(`Using local session for user: ${req.user.preferred_username}`);
    //     return next();
    //   }
      
    //   // Fallback to mock user for development
    //   console.log('No local session found, using mock user for development');
    //   req.user = {
    //     sub: 'dev-user-123',
    //     preferred_username: 'dev-user',
    //     email: 'dev@company.com',
    //     roles: ['user', 'developer'],
    //     department: 'Engineering'
    //   };
    //   req.authSource = 'mock-dev';
    //   return next();
    // }

    // Production: Validate session via auth service
    const validation = await AuthService.validateSessionCookie(req);
    
    if (!validation.valid) {
      console.log('Session validation failed:', validation.error);
      return res.status(401).json({
        error: validation.error || 'Authentication required',
        code: validation.code || 'AUTH_REQUIRED',
        loginUrl: `${config.authService.url}/auth/login`,
        requiresLogin: validation.requiresLogin || true
      });
    }

    // Attach user context to request
    req.user = validation.user;
    req.sessionId = validation.sessionId;
    req.authSource = validation.source;
    
    console.log(`Business request authenticated: ${req.user.preferred_username} via ${req.authSource}`);
    next();

  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    
    // For development: fallback to mock user on auth service error
    if (config.nodeEnv === 'development') {
      console.warn('Auth service unavailable, using mock user for development');
      req.user = {
        sub: 'dev-user-123',
        preferred_username: 'dev-user',
        email: 'dev@company.com',
        roles: ['user', 'developer'],
        department: 'Engineering'
      };
      req.authSource = 'mock-fallback';
      return next();
    }

    res.status(503).json({
      error: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_ERROR',
      retry: true,
      details: config.nodeEnv === 'production' ? 'Service temporarily unavailable' : error.message
    });
  }
}

/**
 * Role-based authorization middleware
 */
function requireRole(requiredRoles) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_USER_CONTEXT'
      });
    }

    const userRoles = req.user.roles || [];
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRoles,
        user: req.user.preferred_username
      });
    }

    next();
  };
}

module.exports = {
  authenticateViaSession,
  requireRole
};
// Contains AI-generated edits.
