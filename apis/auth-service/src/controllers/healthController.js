const config = require('../config');

class HealthController {
  async getHealth(req, res) {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0'
    });
  }

  async getProtectedData(req, res) {
    res.json({ 
      message: 'Protected data from Node API 1', 
      user: req.user,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new HealthController();
// Contains AI-generated edits.
