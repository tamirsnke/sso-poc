const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// Import configuration
const config = require('./src/config');

// Import middleware
const { securityMiddleware, generalLimiter } = require('./src/middleware/security');
const corsMiddleware = require('./src/middleware/cors');
const sessionMiddleware = require('./src/middleware/session');
const { requestLogger, errorHandler, notFoundHandler } = require('./src/middleware/common');

// Import routes
const routes = require('./src/routes');

// Import utilities
const logger = require('./src/utils/logger');

const app = express();

// Security middleware
app.use(securityMiddleware);

// HTTPS redirect in production
if (config.https.redirectHttp && config.nodeEnv === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Rate limiting
app.use(generalLimiter);

// Basic middleware
app.use(cookieParser());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));

// Session middleware
app.use(sessionMiddleware);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use(requestLogger);

// Routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(errorHandler);
// Do NOT register notFoundHandler here for proxied routes!
// Only use notFoundHandler for truly unmatched routes, e.g.:
// app.use((req, res, next) => notFoundHandler(req, res, next));

// Start server
const PORT = config.port;
const HTTPS_PORT = config.httpsPort;

// Create HTTP server
const httpServer = http.createServer(app);
httpServer.timeout = 30000; // 30 seconds
httpServer.keepAliveTimeout = 30000;
httpServer.listen(PORT, () => {
  logger.info(`Auth Service HTTP listening on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`CORS origins: ${config.cors.allowedOrigins.join(', ')}`);
});

// Create HTTPS server if enabled
let httpsServer;
if (config.https.enabled) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(config.https.key),
      cert: fs.readFileSync(config.https.cert)
    };
    
    httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(HTTPS_PORT, () => {
      logger.info(`Auth Service HTTPS listening on port ${HTTPS_PORT}`);
      logger.info(`HTTPS certificates loaded successfully`);
    });
  } catch (error) {
    logger.warn(`HTTPS setup failed: ${error.message}`);
    logger.warn(`Running HTTP only. Generate certificates with: node setup-dev-https.js`);
  }
}

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing servers gracefully');
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
    
    if (httpsServer) {
      httpsServer.close(() => {
        logger.info('HTTPS server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
// Contains AI-generated edits.
