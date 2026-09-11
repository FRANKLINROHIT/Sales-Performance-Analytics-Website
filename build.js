const { execSync } = require('child_process');
const fs = require('fs');

if (fs.existsSync('frontend')) {
  console.log('[build] Running in root directory. Building frontend...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
} else {
  console.log('[build] Running inside frontend directory. Building directly...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
}
