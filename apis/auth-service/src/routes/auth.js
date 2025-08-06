const express = require("express");
const passport = require("passport");
const { Strategy: KeycloakStrategy } = require("passport-keycloak-oauth2-oidc");
const router = express.Router();

// Keycloak configuration
const config = require("../config");

const keycloakConfig = {
  clientID: config.keycloak.clientId,
  clientSecret: config.keycloak.clientSecret,
  realm: config.keycloak.realm,
  publicClient: false,
  sslRequired: "external",
  authServerURL: config.keycloak.authServerUrl,
  callbackURL: `${config.baseUrl}/auth/callback`,
};

// Rate limiting for auth endpoints
const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later" },
});

// Apply rate limiting
router.use(authLimiter);

// Initialize Passport Strategy
passport.use(
  new KeycloakStrategy(
    keycloakConfig,
    async (accessToken, refreshToken, idToken, profile, done) => {
      console.log("Keycloak profile:", idToken);
      try {
        // Store user info and tokens
        const user = {
          profile,
          accessToken,
          refreshToken,
          idToken: idToken.id_token,
        };
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Session serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Login endpoint - redirects to Keycloak
router.get("/login", (req, res, next) => {
  const redirectUri = req.query.redirect_uri || "/";
  const state = req.query.state || "/";
  req.session.returnTo = redirectUri;

  passport.authenticate("keycloak", {
    scope: ["openid", "profile", "email"],
    state,
  })(req, res, next);
});

// Callback endpoint - handles Keycloak response
router.get("/callback", (req, res, next) => {
  passport.authenticate("keycloak", (err, user) => {
    if (err || !user) {
      console.error("Authentication error:", err);
      return res.redirect(
        "/should-login?error=" +
          encodeURIComponent(err?.message || "Authentication failed")
      );
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.redirect(
          "/should-login?error=" + encodeURIComponent(err.message)
        );
      }

      // Set session data
      req.session.user = user.profile;
      req.session.token = user.accessToken;
      req.session.refreshToken = user.refreshToken;
      req.session.idToken = user.idToken;
      req.session.loginTime = new Date().toISOString();
      req.session.lastAccess = new Date().toISOString();

      // Redirect to stored redirect URI
      const redirectTo = req.session.returnTo || "/";
      delete req.session.returnTo;
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// Session check endpoint
router.get("/check", (req, res) => {
  if (!req.isAuthenticated() || !req.session?.token) {
    return res.status(401).json({
      authenticated: false,
      error: "User not authenticated",
    });
  }

  // Validate token here
  const TokenService = require("../services/tokenService");
  const tokenService = new TokenService();
  const validation = tokenService.validateToken(req.session.token);

  if (!validation.valid) {
    // Optionally destroy session here
    req.logout?.();
    req.session.destroy?.(() => {});
    return res.status(401).json({
      authenticated: false,
      error: "Access token expired or invalid",
    });
  }

  req.session.lastAccess = new Date().toISOString();

  res.json({
    authenticated: true,
    ...req.session.user,
    ...req.session.user._json,
    roles: req.session.user.roles || [],
    sessionInfo: {
      loginTime: req.session.loginTime,
      lastAccess: req.session.lastAccess,
    },
  });
});

// Logout endpoint
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid", { path: "/" });
    // Build direct login URL
    const keycloakLoginUrl = `${keycloakConfig.authServerURL}/realms/${
      keycloakConfig.realm
    }/protocol/openid-connect/auth?client_id=${
      keycloakConfig.clientID
    }&redirect_uri=${encodeURIComponent(
      "http://localhost:4200/"
    )}&response_type=code`;
    res.json({ loginUrl: keycloakLoginUrl });
  });
});

// Service-to-service session validation
router.post("/validate-session", (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: "Session ID required",
    });
  }

  req.sessionStore.get(sessionId, (err, sessionData) => {
    if (err || !sessionData?.token) {
      return res.status(401).json({
        valid: false,
        error: "Invalid session",
      });
    }

    res.json({
      valid: true,
      user: sessionData.user,
    });
  });
});

module.exports = router;
