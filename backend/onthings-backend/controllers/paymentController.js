const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { Order } = require('../models');
const { getRazorpay } = require('../utils/razorpay');

const createOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    throw new ApiError(500, 'Razorpay is not configured');
  }

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: req.body.currency || 'INR',
    receipt: req.body.receipt || `rcpt_${Date.now()}`,
    notes: req.body.notes || {}
  });

  return res.status(201).json({
    success: true,
    message: 'Razorpay order created successfully',
    data: order
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { app_order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification fields');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new ApiError(500, 'Razorpay key secret missing');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment signature verification failed');
  }

  if (app_order_id) {
    const order = await Order.findByPk(app_order_id);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.user_id !== req.user.id) {
      throw new ApiError(403, 'Unauthorized order access');
    }

    order.payment_status = 'paid';
    order.payment_method = 'razorpay';
    order.razorpay_order_id = razorpay_order_id;
    order.razorpay_payment_id = razorpay_payment_id;
    await order.save();
  }

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully'
  });
});

module.exports = {
  createOrder,
  verifyPayment
};