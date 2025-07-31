const express = require('express');
const BusinessController = require('../controllers/businessController');
const { authenticateViaSession, requireRole } = require('../middleware/auth');

const router = express.Router();

// Business logic routes
router.get('/orders', authenticateViaSession, BusinessController.getOrders.bind(BusinessController));
router.post('/orders', authenticateViaSession, BusinessController.createOrder.bind(BusinessController));

// Admin routes
router.get('/admin', 
  authenticateViaSession, 
  requireRole('admin'), 
  BusinessController.getAdminData.bind(BusinessController)
);

module.exports = router;
// Contains AI-generated edits.
