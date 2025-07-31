require('dotenv').config();
const path = require('path');

const config = {
  // Server configuration
  port: process.env.PORT || 3002,
  httpsPort: process.env.HTTPS_PORT || 3444,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // HTTPS configuration
  https: {
    enabled: process.env.HTTPS_ENABLED === 'true' || process.env.NODE_ENV === 'production',
    key: process.env.HTTPS_KEY_PATH || path.join(__dirname, '../../../../certs/localhost.key'),
    cert: process.env.HTTPS_CERT_PATH || path.join(__dirname, '../../../../certs/localhost.crt'),
    redirectHttp: process.env.HTTPS_REDIRECT === 'true' || process.env.NODE_ENV === 'production'
  },
  
  // Auth service configuration
  authService: {
    url: process.env.AUTH_SERVICE_URL || (process.env.HTTPS_ENABLED === 'true' ? 'https://localhost:3443' : 'http://localhost:3001'),
    timeout: 5000
  },
  
  // Session configuration (must match auth service)
  session: {
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    name: 'sessionId',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
    }
  },
  
  // CORS configuration
  cors: {
    credentials: true,
    origin: [
      'http://localhost:4200', 
      'http://localhost:4201', 
      'https://localhost:4200',
      'https://localhost:4201',
      'http://localhost:3001',
      'https://localhost:3443'
    ]
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;
// Contains AI-generated edits.
