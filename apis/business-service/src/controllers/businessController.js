class BusinessController {
  getAdminData(req, res) {
    res.json({ 
      message: 'Admin-only data from Node API 2',
      user: req.user,
      service: 'node-api-2',
      timestamp: new Date().toISOString(),
      adminFeatures: [
        'User management',
        'System configuration',
        'Analytics dashboard'
      ]
    });
  }

  getOrders(req, res) {
    // Simulate business logic
    const orders = [
      { 
        id: 1, 
        product: 'Widget A', 
        user: req.user.preferred_username,
        status: 'shipped',
        amount: 299.99
      },
      { 
        id: 2, 
        product: 'Widget B', 
        user: req.user.preferred_username,
        status: 'processing',
        amount: 199.99
      }
    ];

    res.json({
      orders,
      service: 'node-api-2',
      user: req.user.preferred_username,
      timestamp: new Date().toISOString()
    });
  }

  createOrder(req, res) {
    const { product, amount } = req.body;
    
    if (!product || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['product', 'amount']
      });
    }

    // Simulate order creation
    const newOrder = {
      id: Math.floor(Math.random() * 10000),
      product,
      amount,
      user: req.user.preferred_username,
      status: 'created',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
      service: 'node-api-2'
    });
  }
}

module.exports = new BusinessController();
// Contains AI-generated edits.
