const express = require('express');
const AuthController = require('../controllers/authController');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Authentication routes
router.post('/login', AuthController.login.bind(AuthController));
router.post('/logout', AuthController.logout.bind(AuthController));
router.get('/check', AuthController.checkAuth.bind(AuthController));

// Session validation routes for business services
router.post('/validate-session', AuthController.validateSession.bind(AuthController));
router.post('/validate-session-cookie', AuthController.validateSessionCookie.bind(AuthController));

module.exports = router;
// Contains AI-generated edits.
