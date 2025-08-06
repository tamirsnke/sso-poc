require("dotenv").config();
const fs = require("fs");
const path = require("path");

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  httpsPort: process.env.HTTPS_PORT || 3443,
  nodeEnv: process.env.NODE_ENV || "development",
  baseUrl: process.env.BASE_URL || "http://localhost:4200",

  // HTTPS configuration
  https: {
    enabled:
      process.env.HTTPS_ENABLED === "true" ||
      process.env.NODE_ENV === "production",
    key:
      process.env.HTTPS_KEY_PATH ||
      path.join(__dirname, "../../../../certs/localhost.key"),
    cert:
      process.env.HTTPS_CERT_PATH ||
      path.join(__dirname, "../../../../certs/localhost.crt"),
    redirectHttp:
      process.env.HTTPS_REDIRECT === "true" ||
      process.env.NODE_ENV === "production",
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || "default_session_secret",
    name: "sessionId",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    },
  },

  // Keycloak configuration
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || "myrealm",
    authServerUrl:
      process.env.KEYCLOAK_AUTH_SERVER_URL || "http://localhost:8080",
    clientId: process.env.KEYCLOAK_CLIENT_ID || "application-portal",
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "your-client-secret",
    tokenUrl: `${
      process.env.KEYCLOAK_AUTH_SERVER_URL || "http://localhost:8080"
    }/realms/${
      process.env.KEYCLOAK_REALM || "myrealm"
    }/protocol/openid-connect/token`,
    logoutUrl: `${
      process.env.KEYCLOAK_AUTH_SERVER_URL || "http://localhost:8080"
    }/realms/${
      process.env.KEYCLOAK_REALM || "myrealm"
    }/protocol/openid-connect/logout`,
    postLogoutRedirectUri:
      process.env.KEYCLOAK_POST_LOGOUT_REDIRECT_URI ||
      "http://localhost:4200/auth/login",
    callbackUrl:
      process.env.KEYCLOAK_CALLBACK_URL ||
      "http://localhost:4200/auth/callback",
  },

  // CORS configuration
  cors: {
    allowedOrigins: [
      "http://localhost:4200", // angular-app-1 (dev)
      "http://localhost:4201", // angular-app-2 (dev)
      "https://localhost:4200", // angular-app-1 (dev HTTPS)
      "https://localhost:4201", // angular-app-2 (dev HTTPS)
      "https://localhost:3443", // auth-service (dev HTTPS)
      "https://localhost:3444", // business-service (dev HTTPS)
      process.env.CLIENT_ORIGIN,
      ...(process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : []),
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-identity-token"
    ],
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },

  // Rate limiting configuration
  rateLimits: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: "Too many authentication attempts, please try again later..",
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Security configuration
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
// Contains AI-generated edits.
