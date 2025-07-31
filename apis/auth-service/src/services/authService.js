const axios = require('axios');
const config = require('../config');

class AuthService {
  constructor() {
    this.tokenUrl = config.keycloak.tokenUrl;
    this.logoutUrl = config.keycloak.logoutUrl;
    this.revokeUrl = config.keycloak.revokeUrl;
    this.introspectUrl = config.keycloak.introspectUrl;
  }

  async exchangeCodeForToken(code, redirectUri) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', config.keycloak.clientId);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    
    if (config.keycloak.clientSecret) {
      params.append('client_secret', config.keycloak.clientSecret);
    }
    
    try {
      const response = await axios.post(this.tokenUrl, params, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Token exchange failed:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for token');
    }
  }

  async revokeToken(token) {
    const revokeParams = new URLSearchParams();
    revokeParams.append('token', token);
    revokeParams.append('client_id', config.keycloak.clientId);
    
    if (config.keycloak.clientSecret) {
      revokeParams.append('client_secret', config.keycloak.clientSecret);
    }
    
    try {
      await axios.post(this.revokeUrl, revokeParams, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    } catch (error) {
      console.warn('Token revocation failed:', error.message);
      throw error;
    }
  }

  async introspectToken(token) {
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('client_id', config.keycloak.clientId);
    
    if (config.keycloak.clientSecret) {
      params.append('client_secret', config.keycloak.clientSecret);
    }
    
    try {
      const response = await axios.post(this.introspectUrl, params, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Token introspection failed:', error.message);
      throw error;
    }
  }

  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(`${config.keycloak.baseUrl}/protocol/openid-connect/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error.message);
      throw new Error('Failed to retrieve user information');
    }
  }

  generateLogoutUrl(requestOrigin) {
    const origin = requestOrigin || config.cors.allowedOrigins[0] || 'http://localhost:4200';
    return `${this.logoutUrl}?` +
      `client_id=${config.keycloak.clientId}&` +
      `post_logout_redirect_uri=${encodeURIComponent(origin)}`;
  }
}

module.exports = new AuthService();
// Contains AI-generated edits.
