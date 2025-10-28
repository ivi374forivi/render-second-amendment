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

// GET /api/viewer/load/:location - Load model for 3D viewer
router.get('/load/:location(*)', async (req, res, next) => {
  try {
    const { location } = req.params;
    const { format = 'stl', quality = 'medium' } = req.query;

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

    // Get STL files
    const modelPath = path.join(__dirname, '../../', model.location);
    let files = [];

    try {
      const dirFiles = await fs.readdir(modelPath, { recursive: true });
      if (format === 'stl') {
        files = dirFiles.filter(f => f.toLowerCase().endsWith('.stl'));
      } else if (format === 'step') {
        files = dirFiles.filter(f =>
          f.toLowerCase().endsWith('.step') || f.toLowerCase().endsWith('.stp')
        );
      }
    } catch (err) {
      return res.status(500).json({
        error: {
          code: 'FILE_READ_ERROR',
          message: 'Unable to read model files',
        },
      });
    }

    // Get preview image (first render)
    const previewUrl = model.renders && model.renders.length > 0
      ? `/files/${model.location}/${model.renders[0]}`
      : null;

    // Create parts list
    const parts = files.map((file, index) => {
      const fileName = path.basename(file, path.extname(file));
      return {
        id: `part${index + 1}`,
        name: fileName.replace(/_/g, ' '),
        file: `/files/${model.location}/${file}`,
      };
    });

    res.json({
      model_url: parts.length > 0 ? parts[0].file : null,
      preview_url: previewUrl,
      parts,
      quality,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
