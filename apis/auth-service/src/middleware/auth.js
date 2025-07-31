const jwt = require('jsonwebtoken');
const keycloakKeys = require('../config/keycloak');
const TokenService = require('../services/tokenService');

// Enhanced middleware for session-based authentication with token refresh
function requireAuth(req, res, next) {
  const token = req.session.token;
  if (!token) {
    return res.status(401).json({ error: 'No active session' });
  }
  
  jwt.verify(token, keycloakKeys.getPublicKey(), { algorithms: ['RS256'] }, async (err, user) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      
      // Try to refresh token if available
      if (req.session.refreshToken && err.name === 'TokenExpiredError') {
        try {
          await TokenService.refreshAccessToken(req);
          // Retry with new token
          return jwt.verify(req.session.token, keycloakKeys.getPublicKey(), { algorithms: ['RS256'] }, (retryErr, retryUser) => {
            if (retryErr) {
              return res.status(403).json({ error: 'Token refresh failed' });
            }
            req.user = retryUser;
            next();
          });
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr.message);
          return res.status(403).json({ error: 'Session expired' });
        }
      }
      
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
}

module.exports = {
  requireAuth
};
// Contains AI-generated edits.
