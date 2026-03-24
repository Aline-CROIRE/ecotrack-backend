const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

// Import Configurations & Routes
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

/**
 * 1. GLOBAL SECURITY MIDDLEWARES (Headers & CORS)
 * These should always be first to protect the connection.
 */
app.use(helmet()); // Sets various security-related HTTP headers
app.use(cors());   // Enables Cross-Origin Resource Sharing

/**
 * 2. LOGGING MIDDLEWARE
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * 3. BODY PARSERS
 * Crucial: These must be defined BEFORE any sanitization.
 */
app.use(express.json({ limit: '10kb' })); // Limits body size to 10kb to prevent DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * 4. DATA SANITIZATION (The Fix for your TypeError)
 * We use { replaceWith: '_' } to modify the content of req.query/req.body 
 * instead of trying to overwrite the read-only 'getter' property.
 */
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);

/**
 * 5. ADVANCED SECURITY (Rate Limiting & Pollution Prevention)
 */
// Prevent HTTP Parameter Pollution (e.g., ?sort=abc&sort=xyz)
app.use(hpp());

// Rate Limiting: 100 requests per 15 mins per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

/**
 * 6. API DOCUMENTATION
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * 7. MOUNT API ROUTES
 */
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/analytics', analyticsRoutes);

/**
 * 8. ROOT ROUTE
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EcoTrack API is running',
    docs: '/api-docs'
  });
});

/**
 * 9. GLOBAL ERROR HANDLING (Must be the last middleware)
 */
app.use(errorHandler);

module.exports = app;