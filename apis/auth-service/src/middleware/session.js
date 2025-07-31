const session = require('express-session');
const config = require('../config');

// Session configuration with Redis support for production
function createSessionStore() {
  const isProduction = config.nodeEnv === 'production';
  
  if (isProduction && config.redis.url) {
    const RedisStore = require('connect-redis')(session);
    const redis = require('redis');
    
    const redisClient = redis.createClient({
      url: config.redis.url,
      retryDelayOnFailover: config.redis.retryDelayOnFailover,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    console.log('Using Redis session store for production');
    return new RedisStore({ client: redisClient });
  } else {
    console.log('Using memory session store (development only)');
    return undefined;
  }
}

const sessionMiddleware = session({
  store: createSessionStore(),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  name: config.session.name,
  cookie: config.session.cookie
});

module.exports = sessionMiddleware;
// Contains AI-generated edits.
