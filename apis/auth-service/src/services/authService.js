const axios = require('axios');
const config = require('../config');

class AuthService {
  constructor() {
    if (!config.keycloak) {
      throw new Error('Keycloak configuration is required');
    }

    // Initialize Keycloak endpoints
    this.tokenUrl = config.keycloak.tokenUrl;
    this.logoutUrl = config.keycloak.logoutUrl;
    this.revokeUrl = config.keycloak.revokeUrl;
    this.introspectUrl = config.keycloak.introspectUrl;

    // Validate required configuration
    this.validateConfig();
  }

  validateConfig() {
    const requiredFields = ['tokenUrl', 'logoutUrl', 'revokeUrl', 'introspectUrl', 'clientId'];
    const missingFields = requiredFields.filter(field => !config.keycloak[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required Keycloak configuration: ${missingFields.join(', ')}`);
    }
  }

  createKeycloakParams(additionalParams = {}) {
    const params = new URLSearchParams();
    params.append('client_id', config.keycloak.clientId);
    
    if (config.keycloak.clientSecret) {
      params.append('client_secret', config.keycloak.clientSecret);
    }

    Object.entries(additionalParams).forEach(([key, value]) => {
      params.append(key, value);
    });

    return params;
  }

  async exchangeCodeForToken(code, redirectUri) {
    if (!code || !redirectUri) {
      throw new Error('Code and redirect URI are required');
    }

    const params = this.createKeycloakParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    });
    
    try {
      const response = await axios.post(this.tokenUrl, params, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Token exchange failed:', {
        error: error.message,
        response: error.response?.data,
        code
      });
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  async revokeToken(token) {
    if (!token) {
      throw new Error('Token is required');
    }

    const params = this.createKeycloakParams({ token });
    
    try {
      await axios.post(this.revokeUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000
      });
      return true;
    } catch (error) {
      console.warn('Token revocation failed:', {
        error: error.message,
        response: error.response?.data
      });
      throw new Error('Failed to revoke token');
    }
  }

  async introspectToken(token) {
    if (!token) {
      throw new Error('Token is required');
    }

    const params = this.createKeycloakParams({ token });
    
    try {
      const response = await axios.post(this.introspectUrl, params, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Token introspection failed:', {
        error: error.message,
        response: error.response?.data
      });
      throw new Error('Failed to introspect token');
    }
  }

  async getUserInfo(accessToken) {
    if (!accessToken) {
      throw new Error('Access token is required');
    }

    try {
      const response = await axios.get(`${config.keycloak.baseUrl}/protocol/openid-connect/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error || error.message;
      
      console.error('Failed to get user info:', {
        error: errorMessage,
        status,
        response: error.response?.data
      });

      if (status === 401) {
        throw new Error('Invalid or expired access token');
      }
      
      throw new Error('Failed to retrieve user information');
    }
  }

  generateLogoutUrl(requestOrigin) {
    const origin = requestOrigin || config.cors.allowedOrigins[0] || 'http://localhost:4200';
    const params = new URLSearchParams({
      client_id: config.keycloak.clientId,
      post_logout_redirect_uri: origin
    });

    return `${this.logoutUrl}?${params.toString()}`;
  }
}

module.exports = new AuthService();
// Contains AI-generated edits.
