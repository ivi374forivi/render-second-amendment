const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Load models data
const getModelsData = async () => {
  try {
    const filesPath = path.join(__dirname, '../../docs/files.js');
    const content = await fs.readFile(filesPath, 'utf8');
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

// GET /api/tags - List all tags
router.get('/', async (req, res, next) => {
  try {
    const models = await getModelsData();
    const tagCounts = {};

    // Count occurrences of each tag
    models.forEach(model => {
      if (model.tags && Array.isArray(model.tags)) {
        model.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by count
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

// GET /api/tags/:tagName/models - Get models by tag
router.get('/:tagName/models', async (req, res, next) => {
  try {
    const { tagName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const models = await getModelsData();
    const filtered = models.filter(model =>
      model.tags && model.tags.some(tag =>
        tag.toLowerCase() === tagName.toLowerCase()
      )
    );

    const maxLimit = 100;
    const actualLimit = Math.min(parseInt(limit), maxLimit);
    const actualPage = Math.max(parseInt(page), 1);
    const startIndex = (actualPage - 1) * actualLimit;
    const endIndex = startIndex + actualLimit;

    res.json({
      data: filtered.slice(startIndex, endIndex),
      pagination: {
        page: actualPage,
        limit: actualLimit,
        total: filtered.length,
        pages: Math.ceil(filtered.length / actualLimit),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
