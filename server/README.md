# RenderOSArms Server

Express.js server providing RESTful API for the RenderOSArms platform.

## Features

- RESTful API for model access and search
- Rate limiting and security middleware
- CORS support for cross-origin requests
- Static file serving for the web interface
- Comprehensive error handling
- Request compression

## Prerequisites

- Node.js v14 or higher
- npm v6 or higher

## Installation

```bash
# From the project root
npm install
```

## Running the Server

### Development Mode

```bash
npm run dev
```

Server will start on http://localhost:3000 with auto-reload on file changes.

### Production Mode

```bash
npm start
```

Server will start on http://localhost:3000 (or PORT environment variable).

## Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=100
```

## API Endpoints

### Models

- `GET /api/models` - List all models with pagination
- `GET /api/models/search?q=query` - Search models
- `GET /api/models/:location` - Get model details
- `GET /api/models/:location/files` - Get model files

### Tags

- `GET /api/tags` - List all tags with counts
- `GET /api/tags/:tagName/models` - Get models by tag

### Categories

- `GET /api/categories` - List all categories
- `GET /api/categories/:categoryName` - Get models in category

### 3D Viewer

- `GET /api/viewer/load/:location` - Load model for viewer

### System

- `GET /api/health` - Health check endpoint
- `GET /api` - API information

## Query Parameters

### Pagination

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Sorting

- `sort` - Sort field (datetime, location)
- `order` - Sort order (asc, desc)

### Search

- `q` - Search query (required for search endpoint)
- `field` - Search field (location, tags, all)

## Response Format

### Success Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 250,
    "pages": 25
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Security Features

- Helmet.js for security headers
- CORS with configurable origins
- Rate limiting (100 req/hour for anonymous)
- Input validation
- Content Security Policy
- Request size limits (10MB)

## Rate Limiting

- Anonymous: 100 requests per hour
- Headers included:
  - `RateLimit-Limit`
  - `RateLimit-Remaining`
  - `RateLimit-Reset`

## Development

### Project Structure

```
server/
├── index.js           # Main server file
├── routes/            # API route handlers
│   ├── models.js      # Model endpoints
│   ├── tags.js        # Tag endpoints
│   ├── categories.js  # Category endpoints
│   └── viewer.js      # Viewer endpoints
└── README.md          # This file
```

### Adding New Routes

1. Create route file in `server/routes/`
2. Import and use in `server/index.js`
3. Add documentation to API.md

### Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test models endpoint
curl http://localhost:3000/api/models?limit=5

# Test search
curl http://localhost:3000/api/models/search?q=glock
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### CORS Issues

Check the CORS configuration in `server/index.js` and ensure your origin is allowed.

### File Not Found Errors

Ensure the `docs/files.js` file exists and is properly formatted:

```bash
npm run list
```

## Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start server/index.js --name renderosarms
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name renderosarms.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## License

ISC License - See LICENSE file for details.
