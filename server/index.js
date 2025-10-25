const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const aiAgent = require('./ai');

app.use(express.json());

// Serve static files from the 'docs' directory
app.use(express.static(path.join(__dirname, '../docs')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/index.html'));
});

app.post('/api/ai/query', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  const response = aiAgent.processQuery(query);
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
