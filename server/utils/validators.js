import { body, query, param, validationResult } from 'express-validator';

// ========================================
// Validation Result Handler
// ========================================

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// ========================================
// Auth Validators
// ========================================

export const validateSignup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// ========================================
// Project Validators
// ========================================

export const validateCreateProject = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex code'),
  handleValidationErrors,
];

export const validateUpdateProject = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex code'),
  handleValidationErrors,
];

export const validateInviteMember = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors,
];

// ========================================
// Task Validators
// ========================================

export const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Invalid project ID'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('assigneeId')
    .optional()
    .isUUID()
    .withMessage('Invalid assignee ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  handleValidationErrors,
];

export const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done', 'overdue'])
    .withMessage('Status must be todo, in-progress, done, or overdue'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('assigneeId')
    .optional()
    .isUUID()
    .withMessage('Invalid assignee ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  handleValidationErrors,
];

// ========================================
// Comment Validators
// ========================================

export const validateCreateComment = [
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Comment must not exceed 2000 characters'),
  handleValidationErrors,
];

// ========================================
// Query Validators
// ========================================

export const validateTaskFilters = [
  query('project')
    .optional()
    .isUUID()
    .withMessage('Invalid project ID'),
  query('assignee')
    .optional()
    .isUUID()
    .withMessage('Invalid assignee ID'),
  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done', 'overdue'])
    .withMessage('Invalid status'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  handleValidationErrors,
];

// ========================================
// ID Validators
// ========================================

export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];
