const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Load files.js data
const getModelsData = async () => {
  try {
    const filesPath = path.join(__dirname, '../../docs/files.js');
    const content = await fs.readFile(filesPath, 'utf8');
    // Extract the array from the files.js file
    const match = content.match(/const files = (\[[\s\S]*?\]);/);
    if (match) {
      return JSON.parse(match[1]);
    }
    return [];
  } catch (error) {
    console.error('Error loading models data:', error);
    return [];
  }
};

// Helper function to paginate results
const paginate = (data, page = 1, limit = 10) => {
  const maxLimit = 100;
  const actualLimit = Math.min(parseInt(limit), maxLimit);
  const actualPage = Math.max(parseInt(page), 1);
  const startIndex = (actualPage - 1) * actualLimit;
  const endIndex = startIndex + actualLimit;

  return {
    data: data.slice(startIndex, endIndex),
    pagination: {
      page: actualPage,
      limit: actualLimit,
      total: data.length,
      pages: Math.ceil(data.length / actualLimit),
    },
  };
};

// GET /api/models - List all models
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'datetime', order = 'desc' } = req.query;

    let models = await getModelsData();

    // Sort models
    models.sort((a, b) => {
      if (sort === 'datetime') {
        const dateA = new Date(a.datetime);
        const dateB = new Date(b.datetime);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sort === 'location') {
        return order === 'asc'
          ? a.location.localeCompare(b.location)
          : b.location.localeCompare(a.location);
      }
      return 0;
    });

    const result = paginate(models, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/models/search - Search models
router.get('/search', async (req, res, next) => {
  try {
    const { q, field = 'all', page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: {
          code: 'INVALID_QUERY',
          message: 'Search query parameter "q" is required',
        },
      });
    }

    const models = await getModelsData();
    const searchTerm = q.toLowerCase();

    const filtered = models.filter(model => {
      if (field === 'location' || field === 'all') {
        if (model.location.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
      if (field === 'tags' || field === 'all') {
        if (model.tags && model.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm)
        )) {
          return true;
        }
      }
      return false;
    });

    const result = paginate(filtered, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/models/:location - Get model details
router.get('/:location(*)', async (req, res, next) => {
  try {
    const { location } = req.params;
    const models = await getModelsData();

    const model = models.find(m => m.location === location);

    if (!model) {
      return res.status(404).json({
        error: {
          code: 'MODEL_NOT_FOUND',
          message: `Model not found: ${location}`,
        },
      });
    }

    // Try to read README content
    let readmeContent = '';
    try {
      const readmePath = path.join(__dirname, '../../', model.location, 'README.md');
      readmeContent = await fs.readFile(readmePath, 'utf8');
    } catch (err) {
      // README not found or can't be read
      try {
        const readmePath = path.join(__dirname, '../../', model.location, 'README.txt');
        readmeContent = await fs.readFile(readmePath, 'utf8');
      } catch (err2) {
        readmeContent = 'README not available';
      }
    }

    // Get list of STL and STEP files
    const modelPath = path.join(__dirname, '../../', model.location);
    let stlFiles = [];
    let stepFiles = [];

    try {
      const files = await fs.readdir(modelPath, { recursive: true });
      stlFiles = files.filter(f => f.toLowerCase().endsWith('.stl'));
      stepFiles = files.filter(f => f.toLowerCase().endsWith('.step') || f.toLowerCase().endsWith('.stp'));
    } catch (err) {
      // Directory not accessible
    }

    res.json({
      location: model.location,
      datetime: model.datetime,
      tags: model.tags || [],
      readme: readmeContent,
      renders: model.renders || [],
      stl_files: stlFiles.map(f => `/files/${model.location}/${f}`),
      step_files: stepFiles.map(f => `/files/${model.location}/${f}`),
      metadata: {
        version: model.version || 'Unknown',
        author: model.author || 'Unknown',
        license: 'Open Source',
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/models/:location/files - Get model files
router.get('/:location(*)/files', async (req, res, next) => {
  try {
    const { location } = req.params;
    const { type = 'all' } = req.query;
    const models = await getModelsData();

    const model = models.find(m => m.location === location.replace('/files', ''));

    if (!model) {
      return res.status(404).json({
        error: {
          code: 'MODEL_NOT_FOUND',
          message: `Model not found: ${location}`,
        },
      });
    }

    const modelPath = path.join(__dirname, '../../', model.location);
    const files = await fs.readdir(modelPath, { recursive: true });

    const result = {
      stl: type === 'all' || type === 'stl'
        ? files.filter(f => f.toLowerCase().endsWith('.stl')).map(f => `/files/${model.location}/${f}`)
        : [],
      step: type === 'all' || type === 'step'
        ? files.filter(f => f.toLowerCase().endsWith('.step') || f.toLowerCase().endsWith('.stp')).map(f => `/files/${model.location}/${f}`)
        : [],
      renders: type === 'all' || type === 'render'
        ? files.filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f)).map(f => `/files/${model.location}/${f}`)
        : [],
      readme: `/files/${model.location}/README.md`,
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
