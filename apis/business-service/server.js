const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const config = require('./src/config');
const routes = require('./src/routes');

const app = express();

// Session middleware for BFF pattern (shared with auth service)
app.use(session({
  secret: config.session.secret,
  name: config.session.name,
  resave: false,
  saveUninitialized: false,
  cookie: config.session.cookie
}));

// Middleware
app.use(cors({
  ...config.cors,
  credentials: true // Enable credentials for session cookies
}));

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

app.use(express.json());

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: config.nodeEnv === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = config.port;
const HTTPS_PORT = config.httpsPort;

// Create HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`Business Service HTTP listening on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Auth Service: ${config.authService.url}`);
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
      console.log(`Business Service HTTPS listening on port ${HTTPS_PORT}`);
      console.log(`HTTPS certificates loaded successfully`);
    });
  } catch (error) {
    console.warn(`HTTPS setup failed: ${error.message}`);
    console.warn(`Running HTTP only. Generate certificates with: node setup-dev-https.js`);
  }
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing servers gracefully');
  
  httpServer.close(() => {
    console.log('HTTP server closed');
    
    if (httpsServer) {
      httpsServer.close(() => {
        console.log('HTTPS server closed');
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
