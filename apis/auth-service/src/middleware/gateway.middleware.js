const { createProxyMiddleware } = require("http-proxy-middleware");
const applications = require("../config/applications");
function createGatewayMiddleware(appId) {
  const appConfig = applications.find((app) => app.id === appId);

  if (!appConfig) {
    throw new Error(`Application ${appId} not configured`);
  }

  console.log(`Creating gateway for ${appId}:`, {
    target: appConfig.apiUrl,
    allowedPaths: appConfig.allowedPaths,
  });

  return [
    validateRequest(appConfig),
    createProxyMiddleware({
      target: appConfig.apiUrl,
      changeOrigin: true,
      logLevel: "debug",
      timeout: appConfig.options?.timeout || 60000,
      proxyTimeout: appConfig.options?.timeout || 60000,
      ws: true, // Enable WebSocket proxying
      xfwd: true, // Add x-forward headers
      proxyTimeoutError: true,
      pathRewrite: (path, req) => {
        // Fix path rewrite to handle full path
        const gatewayPath = `/gateway/${appId}`;
        const originalPath = req.originalUrl; // Use req.originalUrl to get the unmodified path
        if (originalPath.startsWith(gatewayPath)) {
          const newPath = originalPath.substring(gatewayPath.length) || "/";
          console.log("Path rewrite:", {
            from: originalPath,
            to: newPath,
            originalUrl: req.originalUrl,
          });
          return newPath;
        }

        // Log unexpected paths for debugging
        console.warn("Unexpected path received:", {
          path: originalPath,
          originalUrl: req.originalUrl,
        });
        return originalPath; // Return the original path if it doesn't match the expected pattern
      },
      on: {
        proxyReq: (proxyReq, req) => {
          const targetPath = req.url.startsWith(`/gateway/${appId}`)
            ? req.url.substring(`/gateway/${appId}`.length)
            : req.url;
          const targetUrl = `${appConfig.apiUrl}${targetPath}`;

          const startTime = Date.now();
          req.proxyStartTime = startTime; // Store start time

          console.log("Proxying request started:", {
            timestamp: new Date().toISOString(),
            from: req.originalUrl,
            to: targetUrl,
            method: req.method,
            headers: proxyReq.getHeaders(),
          });

          proxyReq.setHeader("X-Request-Start", Date.now().toString());
          proxyReq.setHeader("Connection", "keep-alive");

          if (req.session?.token) {
            proxyReq.setHeader("Authorization", `Bearer ${req.session.token}`);
          }

          if (req.session?.idToken) {
            proxyReq.setHeader("X-identity-token", req.session.idToken);
          }

          // if (req.user) {
          //   proxyReq.setHeader("X-User-Id", req.user.sub);
          //   proxyReq.setHeader("X-User-Roles", req.user.roles.join(","));
          // }
        },
        proxyRes: (proxyRes, req, res) => {
          const endTime = Date.now();
          const duration = endTime - (req.proxyStartTime || endTime);

          console.log("Proxy response received:", {
            duration: `${duration}ms`,
            statusCode: proxyRes.statusCode,
            url: req.originalUrl,
            headers: proxyRes.headers,
            timing: {
              start: req.proxyStartTime,
              end: endTime,
              threshold: 60000,
            },
          });

          if (duration > 5000) {
            console.warn("Slow request detected:", {
              duration: `${duration}ms`,
              url: req.originalUrl,
            });
          }
        },
        error: (err, req, res) => {
          console.error("Gateway proxy error:", {
            error: err.message,
            code: err.code,
            timing: {
              start: req.proxyStartTime,
              duration: Date.now() - (req.proxyStartTime || Date.now()),
            },
            request: {
              method: req.method,
              url: req.originalUrl,
              headers: req.headers,
            },
            target: `${appConfig.apiUrl}${req.url}`,
          });

          res.status(err.code === "ETIMEDOUT" ? 504 : 502).json({
            error: "Gateway Error",
            message:
              err.code === "ETIMEDOUT"
                ? "Request timed out while waiting for service"
                : "Unable to reach target service",
            code:
              err.code === "ETIMEDOUT"
                ? "GATEWAY_TIMEOUT"
                : "SERVICE_UNAVAILABLE",
            timing: {
              duration: Date.now() - (req.proxyStartTime || Date.now()),
            },
          });
        },
      },
    }),
  ];
}

function validateRequest(appConfig) {
  return async (req, res, next) => {
    const startTime = Date.now();

    try {
      // Skip validation for health checks and public routes
      if (req.path === "/health" || req.path.startsWith("/public")) {
        return next();
      }

      const TokenService = require("../services/tokenService");
      const tokenService = new TokenService();

      // Check and refresh token if needed
      await tokenService.checkAndRefreshToken(req);

      if (!req.session?.token) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Session expired or invalid",
          code: "SESSION_INVALID",
        });
      }

      // Validate token and update user info
      const validation = tokenService.validateToken(req.session.token);
      if (!validation.valid) {
        return res.status(401).json({
          error: "Unauthorized",
          message: validation.error || "Invalid token",
          code: "TOKEN_INVALID",
        });
      }

      req.user = validation.user;

      const endTime = Date.now();
      console.log(`Request validation took ${endTime - startTime}ms`);
      next();
    } catch (error) {
      const endTime = Date.now();
      console.error(
        `Request validation failed after ${endTime - startTime}ms:`,
        error
      );
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication failed",
        code: "AUTH_ERROR",
      });
    }
  };
}

module.exports = createGatewayMiddleware;
