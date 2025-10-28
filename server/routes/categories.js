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

// GET /api/categories - List all categories
router.get('/', async (req, res, next) => {
  try {
    const models = await getModelsData();
    const categoryMap = {};

    // Parse categories from location paths
    models.forEach(model => {
      const parts = model.location.split('/');
      if (parts.length >= 2) {
        const category = parts[0];
        const subcategory = parts[1];

        if (!categoryMap[category]) {
          categoryMap[category] = {
            name: category,
            count: 0,
            subcategories: new Set(),
          };
        }

        categoryMap[category].count++;
        categoryMap[category].subcategories.add(subcategory);
      }
    });

    // Convert to array format
    const categories = Object.values(categoryMap).map(cat => ({
      name: cat.name,
      count: cat.count,
      subcategories: Array.from(cat.subcategories).sort(),
    }));

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:categoryName - Get models in category
router.get('/:categoryName', async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const models = await getModelsData();
    const filtered = models.filter(model =>
      model.location.startsWith(categoryName + '/')
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
