const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Security middleware
const securityMiddleware = helmet(config.security.helmet);

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  ...config.rateLimits.auth,
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting
const generalLimiter = rateLimit({
  ...config.rateLimits.general,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  securityMiddleware,
  authLimiter,
  generalLimiter
};
// Contains AI-generated edits.
