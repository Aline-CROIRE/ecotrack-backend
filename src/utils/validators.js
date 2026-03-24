const { body, validationResult } = require('express-validator');

// Logic to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Auth Validations
exports.registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('role').optional().isIn(['citizen', 'collector', 'admin']).withMessage('Invalid role'),
  validate
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Request Validations
exports.requestValidator = [
  body('wasteType').isIn(['organic', 'plastic', 'paper', 'metal', 'electronic', 'other']).withMessage('Invalid waste type'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('address').notEmpty().withMessage('Address is required'),
  body('scheduledDate').isISO8601().withMessage('A valid date is required'),
  validate
];