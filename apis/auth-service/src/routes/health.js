const express = require('express');
const HealthController = require('../controllers/healthController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Health and utility routes
router.get('/health', HealthController.getHealth.bind(HealthController));
router.get('/protected', requireAuth, HealthController.getProtectedData.bind(HealthController));

module.exports = router;
// Contains AI-generated edits.
