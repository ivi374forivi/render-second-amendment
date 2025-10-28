'use strict'

const fs = require('fs');
const path = require('path');

// Fixed: Secure gitignore parsing
function parseGitignore() {
  try {
    const content = fs.readFileSync('.gitignore', 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '' && !line.startsWith('#'))  // Remove comments
      .map(pattern => pattern.replace(/\\/g, '/'));  // Normalize paths
  } catch (err) {
    console.warn('Could not read .gitignore:', err.message);
    return [];
  }
}

const gitIgnorePatterns = parseGitignore();
const readmeRegex = new RegExp(/readme\.md$/, 'gi');
const imagesRegex = new RegExp(/\.(jpg|jpeg|png|gif)$/, 'gi');

const filesAndFoldersToExclude = [
  '.git',
  'docs',
  'node_modules',
  '.gitignore',
  '.gitattributes',
  ...gitIgnorePatterns
];

// Fixed: Add recursion depth limit, path normalization, and symlink protection
function getFilesByRegex(dir, regex, depth = 0, maxDepth = 10) {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    console.warn(`Max recursion depth reached at: ${dir}`);
    return [];
  }

  // Normalize and resolve path
  const normalizedDir = path.resolve(dir);
  const baseDir = path.resolve('.');

  // Prevent path traversal
  if (!normalizedDir.startsWith(baseDir)) {
    console.warn(`Path traversal attempt blocked: ${dir}`);
    return [];
  }

  let entries;
  try {
    entries = fs.readdirSync(normalizedDir);
  } catch (err) {
    console.warn(`Cannot read directory ${dir}:`, err.message);
    return [];
  }

  return entries.reduce((list, f) => {
    const filepath = path.join(dir, f);
    const normalizedPath = path.normalize(filepath);

    // Skip excluded files/folders
    if (filesAndFoldersToExclude.some(excluded => normalizedPath.includes(excluded))) {
      return list;
    }

    let stats;
    try {
      stats = fs.lstatSync(filepath);  // Use lstat to detect symlinks
    } catch (err) {
      return list;
    }

    // Fixed: Don't follow symlinks (security)
    if (stats.isSymbolicLink()) {
      console.warn(`Skipping symlink: ${filepath}`);
      return list;
    }

    // Recurse through dir
    if (stats.isDirectory()) {
      return [...list, ...getFilesByRegex(filepath, regex, depth + 1, maxDepth)];
    }

    // Check regex match
    if (filepath.search(regex) !== -1) {
      return [...list, filepath];
    }

    return list;
  }, []);
}

// readme.md is the one file to determine a thing
const thingsList = getFilesByRegex('.', readmeRegex);

const infoList = thingsList.map(readmeFilepath => {
  const folder = readmeFilepath.replace(readmeRegex, '');
  const tags = folder.split('/').map(str => str.split('_')).flat().filter(str => str !== '');

  let readmeStat;
  try {
    readmeStat = fs.statSync(readmeFilepath);
  } catch (err) {
    console.warn(`Cannot stat ${readmeFilepath}:`, err.message);
    readmeStat = { mtime: new Date(0) };
  }

  return {
    location: folder.replace(/\/$/, ''), //remove the last slash
    datetime: readmeStat.mtime,
    tags: tags,
    readme: readmeFilepath,
    renders: folder ? getFilesByRegex(folder, imagesRegex) : null
  }
});

fs.writeFileSync('docs/files.js', `window.__print2a_files = ${JSON.stringify(infoList)}`);
console.log(`Generated index with ${infoList.length} models`);