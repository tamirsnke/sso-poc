const express = require('express');
const MicroservicesController = require('../controllers/microservicesController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Microservices integration routes
router.post('/validate-token', MicroservicesController.validateToken.bind(MicroservicesController));
router.post('/introspect', MicroservicesController.introspectToken.bind(MicroservicesController));
router.get('/user-info', requireAuth, MicroservicesController.getUserInfo.bind(MicroservicesController));

module.exports = router;
// Contains AI-generated edits.
