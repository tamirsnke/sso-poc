// Validation utilities
function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter(field => !data[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Response utilities
function createSuccessResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

function createErrorResponse(error, details = null) {
  return {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  };
}

// Async wrapper for better error handling
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  validateRequiredFields,
  isValidEmail,
  isValidUrl,
  createSuccessResponse,
  createErrorResponse,
  asyncHandler
};
// Contains AI-generated edits.
