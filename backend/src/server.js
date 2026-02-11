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
  max: 100 // limit each IP to 100 requests per windowMs
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
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);

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
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

module.exports = app;
