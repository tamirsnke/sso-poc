const axios = require('axios');
const config = require('../config');

class AuthService {
  constructor() {
    this.authServiceUrl = config.authService.url;
    this.timeout = config.authService.timeout;
  }

  async validateToken(token) {
    try {
      const response = await axios.get(
        `${this.authServiceUrl}/auth/check`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: this.timeout 
        }
      );
      
      return {
        valid: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Token validation failed:', error.message);
      
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: 'Invalid token'
        };
      }
      
      throw new Error('Authentication service unavailable');
    }
  }

  async validateSession(sessionId) {
    try {
      const response = await axios.post(
        `${this.authServiceUrl}/api/validate-session`, 
        { sessionId }, 
        { timeout: this.timeout }
      );
      
      return {
        valid: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Session validation failed:', error.message);
      
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: 'Invalid session'
        };
      }
      
      throw new Error('Authentication service unavailable');
    }
  }

  async validateSessionCookie(req) {
    try {
      const response = await axios.get(
        `${this.authServiceUrl}/auth/check`,
        {
          headers: {
            'Cookie': req.headers.cookie || '',
            'X-Forwarded-For': req.ip,
            'X-Original-URL': req.originalUrl,
            'User-Agent': 'Business-Service/1.0'
          },
          timeout: this.timeout
        }
      );

      return {
        valid: true,
        user: response.data.user,
        sessionId: response.data.sessionId,
        source: response.data.source || 'cookie-validation'
      };

    } catch (error) {
      console.error('Cookie session validation failed:', error.message);

      if (error.response?.status === 401) {
        return {
          valid: false,
          error: error.response.data?.error || 'Invalid session cookie',
          code: error.response.data?.code || 'NO_SESSION',
          requiresLogin: error.response.data?.requiresLogin || true
        };
      }

      // Network/service errors
      throw new Error(`Authentication service error: ${error.message}`);
    }
  }

  async checkAuthServiceHealth() {
    try {
      const response = await axios.get(`${this.authServiceUrl}/health`, {
        timeout: 3000
      });
      return { healthy: true, status: response.status };
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        authServiceUrl: this.authServiceUrl
      };
    }
  }
}

module.exports = new AuthService();
// Contains AI-generated edits.
