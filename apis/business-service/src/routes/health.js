const express = require('express');
const HealthController = require('../controllers/healthController');
const { authenticateViaSession } = require('../middleware/auth');

const router = express.Router();

// Health and utility routes
router.get('/health', HealthController.getHealth.bind(HealthController));
router.get('/protected', authenticateViaSession, HealthController.getProtectedData.bind(HealthController));

module.exports = router;
// Contains AI-generated edits.
