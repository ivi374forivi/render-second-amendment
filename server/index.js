const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const modelsRouter = require('./routes/models');
const tagsRouter = require('./routes/tags');
const categoriesRouter = require('./routes/categories');
const viewerRouter = require('./routes/viewer');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "code.jquery.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production'
    ? 'https://renderosarms.com'
    : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour for anonymous users
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.',
        details: {
          limit: req.rateLimit.limit,
          remaining: req.rateLimit.remaining,
          resetTime: new Date(req.rateLimit.resetTime),
        },
      },
    });
  },
});

// Apply rate limiting to API routes
app.use('/api', limiter);

// Serve static files from docs directory
app.use(express.static(path.join(__dirname, '../docs')));

// API routes
app.use('/api/models', modelsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/viewer', viewerRouter);
app.use('/api/ai', aiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: NODE_ENV,
  });
});

// API documentation redirect
app.get('/api', (req, res) => {
  res.json({
    message: 'RenderOSArms API v1',
    documentation: '/api/docs',
    version: '2.0.0',
    endpoints: {
      models: '/api/models',
      search: '/api/models/search',
      tags: '/api/tags',
      categories: '/api/categories',
      viewer: '/api/viewer',
      ai: '/api/ai',
      health: '/api/health',
    },
  });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
      details: {
        path: req.path,
        method: req.method,
      },
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  };

  if (NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
┌─────────────────────────────────────────┐
│  RenderOSArms Server                    │
│  Version: 2.0.0                         │
│  Environment: ${NODE_ENV.padEnd(25)}│
│  Port: ${PORT.toString().padEnd(31)}│
│  URL: http://localhost:${PORT.toString().padEnd(19)}│
└─────────────────────────────────────────┘

API Endpoints:
  • GET  /api/models
  • GET  /api/models/search
  • GET  /api/models/:location
  • GET  /api/tags
  • GET  /api/categories
  • GET  /api/viewer/load/:location
  • POST /api/ai/query
  • GET  /api/ai/capabilities
  • GET  /api/health

Documentation: http://localhost:${PORT}/api
Web Interface: http://localhost:${PORT}/
    `);
  });
}

module.exports = app;
