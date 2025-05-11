const fs = require('fs');
const path = require('path');

// Define the routes directory
const routesDir = path.join(__dirname, 'routes');

// Function to check a file for potential path-to-regexp issues
function checkFile(filePath) {
  console.log(`Checking ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for router.METHOD patterns
  const routePatterns = [
    /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g,
    /app\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g
  ];
  
  for (const pattern of routePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const routePath = match[2];
      
      // Check for common issues
      if (routePath.includes(':') && !routePath.match(/:\w+/)) {
        console.log(`ISSUE FOUND in ${path.basename(filePath)}: Invalid parameter in route: ${routePath}`);
      }
      
      if (routePath.startsWith('http')) {
        console.log(`ISSUE FOUND in ${path.basename(filePath)}: Route starts with http/https: ${routePath}`);
      }
      
      if (routePath.includes('::')) {
        console.log(`ISSUE FOUND in ${path.basename(filePath)}: Double colons in route: ${routePath}`);
      }
      
      if (routePath.match(/:\s/)) {
        console.log(`ISSUE FOUND in ${path.basename(filePath)}: Colon followed by space in route: ${routePath}`);
      }

      // Log all routes for inspection
      console.log(`Route found: ${routePath}`);
    }
  }
}

// Get all JS files in the routes directory
fs.readdir(routesDir, (err, files) => {
  if (err) {
    console.error('Error reading routes directory:', err);
    return;
  }
  
  files.filter(file => file.endsWith('.js')).forEach(file => {
    checkFile(path.join(routesDir, file));
  });
});

console.log("Run this script with: node findInvalidRoute.js");