/**
 * Enhanced Logging Middleware
 * 
 * Provides comprehensive request/response logging with performance metrics,
 * error tracking, and structured log output.
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };

    this.currentLevel = process.env.LOG_LEVEL 
      ? this.logLevels[process.env.LOG_LEVEL.toUpperCase()] 
      : this.logLevels.INFO;

    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, metadata = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    });
  }

  writeToFile(filename, message) {
    const filepath = path.join(this.logDir, filename);
    fs.appendFileSync(filepath, message + '\n');
  }

  log(level, message, metadata = {}) {
    if (this.logLevels[level] > this.currentLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, metadata);
    
    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m'  // Gray
    };
    const resetColor = '\x1b[0m';
    
    console.log(`${colors[level]}[${level}]${resetColor} ${message}`, 
      Object.keys(metadata).length > 0 ? metadata : '');

    // File output
    const date = new Date().toISOString().split('T')[0];
    this.writeToFile(`app-${date}.log`, formattedMessage);

    if (level === 'ERROR') {
      this.writeToFile(`error-${date}.log`, formattedMessage);
    }
  }

  error(message, metadata = {}) {
    this.log('ERROR', message, metadata);
  }

  warn(message, metadata = {}) {
    this.log('WARN', message, metadata);
  }

  info(message, metadata = {}) {
    this.log('INFO', message, metadata);
  }

  debug(message, metadata = {}) {
    this.log('DEBUG', message, metadata);
  }
}

const logger = new Logger();

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info('Response sent', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0
    });

    // Performance warning for slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Error logging middleware
 */
function errorLogger(err, req, res, next) {
  logger.error('Request error', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });

  next(err);
}

/**
 * Performance monitoring middleware
 */
function performanceMonitor(req, res, next) {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Log performance metrics
    if (duration > 500) {
      logger.warn('Performance alert', {
        path: req.path,
        method: req.method,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode
      });
    }

    // Track memory usage
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
      logger.warn('High memory usage', {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      });
    }
  });

  next();
}

/**
 * Security event logger
 */
function securityLogger(event, details = {}) {
  logger.warn('Security event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
}

/**
 * API usage analytics
 */
const apiStats = {
  requests: new Map(),
  errors: new Map()
};

function analyticsMiddleware(req, res, next) {
  const endpoint = `${req.method} ${req.path}`;
  
  // Track request count
  apiStats.requests.set(endpoint, (apiStats.requests.get(endpoint) || 0) + 1);

  // Track errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      apiStats.errors.set(endpoint, (apiStats.errors.get(endpoint) || 0) + 1);
    }
  });

  next();
}

/**
 * Get analytics summary
 */
function getAnalytics() {
  const topEndpoints = Array.from(apiStats.requests.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topErrors = Array.from(apiStats.errors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    totalRequests: Array.from(apiStats.requests.values()).reduce((a, b) => a + b, 0),
    totalErrors: Array.from(apiStats.errors.values()).reduce((a, b) => a + b, 0),
    topEndpoints: topEndpoints.map(([endpoint, count]) => ({ endpoint, count })),
    topErrors: topErrors.map(([endpoint, count]) => ({ endpoint, count })),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
}

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  performanceMonitor,
  securityLogger,
  analyticsMiddleware,
  getAnalytics
};
