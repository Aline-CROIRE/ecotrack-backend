const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Global Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser

// Root Route for testing
app.get('/', (req, res) => {
  res.json({ message: "Welcome to EcoTrack API" });
});

module.exports = app;