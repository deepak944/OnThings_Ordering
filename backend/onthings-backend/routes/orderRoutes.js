const express = require('express');
const { body } = require('express-validator');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/create',
  verifyToken,
  [
    body('items').isArray({ min: 1 }).withMessage('Order items are required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  createOrder
);

router.get('/user-orders', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrderById);
router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

module.exports = router;