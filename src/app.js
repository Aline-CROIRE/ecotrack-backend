const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

// Import Configurations, Routes, and the NEW Sanitizer
const swaggerSpec = require('./config/swagger');
const sanitizeMiddleware = require('./middlewares/sanitizeMiddleware');
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// 1. SECURITY HEADERS
app.use(helmet()); 
app.use(cors());

// 2. LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. BODY PARSERS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. CUSTOM DATA SANITIZATION (The Fix)
app.use(sanitizeMiddleware);

// 5. PARAMETER POLLUTION & RATE LIMITING
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 429, message: 'Too many requests, try again later' }
});
app.use('/api', limiter);

// 6. API DOCUMENTATION
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 7. MOUNT API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', messageRoutes);

// 8. ROOT ROUTE
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'EcoTrack API is running' });
});

// 9. ERROR HANDLING
app.use(errorHandler);

module.exports = app;