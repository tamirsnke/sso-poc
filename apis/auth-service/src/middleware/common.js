// Request logging middleware
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
  next();
}

// Global error handler
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({ 
    error: 'Internal server error',
    details: isProduction ? 'Something went wrong' : err.message
  });
}

// 404 handler
function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Endpoint not found' });
}

module.exports = {
  requestLogger,
  errorHandler,
  notFoundHandler
};
// Contains AI-generated edits.
