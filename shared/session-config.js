const session = require('express-session');

/**
 * Shared session configuration for both auth and business services
 * This ensures session cookies can be shared between services
 */
function createSharedSessionConfig(config) {
  // For development, we'll use a shared session configuration with the same settings
  // In production, you would use a shared Redis store
  
  const sessionConfig = {
    secret: config.session.secret,
    name: config.session.name,
    resave: false,
    saveUninitialized: false,
    cookie: {
      ...config.session.cookie,
      // Ensure cookies work across localhost services in development
      domain: config.nodeEnv === 'development' ? undefined : config.session.cookie.domain
    }
  };

  // Add shared store configuration for production
  if (config.nodeEnv === 'production' && config.redis?.url) {
    const RedisStore = require('connect-redis')(session);
    const redis = require('redis');
    
    const redisClient = redis.createClient({
      url: config.redis.url,
      retryDelayOnFailover: config.redis.retryDelayOnFailover || 100,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest || 3,
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    sessionConfig.store = new RedisStore({ client: redisClient });
    console.log('Using shared Redis session store for production');
  } else {
    console.log('Using memory session store (development only)');
  }

  return session(sessionConfig);
}

module.exports = { createSharedSessionConfig };
// Contains AI-generated edits.
