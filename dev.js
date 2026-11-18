const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('🚀 Starting SalesPulse Full-Stack Development Environment');
console.log('========================================================');

const backend = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

const frontend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, 'frontend')
});

const shutdown = () => {
  console.log('\n[Dev] Shutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
