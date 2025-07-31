const AuthService = require('../services/authService');
const TokenService = require('../services/tokenService');
const config = require('../config');

class AuthController {
  async login(req, res) {
    const { code, redirectUri } = req.body;
    
    // Input validation
    if (!code || !redirectUri) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        required: ['code', 'redirectUri'] 
      });
    }
    
    try {
      const tokenData = await AuthService.exchangeCodeForToken(code, redirectUri);
      
      // Get user info from token
      const userInfo = await AuthService.getUserInfo(tokenData.access_token);
      
      // Store tokens and user info in session
      req.session.token = tokenData.access_token;
      req.session.refreshToken = tokenData.refresh_token;
      req.session.user = userInfo;
      req.session.loginTime = new Date().toISOString();
      
      console.log(`User logged in successfully: ${userInfo.preferred_username}. Session ID: ${req.sessionID}`);
      
      res.json({ 
        success: true, 
        message: 'Login successful',
        sessionId: req.sessionID,
        user: {
          username: userInfo.preferred_username,
          email: userInfo.email,
          roles: userInfo.realm_access?.roles || []
        }
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(400).json({ 
        error: 'Login failed', 
        details: error.message 
      });
    }
  }

  async logout(req, res) {
    try {
      // Step 1: Revoke tokens with Keycloak if available
      if (req.session.token) {
        try {
          await AuthService.revokeToken(req.session.token);
        } catch (revokeErr) {
          // Log but don't fail logout if token revocation fails
          console.warn('Token revocation failed:', revokeErr.message);
        }
      }

      // Step 2: Destroy local session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Failed to destroy session' });
        }
        
        // Step 3: Clear session cookie explicitly
        res.clearCookie('connect.sid', {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: 'lax'
        });
        
        // Step 4: Return logout URL for frontend to redirect to Keycloak logout
        const requestOrigin = req.headers.origin;
        const keycloakLogoutUrl = AuthService.generateLogoutUrl(requestOrigin);
        
        res.json({ 
          success: true, 
          logoutUrl: keycloakLogoutUrl,
          message: 'Logged out successfully'
        });
      });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Logout failed', details: err.message });
    }
  }

  async checkAuth(req, res) {
    if (req.session.token) {
      res.json({ authenticated: true, sessionId: req.sessionID });
    } else {
      res.json({ authenticated: false });
    }
  }

  // Session validation for business services
  async validateSession(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ 
          error: 'Session ID required',
          code: 'MISSING_SESSION_ID'
        });
      }

      // Validate session exists in session store
      const sessionStore = req.sessionStore;
      
      sessionStore.get(sessionId, (err, sessionData) => {
        if (err) {
          console.error('Session store error:', err);
          return res.status(500).json({ 
            error: 'Session validation failed',
            code: 'SESSION_STORE_ERROR'
          });
        }

        if (!sessionData || !sessionData.user) {
          return res.status(401).json({ 
            error: 'Session not found or invalid',
            code: 'INVALID_SESSION',
            sessionId: sessionId
          });
        }

        // Validate token if present
        if (sessionData.token) {
          try {
            const tokenValidation = TokenService.validateToken(sessionData.token);
            if (!tokenValidation.valid) {
              return res.status(401).json({
                error: 'Session token expired',
                code: 'TOKEN_EXPIRED',
                requiresRefresh: true
              });
            }
          } catch (tokenError) {
            console.error('Token validation error:', tokenError.message);
            return res.status(401).json({
              error: 'Invalid session token',
              code: 'TOKEN_INVALID'
            });
          }
        }

        // Return validated user data
        res.json({
          valid: true,
          user: sessionData.user,
          sessionId: sessionId,
          loginTime: sessionData.loginTime,
          lastAccess: new Date().toISOString(),
          source: 'auth-service'
        });
      });

    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ 
        error: 'Internal validation error',
        code: 'VALIDATION_ERROR',
        details: config.nodeEnv === 'production' ? 'Internal error' : error.message
      });
    }
  }

  // Validate session using forwarded cookies (for shared session approach)
  async validateSessionCookie(req, res) {
    try {
      // Check if session exists and has user data
      if (!req.session || !req.session.user) {
        return res.status(401).json({
          valid: false,
          error: 'No valid session cookie',
          code: 'NO_SESSION',
          requiresLogin: true
        });
      }

      // Validate token if present in session
      if (req.session.token) {
        try {
          const tokenValidation = TokenService.validateToken(req.session.token);
          if (!tokenValidation.valid) {
            // Attempt token refresh if refresh token available
            if (req.session.refreshToken) {
              try {
                await TokenService.refreshAccessToken(req);
                console.log(`Token refreshed for session: ${req.sessionID}`);
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError.message);
                return res.status(401).json({
                  valid: false,
                  error: 'Session expired and refresh failed',
                  code: 'REFRESH_FAILED',
                  requiresLogin: true
                });
              }
            } else {
              return res.status(401).json({
                valid: false,
                error: 'Session token expired',
                code: 'TOKEN_EXPIRED',
                requiresLogin: true
              });
            }
          }
        } catch (tokenError) {
          console.error('Token validation error:', tokenError.message);
          return res.status(401).json({
            valid: false,
            error: 'Invalid session token',
            code: 'TOKEN_INVALID',
            requiresLogin: true
          });
        }
      }

      // Update last access time
      req.session.lastAccess = new Date().toISOString();

      // Return validated session data
      res.json({
        valid: true,
        user: req.session.user,
        sessionId: req.sessionID,
        loginTime: req.session.loginTime,
        lastAccess: req.session.lastAccess,
        source: 'session-cookie'
      });

    } catch (error) {
      console.error('Session cookie validation error:', error);
      res.status(500).json({
        valid: false,
        error: 'Session validation failed',
        code: 'VALIDATION_ERROR',
        details: config.nodeEnv === 'production' ? 'Internal error' : error.message
      });
    }
  }
}

module.exports = new AuthController();
// Contains AI-generated edits.
