/**
 * Request Validation Middleware
 * 
 * Validates and sanitizes incoming requests to prevent
 * injection attacks and ensure data integrity.
 */

const { createError } = require('./errorHandler');

/**
 * Validate query parameters
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = req.query[key];

      // Check required fields
      if (rules.required && !value) {
        errors.push(`Query parameter '${key}' is required`);
        continue;
      }

      if (!value && !rules.required) {
        continue;
      }

      // Type validation
      if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`Query parameter '${key}' must be a number`);
        } else if (rules.min !== undefined && num < rules.min) {
          errors.push(`Query parameter '${key}' must be at least ${rules.min}`);
        } else if (rules.max !== undefined && num > rules.max) {
          errors.push(`Query parameter '${key}' must be at most ${rules.max}`);
        }
      }

      if (rules.type === 'string') {
        if (typeof value !== 'string') {
          errors.push(`Query parameter '${key}' must be a string`);
        } else {
          if (rules.minLength && value.length < rules.minLength) {
            errors.push(`Query parameter '${key}' must be at least ${rules.minLength} characters`);
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Query parameter '${key}' must be at most ${rules.maxLength} characters`);
          }
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`Query parameter '${key}' has invalid format`);
          }
        }
      }

      if (rules.type === 'enum') {
        if (!rules.values.includes(value)) {
          errors.push(`Query parameter '${key}' must be one of: ${rules.values.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      throw createError.validation('Invalid query parameters', { errors });
    }

    next();
  };
}

/**
 * Validate request body
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    if (!req.body || typeof req.body !== 'object') {
      throw createError.badRequest('Request body must be a valid JSON object');
    }

    for (const [key, rules] of Object.entries(schema)) {
      const value = req.body[key];

      // Check required fields
      if (rules.required && value === undefined) {
        errors.push(`Field '${key}' is required`);
        continue;
      }

      if (value === undefined && !rules.required) {
        continue;
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`Field '${key}' must be of type ${rules.type}`);
        continue;
      }

      // String validation
      if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`Field '${key}' must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`Field '${key}' must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`Field '${key}' has invalid format`);
        }
        
        // Sanitize string (basic XSS prevention)
        if (rules.sanitize) {
          req.body[key] = sanitizeString(value);
        }
      }

      // Number validation
      if (rules.type === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`Field '${key}' must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`Field '${key}' must be at most ${rules.max}`);
        }
      }

      // Array validation
      if (rules.type === 'object' && Array.isArray(value)) {
        if (rules.minItems && value.length < rules.minItems) {
          errors.push(`Field '${key}' must have at least ${rules.minItems} items`);
        }
        if (rules.maxItems && value.length > rules.maxItems) {
          errors.push(`Field '${key}' must have at most ${rules.maxItems} items`);
        }
      }

      // Custom validation
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }

    if (errors.length > 0) {
      throw createError.validation('Invalid request body', { errors });
    }

    next();
  };
}

/**
 * Validate URL parameters
 */
function validateParams(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = req.params[key];

      if (rules.required && !value) {
        errors.push(`URL parameter '${key}' is required`);
        continue;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`URL parameter '${key}' has invalid format`);
      }

      if (rules.sanitize) {
        req.params[key] = sanitizeString(value);
      }
    }

    if (errors.length > 0) {
      throw createError.validation('Invalid URL parameters', { errors });
    }

    next();
  };
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Rate limiting per IP
 */
const requestCounts = new Map();

function simpleRateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const ipData = requestCounts.get(ip);

    if (now > ipData.resetTime) {
      // Reset window
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (ipData.count >= maxRequests) {
      throw createError.badRequest('Rate limit exceeded. Please try again later.', {
        limit: maxRequests,
        resetTime: new Date(ipData.resetTime)
      });
    }

    ipData.count++;
    next();
  };
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60000); // Clean up every minute

module.exports = {
  validateQuery,
  validateBody,
  validateParams,
  sanitizeString,
  simpleRateLimit
};
