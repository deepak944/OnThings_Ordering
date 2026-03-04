const express = require('express');
const { body } = require('express-validator');
const { signup, login, profile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').optional().isString(),
    body('full_name').optional().isString(),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

router.get('/profile', verifyToken, profile);

module.exports = router;