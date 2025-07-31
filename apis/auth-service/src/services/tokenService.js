const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config');
const keycloakKeys = require('../config/keycloak');

class TokenService {
  constructor() {
    this.tokenUrl = config.keycloak.tokenUrl;
  }

  async refreshAccessToken(req) {
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
      
      req.session.token = response.data.access_token;
      if (response.data.refresh_token) {
        req.session.refreshToken = response.data.refresh_token;
      }
      
      console.log(`Token refreshed for session: ${req.sessionID}`);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  validateToken(token) {
    try {
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

module.exports = new TokenService();
// Contains AI-generated edits.
