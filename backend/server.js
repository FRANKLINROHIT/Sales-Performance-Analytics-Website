const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Sales Performance Analytics Web Portal',
    timestamp: new Date().toISOString()
  });
});

// Register API Route modules
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);

// Centralized error handler
app.use(errorHandler);

// Boot server & init DB
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
