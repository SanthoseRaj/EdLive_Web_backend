const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');

// Helper to rename files
const renameFile = (dir, ext, newName) => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(ext) && !f.includes('.map'));
  if (files.length > 0) {
    const oldPath = path.join(dir, files[0]); // Grabs the first file (usually main.hash.js)
    const newPath = path.join(dir, newName);
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${files[0]} -> ${newName}`);
  }
};

// Rename JS
renameFile(path.join(buildDir, 'static/js'), '.js', 'main.js');

// Rename CSS
renameFile(path.join(buildDir, 'static/css'), '.css', 'main.css');