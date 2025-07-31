const TokenService = require('../services/tokenService');
const AuthService = require('../services/authService');
const config = require('../config');

class MicroservicesController {
  // JWT token validation endpoint for microservices
  async validateToken(req, res) {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    try {
      const result = TokenService.validateToken(token);
      
      if (result.valid) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      res.status(500).json({ 
        error: 'Token validation failed',
        details: config.nodeEnv === 'production' ? 'Service error' : error.message
      });
    }
  }

  // Get current user session info for microservices
  async getUserInfo(req, res) {
    try {
      const userInfo = TokenService.extractUserInfo(
        req.user, 
        req.sessionID, 
        req.session.loginTime, 
        req.session.token
      );
      
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get user info',
        details: config.nodeEnv === 'production' ? 'Service error' : error.message
      });
    }
  }

  // Token introspection endpoint for microservices
  async introspectToken(req, res) {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    try {
      const result = await AuthService.introspectToken(token);
      res.json(result);
    } catch (error) {
      console.error('Token introspection failed:', error.message);
      res.status(500).json({ 
        error: 'Introspection failed',
        details: config.nodeEnv === 'production' ? 'Service unavailable' : error.message
      });
    }
  }
}

module.exports = new MicroservicesController();
// Contains AI-generated edits.
