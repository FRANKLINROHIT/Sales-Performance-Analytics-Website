// Root Vercel Serverless Function entry point
// Vercel auto-detects /api files at the repository root as Serverless Functions
const app = require('../backend/server');

module.exports = app;
