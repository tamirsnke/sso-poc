const express = require('express');
const createGatewayMiddleware = require('../middleware/gateway.middleware');
const applications = require('../config/applications');

const router = express.Router();

// Register gateway routes for each application
applications.forEach(app => {
  console.log(`Registering gateway for ${app.name} at /gateway/${app.id}`);
  const middleware = createGatewayMiddleware(app.id);
  
  // Mount the gateway middleware at the correct path
  router.use(`/gateway/${app.id}`, middleware);
  
  // Log the registration
  console.log(`Gateway registered: /gateway/${app.id} -> ${app.apiUrl}`);
});

// Gateway status endpoint
router.get('/status', (req, res) => {
  const registeredApps = applications.map(app => ({
    id: app.id,
    name: app.name,
    status: 'registered',
    endpoints: [`/gateway/${app.id}/api/*`]
  }));

  res.json({
    status: 'active',
    applications: registeredApps
  });
});

module.exports = router;
