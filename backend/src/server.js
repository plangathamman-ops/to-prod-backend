const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/auth');
const opportunityRoutes = require('./routes/opportunities');
const applicationRoutes = require('./routes/applications');
const uploadRoutes = require('./routes/upload');

// Initialize express app
const app = express();

// Trust proxy - needed for rate limiting behind proxies (Railway, Heroku, etc.)
app.set('trust proxy', 1);

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: false,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  }
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'The app is live'
  });
});

// API Routes
try {
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes loaded');
  
  app.use('/api/opportunities', opportunityRoutes);
  console.log('✓ Opportunities routes loaded');
  
  app.use('/api/applications', applicationRoutes);
  console.log('✓ Applications routes loaded');
  
  app.use('/api/upload', uploadRoutes);
  console.log('✓ Upload routes loaded');
} catch (err) {
  console.error('Error loading routes:', err);
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: config.nodeEnv === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.port || 8080;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`🚀 Server running in ${config.nodeEnv} mode on ${HOST}:${PORT}`);
  console.log('═══════════════════════════════════════════════════════════\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});


module.exports = app;
