const express = require('express');
const healthRoutes = require('./health');
const businessRoutes = require('./business');
const HealthController = require('../controllers/healthController');

const router = express.Router();

// Mount route modules
router.use('/', healthRoutes);
router.use('/api', businessRoutes);

// Root endpoint
router.get('/', HealthController.getServiceInfo.bind(HealthController));

module.exports = router;
// Contains AI-generated edits.
