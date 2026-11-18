const dotenv = require('dotenv');
dotenv.config(); // ← Must be first so process.env is populated before any module reads it

const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./db/initDb');
const errorHandler = require('./middleware/errorHandler');

// Load routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const salesRoutes = require('./routes/salesRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const targetRoutes = require('./routes/targetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const auditRoutes = require('./routes/auditRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Disable X-Powered-By banner to avoid framework fingerprinting
app.disable('x-powered-by');

let dbInitPromise = null;
const ensureDbInitialized = () => {
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase();
  }
  return dbInitPromise;
};

// Middlewares: Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:* http://127.0.0.1:*"
  );
  next();
});

// CORS Configuration: Dynamic and secure origin validation
const explicitOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];

const isAllowedOrigin = (origin) => {
  // Allow requests without Origin header (e.g. server-to-server, curl, same-origin)
  if (!origin) return true;

  // In non-production, allow any localhost or 127.0.0.1 port
  if (process.env.NODE_ENV !== 'production') {
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return true;
    }
  }

  // Explicit allowed origins check
  return explicitOrigins.includes(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // Return callback(null, false) so CORS is safely omitted without throwing 500
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Ensure DB is initialized before handling incoming API requests
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    next(err);
  }
});

// API Health Check
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    system: 'Sales Performance Analytics Web Portal',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Register API Route modules (both /api/xxx and /xxx to handle all Vercel route rewrites)
const routeModules = [
  ['/auth', authRoutes],
  ['/dashboard', dashboardRoutes],
  ['/sales', salesRoutes],
  ['/employees', employeeRoutes],
  ['/products', productRoutes],
  ['/customers', customerRoutes],
  ['/targets', targetRoutes],
  ['/analytics', analyticsRoutes],
  ['/reports', reportRoutes],
  ['/admin', adminRoutes],
  ['/audit', auditRoutes],
  ['/ai', aiRoutes]
];

routeModules.forEach(([prefix, routeHandler]) => {
  app.use(`/api${prefix}`, routeHandler);
  app.use(prefix, routeHandler);
});

// Centralized error handler
app.use(errorHandler);

// Boot server & init DB
// When running locally (node server.js / npm start), start the HTTP listener.
// When imported by Vercel serverless (backend/api/index.js), just export the app.
if (require.main === module) {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Sales Analytics Backend Server running on port ${PORT}`);
      console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  }).catch(err => {
    console.error('[Server Boot Error]:', err);
  });
} else {
  // Vercel serverless: initialize DB then export app
  initializeDatabase().catch(err => {
    console.error('[Server Boot Error]:', err);
  });
}

module.exports = app;
