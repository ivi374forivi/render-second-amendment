/**
 * Comprehensive Error Handling Middleware
 * 
 * Provides detailed error responses with proper HTTP status codes,
 * error categorization, and development/production mode differences.
 */

class AppError extends Error {
  constructor(message, statusCode, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error types for consistent handling
 */
const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * Create standardized error response
 */
function createErrorResponse(err, includeStack = false) {
  const response = {
    error: {
      code: err.code || ErrorTypes.INTERNAL_ERROR,
      message: err.message || 'An unexpected error occurred',
      statusCode: err.statusCode || 500
    }
  };

  if (includeStack && err.stack) {
    response.error.stack = err.stack;
  }

  if (err.details) {
    response.error.details = err.details;
  }

  return response;
}

/**
 * Main error handler middleware
 */
function errorHandler(err, req, res, next) {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (isDevelopment) {
    console.error('Stack trace:', err.stack);
  }

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    err.code = ErrorTypes.VALIDATION_ERROR;
    err.statusCode = 400;
  } else if (err.name === 'UnauthorizedError') {
    err.code = ErrorTypes.UNAUTHORIZED;
    err.statusCode = 401;
  } else if (err.name === 'CastError') {
    err.code = ErrorTypes.BAD_REQUEST;
    err.statusCode = 400;
    err.message = 'Invalid data format';
  }

  // Create error response
  const errorResponse = createErrorResponse(err, isDevelopment);

  // Add request context in development
  if (isDevelopment) {
    errorResponse.error.requestContext = {
      path: req.path,
      method: req.method,
      query: req.query,
      body: req.body
    };
  }

  // Avoid unused parameter warning
  // next parameter is required by Express middleware signature
  void next;

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: ErrorTypes.NOT_FOUND,
      message: 'The requested resource was not found',
      details: {
        path: req.path,
        method: req.method
      }
    }
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Custom error creators
 */
const createError = {
  badRequest: (message, details = null) => {
    const err = new AppError(message, 400, ErrorTypes.BAD_REQUEST);
    if (details) err.details = details;
    return err;
  },

  unauthorized: (message = 'Unauthorized access') => {
    return new AppError(message, 401, ErrorTypes.UNAUTHORIZED);
  },

  forbidden: (message = 'Access forbidden') => {
    return new AppError(message, 403, ErrorTypes.FORBIDDEN);
  },

  notFound: (resource = 'Resource') => {
    return new AppError(`${resource} not found`, 404, ErrorTypes.NOT_FOUND);
  },

  validation: (message, details = null) => {
    const err = new AppError(message, 400, ErrorTypes.VALIDATION_ERROR);
    if (details) err.details = details;
    return err;
  },

  internal: (message = 'Internal server error') => {
    return new AppError(message, 500, ErrorTypes.INTERNAL_ERROR);
  },

  serviceUnavailable: (message = 'Service temporarily unavailable') => {
    return new AppError(message, 503, ErrorTypes.SERVICE_UNAVAILABLE);
  }
};

module.exports = {
  AppError,
  ErrorTypes,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError
};
