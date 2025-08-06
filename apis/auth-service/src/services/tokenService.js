const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config');
const keycloakKeys = require('../config/keycloak');

class TokenService {
  constructor() {
    this.tokenUrl = config.keycloak.tokenUrl;
    this.refreshThreshold = 60; // Refresh token if expires within 60 seconds
  }

  async refreshAccessToken(req) {
    if (!req.session?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', config.keycloak.clientId);
    params.append('refresh_token', req.session.refreshToken);
    
    if (config.keycloak.clientSecret) {
      params.append('client_secret', config.keycloak.clientSecret);
    }
    
    try {
      const response = await axios.post(this.tokenUrl, params, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Update session with new tokens
      req.session.token = response.data.access_token;
      if (response.data.refresh_token) {
        req.session.refreshToken = response.data.refresh_token;
      }

      // Validate the new token
      const validation = this.validateToken(response.data.access_token);
      if (!validation.valid) {
        throw new Error('New token validation failed');
      }

      req.session.tokenExpiration = validation.user.exp * 1000; // Convert to milliseconds
      console.log(`Token refreshed for session: ${req.sessionID}`);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  async checkAndRefreshToken(req) {
    if (!req.session?.token) {
      return false;
    }

    try {
      const validation = this.validateToken(req.session.token);
      if (!validation.valid) {
        return await this.refreshAccessToken(req);
      }

      const now = Math.floor(Date.now() / 1000);
      if (validation.user.exp - now < this.refreshThreshold) {
        return await this.refreshAccessToken(req);
      }

      return { access_token: req.session.token };
    } catch (error) {
      console.error('Token check/refresh failed:', error.message);
      throw error;
    }
  }

  validateToken(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) {
        return { valid: false, error: 'Invalid token format' };
      }

      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      const user = jwt.verify(token, keycloakKeys.getPublicKey(), { algorithms: ['RS256'] });
      return {
        valid: true,
        user: {
          sub: user.sub,
          email: user.email,
          preferred_username: user.preferred_username,
          roles: user.realm_access?.roles || [],
          exp: user.exp
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid token',
        details: config.nodeEnv === 'production' ? 'Token validation failed' : error.message
      };
    }
  }

  extractUserInfo(user, sessionId, loginTime, token) {
    return {
      user: {
        sub: user.sub,
        email: user.email,
        preferred_username: user.preferred_username,
        roles: user.realm_access?.roles || [],
        session_id: sessionId,
        login_time: loginTime
      },
      token: token
    };
  }
}

module.exports = TokenService;
// Contains AI-generated edits.
