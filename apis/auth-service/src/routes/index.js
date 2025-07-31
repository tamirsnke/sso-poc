const express = require('express');
const authRoutes = require('./auth');
const microservicesRoutes = require('./microservices');
const healthRoutes = require('./health');

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/api', microservicesRoutes);
router.use('/', healthRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Node API 1 - SSO Authentication Service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        check: '/auth/check'
      },
      microservices: {
        validateToken: '/api/validate-token',
        introspect: '/api/introspect',
        userInfo: '/api/user-info'
      },
      protected: '/protected'
    }
  });
});

module.exports = router;
// Contains AI-generated edits.
