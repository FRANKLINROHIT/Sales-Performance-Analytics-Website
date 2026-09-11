const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const frontendDir = fs.existsSync('frontend') 
  ? path.resolve(__dirname, 'frontend') 
  : path.resolve(__dirname);

console.log('[build] Building frontend in directory:', frontendDir);

// Install dependencies and run Vite build using cwd option
execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

console.log('[build] Build completed successfully.');
