const config = require('../config');

class HealthController {
  getHealth(req, res) {
    res.json({ 
      service: 'node-api-2',
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      authService: config.authService.url
    });
  }

  getServiceInfo(req, res) {
    res.json({
      service: 'Node API 2 - Microservice',
      description: 'Demonstrates microservices integration with centralized auth',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        protected: '/protected (requires auth)',
        admin: '/admin (requires admin role)',
        orders: '/api/orders (requires auth)'
      },
      authService: config.authService.url
    });
  }

  getProtectedData(req, res) {
    res.json({
      message: 'Protected data from business service',
      user: req.user ? req.user.preferred_username : 'unknown',
      service: 'node-api-2',
      timestamp: new Date().toISOString(),
      authSource: req.authSource || 'unknown',
      sessionId: req.sessionId || 'no-session'
    });
  }
}

module.exports = new HealthController();
// Contains AI-generated edits.
